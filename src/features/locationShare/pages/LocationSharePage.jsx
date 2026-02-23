import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSharedLocation } from '../hooks/useSharedLocation';
import '../styles/locationShare.css';

// Mapbox access token injected by Vite
mapboxgl.accessToken = __MAPBOX_TOKEN__;

// Deep link scheme
const DEEP_LINK_SCHEME = 'viax://share/';
const API_URL = __API_URL__;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Resolve a photo path returned by the backend.
 * Backend returns either a full URL or a relative r2_proxy path.
 */
function resolvePhotoUrl(photo) {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  // Relative path like "r2_proxy.php?key=..." or "profile/276_xxx.jpg"
  if (photo.startsWith('r2_proxy.php')) {
    return `${API_URL}/${photo}`;
  }
  return `${API_URL}/r2_proxy.php?key=${encodeURIComponent(photo)}`;
}

/**
 * LocationSharePage — standalone page (no header/footer) that shows
 * a shared location in real-time on a Mapbox GL map.
 */
export default function LocationSharePage() {
  const { token } = useParams();
  const { data, loading, error, expired } = useSharedLocation(token);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const panelRef = useRef(null);
  const lastRouteKey = useRef('');
  const hasInitialFocusRef = useRef(false);
  const dragStateRef = useRef({ startY: 0, startOffset: 0 });
  const sheetInitializedRef = useRef(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('viax-theme');
    return stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [routeInfo, setRouteInfo] = useState(null);
  const [sheetOffset, setSheetOffset] = useState(0);
  const [maxSheetOffset, setMaxSheetOffset] = useState(0);
  const [isSheetDragging, setIsSheetDragging] = useState(false);

  const getMapPadding = useCallback(() => {
    const isDesktop = window.innerWidth >= 1024;
    const panelHeight = panelRef.current?.offsetHeight ?? (isDesktop ? 320 : 280);
    const visiblePanelHeight = Math.max(0, panelHeight - sheetOffset);

    return {
      top: isDesktop ? 110 : 140,
      bottom: Math.round(isDesktop
        ? Math.min(Math.max(220, visiblePanelHeight + 72), 560)
        : Math.min(Math.max(120, visiblePanelHeight + 40), 500)),
      left: isDesktop ? 90 : 60,
      right: isDesktop ? 90 : 60,
    };
  }, [sheetOffset]);

  useEffect(() => {
    if (!data) return;

    const updateSheetMetrics = () => {
      const panelEl = panelRef.current;
      if (!panelEl) return;

      const collapsedVisible = window.innerWidth >= 1024 ? 220 : 190;
      const nextMax = Math.max(0, panelEl.scrollHeight - collapsedVisible);

      setMaxSheetOffset(nextMax);
      setSheetOffset((prev) => {
        if (!sheetInitializedRef.current) {
          sheetInitializedRef.current = true;
          return nextMax > 0 ? Math.min(nextMax, Math.round(nextMax * 0.35)) : 0;
        }
        return clamp(prev, 0, nextMax);
      });
    };

    updateSheetMetrics();
    window.addEventListener('resize', updateSheetMetrics);
    return () => window.removeEventListener('resize', updateSheetMetrics);
  }, [data]);

  const onSheetPointerDown = useCallback((event) => {
    if (maxSheetOffset <= 0) return;

    event.preventDefault();
    setIsSheetDragging(true);
    dragStateRef.current = { startY: event.clientY, startOffset: sheetOffset };
    if (event.currentTarget?.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }, [maxSheetOffset, sheetOffset]);

  const onSheetPointerMove = useCallback((event) => {
    if (!isSheetDragging) return;

    event.preventDefault();
    const deltaY = event.clientY - dragStateRef.current.startY;
    const nextOffset = clamp(dragStateRef.current.startOffset + deltaY, 0, maxSheetOffset);
    setSheetOffset(nextOffset);
  }, [isSheetDragging, maxSheetOffset]);

  const onSheetPointerUp = useCallback((event) => {
    if (!isSheetDragging) return;

    setIsSheetDragging(false);
    if (event.currentTarget?.releasePointerCapture) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch (_) {
      }
    }

    const snapPoints = [0, Math.round(maxSheetOffset * 0.45), maxSheetOffset];
    setSheetOffset((current) => {
      let nearest = snapPoints[0];
      let bestDist = Math.abs(current - nearest);
      for (let i = 1; i < snapPoints.length; i += 1) {
        const dist = Math.abs(current - snapPoints[i]);
        if (dist < bestDist) {
          bestDist = dist;
          nearest = snapPoints[i];
        }
      }
      return nearest;
    });
  }, [isSheetDragging, maxSheetOffset]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || isSheetDragging || !hasInitialFocusRef.current || !data) return;

    const { latitude, longitude, destination_lat, destination_lng } = data;
    if (latitude == null || longitude == null || destination_lat == null || destination_lng == null) return;

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([longitude, latitude]);
    bounds.extend([destination_lng, destination_lat]);
    map.fitBounds(bounds, { padding: getMapPadding(), duration: 450 });
  }, [sheetOffset, isSheetDragging, data, getMapPadding]);

  // ─── Try to open in app ─────────────────────────────
  useEffect(() => {
    if (!token) return;
    // Attempt deep link on first load (fire-and-forget)
    const timeout = setTimeout(() => {
      window.location.href = `${DEEP_LINK_SCHEME}${token}`;
    }, 300);
    // Cleanup if user stays on page (app not installed)
    const cancelTimeout = setTimeout(() => clearTimeout(timeout), 2000);
    return () => {
      clearTimeout(timeout);
      clearTimeout(cancelTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Theme persistence ──────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('viax-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // ─── Initialize Map ─────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12',
      center: [-75.5812, 6.2442], // Medellín fallback
      zoom: 13,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Update map style on theme change ───────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const newStyle = isDark
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/streets-v12';
    // When style changes, route source/layer are lost
    lastRouteKey.current = '';
    map.setStyle(newStyle);
  }, [isDark]);

  // ─── Fetch route from Mapbox Directions API ─────────
  const fetchRoute = useCallback(async (map, origin, destination) => {
    const key = `${origin[0].toFixed(4)},${origin[1].toFixed(4)}-${destination[0].toFixed(4)},${destination[1].toFixed(4)}`;
    if (key === lastRouteKey.current) return;
    lastRouteKey.current = key;

    try {
      const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json.routes || json.routes.length === 0) return;

      const route = json.routes[0];
      const geojson = { type: 'Feature', geometry: route.geometry };

      setRouteInfo({
        distanceKm: (route.distance / 1000).toFixed(1),
        durationMin: Math.ceil(route.duration / 60),
      });

      if (!map.isStyleLoaded()) {
        await new Promise((resolve) => map.once('style.load', resolve));
      }

      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      } else {
        map.addSource('route', { type: 'geojson', data: geojson });
        map.addLayer({
          id: 'route-border',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.6 },
        });
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#2196f3', 'line-width': 5, 'line-opacity': 0.85 },
        });
      }
    } catch (err) {
      console.warn('[LocationShare] Route fetch error:', err);
    }
  }, []);

  // ─── Update markers on data change ──────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data) return;

    const { latitude, longitude, heading, destination_lat, destination_lng } = data;

    if (latitude != null && longitude != null) {
      const lngLat = [longitude, latitude];

      if (!markerRef.current) {
        // Create sharer marker
        const el = document.createElement('div');
        el.className = 'ls-marker ls-marker--sharer';
        el.innerHTML = `
          <div class="ls-marker__pulse"></div>
          <div class="ls-marker__dot">
            <svg class="ls-marker__arrow" viewBox="0 0 24 24" fill="white" width="18" height="18">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        `;
        markerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(lngLat)
          .addTo(map);
      } else {
        markerRef.current.setLngLat(lngLat);
      }

      // Rotate arrow
      const dotEl = markerRef.current.getElement().querySelector('.ls-marker__dot');
      if (dotEl) dotEl.style.transform = `rotate(${heading || 0}deg)`;
    }

    // Destination marker
    if (destination_lat != null && destination_lng != null) {
      const destLngLat = [destination_lng, destination_lat];

      if (!destMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'ls-marker ls-marker--destination';
        el.innerHTML = `
          <div class="ls-marker__flag">
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
              <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
            </svg>
          </div>
          <div class="ls-marker__stem"></div>
        `;
        destMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(destLngLat)
          .addTo(map);
      } else {
        destMarkerRef.current.setLngLat(destLngLat);
      }

      // Fit both markers
      if (latitude != null && longitude != null) {
        // Fetch route between sharer and destination
        fetchRoute(map, [longitude, latitude], [destination_lng, destination_lat]);

        if (!hasInitialFocusRef.current) {
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([longitude, latitude]);
          bounds.extend(destLngLat);
          map.fitBounds(bounds, { padding: getMapPadding(), duration: 900 });
          hasInitialFocusRef.current = true;
        }
      }
    } else if (latitude != null && longitude != null && !hasInitialFocusRef.current) {
      map.flyTo({ center: [longitude, latitude], zoom: 15, duration: 900 });
      hasInitialFocusRef.current = true;
    }
  }, [data, fetchRoute]);

  // ─── Center map ─────────────────────────────────────
  const centerMap = useCallback(() => {
    const map = mapRef.current;
    if (!map || !data) return;
    const { latitude, longitude, destination_lat, destination_lng } = data;
    if (latitude == null || longitude == null) return;

    if (destination_lat != null && destination_lng != null) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([longitude, latitude]);
      bounds.extend([destination_lng, destination_lat]);
      map.fitBounds(bounds, { padding: getMapPadding(), duration: 600 });
    } else {
      map.flyTo({ center: [longitude, latitude], zoom: 15, duration: 600 });
    }
  }, [data, getMapPadding]);

  // ─── Format remaining time ──────────────────────────
  const formatRemaining = (seconds) => {
    if (!seconds || seconds <= 0) return 'Expirado';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    return `${m} min`;
  };

  const centerButtonBottom = (() => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const panelHeight = panelRef.current?.offsetHeight ?? (isDesktop ? 320 : 280);
    const visiblePanelHeight = Math.max(0, panelHeight - sheetOffset);
    const value = Math.min(
      Math.max(90, visiblePanelHeight + (isDesktop ? 24 : 20)),
      isDesktop ? 220 : 520,
    );
    return `${Math.round(value)}px`;
  })();

  // ─── Render ─────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>{data?.sharer_name ? `${data.sharer_name} — Ubicación en vivo | Viax` : 'Ubicación en vivo | Viax'}</title>
        <meta name="description" content="Sigue la ubicación en tiempo real de un usuario de Viax." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className={`ls-page ${isDark ? 'ls-page--dark' : ''}`}>
        {/* Map */}
        <div className="ls-map" ref={mapContainer} />

        {/* Loading overlay */}
        {loading && (
          <div className="ls-overlay">
            <div className="ls-spinner" />
            <p className="ls-overlay__text">Cargando ubicación…</p>
          </div>
        )}

        {/* Error / Expired overlay */}
        {!loading && (error || expired) && (
          <div className="ls-overlay">
            <div className="ls-error-card">
              <div className="ls-error-card__icon">
                {expired ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                )}
              </div>
              <h2 className="ls-error-card__title">
                {expired ? 'Sesión finalizada' : 'Enlace no disponible'}
              </h2>
              <p className="ls-error-card__desc">
                {expired ? 'La sesión de compartir ubicación ha expirado.' : error}
              </p>
              {data?.sharer_name && (
                <p className="ls-error-card__meta">Compartido por {data.sharer_name}</p>
              )}
              <a href="/" className="btn btn--primary ls-error-card__btn">
                Ir a Viax
              </a>
            </div>
          </div>
        )}

        {/* Top Bar */}
        {!loading && !error && !expired && (
          <div className="ls-topbar">
            <a href="/" className="ls-topbar__close" title="Cerrar">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </a>
            <span className="ls-topbar__dot" />
            <span className="ls-topbar__title">Ubicación en tiempo real</span>
            {data?.remaining_seconds > 0 && (
              <span className="ls-topbar__badge">
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" style={{ marginRight: 4, verticalAlign: -1 }}>
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                {formatRemaining(data.remaining_seconds)}
              </span>
            )}
            <button
              className="ls-topbar__theme"
              onClick={() => setIsDark((prev) => !prev)}
              title="Cambiar tema"
            >
              {isDark ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M9.5 2c-1.82 0-3.53.5-5 1.35 2.99 1.73 5 4.95 5 8.65s-2.01 6.92-5 8.65c1.47.85 3.18 1.35 5 1.35 5.52 0 10-4.48 10-10S15.02 2 9.5 2z"/>
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Center button */}
        {!loading && !error && !expired && (
          <button className="ls-center-btn" onClick={centerMap} title="Centrar mapa" style={{ bottom: centerButtonBottom }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
          </button>
        )}

        {/* Bottom Panel */}
        {!loading && !error && !expired && data && (
          <div
            ref={panelRef}
            className={`ls-panel ${isSheetDragging ? 'ls-panel--dragging' : ''}`}
            style={{ '--ls-sheet-offset': `${sheetOffset}px` }}
          >
            <div
              className="ls-panel__grab"
              onPointerDown={onSheetPointerDown}
              onPointerMove={onSheetPointerMove}
              onPointerUp={onSheetPointerUp}
              onPointerCancel={onSheetPointerUp}
            >
              <div className="ls-panel__handle" />
            </div>

            {/* User info */}
            <div className="ls-panel__user">
              <div className="ls-panel__avatar">
                {data.sharer_photo ? (
                  <img src={resolvePhotoUrl(data.sharer_photo)} alt={data.sharer_name || 'Usuario'} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <div className="ls-panel__info">
                <h3 className="ls-panel__name">{data.sharer_name || 'Usuario Viax'}</h3>
                <div className="ls-panel__status">
                  <span className="ls-panel__status-dot" />
                  <span>Compartiendo ubicación</span>
                </div>
              </div>
              {data.vehicle_plate && (
                <div className="ls-panel__plate">{data.vehicle_plate}</div>
              )}
            </div>

            {/* Route info (ETA + distance) */}
            {routeInfo && (
              <div className="ls-panel__route-info">
                <div className="ls-panel__route-item">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <span>{routeInfo.durationMin} min</span>
                </div>
                <div className="ls-panel__route-sep" />
                <div className="ls-panel__route-item">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>
                  </svg>
                  <span>{routeInfo.distanceKm} km</span>
                </div>
              </div>
            )}

            {/* Destination */}
            {data.destination_address && (
              <div className="ls-panel__dest">
                <div className="ls-panel__dest-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
                  </svg>
                </div>
                <div className="ls-panel__dest-info">
                  <span className="ls-panel__dest-label">Destino</span>
                  <span className="ls-panel__dest-addr">{data.destination_address}</span>
                </div>
              </div>
            )}

            {/* Speed & Vehicle */}
            {(data.speed > 0.5 || data.vehicle_info) && (
              <div className="ls-panel__meta-row">
                {data.speed > 0.5 && (
                  <div className="ls-panel__meta-item">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M20.38 8.57l-1.23 1.85a8 8 0 01-.22 7.58H5.07A8 8 0 0115.58 6.85l1.85-1.23A10 10 0 003.35 19a2 2 0 001.72 1h13.85a2 2 0 001.74-1 10 10 0 00-.27-10.44z"/>
                    </svg>
                    <span>{Math.round(data.speed * 3.6)} km/h</span>
                  </div>
                )}
                {data.vehicle_info && (
                  <div className="ls-panel__meta-item">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                    <span>{data.vehicle_info}</span>
                  </div>
                )}
              </div>
            )}

            {/* Branding */}
            <div className="ls-panel__brand">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ opacity: 0.4 }}>
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
              <span>Viax — Viaja fácil, llega rápido</span>
            </div>

            {/* Open in app */}
            <a href={`${DEEP_LINK_SCHEME}${token}`} className="ls-panel__app-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ marginRight: 8, verticalAlign: -3 }}>
                <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
              </svg>
              Abrir en la app
            </a>
          </div>
        )}
      </div>
    </>
  );
}

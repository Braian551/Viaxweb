import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Viax Colombia';
const SITE_URL = 'https://viaxcol.online';
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

function normalizePath(path) {
  if (!path || path === '/') return '/';
  return path.replace(/\/+$/, '');
}

export default function SeoMeta({
  title,
  description,
  path = '/',
  keywords,
  type = 'website',
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd,
}) {
  const canonicalPath = normalizePath(path);
  const canonical = `${SITE_URL}${canonicalPath}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Viaja fácil, llega rápido`;

  return (
    <Helmet>
      <html lang="es-CO" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <link rel="canonical" href={canonical} />

      <meta property="og:locale" content="es_CO" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <link rel="alternate" hrefLang="es-CO" href={canonical} />
      <link rel="alternate" hrefLang="es" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/`} />

      {jsonLd
        ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        : null}
    </Helmet>
  );
}

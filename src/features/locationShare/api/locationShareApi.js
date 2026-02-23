/**
 * Location Share — API Client
 *
 * Handles all HTTP communication with the location sharing backend.
 * Uses polling to fetch the sharer's position.
 */

const API_URL = __API_URL__;

/**
 * Fetches the current shared location for a given token.
 * @param {string} token — unique share token
 * @returns {Promise<{success: boolean, data?: object, message?: string, expired?: boolean}>}
 */
export async function fetchSharedLocation(token) {
  const url = `${API_URL}/location_sharing/get_location.php?token=${encodeURIComponent(token)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const json = await response.json();

  if (json.success) {
    return { success: true, data: json.data };
  }

  // Handle expired / gone (410)
  if (response.status === 410) {
    return {
      success: false,
      expired: true,
      data: json.data ?? {},
      message: json.message,
    };
  }

  return { success: false, message: json.message ?? 'Error desconocido' };
}

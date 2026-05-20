/**
 * Robustly cleans and prepares an access token for Meta Graph API calls.
 * Removes whitespace, quotes, and handles object inputs.
 * Returns an ENCODED string ready for URL concatenation.
 */
export const getCleanToken = (raw) => {
  if (!raw) return '';
  let token = '';
  
  if (typeof raw === 'string') {
    token = raw.trim();
  } else if (typeof raw === 'object' && raw !== null) {
    token = (
      raw.accessToken || 
      raw.access_token || 
      raw.token || 
      (raw.authResponse && raw.authResponse.accessToken) || 
      ''
    ).toString().trim();
  } else {
    token = String(raw || '').trim();
  }

  // Remove noise like quotes which often cause "Cannot parse access token" errors
  token = token.replace(/["']/g, '');
  
  // Return encoded version for safe URL usage
  return encodeURIComponent(token);
};

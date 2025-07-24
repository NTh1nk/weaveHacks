// Shared API configuration and fallback fetch logic

const LOCAL_API_BASE_URL = 'http://localhost:4000';
const REMOTE_API_BASE_URL = 'http://20.84.58.132';

async function fetchWithFallback(path, options) {
  try {
    const res = await fetch(`${LOCAL_API_BASE_URL}${path}`, options);
    if (!res.ok) throw new Error('Localhost returned non-OK');
    return res;
  } catch (err) {
    // Try remote
    try {
      const res = await fetch(`${REMOTE_API_BASE_URL}${path}`, options);
      return res;
    } catch (remoteErr) {
      throw remoteErr;
    }
  }
}

module.exports = {
  LOCAL_API_BASE_URL,
  REMOTE_API_BASE_URL,
  fetchWithFallback,
}; 
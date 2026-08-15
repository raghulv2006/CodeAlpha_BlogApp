import { auth } from './firebase';

export const authFetch = async (url, options = {}) => {
  let token = null;
  if (auth && auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (err) {
      console.error('Failed to get Firebase token:', err);
    }
  }

  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
};

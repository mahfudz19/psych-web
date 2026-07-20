export const isAuthenticated = () => {
  return document.cookie.includes('token=');
};
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Set default Content-Type untuk POST/PUT request
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`http://localhost:8080${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada server");
  }

  return data;
};
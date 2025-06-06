const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 
  (import.meta.env.MODE === 'production' 
    ? "https://job-search-ypji.onrender.com/api/v1"
    : "http://localhost:4000/api/v1");

export default API_BASE_URL;
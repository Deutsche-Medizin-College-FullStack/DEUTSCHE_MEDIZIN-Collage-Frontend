import axios from "axios";

const noAuthEndpoints = [
  "/just random",
  // "/enums/genders",
  // "/enums/marital-statuses",
  // "/impairments",
  // "/woreda",
  // "/zone",
  // "/region",
  // "/school-backgrounds",
  // "/departments",
  // "/class-years",
  // "/semesters",
  //"/program-levels",
  // "/filters/options",
  // '/program-modality',
];

const apiClient = axios.create({
   baseURL: "https://concise-skunk-preferably.ngrok-free.app/api",

  // baseURL:"https://deutschemedizin-collage-backend-production.up.railway.app/api",
  headers: {
    "ngrok-skip-browser-warning": "true",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // Check if the current endpoint is in the no-auth list
  const requiresAuth = !noAuthEndpoints.some((endpoint) => {
    // Check if the config URL ends with the no-auth endpoint
    return config.url?.endsWith(endpoint);
  });

  console.log(`Request to ${config.url}, requires auth: ${requiresAuth}`);

  const token = localStorage.getItem("xy9a7b");
  if (token && requiresAuth) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token attached to request");
  } else if (!requiresAuth) {
    console.log("No auth required for this endpoint");
    // Explicitly remove Authorization header for no-auth endpoints
    delete config.headers.Authorization;
  } else {
    console.log("No token found or auth not required");
  }

  return config;
});

// Response interceptor to handle 401 and 403 errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: ${response.status}`);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // Handle token expiration - redirect to login or clear token
      localStorage.removeItem("xy9a7b");
      console.error("Authentication failed: Token expired or invalid");
      // You can add redirect logic here if needed
      // window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Handle forbidden access - possibly redirect to login or show error
      console.error(
        "Access forbidden: You do not have permission to access this resource"
      );
      // You can add redirect logic here if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

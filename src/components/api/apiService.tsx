import apiClient from "./apiClient";
const apiService = {
  get: async (url, params = {}, config = {}) => {
    const response = await apiClient.get(url, { params, ...config });
    return response.data;
  },
  post: async (url, data, config = {}) => {
    const response = await apiClient.post(url, data, config);
    return response.data;
  },
  put: async (url, data, config = {}) => {
    const response = await apiClient.put(url, data, config);
    return response.data;
  },
  patch: async (url, data, config = {}) => {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  },
  delete: async (url, config = {}) => {
    const response = await apiClient.delete(url, config);
    return response.data;
  },
};
export default apiService;

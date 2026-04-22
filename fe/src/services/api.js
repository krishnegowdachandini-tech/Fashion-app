import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE || "http://localhost:5000";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${IMAGE_BASE}${imagePath}`;
};

const api = axios.create({ baseURL: API_BASE });

const buildCrud = (resource) => ({
  getAll: (params) => api.get(`/${resource}`, { params }).then((r) => r.data),
  getById: (id) => api.get(`/${resource}/${id}`).then((r) => r.data),
  create: (data) => api.post(`/${resource}`, data).then((r) => r.data),
  update: (id, data) => api.put(`/${resource}/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/${resource}/${id}`).then((r) => r.data),
});

export const specsApi = buildCrud("specs");
export const bagsApi = buildCrud("bags");
export const cosmeticsApi = buildCrud("cosmetics");

export const categoryApi = {
  specs: specsApi,
  bags: bagsApi,
  cosmetics: cosmeticsApi,
};

export const getAllProducts = async (filters = {}) => {
  const [specsRes, bagsRes, cosmeticsRes] = await Promise.all([
    specsApi.getAll(filters),
    bagsApi.getAll(filters),
    cosmeticsApi.getAll(filters),
  ]);
  return [
    ...specsRes.data,
    ...bagsRes.data,
    ...cosmeticsRes.data,
  ];
};

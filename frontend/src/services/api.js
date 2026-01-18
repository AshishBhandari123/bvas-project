import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || { message: "Network error" });
  },
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getCurrentUser: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  getAllUsers: () => api.get("/auth/users"),
  createUser: (data) => api.post("/auth/users", data),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// Bills API
export const billAPI = {
  getAllBills: (params) => api.get("/bills", { params }),
  getVendorBills: () => api.get("/bills/vendor"),
  getPendingBills: () => api.get("/bills/pending"),
  getBillById: (id) => api.get(`/bills/${id}`),
  createBill: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "districtData") {
        formData.append(key, JSON.stringify(data[key]));
      } else if (key === "documents") {
        data[key].forEach((file) => formData.append("documents", file));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post("/bills", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  submitBill: (id) => api.put(`/bills/${id}/submit`),
  approveBill: (id, remarks) => api.put(`/bills/${id}/approve`, { remarks }),
  rejectBill: (id, remarks) => api.put(`/bills/${id}/reject`, { remarks }),
  updateBill: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "districtData") {
        formData.append(key, JSON.stringify(data[key]));
      } else if (key === "documents") {
        data[key].forEach((file) => formData.append("documents", file));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/bills/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getApprovedBills: () => api.get("/bills/approved"),
  getRejectedBills: () => api.get("/bills/rejected"),
  deleteBill: (id) => api.delete(`/bills/${id}`),
  getBillStatistics: () => api.get("/bills/stats"),
  getBillAuditLogs: (id) => api.get(`/bills/${id}/audit`),
};

// Audit API
export const auditAPI = {
  getAuditLogs: (params) => api.get("/audit", { params }),
};

export default api;

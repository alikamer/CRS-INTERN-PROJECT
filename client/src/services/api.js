import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5296/api', // .NET Backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* 
 * BUG FIX/Eksik kod logic tamamnlandı
 * Backend'deki JWT token ömrü 15 dakika olduğu için, sayfada biraz vakit geçirince 
 * token ölüyor ve API istekleri (örn: B2B analiz verisi) "401 Unauthorized" iletilmiyordu. 
 * Interceptor ekledik bunu çözmek için.
 *401 döndüğünde arka planda refresh-token ile yeni token alıp isteği  baştan deniyoruz. 
 */

// Response interceptor to handle 401 Token Expiration auto !!!!!
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Eğer hata 401 Unauthorized ise ve daha önce bu isteği yenilemeyi denemediysek (_retry flag)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Yeni token almak için refresh-token endpoint'ine istek at
        const res = await axios.post('http://localhost:5296/api/Auth/refresh-token', {
          refreshToken: refreshToken
        });

        const newAccessToken = res.data.token;
        const newRefreshToken = res.data.refreshToken;

        // Yeni tokenları localStorage'a kaydet
        localStorage.setItem('token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Başarısız olan orijinal isteğin header'ını yeni token ile güncelle ve tekrar dene
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error("Token yenileme başarısız oldu, oturum sonlandırılıyor.", refreshError);
        // Refresh token da patladıysa (süresi doldu vs.) veya yoksa kullanıcıyı temizleyip login'e at
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/*  
  API CALL
  Burada yazdığımız yeni getAllReceipts fonksiyonu, URL sonuna query stringleri 
  (pageNumber, pageSize, status) ekleyerek backend'e istek atıyor.
 */
export const getAllReceipts = async (pageNumber = 1, pageSize = 10, status = '') => {
  let url = `/Receipts/all?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (status) {
    url += `&status=${status}`;
  }
  const response = await api.get(url);
  return response.data;
};

// Consumer Profile Endpoint'leri
export const getConsumerProfile = async () => {
  const response = await api.get('/Consumer/profile');
  return response.data;
};

export const updateConsumerProfile = async (profileData) => {
  const response = await api.put('/Consumer/profile', profileData);
  return response.data;
};

export const getPendingTenants = async () => {
  const response = await api.get('/Admin/pending-tenants');
  return response.data;
};

export const getBrands = async () => {
  const response = await api.get('/Admin/brands');
  return response.data;
};

export const approveTenant = async (tenantId, brandId, subscriptionTier) => {
  const response = await api.post(`/Admin/tenants/${tenantId}/approve`, {
    brandId,
    subscriptionTier,
  });
  return response.data;
};

export const rejectTenant = async (tenantId) => {
  const response = await api.post(`/Admin/tenants/${tenantId}/reject`);
  return response.data;
};

export const getAllTenants = async () => {
  const response = await api.get('/Admin/tenants');
  return response.data;
};

export const updateTenantSubscription = async (tenantId, subscriptionTier) => {
  const response = await api.post(`/Admin/tenants/${tenantId}/subscription`, { subscriptionTier });
  return response.data;
};

export const deactivateTenant = async (tenantId) => {
  const response = await api.post(`/Admin/tenants/${tenantId}/deactivate`);
  return response.data;
};

export const activateTenant = async (tenantId) => {
  const response = await api.post(`/Admin/tenants/${tenantId}/activate`);
  return response.data;
};

export const getAllBrandsForManagement = async () => {
  const response = await api.get('/Admin/brands/all');
  return response.data;
};

export const createBrand = async (name) => {
  const response = await api.post('/Admin/brands', { name, logoUrl: null });
  return response.data;
};

export const updateBrand = async (brandId, name, logoUrl) => {
  const response = await api.put(`/Admin/brands/${brandId}`, { name, logoUrl });
  return response.data;
};

export const deactivateBrand = async (brandId) => {
  const response = await api.post(`/Admin/brands/${brandId}/deactivate`);
  return response.data;
};

export const activateBrand = async (brandId) => {
  const response = await api.post(`/Admin/brands/${brandId}/activate`);
  return response.data;
};

export const getTeam = async () => {
  const response = await api.get('/Corporate/team');
  return response.data;
};

export const inviteTeamMember = async (email) => {
  const response = await api.post('/Corporate/team/invite', { email });
  return response.data;
};

export default api;

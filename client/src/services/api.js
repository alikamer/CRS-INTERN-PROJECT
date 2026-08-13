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

// Consumer Profile Güncelleme Endpoint'i
export const updateConsumerProfile = async (profileData) => {
  const response = await api.put('/Consumer/profile', profileData);
  return response.data;
};

export default api;

// API Client Utility
const API_BASE_URL = 'http://localhost:5000/api';

class APIClient {
  static getToken() {
    return localStorage.getItem('token');
  }

  static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`,
    };
  }

  static async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async patch(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async put(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

// Menu API methods
class MenuAPI {
  static async getMenuItems(restaurantId, category = 'all') {
    const endpoint = category === 'all' 
      ? `/menu/restaurant/${restaurantId}`
      : `/menu/category/${category}?restaurantId=${restaurantId}`;
    return APIClient.get(endpoint);
  }
}

// Order API methods
class OrderAPI {
  static async createOrder(data) {
    return APIClient.post('/orders', data);
  }

  static async getOrders(restaurantId) {
    return APIClient.get(`/orders/restaurant/${restaurantId}`);
  }

  static async getOrderById(orderId) {
    return APIClient.get(`/orders/${orderId}`);
  }

  static async updateOrderStatus(orderId, status) {
    return APIClient.patch(`/orders/${orderId}/status`, { status });
  }
}

// Billing API methods
class BillingAPI {
  static async createBilling(data) {
    return APIClient.post('/billing', data);
  }

  static async getBillings(restaurantId) {
    return APIClient.get(`/billing/restaurant/${restaurantId}`);
  }
}

// Attendance API methods
class AttendanceAPI {
  static async checkIn(data) {
    return APIClient.post('/attendance/check-in', data);
  }

  static async checkOut(data) {
    return APIClient.post('/attendance/check-out', data);
  }

  static async getHistory(userId, filters = {}) {
    let endpoint = `/attendance/history/${userId}`;
    const params = new URLSearchParams(filters);
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    return APIClient.get(endpoint);
  }

  static async getStaffStatus(restaurantId) {
    return APIClient.get(`/attendance/staff/status/${restaurantId}`);
  }
}

// Analytics API methods
class AnalyticsAPI {
  static async getSalesAnalytics(restaurantId, filters = {}) {
    let endpoint = `/analytics/sales/${restaurantId}`;
    const params = new URLSearchParams(filters);
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    return APIClient.get(endpoint);
  }

  static async getDashboardMetrics(restaurantId) {
    return APIClient.get(`/analytics/dashboard/${restaurantId}`);
  }

  static async getTopItems(restaurantId, limit = 10) {
    return APIClient.get(`/analytics/items/top/${restaurantId}?limit=${limit}`);
  }
}

// Restaurant API methods
class RestaurantAPI {
  static async getRestaurant(restaurantId) {
    return APIClient.get(`/restaurants/${restaurantId}`);
  }

  static async getAllRestaurants() {
    return APIClient.get('/restaurants');
  }

  static async createRestaurant(data) {
    return APIClient.post('/restaurants', data);
  }

  static async updateRestaurant(restaurantId, data) {
    return APIClient.put(`/restaurants/${restaurantId}`, data);
  }
}

// Payment API methods
class PaymentAPI {
  static async createPaymentOrder(data) {
    return APIClient.post('/payment/create-order', data);
  }

  static async verifyPayment(data) {
    return APIClient.post('/payment/verify', data);
  }

  static async getPaymentStatus(paymentId) {
    return APIClient.get(`/payment/${paymentId}`);
  }
}

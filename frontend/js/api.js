/* SheSparks API client. Include with <script src="/js/api.js"></script>.
   Frontend and API are served from the same origin by backend/server.js. */
(function () {
  const API_BASE = '/api';

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
    });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) {
      const message = payload && (payload.message || payload.error || payload.sqlMessage);
      throw new Error(message || `API request failed (${response.status})`);
    }
    return payload;
  }

  window.SheSparksAPI = {
    get: (path) => request(path),
    post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
    put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),        // ✅ เพิ่ม PUT
    delete: (path) => request(path, { method: 'DELETE' }),                                    // ✅ เพิ่ม DELETE

    members: () => request('/members'),
    member: (id) => request(`/members/${encodeURIComponent(id)}`),
    memberPoints: (id) => request(`/members/${encodeURIComponent(id)}/points`),
    studios: () => request('/studios'),
    rooms: () => request('/rooms'),
    availableRooms: (date, startTime, endTime) => request(`/rooms/available?${new URLSearchParams({ date, startTime, endTime })}`),
    sports: () => request('/sports'),
    trainers: () => request('/trainers'),
    availableTrainers: (date, startTime, endTime) => request(`/trainers/available?${new URLSearchParams({ date, startTime, endTime })}`),
    courses: () => request('/courses'),
    enrollCourse: (data) => request('/courses/enroll', { method: 'POST', body: JSON.stringify(data) }),
    bookings: () => request('/bookings'),
    memberBookings: (id) => request(`/bookings/member/${encodeURIComponent(id)}`),
    payments: (id) => request(`/payments/member/${encodeURIComponent(id)}`),
    rewards: () => request('/rewards'),
    redeemReward: (data) => request('/rewards/redeem', { method: 'POST', body: JSON.stringify(data) }),
    reports: {
      bookings: () => request('/reports/bookings'),
      revenue: () => request('/reports/revenue'),
      courses: () => request('/reports/courses'),
      members: () => request('/reports/members')
    }
  };
})();
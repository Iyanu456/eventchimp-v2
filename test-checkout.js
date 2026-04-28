import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

const testCheckout = async () => {
  try {
    // First, let's try to login to get a JWT token
    console.log('Attempting to login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'attendee@eventchimp.com',
      password: 'Password123!'
    });

    const token = loginResponse.data.data.token;
    console.log('Login successful, got token');

    const response = await axios.post(`${API_BASE}/payments/checkout`, {
      eventId: '69d013b61e90a046732116b8',
      ticketTypeId: 'general-admission',
      quantity: 1,
      attendeeFirstName: 'Oyerindei13',
      attendeeLastName: 'OYERINDE',
      attendeeEmail: 'oyerindei13@gmail.com',
      attendeePhone: '',
      comment: '',
      customAnswers: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Checkout successful:', response.data);
  } catch (error) {
    console.error('Checkout failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('Authentication failed. You may need to create a test user or use a different email/password.');
    }
  }
};

testCheckout();
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/requests`;

export const createRequest = async (requestData) => {
  try {
    const response = await axios.post(API_URL, requestData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const fetchRequests = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const fetchRequestById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const fetchNearbyRequests = async (latitude, longitude, radius = 10) => {
  try {
    const response = await axios.get(`${API_URL}/nearby`, {
      params: { latitude, longitude, radius }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const respondToRequest = async (requestId, payload) => {
  try {
    const response = await axios.post(`${API_URL}/${requestId}/respond`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const acceptDonorResponse = async (donationId) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/donations/${donationId}/accept`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const completeDonation = async (donationId, payload = {}) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/donations/${donationId}/complete`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};



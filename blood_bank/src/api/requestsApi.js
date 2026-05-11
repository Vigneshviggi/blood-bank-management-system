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

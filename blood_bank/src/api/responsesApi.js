import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/responses`;

export const submitResponse = async (responseData) => {
  try {
    const response = await axios.post(API_URL, responseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const fetchResponsesForRequest = async (requestId) => {
  try {
    const response = await axios.get(`${API_URL}/request/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

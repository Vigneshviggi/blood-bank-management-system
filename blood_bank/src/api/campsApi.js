import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/camps`;

export const fetchCamps = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const createCamp = async (campData) => {
  try {
    const response = await axios.post(API_URL, campData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

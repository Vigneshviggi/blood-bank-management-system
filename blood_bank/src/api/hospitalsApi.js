import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/hospitals`;

export const fetchHospitals = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const createHospital = async (hospitalData) => {
  try {
    const response = await axios.post(API_URL, hospitalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};
export const fetchStock = async () => {
  try {
    const response = await axios.get(`${API_URL}/stock`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

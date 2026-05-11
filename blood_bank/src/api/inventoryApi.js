import axios from 'axios';

const API_URL = 'http://localhost:5000/api/hospitals/stock';

export const fetchInventory = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

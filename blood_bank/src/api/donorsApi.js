import axios from 'axios';

const API_URL = 'http://localhost:5000/api/donors';

export const fetchDonors = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const createDonor = async (donorData) => {
  try {
    const response = await axios.post(API_URL, donorData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

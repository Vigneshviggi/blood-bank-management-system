import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/donors`;

export const fetchDonors = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const fetchNearbyDonors = async (latitude, longitude, radius = 10, bloodGroup = 'All', availability = 'available') => {
  try {
    const params = { latitude, longitude, radius };
    if (bloodGroup && bloodGroup !== 'All') {
      params.bloodGroup = bloodGroup;
    }
    if (availability && availability !== 'All') {
      params.availability = availability.toLowerCase();
    }
    const response = await axios.get(`${API_URL}/nearby`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const contactDonor = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}/contact`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const fetchDonorById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
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

export const updateDonor = async (id, donorData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, donorData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

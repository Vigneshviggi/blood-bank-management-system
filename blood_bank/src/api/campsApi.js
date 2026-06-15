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

export const fetchCampById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
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

export const registerForCamp = async (campId, registrationData) => {
  try {
    const response = await axios.post(`${API_URL}/${campId}/register`, registrationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const cancelRegistration = async (campId) => {
  try {
    const response = await axios.post(`${API_URL}/${campId}/cancel-registration`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const fetchCampAttendees = async (campId) => {
  try {
    const response = await axios.get(`${API_URL}/${campId}/attendees`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const fetchRegistrationStatus = async (campId, userId) => {
  try {
    const response = await axios.get(`${API_URL}/${campId}/registration-status`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const updateRegistrationStatus = async (registrationId, status) => {
  try {
    const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/camps/registration/${registrationId}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

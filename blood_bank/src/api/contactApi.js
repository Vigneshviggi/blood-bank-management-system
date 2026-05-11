import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/contact-support`;

export const submitContactMessage = async (messageData) => {
  try {
    const response = await axios.post(API_URL, messageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const fetchContactMessages = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

export const deleteContactMessage = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

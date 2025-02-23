import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log(API_BASE_URL)

// Register a new user
export const register = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    username,
    password,
  });
  return response.data;
};

// Login a user
export const login = async (username, password) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/login`,
    { username, password },
    { withCredentials: true }
  );
  return response.data;
};

// Logout a user
export const logout = async () => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/logout`,
    {},
    { withCredentials: true }
  );
  return response.data;
};

// Access a protected route => fectch current user/token info {id, iat, exp, username}
export const fetchProtectedData = async () => {
  const response = await axios.get(`${API_BASE_URL}/auth/protected`, {
    withCredentials: true,
  });
  return response.data;
};

// Check if a user is Logged In
export const isLoggedIn = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/protected`, {
      withCredentials: true,
    });
    return response.data;
  } catch (err) {
    return null;
  }
};

// Get the list of users
export const getUsers = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/chat/users`, {
    params: { userId },
    withCredentials: true,
  });
  return response.data;
};

// Get list of conversations
export const getConversations = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
    params: { userId },
    withCredentials: true,
  });
  return response.data;
};

// Join a room
export const joinGroup = async (userId, groupId) => {
  const response = await axios.post(
    `${API_BASE_URL}/chat/join`,
    { userId, groupId },
    { withCredentials: true }
  );
  return response.data;
};

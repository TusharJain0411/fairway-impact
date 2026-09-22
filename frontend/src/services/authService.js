import api from "./api";

export const registerRequest = async (formData) => {
  const response = await api.post("/users/register", formData);
  return response.data;
};

export const loginRequest = async (formData) => {
  const response = await api.post("/users/login", formData);
  return response.data;
};

export const getProfileRequest = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateCharitySettingsRequest = async (data) => {
  const response = await api.put("/users/charity-settings", data);
  return response.data;
};
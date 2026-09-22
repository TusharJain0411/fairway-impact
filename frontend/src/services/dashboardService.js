import api from "./api";

export const getUserDashboardRequest = async () => {
  const response = await api.get("/users/dashboard");
  return response.data;
};

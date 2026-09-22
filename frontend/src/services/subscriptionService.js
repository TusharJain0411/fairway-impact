import api from "./api";

export const createSubscriptionRequest = async (data) => {
  const response = await api.post("/subscriptions/create", data);
  return response.data;
};

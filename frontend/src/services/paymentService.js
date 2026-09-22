import api from "./api";

export const createPaymentOrderRequest = async (subscriptionId) => {
  const response = await api.post("/payments/create-order", {
    subscriptionId,
  });

  return response.data;
};

export const verifyPaymentRequest = async (paymentData) => {
  const response = await api.post("/payments/verify", paymentData);
  return response.data;
};

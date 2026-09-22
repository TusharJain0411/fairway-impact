import api from "./api";

export const getCharitiesRequest = async () => {
  const response = await api.get("/charities");
  return response.data;
};

import api from "./api";

export const getMyWinningsRequest = async () => {
  const response = await api.get("/winners/my-winnings");
  return response.data;
};

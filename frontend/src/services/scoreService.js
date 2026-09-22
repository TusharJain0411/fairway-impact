import api from "./api";

export const getScoresRequest = async () => {
  const response = await api.get("/scores");
  return response.data;
};

export const createScoreRequest = async (scoreData) => {
  const response = await api.post("/scores", scoreData);
  return response.data;
};

export const updateScoreRequest = async (scoreId, scoreData) => {
  const response = await api.put(`/scores/${scoreId}`, scoreData);
  return response.data;
};

export const deleteScoreRequest = async (scoreId) => {
  const response = await api.delete(`/scores/${scoreId}`);
  return response.data;
};

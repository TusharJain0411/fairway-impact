import api from "./api";

export const getAdminDashboardRequest = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getAdminUsersRequest = async (search = "") => {
  const response = await api.get("/admin/users", {
    params: { search },
  });

  return response.data;
};

export const getAdminUserByIdRequest = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateAdminUserRequest = async (userId, data) => {
  const response = await api.patch(`/admin/users/${userId}`, data);
  return response.data;
};

export const disableAdminUserRequest = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getAdminCharitiesRequest = async () => {
  const response = await api.get("/charities/admin/all");
  return response.data;
};

export const createCharityRequest = async (data) => {
  const response = await api.post("/charities", data);
  return response.data;
};

export const updateCharityRequest = async (charityId, data) => {
  const response = await api.put(`/charities/${charityId}`, data);
  return response.data;
};

export const deleteCharityRequest = async (charityId) => {
  const response = await api.delete(`/charities/${charityId}`);
  return response.data;
};

export const getAdminDrawsRequest = async () => {
  const response = await api.get("/draws/admin/all");
  return response.data;
};

export const createDrawRequest = async (data) => {
  const response = await api.post("/draws", data);
  return response.data;
};

export const openDrawRequest = async (drawId) => {
  const response = await api.patch(`/draws/${drawId}/open`);
  return response.data;
};

export const simulateDrawRequest = async (drawId) => {
  const response = await api.post(`/draws/${drawId}/simulate`);
  return response.data;
};

export const publishDrawRequest = async (drawId) => {
  const response = await api.post(`/draws/${drawId}/publish`);
  return response.data;
};

export const updateDrawModeRequest = async (drawId, drawMode) => {
  const response = await api.patch(`/draws/${drawId}/mode`, {
    drawMode,
  });

  return response.data;
};

export const getAdminWinnersRequest = async () => {
  const response = await api.get("/winners/admin/all");
  return response.data;
};

export const markWinnerPaidRequest = async (winnerId) => {
  const response = await api.patch(`/winners/${winnerId}/mark-paid`);
  return response.data;
};

export const endDrawRequest = async (drawId) => {
  const response = await api.patch(`/draws/${drawId}/end`);
  return response.data;
};
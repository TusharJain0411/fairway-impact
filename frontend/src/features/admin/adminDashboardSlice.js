import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAdminDashboardRequest } from "../../services/adminService";

export const fetchAdminDashboard = createAsyncThunk(
  "adminDashboard/fetchAdminDashboard",
  async (_, { rejectWithValue }) => {
    try {
      return await getAdminDashboardRequest();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load admin dashboard.",
      );
    }
  },
);

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState: {
    data: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default adminDashboardSlice.reducer;

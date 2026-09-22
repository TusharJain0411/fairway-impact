import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserDashboardRequest } from "../../services/dashboardService";

export const fetchUserDashboard = createAsyncThunk(
  "dashboard/fetchUserDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUserDashboardRequest();
      return data.dashboard;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load dashboard.",
      );
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    data: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearDashboard: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;

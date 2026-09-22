import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAdminWinnersRequest,
  markWinnerPaidRequest,
} from "../../services/adminService";

export const fetchAdminWinners = createAsyncThunk(
  "adminWinners/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAdminWinnersRequest();
      return data.winners;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load winners.",
      );
    }
  },
);

export const markAdminWinnerPaid = createAsyncThunk(
  "adminWinners/markPaid",
  async (winnerId, { rejectWithValue }) => {
    try {
      return await markWinnerPaidRequest(winnerId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to update payout.",
      );
    }
  },
);

const adminWinnersSlice = createSlice({
  name: "adminWinners",
  initialState: {
    items: [],
    isLoading: false,
    isSaving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminWinners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminWinners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdminWinners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(markAdminWinnerPaid.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(markAdminWinnerPaid.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(markAdminWinnerPaid.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      });
  },
});

export default adminWinnersSlice.reducer;

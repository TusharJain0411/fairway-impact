import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getMyWinningsRequest } from "../../services/winningsService";

export const fetchMyWinnings = createAsyncThunk(
  "winnings/fetchMyWinnings",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyWinningsRequest();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load winnings.",
      );
    }
  },
);

const winningsSlice = createSlice({
  name: "winnings",
  initialState: {
    data: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyWinnings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyWinnings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchMyWinnings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default winningsSlice.reducer;

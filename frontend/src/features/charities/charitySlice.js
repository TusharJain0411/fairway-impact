import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCharitiesRequest } from "../../services/charityService";

export const fetchCharities = createAsyncThunk(
  "charities/fetchCharities",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCharitiesRequest();
      return data.charities;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load charities.",
      );
    }
  },
);

const charitySlice = createSlice({
  name: "charities",
  initialState: {
    items: [],
    selectedCharity: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    selectCharity: (state, action) => {
      state.selectedCharity = action.payload;
    },

    clearSelectedCharity: (state) => {
      state.selectedCharity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCharities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCharities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { selectCharity, clearSelectedCharity } = charitySlice.actions;

export default charitySlice.reducer;

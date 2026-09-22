import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import {
  createCharityRequest,
  deleteCharityRequest,
  getAdminCharitiesRequest,
  updateCharityRequest,
} from "../../services/adminService";

export const fetchAdminCharities = createAsyncThunk(
  "adminCharities/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAdminCharitiesRequest();
      return data.charities;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load charities.",
      );
    }
  },
);

export const createAdminCharity = createAsyncThunk(
  "adminCharities/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createCharityRequest(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to create charity.",
      );
    }
  },
);

export const updateAdminCharity = createAsyncThunk(
  "adminCharities/update",
  async ({ charityId, data }, { rejectWithValue }) => {
    try {
      return await updateCharityRequest(charityId, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to update charity.",
      );
    }
  },
);

export const removeAdminCharity = createAsyncThunk(
  "adminCharities/remove",
  async (charityId, { rejectWithValue }) => {
    try {
      return await deleteCharityRequest(charityId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to delete charity.",
      );
    }
  },
);

const adminCharitiesSlice = createSlice({
  name: "adminCharities",
  initialState: {
    items: [],
    isLoading: false,
    isSaving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminCharities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminCharities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdminCharities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addMatcher(
        isAnyOf(
          createAdminCharity.pending,
          updateAdminCharity.pending,
          removeAdminCharity.pending,
        ),
        (state) => {
          state.isSaving = true;
        },
      )
      .addMatcher(
        isAnyOf(
          createAdminCharity.fulfilled,
          updateAdminCharity.fulfilled,
          removeAdminCharity.fulfilled,
        ),
        (state) => {
          state.isSaving = false;
        },
      )
      .addMatcher(
        isAnyOf(
          createAdminCharity.rejected,
          updateAdminCharity.rejected,
          removeAdminCharity.rejected,
        ),
        (state, action) => {
          state.isSaving = false;
          state.error = action.payload;
        },
      );
  },
});

export default adminCharitiesSlice.reducer;

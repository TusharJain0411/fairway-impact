import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import {
  createDrawRequest,
  getAdminDrawsRequest,
  openDrawRequest,
  publishDrawRequest,
  simulateDrawRequest,
  updateDrawModeRequest,
  endDrawRequest,
} from "../../services/adminService";;

export const fetchAdminDraws = createAsyncThunk(
  "adminDraws/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAdminDrawsRequest();
      return data.draws;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load draws.",
      );
    }
  },
);

export const createAdminDraw = createAsyncThunk(
  "adminDraws/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createDrawRequest(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to create draw.",
      );
    }
  },
);

export const openAdminDraw = createAsyncThunk(
  "adminDraws/open",
  async (drawId, { rejectWithValue }) => {
    try {
      return await openDrawRequest(drawId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to open draw.",
      );
    }
  },
);

export const simulateAdminDraw = createAsyncThunk(
  "adminDraws/simulate",
  async (drawId, { rejectWithValue }) => {
    try {
      return await simulateDrawRequest(drawId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to simulate draw.",
      );
    }
  },
);

export const publishAdminDraw = createAsyncThunk(
  "adminDraws/publish",
  async (drawId, { rejectWithValue }) => {
    try {
      return await publishDrawRequest(drawId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to publish draw.",
      );
    }
  },
);

export const updateAdminDrawMode = createAsyncThunk(
  "adminDraws/updateMode",
  async ({ drawId, drawMode }, { rejectWithValue }) => {
    try {
      return await updateDrawModeRequest(drawId, drawMode);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to update draw mode.",
      );
    }
  },
);


export const endAdminDraw = createAsyncThunk(
  "adminDraws/end",
  async (drawId, { rejectWithValue }) => {
    try {
      return await endDrawRequest(drawId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to end draw.",
      );
    }
  },
);

const adminDrawsSlice = createSlice({
  name: "adminDraws",
  initialState: {
    items: [],
    isLoading: false,
    isSaving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDraws.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminDraws.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdminDraws.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addMatcher(
        isAnyOf(
          createAdminDraw.pending,
          openAdminDraw.pending,
          simulateAdminDraw.pending,
          publishAdminDraw.pending,
        ),
        (state) => {
          state.isSaving = true;
        },
      )
      .addMatcher(
        isAnyOf(
          createAdminDraw.fulfilled,
          openAdminDraw.fulfilled,
          simulateAdminDraw.fulfilled,
          publishAdminDraw.fulfilled,
        ),
        (state) => {
          state.isSaving = false;
        },
      )
      .addMatcher(
        isAnyOf(
          createAdminDraw.rejected,
          openAdminDraw.rejected,
          simulateAdminDraw.rejected,
          publishAdminDraw.rejected,
        ),
        (state, action) => {
          state.isSaving = false;
          state.error = action.payload;
        },
      );
  },
});

export default adminDrawsSlice.reducer;

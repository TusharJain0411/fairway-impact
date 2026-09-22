import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import {
  createScoreRequest,
  deleteScoreRequest,
  getScoresRequest,
  updateScoreRequest,
} from "../../services/scoreService";

export const fetchScores = createAsyncThunk(
  "scores/fetchScores",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getScoresRequest();
      return data.scores;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load scores.",
      );
    }
  },
);

export const addScore = createAsyncThunk(
  "scores/addScore",
  async (scoreData, { rejectWithValue }) => {
    try {
      return await createScoreRequest(scoreData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to add score.",
      );
    }
  },
);

export const editScore = createAsyncThunk(
  "scores/editScore",
  async ({ scoreId, scoreData }, { rejectWithValue }) => {
    try {
      return await updateScoreRequest(scoreId, scoreData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to update score.",
      );
    }
  },
);

export const removeScore = createAsyncThunk(
  "scores/removeScore",
  async (scoreId, { rejectWithValue }) => {
    try {
      return await deleteScoreRequest(scoreId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to delete score.",
      );
    }
  },
);

const scoreSlice = createSlice({
  name: "scores",
  initialState: {
    items: [],
    isLoading: false,
    isSaving: false,
    error: null,
  },
  reducers: {
    clearScoreError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScores.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchScores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addMatcher(
        isAnyOf(addScore.pending, editScore.pending, removeScore.pending),
        (state) => {
          state.isSaving = true;
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(addScore.fulfilled, editScore.fulfilled, removeScore.fulfilled),
        (state) => {
          state.isSaving = false;
        },
      )
      .addMatcher(
        isAnyOf(addScore.rejected, editScore.rejected, removeScore.rejected),
        (state, action) => {
          state.isSaving = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearScoreError } = scoreSlice.actions;

export default scoreSlice.reducer;

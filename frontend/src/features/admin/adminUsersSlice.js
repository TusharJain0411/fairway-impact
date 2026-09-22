import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  disableAdminUserRequest,
  getAdminUserByIdRequest,
  getAdminUsersRequest,
  updateAdminUserRequest,
} from "../../services/adminService";

export const fetchAdminUsers = createAsyncThunk(
  "adminUsers/fetchAdminUsers",
  async (search, { rejectWithValue }) => {
    try {
      return await getAdminUsersRequest(search);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load users.",
      );
    }
  },
);

export const fetchAdminUserDetails = createAsyncThunk(
  "adminUsers/fetchAdminUserDetails",
  async (userId, { rejectWithValue }) => {
    try {
      return await getAdminUserByIdRequest(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load user details.",
      );
    }
  },
);

export const updateAdminUser = createAsyncThunk(
  "adminUsers/updateAdminUser",
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      return await updateAdminUserRequest(userId, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to update user.",
      );
    }
  },
);

export const disableAdminUser = createAsyncThunk(
  "adminUsers/disableAdminUser",
  async (userId, { rejectWithValue }) => {
    try {
      return await disableAdminUserRequest(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to disable user.",
      );
    }
  },
);

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState: {
    users: [],
    total: 0,
    selectedUser: null,
    isLoading: false,
    isSaving: false,
    error: null,
  },
  reducers: {
    clearSelectedAdminUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.total = action.payload.total;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchAdminUserDetails.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })

      .addCase(updateAdminUser.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateAdminUser.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(updateAdminUser.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      .addCase(disableAdminUser.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(disableAdminUser.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(disableAdminUser.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedAdminUser } = adminUsersSlice.actions;

export default adminUsersSlice.reducer;

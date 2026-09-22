import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getProfileRequest,
  loginRequest,
  registerRequest,
} from "../../services/authService";

const storedToken = localStorage.getItem("fairwayImpactToken");
const storedUser = localStorage.getItem("fairwayImpactUser");

const saveSession = (token, user) => {
  localStorage.setItem("fairwayImpactToken", token);
  localStorage.setItem("fairwayImpactUser", JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem("fairwayImpactToken");
  localStorage.removeItem("fairwayImpactUser");
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      return await loginRequest(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to log in.",
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      return await registerRequest(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to create account.",
      );
    }
  },
);

export const loadCurrentUser = createAsyncThunk(
  "auth/loadCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await getProfileRequest();
    } catch (error) {
      return rejectWithValue("Session expired. Please log in again.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: storedToken || null,
    user: storedUser ? JSON.parse(storedUser) : null,
    isAuthenticated: Boolean(storedToken),
    isLoading: false,
    isCheckingSession: Boolean(storedToken),
    error: null,
  },
  reducers: {
    logoutUser: (state) => {
      clearSession();

      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    clearAuthError: (state) => {
      state.error = null;
    },
    updateAuthUser: (state, action) => {
      const updatedUser = {
        ...state.user,
        ...action.payload,
      };

      state.user = updatedUser;

      localStorage.setItem("fairwayImpactUser", JSON.stringify(updatedUser));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token, user } = action.payload;

        saveSession(token, user);

        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { token, user } = action.payload;

        saveSession(token, user);

        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isCheckingSession = false;

        localStorage.setItem(
          "fairwayImpactUser",
          JSON.stringify(action.payload.user),
        );
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        clearSession();

        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isCheckingSession = false;
      });
  },
});

export const { logoutUser, clearAuthError,updateAuthUser } = authSlice.actions;

export default authSlice.reducer;

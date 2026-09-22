import { createSlice } from "@reduxjs/toolkit";

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    selectedPlan: null,
    contributionPercent: 10,
  },
  reducers: {
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },

    setContributionPercent: (state, action) => {
      state.contributionPercent = action.payload;
    },

    clearSubscriptionSelection: (state) => {
      state.selectedPlan = null;
      state.contributionPercent = 10;
    },
  },
});

export const {
  setSelectedPlan,
  setContributionPercent,
  clearSubscriptionSelection,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;

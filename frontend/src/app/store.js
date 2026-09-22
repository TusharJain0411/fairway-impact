import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import charityReducer from "../features/charities/charitySlice";
import subscriptionReducer from "../features/subscription/subscriptionSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import scoreReducer from "../features/scores/scoreSlice";
import winningsReducer from "../features/winnings/winningsSlice";
import adminDashboardReducer from "../features/admin/adminDashboardSlice";
import adminUsersReducer from "../features/admin/adminUsersSlice";
import adminCharitiesReducer from "../features/admin/adminCharitiesSlice";
import adminDrawsReducer from "../features/admin/adminDrawsSlice";
import adminWinnersReducer from "../features/admin/adminWinnersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    charities: charityReducer,
    subscription: subscriptionReducer,
    dashboard: dashboardReducer,
    scores: scoreReducer,
    winnings: winningsReducer,
    adminDashboard: adminDashboardReducer,
    adminUsers: adminUsersReducer,
    adminCharities: adminCharitiesReducer,
    adminDraws: adminDrawsReducer,
    adminWinners: adminWinnersReducer,
    
  },
});

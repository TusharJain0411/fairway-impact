import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trophy,
  Heart,
  CalendarDays,
  CircleDollarSign,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import DashboardStat from "../components/Dashboard/DashboardStat";
import RecentScores from "../components/Dashboard/RecentScores";
import { LoadingState, ErrorState } from "../components/Common/PageStates";
import { fetchUserDashboard } from "../features/dashboard/dashboardSlice";
import "../styles/dashboard/dashboard.css";

const formatRupees = (amount = 0) =>
  `₹${Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatDrawMonth = (month) => {
  if (!month) return "No upcoming draw";

  return new Date(month).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

function Dashboard() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchUserDashboard());
  }, [dispatch]);

  if (isLoading && !data) {
    return <LoadingState text="Loading your dashboard..." />;
  }

  if (error && !data) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        message={error}
        onRetry={() => dispatch(fetchUserDashboard())}
      />
    );
  }

  const subscription = data?.subscription;
  const contributionPercent = subscription?.contributionPercent || 10;

  const yearlyTarget =
    subscription?.plan === "yearly"
      ? (12000 * contributionPercent) / 100
      : (1200 * 12 * contributionPercent) / 100;

  const yearlyContribution = data?.charityContributionThisYear || 0;

  const contributionProgress =
    yearlyTarget > 0
      ? Math.min((yearlyContribution / yearlyTarget) * 100, 100)
      : 0;

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">MEMBER DASHBOARD</p>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "Member"}.</h1>
          <p>Here is your golf, rewards, and impact overview.</p>
        </div>

        <Link to="/dashboard/scores" className="add-score-btn">
          Add a score <ArrowRight size={18} />
        </Link>
      </header>

      <div className="dashboard-stats-grid">
        <DashboardStat
          icon={<Trophy size={21} />}
          color="stat-yellow"
          title="Latest score"
          value={data?.latestScore ?? "—"}
          subtitle={
            data?.latestScore ? "Stableford points" : "No scores added yet"
          }
        />

        <DashboardStat
          icon={<Heart size={21} fill="currentColor" />}
          color="stat-pink"
          title="Charity impact"
          value={formatRupees(yearlyContribution)}
          subtitle="Contributed this year"
        />

        <DashboardStat
          icon={<CalendarDays size={21} />}
          color="stat-blue"
          title="Next draw"
          value={formatDrawMonth(data?.currentDraw?.month)}
          subtitle={
            data?.currentDraw?.isEntered ? "You are entered" : "Not entered yet"
          }
        />

        <DashboardStat
          icon={<CircleDollarSign size={21} />}
          color="stat-green"
          title="Total winnings"
          value={formatRupees(data?.totalWinnings)}
          subtitle={
            data?.totalWins
              ? `${data.totalWins} prize${data.totalWins > 1 ? "s" : ""} won`
              : "No prizes won yet"
          }
        />
      </div>

      <div className="dashboard-content-grid">
        <RecentScores scores={data?.recentScores || []} />

        <aside className="impact-panel">
          <p className="section-label">YOUR IMPACT</p>
          <h2>{subscription?.charity?.name || "No charity selected"}</h2>

          <p className="impact-description">
            {subscription
              ? `You donate ${contributionPercent}% of your membership to support this cause through golf.`
              : "Choose a membership and charity to begin making an impact."}
          </p>

          <div className="impact-progress-top">
            <span>Your yearly contribution</span>
            <strong>
              {formatRupees(yearlyContribution)} / {formatRupees(yearlyTarget)}
            </strong>
          </div>

          <div className="impact-progress-bar">
            <span style={{ width: `${contributionProgress}%` }} />
          </div>

          <Link to="/dashboard/my-charity" className="impact-link">
            View charity details <ArrowRight size={16} />
          </Link>
        </aside>
      </div>

      <section className="draw-banner">
        <div className="draw-banner-icon">
          <Trophy size={25} />
        </div>

        <div>
          <p className="section-label">MONTHLY DRAW</p>
          <h2>
            {data?.currentDraw?.isEntered
              ? "You are entered in the current draw."
              : "Add five scores to become eligible for the draw."}
          </h2>
          <p>
            Keep your five latest scores updated to stay ready for monthly
            rewards.
          </p>
        </div>

        <Link to="/dashboard/scores" className="draw-banner-btn">
          Update scores
        </Link>
      </section>
    </section>
  );
}

export default Dashboard;

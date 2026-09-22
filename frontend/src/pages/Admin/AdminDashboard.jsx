import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Trophy,
  Heart,
  CircleDollarSign,
  ArrowRight,
  Clock3,
} from "lucide-react";
import { Link } from "react-router-dom";

import { LoadingState, ErrorState } from "../../components/Common/PageStates";
import { fetchAdminDashboard } from "../../features/admin/adminDashboardSlice";
import "../../styles/admin/admin-dashboard.css";

const formatRupees = (amount = 0) =>
  `₹${Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatMonth = (date) => {
  if (!date) return "No current draw";

  return new Date(date).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function AdminDashboard() {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useSelector(
    (state) => state.adminDashboard,
  );

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  if (isLoading && !data) {
    return <LoadingState text="Loading admin dashboard..." />;
  }

  if (error && !data) {
    return (
      <ErrorState
        title="Unable to load admin dashboard"
        message={error}
        onRetry={() => dispatch(fetchAdminDashboard())}
      />
    );
  }

  const stats = data?.stats || {};
  const recentMembers = data?.recentMembers || [];
  const currentDraw = stats.currentDraw;
  const prizePool = stats.currentPrizePool || 0;

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div>
          <p className="admin-eyebrow">ADMIN OVERVIEW</p>
          <h1>Platform overview</h1>
          <p>Monitor memberships, draws, charities, and reward payouts.</p>
        </div>

        <Link to="/admin/draws" className="run-draw-btn">
          Manage draw <ArrowRight size={18} />
        </Link>
      </header>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <div className="admin-stat-icon admin-blue">
            <Users size={22} />
          </div>
          <div>
            <p>Total members</p>
            <h2>{stats.totalMembers || 0}</h2>
            <span>Registered non-admin accounts</span>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon admin-yellow">
            <Trophy size={22} />
          </div>
          <div>
            <p>Current prize pool</p>
            <h2>{formatRupees(prizePool)}</h2>
            <span>{formatMonth(currentDraw?.month)}</span>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon admin-pink">
            <Heart size={22} />
          </div>
          <div>
            <p>Charity contributions</p>
            <h2>{formatRupees(stats.charityContributionsThisMonth)}</h2>
            <span>Collected this month</span>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon admin-green">
            <CircleDollarSign size={22} />
          </div>
          <div>
            <p>Pending payouts</p>
            <h2>{stats.pendingPayouts || 0}</h2>
            <span>Winners awaiting payment</span>
          </div>
        </article>
      </section>

      <section className="admin-content-grid">
        <article className="draw-status-card">
          <div className="admin-card-top">
            <div>
              <p className="admin-eyebrow">CURRENT DRAW</p>
              <h2>{formatMonth(currentDraw?.month)}</h2>
            </div>

            <span className="draw-open-badge">
              <Clock3 size={14} />
              {currentDraw?.status || "Not created"}
            </span>
          </div>

          <p className="draw-status-text">
            {currentDraw
              ? `${currentDraw.eligibleSubscriberCount || 0} eligible members are included in this draw.`
              : "Create a draw to begin accepting eligible score entries."}
          </p>

          <div className="prize-pool-breakdown">
            <div>
              <span>5-number match</span>
              <strong>{formatRupees(prizePool * 0.4)}</strong>
              <small>40% prize pool</small>
            </div>

            <div>
              <span>4-number match</span>
              <strong>{formatRupees(prizePool * 0.35)}</strong>
              <small>35% prize pool</small>
            </div>

            <div>
              <span>3-number match</span>
              <strong>{formatRupees(prizePool * 0.25)}</strong>
              <small>25% prize pool</small>
            </div>
          </div>

          <Link to="/admin/draws" className="admin-card-link">
            Configure or run draw <ArrowRight size={16} />
          </Link>
        </article>

        <article className="verification-card">
          <p className="admin-eyebrow">ACTION REQUIRED</p>
          <h2>{stats.pendingPayouts || 0} payouts pending</h2>
          <p>
            Mark completed payouts after winners receive their draw rewards.
          </p>

          <div className="verification-users">
            <span>₹</span>
          </div>

          <Link to="/admin/winners" className="review-winners-btn">
            Manage payouts <ArrowRight size={16} />
          </Link>
        </article>
      </section>

      <section className="recent-members-section">
        <div className="recent-members-heading">
          <div>
            <p className="admin-eyebrow">RECENT MEMBERS</p>
            <h2>Latest registrations</h2>
          </div>

          <Link to="/admin/users">View all users</Link>
        </div>

        <div className="admin-table-wrapper">
          <div className="admin-table">
            <div className="admin-table-header">
              <span>Member</span>
              <span>Email</span>
              <span>Charity</span>
              <span>Joined on</span>
              <span>Status</span>
            </div>

            {recentMembers.map((member) => (
              <div className="admin-table-row" key={member._id}>
                <strong>{member.name}</strong>
                <span>{member.email}</span>
                <span>{member.selectedCharity?.name || "Not selected"}</span>
                <span>{formatDate(member.createdAt)}</span>

                <b
                  className={
                    member.isActive
                      ? "active-member-status"
                      : "inactive-member-status"
                  }
                >
                  {member.isActive ? "Active" : "Disabled"}
                </b>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;

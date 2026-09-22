import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trophy,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "../../components/Common/PageStates";
import { fetchMyWinnings } from "../../features/winnings/winningsSlice";
import "../../styles/dashboard/winnings.css";

const formatRupees = (amount = 0) =>
  `₹${Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatMonth = (date) => {
  if (!date) return "—";

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

function Winnings() {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useSelector((state) => state.winnings);

  useEffect(() => {
    dispatch(fetchMyWinnings());
  }, [dispatch]);

  if (isLoading && !data) {
    return <LoadingState text="Loading your winnings..." />;
  }

  if (error && !data) {
    return (
      <ErrorState
        title="Unable to load winnings"
        message={error}
        onRetry={() => dispatch(fetchMyWinnings())}
      />
    );
  }

  const summary = data?.summary || {
    totalWinnings: 0,
    totalWins: 0,
    drawsEntered: 0,
  };

  const history = data?.history || [];
  const currentDraw = data?.currentDraw;

  return (
    <main className="winnings-page">
      <header className="winnings-header">
        <div>
          <p className="dashboard-eyebrow">DRAW & REWARDS</p>
          <h1>My Winnings</h1>
          <p>
            Track your monthly draw participation, match results, and payouts.
          </p>
        </div>
      </header>

      <section className="winnings-stats-grid">
        <article className="winning-stat-card">
          <div className="winning-stat-icon yellow-icon">
            <CircleDollarSign size={22} />
          </div>
          <div>
            <p>Total winnings</p>
            <h2>{formatRupees(summary.totalWinnings)}</h2>
            <span>
              {summary.totalWins
                ? `${summary.totalWins} prize${summary.totalWins > 1 ? "s" : ""} won`
                : "No prizes won yet"}
            </span>
          </div>
        </article>

        <article className="winning-stat-card">
          <div className="winning-stat-icon blue-icon">
            <Trophy size={22} />
          </div>
          <div>
            <p>Draws entered</p>
            <h2>{summary.drawsEntered}</h2>
            <span>Based on your eligible score entries</span>
          </div>
        </article>

        <article className="winning-stat-card">
          <div className="winning-stat-icon green-icon">
            <CalendarDays size={22} />
          </div>
          <div>
            <p>Next draw</p>
            <h2>
              {currentDraw
                ? new Date(currentDraw.month).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "—"}
            </h2>
            <span>{currentDraw ? "You are entered" : "No active draw"}</span>
          </div>
        </article>
      </section>

      {currentDraw && (
        <section className="current-draw-card">
          <div className="current-draw-icon">
            <Trophy size={31} />
          </div>

          <div className="current-draw-content">
            <p className="dashboard-eyebrow">CURRENT DRAW</p>
            <h2>{formatMonth(currentDraw.month)} Monthly Draw</h2>
            <p>
              Your membership is active and your latest scores make you eligible
              for this draw.
            </p>

            <div className="draw-date-info">
              <Clock3 size={17} />
              Results will be available after the draw is published.
            </div>
          </div>

          <span className="draw-status-badge">Entered</span>
        </section>
      )}

      <section className="draw-history-section">
        <div className="draw-history-heading">
          <div>
            <p className="dashboard-eyebrow">DRAW HISTORY</p>
            <h2>Your previous results</h2>
          </div>
        </div>

        {history.length === 0 ? (
          <EmptyState
            title="No draw entries yet"
            message="Add five scores and keep your membership active to enter a draw."
          />
        ) : (
          <div className="draw-history-table-wrapper">
            <div className="draw-history-table">
              <div className="draw-history-table-header">
                <span>Draw month</span>
                <span>Result date</span>
                <span>Match result</span>
                <span>Prize</span>
                <span>Status</span>
              </div>

              {history.map((draw) => (
                <div className="draw-history-row" key={draw.drawId}>
                  <strong>{formatMonth(draw.month)}</strong>
                  <span>
                    {draw.type === "upcoming"
                      ? "Results pending"
                      : formatDate(draw.resultDate)}
                  </span>
                  <span>{draw.match}</span>
                  <b>{formatRupees(draw.prize)}</b>

                  <span className={`draw-result-status ${draw.type}`}>
                    {draw.type === "upcoming" ? (
                      <Clock3 size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    {draw.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Winnings;

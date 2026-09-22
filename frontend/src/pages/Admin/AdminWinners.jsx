import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleDollarSign, CheckCircle2, Clock3 } from "lucide-react";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/Common/PageStates";
import {
  fetchAdminWinners,
  markAdminWinnerPaid,
} from "../../features/admin/adminWinnersSlice";
import "../../styles/admin/admin-winners.css";

const formatRupees = (amount = 0) =>
  `₹${Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

function AdminWinners() {
  const dispatch = useDispatch();

  const {
    items: winners,
    isLoading,
    isSaving,
    error,
  } = useSelector((state) => state.adminWinners);

  const [actionError, setActionError] = useState("");

  useEffect(() => {
    dispatch(fetchAdminWinners());
  }, [dispatch]);

  const pendingPayouts = winners.filter(
    (winner) => winner.payoutStatus === "pending",
  ).length;

  const paidWinners = winners.filter(
    (winner) => winner.payoutStatus === "paid",
  ).length;

  const allPayoutsPaid =
    winners.length > 0 &&
    winners.every((winner) => winner.payoutStatus === "paid");

  const handleMarkPaid = async (winnerId) => {
    const confirmed = window.confirm(
      "Confirm that this winner has received the payout?",
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await dispatch(markAdminWinnerPaid(winnerId)).unwrap();
      dispatch(fetchAdminWinners());
    } catch (message) {
      setActionError(message);
    }
  };

  if (isLoading && winners.length === 0) {
    return <LoadingState text="Loading winners..." />;
  }

  if (error && winners.length === 0) {
    return (
      <ErrorState
        title="Unable to load winners"
        message={error}
        onRetry={() => dispatch(fetchAdminWinners())}
      />
    );
  }

  return (
    <main className="admin-winners-page">
      <header className="admin-winners-header">
        <div>
          <p className="admin-eyebrow">WINNER MANAGEMENT</p>
          <h1>Winners & Payouts</h1>
          <p>Track winners and mark completed reward payouts.</p>
        </div>
      </header>

      <section className="winner-summary-grid">
        <article>
          <Clock3 size={21} />
          <div>
            <span>Pending payouts</span>
            <strong>{pendingPayouts}</strong>
          </div>
        </article>

        <article>
          <CheckCircle2 size={21} />
          <div>
            <span>Paid winners</span>
            <strong>{paidWinners}</strong>
          </div>
        </article>

        <article>
          <CircleDollarSign size={21} />
          <div>
            <span>Total winners</span>
            <strong>{winners.length}</strong>
          </div>
        </article>
      </section>

      {actionError && <p className="auth-form-error">{actionError}</p>}

      <section className="admin-winners-table-section">
        {winners.length === 0 ? (
          <EmptyState
            title="No winners yet"
            message="Winner records will appear after a draw is published."
          />
        ) : (
          <div className="admin-winners-table-wrapper">
            <div
              className={`admin-winners-table admin-winners-table-simple ${
                allPayoutsPaid ? "all-payouts-paid" : ""
              }`}
            >
              <div className="admin-winners-table-header">
                <span>Winner</span>
                <span>Match type</span>
                <span>Prize</span>
                <span>Payout</span>
                {!allPayoutsPaid && <span>Actions</span>}
              </div>

              {winners.map((winner) => (
                <div className="admin-winners-table-row" key={winner._id}>
                  <div className="winner-member">
                    <span>
                      {winner.user?.name
                        ?.split(" ")
                        .map((word) => word[0])
                        .join("") || "U"}
                    </span>

                    <div>
                      <strong>{winner.user?.name || "Unknown user"}</strong>
                      <small>{winner.user?.email || "—"}</small>
                    </div>
                  </div>

                  <span>{winner.matchType}</span>
                  <b>{formatRupees(winner.prizeAmount)}</b>

                  <span
                    className={`winner-status ${
                      winner.payoutStatus === "paid"
                        ? "status-paid"
                        : "status-pending"
                    }`}
                  >
                    {winner.payoutStatus === "paid" ? "Paid" : "Pending"}
                  </span>

                  {!allPayoutsPaid && (
                    <div className="winner-actions">
                      {winner.payoutStatus === "pending" && (
                        <button
                          className="mark-paid-btn"
                          title="Mark payout as paid"
                          onClick={() => handleMarkPaid(winner._id)}
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Pay"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminWinners;

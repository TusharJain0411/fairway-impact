import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dices,
  Sparkles,
  Trophy,
  Play,
  Send,
  CheckCircle2,
  Plus,
  
} from "lucide-react";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/Common/PageStates";
import {
  fetchAdminDraws,
  openAdminDraw,
  publishAdminDraw,
  simulateAdminDraw,
  updateAdminDrawMode,
  createAdminDraw,
  endAdminDraw,
} from "../../features/admin/adminDrawsSlice";
import "../../styles/admin/admin-draws.css";

const formatRupees = (amount = 0) =>
  `₹${Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatMonth = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

function AdminDraws() {
  const dispatch = useDispatch();

  const { items, isLoading, isSaving, error } = useSelector(
    (state) => state.adminDraws,
  );

  const [drawMode, setDrawMode] = useState("random");
  const [actionError, setActionError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newDraw, setNewDraw] = useState({
    month: new Date().toISOString().slice(0, 7),
    prizePoolAmount: 120000,
    drawMode: "random",
  });

  useEffect(() => {
    dispatch(fetchAdminDraws());
  }, [dispatch]);

const currentDraw = items.find((draw) =>
  ["draft", "open", "published"].includes(draw.status),
);
  useEffect(() => {
    if (currentDraw?.drawMode) {
      setDrawMode(currentDraw.drawMode);
    }
  }, [currentDraw?.drawMode]);

  const isPublished = ["published", "completed"].includes(currentDraw?.status);

  const drawNumbers = currentDraw?.winningNumbers || [];
  const prizePool = currentDraw?.prizePoolAmount || 0;

  const fiveNumberPrize =
    currentDraw?.prizeTiers?.fiveNumber?.amount || prizePool * 0.4;

  const fourNumberPrize =
    currentDraw?.prizeTiers?.fourNumber?.amount || prizePool * 0.35;

  const threeNumberPrize =
    currentDraw?.prizeTiers?.threeNumber?.amount || prizePool * 0.25;

  const refreshDraws = () => dispatch(fetchAdminDraws());

  const handleModeChange = async (mode) => {
    if (!currentDraw || isPublished) return;

    setDrawMode(mode);
    setActionError("");

    try {
      await dispatch(
        updateAdminDrawMode({
          drawId: currentDraw._id,
          drawMode: mode,
        }),
      ).unwrap();

      refreshDraws();
    } catch (message) {
      setActionError(message);
    }
  };

  const handleOpenDraw = async () => {
    setActionError("");

    try {
      await dispatch(openAdminDraw(currentDraw._id)).unwrap();
      refreshDraws();
    } catch (message) {
      setActionError(message);
    }
  };

  const handleSimulation = async () => {
    setActionError("");

    try {
      await dispatch(simulateAdminDraw(currentDraw._id)).unwrap();
      refreshDraws();
    } catch (message) {
      setActionError(message);
    }
  };

  const handlePublish = async () => {
    setActionError("");

    try {
      await dispatch(publishAdminDraw(currentDraw._id)).unwrap();
      refreshDraws();
    } catch (message) {
      setActionError(message);
    }
  };


 const handleEndDraw = async () => {
   const confirmed = window.confirm(
     "End this draw? Results and payout records will remain available.",
   );

   if (!confirmed) return;

   setActionError("");

   try {
     await dispatch(endAdminDraw(currentDraw._id)).unwrap();
     refreshDraws();
   } catch (message) {
     setActionError(message);
   }
 };

  if (isLoading && items.length === 0) {
    return <LoadingState text="Loading draws..." />;
  }

  if (error && items.length === 0) {
    return (
      <ErrorState
        title="Unable to load draws"
        message={error}
        onRetry={refreshDraws}
      />
    );
  }

  if (!currentDraw) {
    return (
      <main className="admin-draws-page">
        <header className="admin-draws-header">
          <div>
            <p className="admin-eyebrow">DRAW MANAGEMENT</p>
            <h1>No active draw</h1>
            <p>
              Create a new monthly draw to start accepting eligible entries.
            </p>
          </div>

          {!showCreateForm && (
            <button
              type="button"
              className="simulate-draw-btn"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={18} />
              Create new draw
            </button>
          )}
        </header>

        {actionError && <p className="auth-form-error">{actionError}</p>}

        {showCreateForm ? (
          <section className="draw-simulation-card">
            <div className="simulation-heading">
              <div>
                <p className="admin-eyebrow">NEW DRAW</p>
                <h2>Create monthly draw</h2>
                <p>
                  Choose the draw month, prize pool, and number-selection
                  method.
                </p>
              </div>
            </div>

            <form className="create-draw-form" onSubmit={handleCreateDraw}>
              <div>
                <label htmlFor="draw-month">Draw month</label>
                <input
                  id="draw-month"
                  type="month"
                  value={newDraw.month}
                  onChange={(event) =>
                    setNewDraw({ ...newDraw, month: event.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="prize-pool">Prize pool amount (₹)</label>
                <input
                  id="prize-pool"
                  type="number"
                  min="1"
                  value={newDraw.prizePoolAmount}
                  onChange={(event) =>
                    setNewDraw({
                      ...newDraw,
                      prizePoolAmount: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="new-draw-mode">Draw mode</label>
                <select
                  id="new-draw-mode"
                  value={newDraw.drawMode}
                  onChange={(event) =>
                    setNewDraw({
                      ...newDraw,
                      drawMode: event.target.value,
                    })
                  }
                >
                  <option value="random">Random draw</option>
                  <option value="algorithmic">Algorithmic draw</option>
                </select>
              </div>

              <div className="create-draw-actions">
                <button
                  type="button"
                  className="cancel-create-draw-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="simulate-draw-btn"
                  disabled={isSaving}
                >
                  {isSaving ? "Creating..." : "Create draw"}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <EmptyState
            title="No active draw"
            message="Create a new draw to configure its mode and run a simulation."
          />
        )}
      </main>
    );
  }

  return (
    <main className="admin-draws-page">
      <header className="admin-draws-header">
        <div>
          <p className="admin-eyebrow">DRAW MANAGEMENT</p>
          <h1>{formatMonth(currentDraw.month)} Draw</h1>
          <p>Configure, simulate, and publish this month’s prize draw.</p>
        </div>

        <div className="draw-header-actions">
          {currentDraw.status === "draft" && (
            <button
              type="button"
              className="simulate-draw-btn"
              onClick={handleOpenDraw}
              disabled={isSaving}
            >
              Open draw
            </button>
          )}

          <span
            className={`draw-page-status ${isPublished ? "published" : ""}`}
          >
            {isPublished ? "Results published" : currentDraw.status}
          </span>

          {currentDraw.status === "published" && (
            <button
              type="button"
              className="simulate-draw-btn"
              onClick={handleEndDraw}
              disabled={isSaving}
            >
              End draw
            </button>
          )}
        </div>
      </header>

      {actionError && <p className="auth-form-error">{actionError}</p>}

      <section className="draw-settings-grid">
        <article className="draw-mode-card">
          <p className="admin-eyebrow">DRAW METHOD</p>
          <h2>Choose draw mode</h2>

          <button
            type="button"
            disabled={isPublished || isSaving}
            className={`draw-mode-option ${
              drawMode === "random" ? "selected-draw-mode" : ""
            }`}
            onClick={() => handleModeChange("random")}
          >
            <Dices size={22} />
            <span>
              <strong>Random draw</strong>
              <small>Lottery-style random number selection.</small>
            </span>
          </button>

          <button
            type="button"
            disabled={isPublished || isSaving}
            className={`draw-mode-option ${
              drawMode === "algorithmic" ? "selected-draw-mode" : ""
            }`}
            onClick={() => handleModeChange("algorithmic")}
          >
            <Sparkles size={22} />
            <span>
              <strong>Algorithmic draw</strong>
              <small>Weighted using submitted score frequency.</small>
            </span>
          </button>
        </article>

        <article className="draw-pool-card">
          <p className="admin-eyebrow">CURRENT PRIZE POOL</p>
          <h2>{formatRupees(prizePool)}</h2>
          <p>
            {currentDraw.eligibleSubscriberCount || 0} eligible members in this
            draw.
          </p>

          <div className="draw-pool-list">
            <div>
              <span>5-number match</span>
              <strong>{formatRupees(fiveNumberPrize)}</strong>
              <small>40% · Jackpot rollover</small>
            </div>

            <div>
              <span>4-number match</span>
              <strong>{formatRupees(fourNumberPrize)}</strong>
              <small>35% · Shared by winners</small>
            </div>

            <div>
              <span>3-number match</span>
              <strong>{formatRupees(threeNumberPrize)}</strong>
              <small>25% · Shared by winners</small>
            </div>
          </div>
        </article>
      </section>

      <section className="draw-simulation-card">
        <div className="simulation-heading">
          <div>
            <p className="admin-eyebrow">DRAW SIMULATION</p>
            <h2>Generate winning numbers</h2>
            <p>
              Run a simulation before publishing. Generated numbers range from 1
              to 45.
            </p>
          </div>

          <button
            type="button"
            className="simulate-draw-btn"
            onClick={handleSimulation}
            disabled={isSaving || isPublished}
          >
            <Play size={18} />
            {isSaving ? "Processing..." : "Run simulation"}
          </button>
        </div>

        {drawNumbers.length === 0 ? (
          <div className="empty-draw-state">
            <Trophy size={34} />
            <h3>No simulation generated</h3>
            <p>Choose a draw method and run the simulation.</p>
          </div>
        ) : (
          <div className="draw-result-area">
            <div className="draw-number-list">
              {drawNumbers.map((number) => (
                <span key={number}>{number}</span>
              ))}
            </div>

            <p>
              Generated through{" "}
              <strong>
                {drawMode === "random" ? "Random draw" : "Algorithmic draw"}
              </strong>
            </p>
          </div>
        )}
      </section>

      <section className="draw-publish-card">
        <div>
          <p className="admin-eyebrow">FINAL ACTION</p>
          <h2>
            {isPublished
              ? "Draw results are live"
              : "Ready to publish the results?"}
          </h2>
          <p>
            Publishing makes results visible to eligible members and creates
            winner payout records.
          </p>
        </div>

        <button
          type="button"
          className="publish-draw-btn"
          onClick={handlePublish}
          disabled={drawNumbers.length === 0 || isPublished || isSaving}
        >
          {isPublished ? (
            <>
              <CheckCircle2 size={18} />
              Published
            </>
          ) : (
            <>
              <Send size={18} />
              {isSaving ? "Publishing..." : "Publish results"}
            </>
          )}
        </button>
      </section>
    </main>
  );
}

export default AdminDraws;

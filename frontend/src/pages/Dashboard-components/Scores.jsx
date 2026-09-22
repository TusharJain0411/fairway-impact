import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleAlert, Trophy } from "lucide-react";

import ScoreForm from "../../components/Dashboard/ScoreForm";
import ScoreTable from "../../components/Dashboard/ScoreTable";
import { LoadingState, ErrorState } from "../../components/Common/PageStates";
import {
  addScore,
  clearScoreError,
  editScore,
  fetchScores,
  removeScore,
} from "../../features/scores/scoreSlice";
import "../../styles/dashboard/scores.css";

function Scores() {
  const dispatch = useDispatch();

  const {
    items: scores,
    isLoading,
    isSaving,
    error,
  } = useSelector((state) => state.scores);

  const [editingScore, setEditingScore] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    dispatch(fetchScores());
  }, [dispatch]);

  const handleSaveScore = async (scoreData) => {
    setActionError("");
    dispatch(clearScoreError());

    const payload = {
      playedOn: scoreData.date,
      score: Number(scoreData.score),
      course: scoreData.course.trim() || "Golf Course",
    };

    try {
      if (editingScore) {
        await dispatch(
          editScore({
            scoreId: editingScore._id,
            scoreData: payload,
          }),
        ).unwrap();

        setEditingScore(null);
      } else {
        await dispatch(addScore(payload)).unwrap();
      }

      dispatch(fetchScores());
    } catch (message) {
      setActionError(message);
    }
  };

  const handleDeleteScore = async (scoreId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this score?",
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await dispatch(removeScore(scoreId)).unwrap();

      if (editingScore?._id === scoreId) {
        setEditingScore(null);
      }

      dispatch(fetchScores());
    } catch (message) {
      setActionError(message);
    }
  };

  if (isLoading && scores.length === 0) {
    return <LoadingState text="Loading your scores..." />;
  }

  if (error && scores.length === 0) {
    return (
      <ErrorState
        title="Unable to load scores"
        message={error}
        onRetry={() => dispatch(fetchScores())}
      />
    );
  }

  return (
    <main className="scores-main">
      <header className="scores-header">
        <div>
          <p className="scores-eyebrow">GOLF PERFORMANCE</p>
          <h1>My Scores</h1>
          <p>
            Keep your latest five Stableford scores up to date for monthly draw
            participation.
          </p>
        </div>

        <div className="score-limit-indicator">
          <Trophy size={18} />
          <span>
            <strong>{scores.length}/5</strong> scores saved
          </span>
        </div>
      </header>

      <div className="scores-layout">
        <ScoreForm
          editingScore={editingScore}
          isSaving={isSaving}
          onSave={handleSaveScore}
          onCancel={() => {
            setEditingScore(null);
            setActionError("");
          }}
        />

        <section className="scores-list-section">
          <div className="scores-list-heading">
            <div>
              <p className="scores-eyebrow">LATEST RESULTS</p>
              <h2>Your recent rounds</h2>
            </div>

            <span>Most recent first</span>
          </div>

          {(actionError || error) && (
            <div className="scores-error">
              <CircleAlert size={18} />
              {actionError || error}
            </div>
          )}

          <ScoreTable
            scores={scores}
            onEdit={(score) => {
              setEditingScore(score);
              setActionError("");
              dispatch(clearScoreError());
            }}
            onDelete={handleDeleteScore}
          />
        </section>
      </div>

      <p className="score-note">
        Only your latest five scores are kept. When you add a sixth score, the
        oldest one is removed automatically.
      </p>
    </main>
  );
}

export default Scores;

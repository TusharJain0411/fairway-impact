import { Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "../Common/PageStates";
import "../../styles/dashboard/score-table.css";

function ScoreTable({ scores, onEdit, onDelete }) {
  if (scores.length === 0) {
    return (
      <EmptyState
        title="No scores added yet"
        message="Add your latest golf score to begin."
      />
    );
  }

  return (
    <div className="score-table-wrapper">
      <div className="score-table">
        <div className="score-table-header">
          <span>Date played</span>
          <span>Golf course</span>
          <span>Stableford score</span>
          <span>Actions</span>
        </div>

        {scores.map((score) => (
          <div className="score-table-row" key={score._id}>
            <span>{new Date(score.playedOn).toLocaleDateString("en-GB")}</span>

            <strong>{score.course}</strong>
            <b>{score.score}</b>

            <div className="score-actions">
              <button onClick={() => onEdit(score)} title="Edit score">
                <Pencil size={16} />
              </button>

              <button
                className="delete-score-btn"
                onClick={() => onDelete(score._id)}
                title="Delete score"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScoreTable;

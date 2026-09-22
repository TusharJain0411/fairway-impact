import { Link } from "react-router-dom";
import { ArrowUpRight, Trophy } from "lucide-react";
import "../../styles/dashboard/recent-scores.css";

function RecentScores({ scores }) {
  return (
    <section className="recent-scores-card">
      <div className="section-card-heading">
        <div>
          <p className="section-label">YOUR LATEST SCORES</p>
          <h2>Recent performance</h2>
        </div>

        <Link to="/dashboard/scores">
          View all <ArrowUpRight size={17} />
        </Link>
      </div>

      {scores.length === 0 ? (
        <div className="recent-scores-empty">
          <Trophy size={26} />
          <p>No scores yet. Add your first score to begin.</p>
        </div>
      ) : (
        <div className="score-list">
          {scores.map((score) => (
            <div className="score-row" key={score._id}>
              <div>
                <strong>{score.course}</strong>
                <p>
                  {new Date(score.playedOn).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="score-value">
                <span>Stableford</span>
                <strong>{score.score}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentScores;

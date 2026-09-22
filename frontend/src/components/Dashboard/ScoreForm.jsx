import { useEffect, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import "../../styles/dashboard/score-form.css";

function ScoreForm({ editingScore, onSave, onCancel, isSaving }) {
  const [date, setDate] = useState("");
  const [score, setScore] = useState("");
  const [course, setCourse] = useState("");

  useEffect(() => {
    if (editingScore) {
     setDate(editingScore.playedOn?.slice(0, 10) || "");
      setScore(editingScore.score);
      setCourse(editingScore.course);
    } else {
      setDate("");
      setScore("");
      setCourse("");
    }
  }, [editingScore]);

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      date,
      score: Number(score),
      course: course.trim() || "Golf Course",
    });

    if (!editingScore) {
      setDate("");
      setScore("");
      setCourse("");
    }
  };

  return (
    <form className="score-form" onSubmit={handleSubmit}>
      <div className="score-form-heading">
        <div>
          <p>{editingScore ? "EDIT SCORE" : "ADD A SCORE"}</p>
          <h2>
            {editingScore
              ? "Update your golf score"
              : "Record your latest round"}
          </h2>
        </div>

        {editingScore && (
          <button type="button" className="cancel-edit-btn" onClick={onCancel}>
            <X size={18} />
            Cancel
          </button>
        )}
      </div>

      <div className="score-form-grid">
        <div>
          <label htmlFor="scoreDate">Date played</label>
          <input
            id="scoreDate"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="scoreValue">Stableford score</label>
          <input
            id="scoreValue"
            type="number"
            min="1"
            max="45"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            placeholder="1 - 45"
            required
          />
        </div>
      </div>

      <label htmlFor="course">Course name</label>
      <input
        id="course"
        type="text"
        value={course}
        onChange={(event) => setCourse(event.target.value)}
        placeholder="Example: Udaipur Golf Course"
      />

      <button type="submit" className="save-score-btn" disabled={isSaving}>
        {editingScore ? <Save size={18} /> : <Plus size={18} />}
        {isSaving ? "Saving..." : editingScore ? "Save changes" : "Add score"}
      </button>
    </form>
  );
}

export default ScoreForm;

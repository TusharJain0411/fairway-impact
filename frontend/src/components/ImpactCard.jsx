import { Heart, Trophy } from "lucide-react";
import "../styles/impact-card.css"
function ImpactCard() {
  return (
    <div className="impact-card">
      <div>
        <Heart className="card-icon pink" size={26} />
        <p>Charity contribution</p>
        <h3>From 10% of every subscription</h3>
      </div>

      <div>
        <Trophy className="card-icon yellow" size={26} />
        <p>Monthly rewards</p>
        <h3>Win through score-based draws</h3>
      </div>
    </div>
  );
}

export default ImpactCard;

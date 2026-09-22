import { Heart } from "lucide-react";
import "../styles/charity-card.css";

function CharityCard({ charity, selectedCharity, setSelectedCharity }) {
  const isSelected = selectedCharity === charity.id;

  return (
    <article
      className={`charity-card ${isSelected ? "selected-charity" : ""}`}
      onClick={() => setSelectedCharity(charity.id)}
    >
      <div className={`charity-icon ${charity.color}`}>
        <Heart size={23} fill="currentColor" />
      </div>

      <div className="charity-content">
        <p className="charity-category">{charity.category}</p>
        <h3>{charity.name}</h3>
        <p>{charity.description}</p>
      </div>

      <span className="charity-select-circle">
        {isSelected && <span className="charity-select-fill" />}
      </span>
    </article>
  );
}

export default CharityCard;

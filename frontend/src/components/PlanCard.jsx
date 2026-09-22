import { Check } from "lucide-react";
import "../styles/plan-card.css";

function PlanCard({ plan, selectedPlan, setSelectedPlan }) {
  const isSelected = selectedPlan === plan.id;

  return (
    <article
      className={`plan-card ${isSelected ? "selected-plan" : ""}`}
      onClick={() => setSelectedPlan(plan.id)}
    >
      {plan.popular && <span className="popular-badge">BEST VALUE</span>}

      <div className="plan-card-top">
        <div>
          <p className="plan-name">{plan.name}</p>
          <h3>
            ₹ {plan.price}
            <span>/{plan.billing}</span>
          </h3>
        </div>

        <span className="radio-circle">
          {isSelected && <span className="radio-fill" />}
        </span>
      </div>

      <p className="plan-description">{plan.description}</p>

      <ul className="plan-features">
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check size={17} />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default PlanCard;

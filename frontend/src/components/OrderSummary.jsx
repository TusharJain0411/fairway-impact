import { useSelector } from "react-redux";
import { CheckCircle2, Heart } from "lucide-react";
import "../styles/order-summary.css";

const planDetails = {
  monthly: {
    name: "Monthly membership",
    description: "Fairway Impact monthly plan",
    amount: 1200,
  },
  yearly: {
    name: "Yearly membership",
    description: "Fairway Impact annual plan",
    amount: 12000,
  },
};

function OrderSummary() {
  const { selectedPlan, contributionPercent } = useSelector(
    (state) => state.subscription,
  );

  const { selectedCharity } = useSelector((state) => state.charities);

  const plan = planDetails[selectedPlan] || planDetails.yearly;

  return (
    <aside className="order-summary">
      <p className="summary-label">ORDER SUMMARY</p>

      <div className="summary-plan">
        <div>
          <h3>{plan.name}</h3>
          <p>{plan.description}</p>
        </div>
        <strong>₹{plan.amount.toLocaleString("en-IN")}</strong>
      </div>

      <div className="summary-line" />

      <div className="summary-charity">
        <Heart size={20} fill="currentColor" />
        <div>
          <span>Supporting</span>
          <strong>{selectedCharity?.name || "No charity selected"}</strong>
          <p>{contributionPercent}% charity contribution</p>
        </div>
      </div>

      <div className="summary-line" />

      <div className="summary-total">
        <span>Total due today</span>
        <strong>₹{plan.amount.toLocaleString("en-IN")}</strong>
      </div>

      <div className="summary-benefits">
        <p>
          <CheckCircle2 size={16} />
          Monthly draw entry included
        </p>
        <p>
          <CheckCircle2 size={16} />
          Cancel before your renewal date
        </p>
      </div>
    </aside>
  );
}

export default OrderSummary;

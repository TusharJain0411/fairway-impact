import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, ShieldCheck } from "lucide-react";

import PlanCard from "../components/PlanCard";
import { setSelectedPlan } from "../features/subscription/subscriptionSlice";
import "../styles/subscribe.css";

const plans = [
  {
    id: "monthly",
    name: "Monthly membership",
    price: "1200",
    billing: "month",
    description: "Flexible membership, billed monthly. Cancel anytime.",
    features: [
      "Monthly prize draw entry",
      "Track your five latest scores",
      "Choose a charity to support",
    ],
  },
  {
    id: "yearly",
    name: "Yearly membership",
    price: "12000",
    billing: "year",
    description: "Save ₹2400 per year and make a bigger lasting impact.",
    popular: true,
    features: [
      "Everything in monthly membership",
      "Two months free every year",
      "Priority access to new rewards",
    ],
  },
];

function Subscribe() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedPlan =
    useSelector((state) => state.subscription.selectedPlan) || "yearly";

  const selectedPlanData = plans.find((plan) => plan.id === selectedPlan);

  const handleSelectPlan = (planId) => {
    dispatch(setSelectedPlan(planId));
  };

  const handleContinue = () => {
    dispatch(setSelectedPlan(selectedPlan));
    navigate("/charities");
  };

  return (
    <main className="subscribe-page">
      <nav className="subscribe-nav">
        <Link to="/" className="subscribe-logo">
          Fairway<span>Impact</span>
        </Link>

        <Link to="/" className="subscribe-back">
          ← Back to home
        </Link>
      </nav>

      <section className="subscribe-content">
        <p className="subscribe-eyebrow">MEMBERSHIP</p>
        <h1>Choose how you want to play with purpose.</h1>
        <p className="subscribe-intro">
          Your membership enters you into monthly draws and supports the charity
          you choose.
        </p>

        <div className="plans-grid">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selectedPlan={selectedPlan}
              setSelectedPlan={handleSelectPlan}
            />
          ))}
        </div>

        <div className="subscribe-summary">
          <div>
            <span>Selected membership</span>
            <strong>
              {selectedPlanData.name} - ₹{selectedPlanData.price}/
              {selectedPlanData.billing}
            </strong>
          </div>

          <button type="button" onClick={handleContinue}>
            Continue to charity <ArrowRight size={18} />
          </button>
        </div>

        <p className="secure-payment">
          <ShieldCheck size={17} />
          Secure payment will be added in the final checkout step.
        </p>
      </section>
    </main>
  );
}

export default Subscribe;

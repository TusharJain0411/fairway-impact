import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import "../styles/common/success-page.css";

function SuccessPage() {
  const location = useLocation();

  const isPaymentSuccess = location.pathname === "/payment-success";

  const title = isPaymentSuccess
    ? "Your membership is active!"
    : "Your account is ready!";

  const description = isPaymentSuccess
    ? "Your UPI payment was successful. You can now add scores, support your charity, and enter monthly draws."
    : "Your Fairway Impact account has been created. Choose a membership to start supporting a charity and enter monthly draws.";
    
const buttonLink = isPaymentSuccess ? "/dashboard" : "/subscribe";
const buttonText = isPaymentSuccess ? "Go to dashboard" : "Choose membership";
  return (
    <main className="success-page">
      <section className="success-card">
        <div className="success-icon">
          <CheckCircle2 size={54} />
        </div>

        <p className="success-eyebrow">SUCCESS</p>
        <h1>{title}</h1>
        <p>{description}</p>

        <Link to={buttonLink} className="success-btn">
          {buttonText} <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}

export default SuccessPage;

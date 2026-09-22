import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LockKeyhole, Smartphone, ArrowRight } from "lucide-react";

import OrderSummary from "../components/OrderSummary";
import { createSubscriptionRequest } from "../services/subscriptionService";
import {
  createPaymentOrderRequest,
  verifyPaymentRequest,
} from "../services/paymentService";
import { clearSelectedCharity } from "../features/charities/charitySlice";
import { clearSubscriptionSelection } from "../features/subscription/subscriptionSlice";
import "../styles/checkout.css";

const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { selectedPlan, contributionPercent } = useSelector(
    (state) => state.subscription,
  );
  const { selectedCharity } = useSelector((state) => state.charities);

  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPaymentError("");

    if (!selectedPlan) {
      navigate("/subscribe");
      return;
    }

    if (!selectedCharity?._id) {
      navigate("/charities");
      return;
    }

    try {
      setIsPaying(true);

      const subscriptionData = await createSubscriptionRequest({
        plan: selectedPlan,
        charityId: selectedCharity._id,
        charityContributionPercent: contributionPercent,
      });

      const orderData = await createPaymentOrderRequest(
        subscriptionData.subscription._id,
      );

      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error("Unable to load the payment gateway. Try again.");
      }

      const razorpay = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Fairway Impact",
        description: `${selectedPlan} membership`,
        order_id: orderData.orderId,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },

       

        theme: {
          color: "#203027",
        },

        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },

        handler: async (response) => {
          try {
            await verifyPaymentRequest({
              subscriptionId: orderData.subscriptionId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            dispatch(clearSelectedCharity());
            dispatch(clearSubscriptionSelection());

            navigate("/payment-success", { replace: true });
          } catch (error) {
            setPaymentError(
              error.response?.data?.message ||
                "Payment could not be verified. Please contact support.",
            );
            setIsPaying(false);
          }
        },
      });

      razorpay.on("payment.failed", (response) => {
        setPaymentError(
          response.error?.description ||
            "UPI payment failed. Please try again.",
        );
        setIsPaying(false);
      });

      razorpay.open();
    } catch (error) {
      setPaymentError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment. Please try again.",
      );
      setIsPaying(false);
    }
  };

  return (
    <main className="checkout-page">
      <nav className="checkout-nav">
        <Link to="/" className="checkout-logo">
          Fairway<span>Impact</span>
        </Link>

        <Link to="/charities" className="checkout-back">
          ← Back to charities
        </Link>
      </nav>

      <section className="checkout-content">
        <div className="checkout-heading">
          <p className="checkout-eyebrow">FINAL STEP</p>
          <h1>Complete your membership.</h1>
          <p>Your membership begins after your UPI payment is confirmed.</p>
        </div>

        <div className="checkout-grid">
          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="payment-title">
              <Smartphone size={22} />
              <div>
                <h2>Pay securely using UPI</h2>
                <p>Use Google Pay, PhonePe, Paytm, or any UPI app.</p>
              </div>
            </div>

            <div className="upi-method">
              <div className="upi-icon">
                <Smartphone size={21} />
              </div>

              <div>
                <h3>UPI Payment</h3>
                <p>
                  You will choose your UPI app in the secure payment window.
                </p>
              </div>

              <span className="upi-selected-circle">
                <span />
              </span>
            </div>

            {paymentError && <p className="auth-form-error">{paymentError}</p>}

            <button
              type="submit"
              className="complete-payment-btn"
              disabled={isPaying}
            >
              {isPaying ? "Opening payment..." : "Pay with UPI"}
              {!isPaying && <ArrowRight size={18} />}
            </button>

            <p className="secure-message">
              <LockKeyhole size={15} />
              Your UPI PIN is handled only by Razorpay and your UPI app.
            </p>
          </form>

          <OrderSummary />
        </div>
      </section>
    </main>
  );
}

export default Checkout;

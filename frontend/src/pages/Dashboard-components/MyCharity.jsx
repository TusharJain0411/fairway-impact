import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, ExternalLink, Save } from "lucide-react";

import { LoadingState, ErrorState } from "../../components/Common/PageStates";
import { fetchUserDashboard } from "../../features/dashboard/dashboardSlice";
import { updateAuthUser } from "../../features/auth/authSlice";
import { setContributionPercent } from "../../features/subscription/subscriptionSlice";
import { updateCharitySettingsRequest } from "../../services/authService";
import "../../styles/dashboard/my-charity.css";

const formatRupees = (amount = 0) =>
  `₹${Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

function MyCharity() {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useSelector((state) => state.dashboard);

  const [contribution, setContribution] = useState(10);
  const [savedMessage, setSavedMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const subscription = data?.subscription;
  const charity = subscription?.charity;

  useEffect(() => {
    dispatch(fetchUserDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (subscription?.contributionPercent) {
      setContribution(subscription.contributionPercent);
    }
  }, [subscription?.contributionPercent]);

  const yearlyAmount = subscription?.plan === "yearly" ? 12000 : 1200 * 12;

  const yearlyTarget = (yearlyAmount * contribution) / 100;
  const actualContribution = data?.charityContributionThisYear || 0;

  const handleSave = async () => {
    setSaveError("");
    setSavedMessage("");

    try {
      setIsSaving(true);

      const response = await updateCharitySettingsRequest({
        contributionPercent: contribution,
      });

      dispatch(updateAuthUser(response.user));
      dispatch(setContributionPercent(contribution));
      dispatch(fetchUserDashboard());

      setSavedMessage("Your charity contribution has been updated.");

      setTimeout(() => {
        setSavedMessage("");
      }, 3000);
    } catch (requestError) {
      setSaveError(
        requestError.response?.data?.message ||
          "Unable to update charity contribution.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !data) {
    return <LoadingState text="Loading charity settings..." />;
  }

  if (error && !data) {
    return (
      <ErrorState
        title="Unable to load charity settings"
        message={error}
        onRetry={() => dispatch(fetchUserDashboard())}
      />
    );
  }

  return (
    <main className="my-charity-page">
      <header className="charity-page-header">
        <div>
          <p className="dashboard-eyebrow">YOUR CHARITY</p>
          <h1>Make every round matter.</h1>
          <p>
            Manage the charity you support and your membership contribution.
          </p>
        </div>
      </header>

      <section className="selected-charity-card">
        <div className="selected-charity-icon">
          <Heart size={28} fill="currentColor" />
        </div>

        <div className="selected-charity-info">
          <p className="charity-category-label">
            {charity?.category || "CHARITY"}
          </p>

          <h2>{charity?.name || "No charity selected"}</h2>

          <p>
            {charity?.description ||
              "Choose a membership and charity to start making an impact."}
          </p>

          {charity?.website && (
            <a
              href={charity.website}
              target="_blank"
              rel="noreferrer"
              className="charity-website-btn"
            >
              Visit charity website <ExternalLink size={16} />
            </a>
          )}
        </div>

        {charity && (
          <span className="supporting-badge">You support this charity</span>
        )}
      </section>

      <section className="charity-settings-grid">
        <article className="contribution-card">
          <p className="dashboard-eyebrow">MEMBERSHIP CONTRIBUTION</p>
          <h2>Choose your contribution</h2>
          <p>
            At least 10% of your subscription goes directly to your selected
            charity.
          </p>

          <div className="contribution-buttons">
            {[10, 15, 20, 25].map((percentage) => (
              <button
                key={percentage}
                type="button"
                className={
                  contribution === percentage ? "selected-percentage" : ""
                }
                onClick={() => setContribution(percentage)}
                disabled={!subscription}
              >
                {percentage}%
              </button>
            ))}
          </div>

          <div className="contribution-summary">
            <span>Your yearly contribution target</span>
            <strong>{formatRupees(yearlyTarget)}</strong>
          </div>

          <button
            type="button"
            className="save-contribution-btn"
            onClick={handleSave}
            disabled={!subscription || isSaving}
          >
            <Save size={17} />
            {isSaving ? "Saving..." : "Save contribution"}
          </button>

          {savedMessage && <p className="saved-message">{savedMessage}</p>}
          {saveError && <p className="auth-form-error">{saveError}</p>}
        </article>

        <article className="impact-summary-card">
          <p className="dashboard-eyebrow">YOUR IMPACT</p>
          <h2>{formatRupees(actualContribution)} contributed</h2>

          <p>
            Thank you for supporting {charity?.name || "your chosen charity"}
            this year.
          </p>

          <div className="impact-summary-line" />

          <div className="impact-summary-item">
            <span>Current contribution</span>
            <strong>{contribution}%</strong>
          </div>

          <div className="impact-summary-item">
            <span>Membership type</span>
            <strong>
              {subscription?.plan
                ? subscription.plan[0].toUpperCase() +
                  subscription.plan.slice(1)
                : "Not selected"}
            </strong>
          </div>

          <div className="impact-summary-item">
            <span>Next contribution</span>
            <strong>
              {subscription?.renewalDate
                ? new Date(subscription.renewalDate).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )
                : "—"}
            </strong>
          </div>
        </article>
      </section>
    </main>
  );
}

export default MyCharity;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Heart, Search } from "lucide-react";

import CharityCard from "../components/CharityCard";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "../components/Common/PageStates";
import {
  fetchCharities,
  selectCharity,
} from "../features/charities/charitySlice";
import { setContributionPercent } from "../features/subscription/subscriptionSlice";
import "../styles/charities.css";

const charityColors = ["blue", "pink", "green", "orange"];

function Charities() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, selectedCharity, isLoading, error } = useSelector(
    (state) => state.charities,
  );

  const { contributionPercent } = useSelector((state) => state.subscription);

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(fetchCharities());
  }, [dispatch]);

  useEffect(() => {
    if (items.length > 0 && !selectedCharity) {
      dispatch(selectCharity(items[0]));
    }
  }, [items, selectedCharity, dispatch]);

  const charities = items.map((charity, index) => ({
    ...charity,
    id: charity._id,
    color: charityColors[index % charityColors.length],
  }));

  const filteredCharities = charities.filter((charity) =>
    charity.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleSelectCharity = (charityId) => {
    const charity = items.find((item) => item._id === charityId);

    if (charity) {
      dispatch(selectCharity(charity));
    }
  };

  const handleContinue = () => {
    if (!selectedCharity) return;

    navigate("/checkout");
  };

  return (
    <main className="charities-page">
      <nav className="charities-nav">
        <Link to="/" className="charities-logo">
          Fairway<span>Impact</span>
        </Link>

        <Link to="/subscribe" className="charities-back">
          ← Back to membership
        </Link>
      </nav>

      <section className="charities-content">
        <div className="charities-heading">
          <p className="charities-eyebrow">MAKE AN IMPACT</p>
          <h1>Choose the cause you want to support.</h1>
          <p>
            At least 10% of your membership goes directly to the charity you
            choose. You can increase that amount if you wish.
          </p>
        </div>

        <div className="charity-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search charities"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        {isLoading && <LoadingState text="Loading charities..." />}

        {error && (
          <ErrorState
            title="Unable to load charities"
            message={error}
            onRetry={() => dispatch(fetchCharities())}
          />
        )}

        {!isLoading && !error && filteredCharities.length === 0 && (
          <EmptyState
            title="No charities found"
            message="Try another search term."
          />
        )}

        {!isLoading && !error && filteredCharities.length > 0 && (
          <div className="charities-grid">
            {filteredCharities.map((charity) => (
              <CharityCard
                key={charity.id}
                charity={charity}
                selectedCharity={selectedCharity?._id}
                setSelectedCharity={handleSelectCharity}
              />
            ))}
          </div>
        )}

        <section className="contribution-box">
          <div className="contribution-title">
            <Heart size={21} fill="currentColor" />
            <div>
              <h2>Your charity contribution</h2>
              <p>Choose how much of your membership supports this cause.</p>
            </div>
          </div>

          <div className="contribution-options">
            {[10, 15, 20, 25].map((amount) => (
              <button
                key={amount}
                type="button"
                className={
                  contributionPercent === amount ? "active-amount" : ""
                }
                onClick={() => dispatch(setContributionPercent(amount))}
              >
                {amount}%
              </button>
            ))}
          </div>
        </section>

        <div className="charity-summary">
          <div>
            <span>Supporting</span>
            <strong>
              {selectedCharity
                ? `${selectedCharity.name} · ${contributionPercent}% contribution`
                : "Choose a charity"}
            </strong>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedCharity || isLoading}
          >
            Continue to payment <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}

export default Charities;

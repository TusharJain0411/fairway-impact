import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ImpactCard from "./ImpactCard";
import "../styles/hero.css"
function Hero() {
  return (
    <section className="hero">
      <p className="eyebrow">PLAY WITH PURPOSE</p>

      <h1>Your score can create a real impact.</h1>

      <p className="hero-text">
        Track your golf scores, enter monthly prize draws, and support a charity
        that matters to you.
      </p>

      <div className="hero-actions">
        <Link to="/subscribe" className="primary-btn">
          Join Digital Heroes <ArrowRight size={18} />
        </Link>

        <a href="#how-it-works" className="secondary-btn">
          See how it works
        </a>
      </div>

      <ImpactCard />
    </section>
  );
}

export default Hero;

import { Link } from "react-router-dom";
import "../styles/navbar.css"
function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Fairway<span>Impact</span>
      </Link>

      <div className="nav-links">
        <a href="#how-it-works">How it works</a>
        <a href="#charities">Charities</a>
        <Link to="/login" className="login-link">
          Log in
        </Link>
        <Link to="/subscribe" className="subscribe-btn">
          Subscribe
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;

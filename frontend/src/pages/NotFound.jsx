import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/common/page-states.css";

function NotFound() {
  return (
    <main className="not-found-page">
      <section>
        <p className="not-found-code">404</p>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>

        <Link to="/" className="back-home-btn">
          <ArrowLeft size={18} />
          Back to home
        </Link>
      </section>
    </main>
  );
}

export default NotFound;

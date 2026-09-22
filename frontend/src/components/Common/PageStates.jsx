import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import "../../styles/common/page-states.css";

export function LoadingState({ text = "Loading..." }) {
  return (
    <div className="page-state">
      <span className="loading-spinner" />
      <p>{text}</p>
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  message = "No data is available at the moment.",
}) {
  return (
    <div className="page-state">
      <Inbox size={38} />
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
}) {
  return (
    <div className="page-state error-state">
      <AlertCircle size={38} />
      <h3>{title}</h3>
      <p>{message}</p>

      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}

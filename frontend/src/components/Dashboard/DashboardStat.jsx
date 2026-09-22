import "../../styles/dashboard/dashboard-stat.css";

function DashboardStat({ icon, title, value, subtitle, color }) {
  return (
    <article className="dashboard-stat">
      <div className={`stat-icon ${color}`}>{icon}</div>

      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        <span>{subtitle}</span>
      </div>
    </article>
  );
}

export default DashboardStat;

export default function StatusBadge({ status, label }) {
  const text =
    label ||
    (status === 'healthy'
      ? 'Healthy'
      : status === 'warning'
      ? 'Needs Attention'
      : status === 'danger'
      ? 'Critical'
      : 'Info');

  return (
    <span className={`badge badge--${status}`}>
      <span className="badge__dot" />
      {text}
    </span>
  );
}
export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? 'toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      aria-label={label || 'Toggle'}
    >
      <span className="toggle__knob" />
    </button>
  );
}
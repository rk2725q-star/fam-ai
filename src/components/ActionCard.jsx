import { ArrowRight } from 'lucide-react';

export default function ActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <button className="action-card" onClick={onClick}>
      <div className="action-card__icon">
        <Icon size={22} strokeWidth={2} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="action-card__arrow">
        Get started <ArrowRight size={14} />
      </span>
    </button>
  );
}
import { MapPin, Droplets, Sprout } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

export default function FieldCard({ field, onClick }) {
  return (
    <div className="field-card" onClick={() => onClick && onClick(field)}>
      <div className="field-card__img">
        <img
          src={field.image}
          alt={field.crop}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80';
          }}
        />
        <div className="field-card__badge">
          <StatusBadge status={field.status} />
        </div>
      </div>
      <div className="field-card__body">
        <div className="field-card__title">
          <div>
            <h3>{field.crop}</h3>
            <p>{field.name} · {field.area}</p>
          </div>
        </div>
        <div className="field-card__meta">
          <div className="field-meta">
            <div className="field-meta__label"><Sprout size={11} /> Stage</div>
            <div className="field-meta__value">{field.stage}</div>
          </div>
          <div className="field-meta">
            <div className="field-meta__label"><Droplets size={11} /> Irrigation</div>
            <div className="field-meta__value">{field.lastIrrigation}</div>
          </div>
          <div className="field-meta">
            <div className="field-meta__label"><MapPin size={11} /> Soil</div>
            <div className="field-meta__value">{field.soil}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
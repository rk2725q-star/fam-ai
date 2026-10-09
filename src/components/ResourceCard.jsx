import { ArrowRight } from 'lucide-react';

export default function ResourceCard({ resource, onReadMore }) {
  return (
    <article className="res-card">
      <div className="res-card__img">
        <img
          src={resource.image}
          alt={resource.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80';
          }}
        />
        <span className="res-card__cat">{resource.category}</span>
      </div>
      <div className="res-card__body">
        <h3>{resource.title}</h3>
        <p>{resource.description}</p>
        <button className="res-card__link" onClick={() => onReadMore && onReadMore(resource)}>
          Read More <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}
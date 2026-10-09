import { useState } from 'react';
import { Plus, MapPin, Droplets, Sprout, Calendar, Leaf, X } from 'lucide-react';
import FieldCard from '../components/FieldCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import { fields as initialFields } from '../data/fields.js';

export default function MyFields() {
  const [fields, setFields] = useState(initialFields);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newField, setNewField] = useState({
    name: '',
    crop: '',
    area: '',
    soil: 'Loamy',
    stage: 'Vegetative',
    location: '',
  });

  const handleAdd = () => {
    if (!newField.name || !newField.crop) return;
    const field = {
      id: `field-${fields.length + 1}`,
      name: newField.name,
      crop: newField.crop,
      cropFull: newField.crop,
      area: `${newField.area || '1.0'} acre${newField.area > 1 ? 's' : ''}`,
      status: 'healthy',
      soil: newField.soil,
      stage: newField.stage,
      lastIrrigation: 'Not yet',
      planted: '—',
      harvest: '—',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
      location: newField.location || 'New Block',
      irrigationStatus: 'Not scheduled',
      notes: '',
    };
    setFields((f) => [...f, field]);
    setNewField({ name: '', crop: '', area: '', soil: 'Loamy', stage: 'Vegetative', location: '' });
    setShowAdd(false);
  };

  return (
    <>
      <div className="page-header page-header__row">
        <div>
          <h1>My Fields</h1>
          <p>Monitor your farms and crop health.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAdd(true)}>
          <Plus size={17} /> Add New Field
        </button>
      </div>

      <div className="fields-grid">
        {fields.map((f) => (
          <FieldCard key={f.id} field={f} onClick={setSelected} />
        ))}
      </div>

      {/* Field detail modal */}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="field-detail">
            <div className="field-detail__hero">
              <img
                src={selected.image}
                alt={selected.crop}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80';
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>{selected.cropFull}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  {selected.area} · {selected.location}
                </p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <StatusBadge status={selected.status} />
              </div>
            </div>

            <div className="field-detail__grid">
              <div className="info-tile">
                <div className="info-tile__label"><Leaf size={12} /> Soil</div>
                <div className="info-tile__value">{selected.soil}</div>
              </div>
              <div className="info-tile">
                <div className="info-tile__label"><Sprout size={12} /> Crop Stage</div>
                <div className="info-tile__value">{selected.stage}</div>
              </div>
              <div className="info-tile">
                <div className="info-tile__label"><Droplets size={12} /> Last Irrigation</div>
                <div className="info-tile__value">{selected.lastIrrigation}</div>
              </div>
              <div className="info-tile">
                <div className="info-tile__label"><Calendar size={12} /> Planted</div>
                <div className="info-tile__value">{selected.planted}</div>
              </div>
            </div>

            {selected.notes && (
              <div className="disclaimer disclaimer--info" style={{ marginTop: 0 }}>
                <MapPin size={15} style={{ flexShrink: 0 }} />
                <span>{selected.notes}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add field modal */}
      {showAdd && (
        <Modal
          title="Add New Field"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={handleAdd}>
                Add Field
              </button>
            </>
          }
        >
          <div className="field-group">
            <label>Field Name</label>
            <input
              placeholder="e.g. Field 5"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            />
          </div>
          <div className="field-group">
            <label>Crop</label>
            <input
              placeholder="e.g. Sugarcane"
              value={newField.crop}
              onChange={(e) => setNewField({ ...newField, crop: e.target.value })}
            />
          </div>
          <div className="field-group">
            <label>Area (acres)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 1.5"
              value={newField.area}
              onChange={(e) => setNewField({ ...newField, area: e.target.value })}
            />
          </div>
          <div className="field-group">
            <label>Soil Type</label>
            <select
              value={newField.soil}
              onChange={(e) => setNewField({ ...newField, soil: e.target.value })}
            >
              <option>Loamy</option>
              <option>Sandy Loam</option>
              <option>Clay</option>
              <option>Red Loam</option>
            </select>
          </div>
          <div className="field-group">
            <label>Location / Block</label>
            <input
              placeholder="e.g. North Block"
              value={newField.location}
              onChange={(e) => setNewField({ ...newField, location: e.target.value })}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
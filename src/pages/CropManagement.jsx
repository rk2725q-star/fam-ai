import { useState } from 'react';
import {
  Plus,
  Sprout,
  Calendar,
  Droplets,
  CheckCircle2,
  Clock,
  ArrowRight,
  Leaf,
} from 'lucide-react';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { crops } from '../data/crops.js';

const tabs = ['Overview', 'Growth Stage', 'Fertilizer', 'Schedule', 'Notes'];

export default function CropManagement() {
  const [selectedId, setSelectedId] = useState(crops[0].id);
  const [tab, setTab] = useState('Overview');
  const [showAdd, setShowAdd] = useState(false);

  const crop = crops.find((c) => c.id === selectedId) || crops[0];

  return (
    <>
      <div className="page-header page-header__row">
        <div>
          <h1>Crop Management</h1>
          <p>Manage crops, growth stages and cultivation schedules.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAdd(true)}>
          <Plus size={17} /> Add Crop
        </button>
      </div>

      <div className="crop-grid">
        {/* Crop list */}
        <aside className="crop-list">
          <h3>My Crops</h3>
          {crops.map((c) => (
            <button
              key={c.id}
              className={`crop-item ${c.id === selectedId ? 'active' : ''}`}
              onClick={() => {
                setSelectedId(c.id);
                setTab('Overview');
              }}
            >
              <img
                className="crop-item__thumb"
                src={c.image}
                alt={c.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80';
                }}
              />
              <div className="crop-item__body">
                <h4>{c.shortName}</h4>
                <p>{c.area} · {c.stage}</p>
              </div>
              <StatusBadge status={c.status} />
            </button>
          ))}
        </aside>

        {/* Detail */}
        <section className="detail">
          <div className="detail__head">
            <img
              src={crop.image}
              alt={crop.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80';
              }}
            />
            <div>
              <h2>{crop.name}</h2>
              <p>{crop.field} · {crop.area} · {crop.soil}</p>
            </div>
            <div className="detail__head-right">
              <StatusBadge status={crop.status} />
            </div>
          </div>

          <div className="tabs">
            {tabs.map((t) => (
              <button
                key={t}
                className={`tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="tab-panel">
            {tab === 'Overview' && (
              <>
                <div className="tab-panel__grid">
                  <div className="info-tile">
                    <div className="info-tile__label"><Sprout size={13} /> Current Stage</div>
                    <div className="info-tile__value">{crop.stage}</div>
                  </div>
                  <div className="info-tile">
                    <div className="info-tile__label"><Calendar size={13} /> Planted</div>
                    <div className="info-tile__value">{crop.planted}</div>
                  </div>
                  <div className="info-tile">
                    <div className="info-tile__label"><Calendar size={13} /> Expected Harvest</div>
                    <div className="info-tile__value">{crop.harvest}</div>
                  </div>
                  <div className="info-tile">
                    <div className="info-tile__label"><Leaf size={13} /> Area</div>
                    <div className="info-tile__value">{crop.area}</div>
                  </div>
                </div>

                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Crop Lifecycle
                </div>
                <Lifecycle stages={crop.stages} current={crop.currentStageIndex} />
              </>
            )}

            {tab === 'Growth Stage' && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
                  Lifecycle Timeline
                </div>
                <Lifecycle stages={crop.stages} current={crop.currentStageIndex} />
                <div className="disclaimer disclaimer--info" style={{ marginTop: 20 }}>
                  <Clock size={16} style={{ flexShrink: 0 }} />
                  <span>
                    Current stage: <strong>{crop.stage}</strong>. Adjust irrigation and
                    fertilizer based on stage-specific requirements.
                  </span>
                </div>
              </>
            )}

            {tab === 'Fertilizer' && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Fertilizer Schedule
                </div>
                <div className="schedule-list">
                  {crop.fertilizers.map((f) => (
                    <div className="schedule-item" key={f.name}>
                      <div className="schedule-item__date">{f.date}</div>
                      <div className="schedule-item__body">
                        <h4>{f.name}</h4>
                        <p>{f.detail}</p>
                      </div>
                      <CheckCircle2 size={18} style={{ color: 'var(--green-700)' }} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'Schedule' && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Irrigation Schedule
                </div>
                <div className="schedule-list" style={{ marginBottom: 24 }}>
                  {crop.irrigationSchedule.map((s) => (
                    <div className="schedule-item" key={s.name}>
                      <div className="schedule-item__date">
                        <Droplets size={14} style={{ display: 'block', margin: '0 auto 2px' }} />
                        {s.date}
                      </div>
                      <div className="schedule-item__body">
                        <h4>{s.name}</h4>
                        <p>{s.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Important Tasks
                </div>
                <div className="schedule-list">
                  {crop.tasks.map((t) => (
                    <div className="schedule-item" key={t.name}>
                      <div className="schedule-item__date">{t.date}</div>
                      <div className="schedule-item__body">
                        <h4>{t.name}</h4>
                        <p>{t.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'Notes' && (
              <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)' }}>
                <p style={{ marginBottom: 12 }}>
                  <strong style={{ color: 'var(--text)' }}>Field Notes:</strong> Monitor
                  crop health weekly. Record observations for better decision-making next
                  season.
                </p>
                <p>
                  <strong style={{ color: 'var(--text)' }}>Advisory:</strong> Always
                  consult local agricultural extension officers for region-specific
                  recommendations.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {showAdd && (
        <Modal
          title="Add New Crop"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={() => setShowAdd(false)}>
                Add Crop
              </button>
            </>
          }
        >
          <div className="field-group">
            <label>Crop Name</label>
            <input placeholder="e.g. Sugarcane" />
          </div>
          <div className="field-group">
            <label>Field</label>
            <select defaultValue="Field 1">
              <option>Field 1</option>
              <option>Field 2</option>
              <option>Field 3</option>
              <option>Field 4</option>
            </select>
          </div>
          <div className="field-group">
            <label>Area (acres)</label>
            <input type="number" placeholder="e.g. 1.5" />
          </div>
          <div className="field-group">
            <label>Planting Date</label>
            <input type="date" />
          </div>
        </Modal>
      )}
    </>
  );
}

function Lifecycle({ stages, current }) {
  return (
    <div className="lifecycle">
      {stages.map((s, i) => {
        const done = i < current;
        const isCurrent = i === current;
        return (
          <div className="lifecycle__step" key={s}>
            <div className="lifecycle__node">
              <div
                className={`lifecycle__circle ${
                  done ? 'lifecycle__circle--done' : isCurrent ? 'lifecycle__circle--current' : ''
                }`}
              >
                {done ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <div className={`lifecycle__label ${isCurrent ? 'lifecycle__label--current' : ''}`}>
                {s}
              </div>
            </div>
            {i < stages.length - 1 && (
              <ArrowRight size={16} className="lifecycle__arrow" />
            )}
          </div>
        );
      })}
    </div>
  );
}
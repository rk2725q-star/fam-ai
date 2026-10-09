import { useState } from 'react';
import {
  Pencil,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import Toggle from '../components/Toggle.jsx';
import Modal from '../components/Modal.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Settings() {
  const { language, setLanguage, languages } = useLanguage();

  const [profile, setProfile] = useState({
    name: 'Ramesh',
    location: 'Coimbatore, Tamil Nadu',
  });
  const [units, setUnits] = useState('Metric');
  const [notifications, setNotifications] = useState({
    weather: true,
    irrigation: true,
    disease: true,
    farmUpdates: false,
  });
  const [showEdit, setShowEdit] = useState(false);
  const [draft, setDraft] = useState(profile);

  const [toastMsg, setToastMsg] = useState('');

  const toggle = (key) =>
    setNotifications((n) => ({ ...n, [key]: !n[key] }));

  const saveProfile = () => {
    setProfile(draft);
    setShowEdit(false);
    setToastMsg(language === 'ta' ? 'சுயவிவரம் புதுப்பிக்கப்பட்டது!' : 'Profile updated successfully!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <>
      <div className="page-header">
        <h1>{language === 'ta' ? 'அமைப்புகள் (Settings)' : 'Settings'}</h1>
        <p>
          {language === 'ta'
            ? 'உங்கள் கணக்கு, மொழி மற்றும் விருப்பங்களை நிர்வகிக்கவும்.'
            : 'Manage your account, language and preferences.'}
        </p>
      </div>

      {toastMsg && (
        <div className="alert-toast">
          <CheckCircle2 size={16} color="#16a34a" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Profile */}
        <section className="settings-card">
          <div className="settings-card__title">
            {language === 'ta' ? 'சுயவிவரம் (Profile)' : 'Profile'}
          </div>
          <div className="profile-row">
            <div className="profile-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h3>{profile.name}</h3>
              <p>{profile.location}</p>
            </div>
            <button
              className="btn btn--outline btn--sm"
              onClick={() => {
                setDraft(profile);
                setShowEdit(true);
              }}
            >
              <Pencil size={14} /> Edit Profile
            </button>
          </div>
        </section>



        {/* Preferences */}
        <section className="settings-card">
          <div className="settings-card__title">
            {language === 'ta' ? 'விருப்பத்தேர்வுகள் (Preferences)' : 'Preferences'}
          </div>
          <div className="setting-row">
            <div className="setting-row__label">
              <h4>{language === 'ta' ? 'மொழி (Language)' : 'Language'}</h4>
              <p>
                {language === 'ta'
                  ? 'Farm AI பேசும் மற்றும் பதிலளிக்கும் மொழி'
                  : 'Assistant conversation and display language'}
              </p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.fullLabel}
                </option>
              ))}
            </select>
          </div>
          <div className="setting-row">
            <div className="setting-row__label">
              <h4>Units</h4>
              <p>Measurement system for weather & area</p>
            </div>
            <select value={units} onChange={(e) => setUnits(e.target.value)}>
              <option>Metric (kg, litres, acres)</option>
              <option>Imperial</option>
            </select>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-card">
          <div className="settings-card__title">Notifications</div>

          <div className="setting-row">
            <div className="setting-row__label">
              <h4>Weather Alerts</h4>
              <p>Get alerts for rain, storms and extreme weather</p>
            </div>
            <Toggle
              checked={notifications.weather}
              onChange={() => toggle('weather')}
              label="Weather Alerts"
            />
          </div>

          <div className="setting-row">
            <div className="setting-row__label">
              <h4>Irrigation Recommendations</h4>
              <p>Daily irrigation guidance based on conditions</p>
            </div>
            <Toggle
              checked={notifications.irrigation}
              onChange={() => toggle('irrigation')}
              label="Irrigation Recommendations"
            />
          </div>

          <div className="setting-row">
            <div className="setting-row__label">
              <h4>Disease Alerts</h4>
              <p>Alerts about disease risks in your area</p>
            </div>
            <Toggle
              checked={notifications.disease}
              onChange={() => toggle('disease')}
              label="Disease Alerts"
            />
          </div>

          <div className="setting-row">
            <div className="setting-row__label">
              <h4>Important Farm Updates</h4>
              <p>General updates and announcements</p>
            </div>
            <Toggle
              checked={notifications.farmUpdates}
              onChange={() => toggle('farmUpdates')}
              label="Important Farm Updates"
            />
          </div>
        </section>

        {/* Privacy & Support */}
        <section className="settings-card">
          <div className="settings-card__title">Privacy & Support</div>
          <div className="settings-link-row">
            <div className="settings-link-row__left">
              <Shield size={18} /> Data & Privacy
            </div>
            <ChevronRight size={16} />
          </div>
          <div className="settings-link-row">
            <div className="settings-link-row__left">
              <HelpCircle size={18} /> Help & Support
            </div>
            <ChevronRight size={16} />
          </div>
          <div className="settings-link-row">
            <div className="settings-link-row__left">
              <Info size={18} /> About Farm AI
            </div>
            <ChevronRight size={16} />
          </div>
        </section>

        {/* Logout */}
        <section className="settings-card">
          <button className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </section>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <Modal
          title="Edit Profile"
          onClose={() => setShowEdit(false)}
          footer={
            <>
              <button className="btn btn--outline" onClick={() => setShowEdit(false)}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={saveProfile}>
                Save Changes
              </button>
            </>
          }
        >
          <div className="field-group">
            <label>Full Name</label>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div className="field-group">
            <label>Location</label>
            <input
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            />
          </div>
          <div className="field-group">
            <label>Phone Number</label>
            <input placeholder="+91 ..." />
          </div>
        </Modal>
      )}


    </>
  );
}
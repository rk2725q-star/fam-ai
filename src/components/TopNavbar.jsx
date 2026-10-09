import { useState } from 'react';
import { Search, Bell, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function TopNavbar({ onMenuClick, onToggleCollapse, collapsed }) {
  const { language, setLanguage, languages } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleAsk = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      navigate('/assistant');
      return;
    }
    // Navigate to assistant with search state
    navigate('/assistant', { state: { initialPrompt: searchQuery } });
  };

  return (
    <header className="topbar">
      <button
        className="topbar__menu-btn"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <button
        className="topbar__collapse-btn"
        onClick={onToggleCollapse}
        aria-label="Collapse sidebar"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <form className="topbar__search" onSubmit={handleAsk}>
        <Search size={17} className="topbar__search-icon" />
        <input
          type="text"
          placeholder={
            language === 'ta'
              ? 'Farm AI-யிடம் கேளுங்கள்...'
              : 'Ask Farm AI anything...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="topbar__ask-btn" type="submit">
          {language === 'ta' ? 'கேள்' : 'Ask'}
        </button>
      </form>

      <div className="topbar__actions">
        <div className="topbar__lang">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Language"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.fullLabel}
              </option>
            ))}
          </select>
        </div>

        <button className="topbar__icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="topbar__badge" />
        </button>

        <button className="topbar__profile" onClick={() => navigate('/settings')}>
          <div className="topbar__avatar">R</div>
          <div className="topbar__profile-info">
            <strong>Ramesh</strong>
            <span>{language === 'ta' ? 'விவசாயி' : 'Farmer'}</span>
          </div>
        </button>
      </div>
    </header>
  );
}
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import TopNavbar from './components/TopNavbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import DiseaseDetection from './pages/DiseaseDetection.jsx';
import IrrigationGuide from './pages/IrrigationGuide.jsx';
import CropManagement from './pages/CropManagement.jsx';
import Resources from './pages/Resources.jsx';
import Weather from './pages/Weather.jsx';
import MyFields from './pages/MyFields.jsx';
import Settings from './pages/Settings.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <LanguageProvider>
      <div className="app-shell">
        <Sidebar
          open={sidebarOpen}
          collapsed={collapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        <div className={`app-main ${collapsed ? 'app-main--collapsed' : ''}`}>
          <TopNavbar
            onMenuClick={() => setSidebarOpen(true)}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            collapsed={collapsed}
          />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/assistant" element={<AIAssistant />} />
              <Route path="/disease-detection" element={<DiseaseDetection />} />
              <Route path="/irrigation" element={<IrrigationGuide />} />
              <Route path="/crop-management" element={<CropManagement />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/fields" element={<MyFields />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}
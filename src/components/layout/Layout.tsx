import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { ToastContainer } from '../common/ToastContainer';
import { WorkedExampleModal } from '../common/WorkedExampleModal';

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <div className="app-container circuit-grid-bg">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="main-wrapper">
        <TopNavbar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        
        <main className="content-container">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
      <WorkedExampleModal />
    </div>
  );
};

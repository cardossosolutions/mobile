import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import CompanyManagement from '../management/CompanyManagement';
import ResidenceManagement from '../management/ResidenceManagement';
import EmployeeManagement from '../management/EmployeeManagement';
import GuestManagement from '../management/GuestManagement';
import AppointmentManagement from '../management/AppointmentManagement';
import VisitorScheduleView from '../views/VisitorScheduleView';
import DashboardHome from './DashboardHome';

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <DashboardHome />;
      case 'companies':
        return <CompanyManagement />;
      case 'residences':
        return <ResidenceManagement />;
      case 'employees':
        return <EmployeeManagement />;
      case 'guests':
        return <GuestManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'visitor-schedule':
        return <VisitorScheduleView />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
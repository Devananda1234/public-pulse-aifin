import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, MapPin, FileText, Search, ShieldCheck, LogOut, Menu } from 'lucide-react';

const Layout: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Report Issue', path: '/report', icon: FileText },
    { name: 'Interactive Map', path: '/map', icon: MapPin },
    { name: 'Track Issue', path: '/track', icon: Search },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="font-bold text-xl text-slate-800">Public Pulse</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-sky-50 text-sky-600 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          {isAdmin ? (
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 w-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          ) : (
            <Link 
              to="/login"
              className="flex items-center gap-3 px-3 py-2 w-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors"
            >
              <ShieldCheck size={20} />
              Admin Login
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
          <div className="md:hidden">
            <button className="text-slate-500 hover:text-slate-700">
              <Menu size={24} />
            </button>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">
              {isAdmin ? 'Admin Mode' : 'Public Access'}
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

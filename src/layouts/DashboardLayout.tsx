import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, MessageSquare, CheckSquare, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';

export default function DashboardLayout() {
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Profil', to: '/profile', icon: User },
    { name: 'Conversations', to: '/conversations', icon: MessageSquare, badge: 2 },
    { name: 'Actions', to: '/actions', icon: CheckSquare },
    { name: 'Paramètres', to: '/settings', icon: Settings },
  ];

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';
  const userName = user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-neutral-800 shrink-0">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-purple-900/20">
            <MessageSquare className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">OmniChat</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Menu principal</div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-purple-600/10 text-purple-400'
                    : 'text-gray-400 hover:bg-neutral-900 hover:text-gray-200'
                )
              }
            >
              <div className="flex items-center">
                <item.icon className={clsx(
                  "mr-3 h-5 w-5 transition-colors",
                  "group-hover:text-purple-400"
                )} />
                {item.name}
              </div>
              {item.badge && (
                <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-black">
        <Outlet />
      </main>
    </div>
  );
}

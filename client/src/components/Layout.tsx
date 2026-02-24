import { NavLink, Outlet } from 'react-router-dom';

const tabs = [
  { to: '/',         label: 'Journal',  icon: '📔' },
  { to: '/add',      label: 'Log Entry', icon: '➕' },
  { to: '/insights', label: 'Insights', icon: '📊' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-2xl mx-auto">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border-t border-gray-200 flex">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors
               ${isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`
            }
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

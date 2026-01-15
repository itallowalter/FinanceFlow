import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  Target, 
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Wallet, label: 'Contas', path: '/accounts' },
    { icon: ArrowRightLeft, label: 'Transações', path: '/transactions' },
    { icon: Target, label: 'Metas', path: '/goals' },
    { icon: AlertTriangle, label: 'Dívidas', path: '/debts' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-30 w-64 bg-surface border-r border-gray-800 
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            FinanceFlow
          </h1>
        </div>
        
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'}
                `}
              >
                <Icon size={20} className="mr-3" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-gray-800 bg-surface">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-white">FinanceFlow</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
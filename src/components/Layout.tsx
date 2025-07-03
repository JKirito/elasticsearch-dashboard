import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Database, AlertCircle } from 'lucide-react';
import { useConnectionTest } from '../hooks/useElasticsearch';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/overview', label: 'Overview', icon: <Home size={20} /> },
  { path: '/indexes', label: 'Indexes', icon: <Database size={20} /> },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { data: isConnected, isLoading: isTestingConnection } = useConnectionTest();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Elasticsearch Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isTestingConnection ? (
                <div className="flex items-center text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                  Connecting...
                </div>
              ) : isConnected ? (
                <div className="flex items-center text-green-600">
                  <div className="h-2 w-2 bg-green-600 rounded-full mr-2"></div>
                  Connected
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <AlertCircle size={16} className="mr-2" />
                  Connection Failed
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path === '/indexes' && location.pathname.startsWith('/indexes/'));
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
import React, { useEffect } from 'react';
import { Home, Coins, PlusCircle, Shield, Skull, Wallet, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavItem = ({ icon: Icon, text, to, onClick }: { 
  icon: React.ElementType; 
  text: string; 
  to: string;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-[#7a5cff] text-white' 
            : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{text}</span>
      </Link>
    </li>
  );
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isConnected, connect, disconnect, isLoading, publicKey } = useWallet();

  // Close sidebar on route change on mobile
  const location = useLocation();
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location, isOpen, onClose]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-[#2a2a2a] z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between mb-8 md:justify-center">
            <h1 className="text-2xl font-bold text-white tracking-wider">ALTIFY</h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors md:hidden"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <nav className="space-y-8">
            <ul className="space-y-2">
              <NavItem icon={Home} text="Home" to="/" onClick={onClose} />
              <NavItem icon={Shield} text="Safe Coins" to="/safe-coins" onClick={onClose} />
              <NavItem icon={Skull} text="Degen Coins" to="/degen-coins" onClick={onClose} />
              <NavItem icon={Coins} text="My Tokens" to="/my-tokens" onClick={onClose} />
              <NavItem icon={PlusCircle} text="Create Token" to="/create" onClick={onClose} />
            </ul>

            <div className="px-4">
              {isConnected && publicKey ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400 bg-[#1e1e1e] px-3 py-2 rounded break-all">
                    {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                  </div>
                  <button
                    onClick={() => {
                      disconnect();
                      onClose();
                    }}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connect();
                    onClose();
                  }}
                  disabled={isLoading}
                  className="w-full bg-[#7a5cff] hover:bg-[#6a4cef] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wallet className="w-4 h-4" />
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
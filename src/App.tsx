import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MobileMenu from './components/MobileMenu';
import HomePage from './pages/HomePage';
import CreateToken from './pages/CreateToken';
import MyTokens from './pages/MyTokens';
import SafeCoins from './pages/SafeCoins';
import DegenCoins from './pages/DegenCoins';
import TokenPage from './pages/TokenPage';
import DegenTokenPage from './pages/DegenTokenPage';
import TokenDashboard from './pages/TokenDashboard';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RiskDisclaimer from './pages/RiskDisclaimer';
import Footer from './components/Footer';
import WarningPopup from './components/WarningPopup';
import { useWarningPopup } from './hooks/useWarningPopup';
import { WalletProvider } from './contexts/WalletContext';
import { TokenProvider } from './contexts/TokenContext';
import {clusterApiUrl, Connection, Keypair} from "@solana/web3.js";
import {createAndSignTransaction} from "./services/solanaServices.ts";

function App() {
  const { showWarning, acceptWarning } = useWarningPopup();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <WalletProvider>
      <TokenProvider>
        <Router>
          <div className="flex min-h-screen bg-[#1e1e1e]">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <Sidebar isOpen={false} onClose={() => {}} />
            </div>

            {/* Mobile Menu */}
            <MobileMenu 
              isOpen={isMobileMenuOpen} 
              onClose={() => setIsMobileMenuOpen(false)} 
            />
            
            <div className="flex-1 flex flex-col min-h-screen">
              {/* Mobile Header */}
              <div className="md:hidden bg-[#2a2a2a] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-white tracking-wider">ALTIFY</h1>
                <div className="w-10" /> {/* Spacer for centering */}
              </div>

              <main className="flex-1 px-4 md:px-8 py-6 md:py-12">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/create" element={<CreateToken />} />
                    <Route path="/my-tokens" element={<MyTokens />} />
                    <Route path="/safe-coins" element={<SafeCoins />} />
                    <Route path="/degen-coins" element={<DegenCoins />} />
                    <Route path="/token/:tokenAddress" element={<TokenPage />} />
                    <Route path="/degen-token/:tokenAddress" element={<DegenTokenPage />} />
                    <Route path="/dashboard/:tokenAddress" element={<TokenDashboard />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/risk" element={<RiskDisclaimer />} />
                  </Routes>
                </div>
              </main>
              <Footer />
            </div>
          </div>
          {showWarning && <WarningPopup onAccept={acceptWarning} />}
        </Router>
      </TokenProvider>
    </WalletProvider>
  );
}

export default App;
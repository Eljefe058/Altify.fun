import React from 'react';
import { useNavigate } from 'react-router-dom';
import FAQ from '../components/FAQ';
import ContactForm from '../components/ContactForm';
import HowItWorks from '../components/HowItWorks';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          Create Your Custom Solana Token Instantly
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
          Launch your token with advanced features, automated liquidity management, and real-time analytics. Start building your crypto project in minutes.
        </p>
        <button 
          onClick={() => navigate('/create')}
          className="bg-[#7a5cff] hover:bg-[#6a4cef] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
        >
          Create Token
        </button>
      </div>

      <HowItWorks />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <FAQ />
        <ContactForm />
      </div>
    </>
  );
}
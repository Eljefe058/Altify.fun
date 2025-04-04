import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 py-6 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-center md:text-left">
          © 2024 Altify.fun. All rights reserved.
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/risk" className="hover:text-white transition-colors">Risk Disclaimer</Link>
        </div>
      </div>
    </footer>
  );
}
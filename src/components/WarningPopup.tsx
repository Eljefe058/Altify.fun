import React from 'react';
import { X, AlertTriangle, Shield } from 'lucide-react';

interface WarningPopupProps {
  onAccept: () => void;
}

export default function WarningPopup({ onAccept }: WarningPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] rounded-lg max-w-2xl w-full p-6 relative">
        <div className="absolute right-4 top-4">
          <X className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-[#7a5cff]" />
          <h2 className="text-2xl font-bold text-white">Important Risk Disclaimer</h2>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-semibold mb-1">High-Risk Investment Warning</h3>
                <p className="text-gray-300">
                  Cryptocurrency tokens, especially newly created ones, are extremely high-risk investments. 
                  You could lose all of your invested capital.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-yellow-400 font-semibold mb-1">Non-Custodial Service</h3>
                <p className="text-gray-300">
                  Altify.fun is a non-custodial, automated tool and does not hold user funds or endorse any tokens. 
                  Tokens can be scams, and we are not responsible for any losses.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-400 font-semibold mb-1">Legal Compliance</h3>
                <p className="text-gray-300">
                  By using Altify.fun, you confirm that you are not violating any local regulations and accept 
                  full responsibility for token launches, trading, and potential losses.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1e1e1e] rounded-lg p-4 mb-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="w-4 h-4 mt-1 rounded border-gray-700 text-[#7a5cff] focus:ring-[#7a5cff] focus:ring-offset-gray-900"
              onChange={(e) => {
                if (e.target.checked) {
                  const timer = setTimeout(onAccept, 2000); // Force user to wait 2 seconds
                  return () => clearTimeout(timer);
                }
              }}
            />
            <span className="text-sm text-gray-300">
              I understand and accept all risks involved. I acknowledge that Altify.fun is not responsible 
              for any losses, and I will conduct my own research before investing.
            </span>
          </label>
        </div>
        
        <div className="text-center text-sm text-gray-400">
          By proceeding, you agree to our{' '}
          <a href="/terms" className="text-[#7a5cff] hover:underline">Terms of Service</a>,{' '}
          <a href="/privacy" className="text-[#7a5cff] hover:underline">Privacy Policy</a>, and{' '}
          <a href="/risk" className="text-[#7a5cff] hover:underline">Risk Disclaimer</a>.
        </div>
      </div>
    </div>
  );
}
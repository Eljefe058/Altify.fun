import React, { useState } from 'react';
import { AlertTriangle, Shield } from 'lucide-react';

interface CreateTokenConfirmationProps {
  mode: 'safe' | 'advanced' | 'degen';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CreateTokenConfirmation({ mode, onConfirm, onCancel }: CreateTokenConfirmationProps) {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const handleAccept = () => {
    if (!hasAccepted) return;
    setIsWaiting(true);
    // Force user to wait 3 seconds before confirming
    setTimeout(() => {
      onConfirm();
    }, 3000);
  };

  const modeWarnings = {
    safe: {
      title: 'Safe Mode Token Creation',
      description: 'Creating a rugpull-proof token with verified security features.',
      warning: 'Even safe tokens can lose value. Security features may limit flexibility.'
    },
    advanced: {
      title: 'Advanced Mode Token Creation',
      description: 'Creating a token with customizable features and standard security.',
      warning: 'Advanced features require careful configuration to prevent misuse.'
    },
    degen: {
      title: 'High-Risk Token Creation',
      description: 'Creating a token with minimal restrictions and experimental features.',
      warning: 'EXTREMELY HIGH RISK! No safety measures. Potential for total loss.'
    }
  };

  const warning = modeWarnings[mode];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-[#7a5cff]" />
          <h2 className="text-2xl font-bold text-white">{warning.title}</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-[#1e1e1e] rounded-lg">
            <p className="text-gray-300">{warning.description}</p>
          </div>

          <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-200">{warning.warning}</p>
            </div>
          </div>

          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-gray-300">
                <div>By clicking Create, I confirm that:</div>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>I am not violating any local regulations</li>
                  <li>I understand and accept all risks involved</li>
                  <li>I am fully responsible for this token</li>
                  <li>Altify.fun is not liable for any outcomes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1e1e1e] rounded-lg p-4 mb-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="w-4 h-4 mt-1 rounded border-gray-700 text-[#7a5cff] focus:ring-[#7a5cff] focus:ring-offset-gray-900"
              checked={hasAccepted}
              onChange={(e) => setHasAccepted(e.target.checked)}
            />
            <span className="text-sm text-gray-300">
              I have read and understood all warnings. I accept full responsibility for creating and managing this token.
            </span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            disabled={!hasAccepted || isWaiting}
            className="flex-1 bg-[#7a5cff] hover:bg-[#6a4cef] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isWaiting ? 'Creating Token...' : 'Create Token'}
          </button>
        </div>
      </div>
    </div>
  );
}
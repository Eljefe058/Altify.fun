import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, ExternalLink, Shield, Zap, Skull } from 'lucide-react';
import NetworkBadge from '../components/NetworkBadge';
import CreateTokenConfirmation from '../components/CreateTokenConfirmation';
import { useWallet } from '../contexts/WalletContext';
import { useTokens } from '../contexts/TokenContext';
import type { CreationMode } from '../types';
import {createTheToken} from '../services/SafeMode.jsx';
import { getLiquidityAccount } from "../services/HandleTrade.jsx";
import {advancedModeInitialize} from '../services/AdvancedModeServices.jsx';
import { degeninitializeToken } from '../services/DegenMode.jsx';

// import { Buffer } from 'buffer';
// window.Buffer = Buffer;
// import createTokenSafeMode from '../../programs/degen-token/src/'

interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  image: string;
  website: string;
  twitter: string;
  discord: string;
  telegram: string;
  initialLiquidity: number;
  mode: CreationMode;
}



const initialFormData: TokenFormData = {
  name: '',
  symbol: '',
  description: '',
  image: '',
  website: '',
  twitter: '',
  discord: '',
  telegram: '',
  initialLiquidity: 0.2,
  mode: 'safe'
};

const modeDescriptions = {
  safe: 'Rugpull-proof token with verified security features. Best for serious projects.',
  advanced: 'Full customization options with standard security measures. For experienced creators.',
  degen: 'High-risk mode with minimal restrictions. Includes bonding curve and experimental features.'
};

const modeIcons = {
  safe: Shield,
  advanced: Zap,
  degen: Skull
};

export default function CreateToken() {
  const navigate = useNavigate();
  const { isConnected, connect, network, balance, error: walletError, publicKey, wallet } = useWallet();
  const { addToken } = useTokens();
  const [formData, setFormData] = useState<TokenFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [symbolError, setSymbolError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'initialLiquidity' && formData.mode !== 'degen') {
      const numValue = parseFloat(value);
      if (numValue < 0.2) {
        setError('Minimum 0.2 SOL required to create a liquidity pool');
      } else {
        setError(null);
      }
    }

    if (name === 'symbol') {
      // Convert to uppercase
      const upperValue = value.toUpperCase();

      // Validate length
      if (upperValue.length > 10) {
        setSymbolError('Token symbols on Solana must be between 1-10 characters.');
        return;
      }

      // Validate characters (only letters and numbers)
      if (upperValue && !/^[A-Z0-9]*$/.test(upperValue)) {
        setSymbolError('Token symbols can only contain letters and numbers.');
        return;
      }

      setSymbolError(null);
      setFormData(prev => ({ ...prev, symbol: upperValue }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModeChange = (mode: CreationMode) => {
    setFormData(prev => ({ ...prev, mode }));
    if (mode === 'degen') {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (symbolError) {
      return;
    }

    // Show confirmation modal instead of creating token immediately
    setShowConfirmation(true);
  };




  const handleConfirmCreate = async () => {
    setIsLoading(true);

    try {
      if (formData.mode === 'safe') {
        if (isConnected && wallet && publicKey) {
          console.log("Wallet Connected !!")
          // console.log("Token Account", tokenAddress.toString());
          // console.log("Token Address", t)
          // const signature = await createAndSignTransaction(wallet, connection, publicKey).catch(console.error);
          // console.log("Transaction Successful !!!", signature);
        }

      }
      // Generate a random token address for demo purposes
      // In production, this would be the actual token mint address from Solana
      const tokenAddress = Array.from({ length: 44 }, () =>
        '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[
          Math.floor(Math.random() * 58)
        ]
      ).join('');

      // Create the new token object
      const newToken = {
        name: formData.name,
        symbol: formData.symbol,
        mode: formData.mode,
        liquidity: formData.initialLiquidity,
        createdAt: new Date().toISOString(),
        address: tokenAddress,
        owner: publicKey!
      };

      if (formData.mode === 'safe') {
        await createTheToken(formData.name, formData.symbol, formData.initialLiquidity);
        getLiquidityAccount(formData.initialLiquidity);
      }

      if(formData.mode === 'advanced'){
          await advancedModeInitialize(formData.name, formData.symbol, formData.initialLiquidity);
      }

      if(formData.mode === 'degen') {
        await degeninitializeToken(formData.name, formData.symbol, formData.initialLiquidity);
      }
      // if(formData.mode === 'safe') {
      //   await createTokenSafeMode({})
      // }

      // Add the token to global state
      addToken(newToken);

        // Navigate to My Tokens page
        navigate('/my-tokens');

    } catch (err: any) {
      setError(err.message || 'Failed to create token. Please try again.');
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold text-white mb-8">Connect Your Wallet</h1>
        <button
          onClick={connect}
          disabled={isLoading}
          className="bg-[#7a5cff] hover:bg-[#6a4cef] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
        >
          {isLoading ? 'Connecting...' : 'Connect Phantom Wallet'}
        </button>
        {walletError && (
          <div className="mt-4 text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {walletError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {showConfirmation && (
        <CreateTokenConfirmation
          mode={formData.mode}
          onConfirm={handleConfirmCreate}
          onCancel={() => setShowConfirmation(false)}
        />
      )}

      {/* Wallet Status Bar */}
      <div className="bg-[#2a2a2a] rounded-lg p-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <NetworkBadge network={network === 'testnet' ? 'devnet' : 'mainnet'} />
          <div className="text-sm text-gray-300">
            <span className="mr-2">Connected:</span>
            <code className="bg-[#1e1e1e] px-2 py-1 rounded">
              {balance !== null && (
                <div className="text-sm text-gray-300">
                  <span className="mr-2">Balance:</span>
                  <span className="font-medium text-white">{balance.toFixed(2)} SOL</span>
                </div>
              )}
            </code>
          </div>
        </div>
      </div>

      {/* Network Warning */}
      {network === 'testnet' && (
        <div className="bg-[#2a2a2a] rounded-lg p-6 mb-8">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">
              You are currently in Testnet mode. Tokens created here use test SOL and aren't tradable on mainnet.
              Switch to mainnet in your Phantom wallet settings for real token creation.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Creation Mode Selection */}
        <div className="bg-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Select Creation Mode</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {(['safe', 'advanced', 'degen'] as CreationMode[]).map(mode => {
              const Icon = modeIcons[mode];
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleModeChange(mode)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.mode === mode
                      ? 'border-[#7a5cff] bg-[#7a5cff]/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${
                    formData.mode === mode ? 'text-[#7a5cff]' : 'text-gray-400'
                  }`} />
                  <h3 className="text-lg font-medium text-white capitalize mb-1">
                    {mode} Mode
                  </h3>
                  <p className="text-sm text-gray-400">
                    {modeDescriptions[mode]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Token Details */}
        <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Token Details</h2>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Token Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white"
              placeholder="My Awesome Token"
            />
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-300 mb-1">
              Token Symbol
            </label>
            <input
              type="text"
              id="symbol"
              name="symbol"
              required
              maxLength={10}
              value={formData.symbol}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-[#1e1e1e] border rounded-lg focus:outline-none focus:border-[#7a5cff] text-white ${
                symbolError ? 'border-red-500' : 'border-gray-700'
              }`}
              placeholder="MAT"
            />
            {symbolError && (
              <div className="mt-2 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {symbolError}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white resize-none"
              placeholder="Describe your token..."
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
              Token Image URL (Optional)
            </label>
            <div className="flex gap-4">
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white"
                placeholder="https://..."
              />
              <button
                type="button"
                className="px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Upload className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Social Links</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
                Website
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-10 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white"
                  placeholder="https://..."
                />
                <ExternalLink className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-1">
                Twitter
              </label>
              <input
                type="url"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label htmlFor="discord" className="block text-sm font-medium text-gray-300 mb-1">
                Discord
              </label>
              <input
                type="url"
                id="discord"
                name="discord"
                value={formData.discord}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white"
                placeholder="https://discord.gg/..."
              />
            </div>

            <div>
              <label htmlFor="telegram" className="block text-sm font-medium text-gray-300 mb-1">
                Telegram
              </label>
              <input
                type="url"
                id="telegram"
                name="telegram"
                value={formData.telegram}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white"
                placeholder="https://t.me/..."
              />
            </div>
          </div>
        </div>

        {/* Liquidity Setup */}
        <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Liquidity Setup</h2>

          <div>
            <label htmlFor="initialLiquidity" className="block text-sm font-medium text-gray-300 mb-1">
              Initial Liquidity (SOL)
            </label>
            <input
              type="number"
              id="initialLiquidity"
              name="initialLiquidity"
              required
              min={formData.mode === 'degen' ? 0 : 0.2}
              step="0.1"
              value={formData.initialLiquidity}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white"
            />
            {error && (
              <p className="mt-2 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !!error}
          className="w-full bg-[#7a5cff] hover:bg-[#6a4cef] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Creating Token...' : 'Create Token'}
        </button>
      </form>
    </div>
  );
}






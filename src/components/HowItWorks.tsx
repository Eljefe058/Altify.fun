import React from 'react';
import { Wallet, PlusCircle, Droplets, Settings } from 'lucide-react';

const Step = ({ icon: Icon, title, description }: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => (
  <div className="bg-[#2a2a2a] p-6 rounded-lg text-center">
    <div className="w-12 h-12 mx-auto mb-4 bg-[#7a5cff] rounded-lg flex items-center justify-center">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);

export default function HowItWorks() {
  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Step
          icon={Wallet}
          title="Connect Wallet"
          description="Connect your Solana wallet to get started with token creation"
        />
        <Step
          icon={PlusCircle}
          title="Create Token"
          description="Configure your token's name, supply, and advanced features"
        />
        <Step
          icon={Droplets}
          title="Add Liquidity"
          description="Provide initial liquidity to enable trading on DEX platforms"
        />
        <Step
          icon={Settings}
          title="Manage Features"
          description="Control token features and monitor performance in real-time"
        />
      </div>
    </div>
  );
}
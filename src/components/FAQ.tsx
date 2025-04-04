import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 last:border-0">
      <button
        className="w-full py-4 flex items-center justify-between text-left hover:text-[#7a5cff] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-white">{question}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4">
          <p className="text-gray-400">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default function FAQ() {
  return (
    <div className="bg-[#2a2a2a] rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
      <div className="space-y-2">
        <FAQItem
          question="What is Altify.fun?"
          answer="Altify.fun is a platform that allows you to create and manage your own tokens on various blockchain networks with ease."
        />
        <FAQItem
          question="How much does it cost to create a token?"
          answer="The cost varies depending on network conditions and token features. Basic token creation starts at 0.01 SOL plus network fees."
        />
        <FAQItem
          question="What are Safe Coins?"
          answer="Safe Coins are tokens that have passed our security audits and meet our strict safety criteria for investors."
        />
        <FAQItem
          question="What are Degen Coins?"
          answer="Degen Coins are high-risk, high-reward tokens. Always do your own research and invest responsibly."
        />
      </div>
    </div>
  );
}
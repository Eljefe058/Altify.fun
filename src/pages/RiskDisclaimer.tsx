import React from 'react';

export default function RiskDisclaimer() {
  return (
    <div className="prose prose-invert max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Risk Disclaimer</h1>

      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-red-400 mb-4">High-Risk Warning</h2>
        <p className="text-gray-300">
          Cryptocurrency tokens, especially newly created ones, are extremely high-risk investments. You could lose all of your invested capital. Always conduct thorough research before investing.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Investment Risks</h2>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Tokens may experience extreme price volatility</li>
          <li>Liquidity may be limited or non-existent</li>
          <li>Projects may fail or be abandoned</li>
          <li>Smart contract vulnerabilities may lead to losses</li>
          <li>Market manipulation and scams are common</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. User Responsibility</h2>
        <p className="text-gray-300 mb-4">
          By using Altify.fun, you acknowledge and accept:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Full responsibility for your trading and investment decisions</li>
          <li>The need to conduct your own research (DYOR)</li>
          <li>That past performance does not guarantee future results</li>
          <li>The importance of only investing what you can afford to lose</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Security Risks</h2>
        <p className="text-gray-300 mb-4">
          Be aware of the following security considerations:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Keep your private keys and passwords secure</li>
          <li>Verify all transaction details before confirming</li>
          <li>Be cautious of phishing attempts and scams</li>
          <li>Use hardware wallets for significant amounts</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. No Financial Advice</h2>
        <p className="text-gray-300 mb-4">
          Nothing on Altify.fun constitutes financial, legal, or investment advice. We do not make any recommendations about which tokens to create, buy, or sell. Always consult with qualified professionals before making investment decisions.
        </p>
      </section>
    </div>
  );
}
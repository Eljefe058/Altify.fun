import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="prose prose-invert max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Data Collection</h2>
        <p className="text-gray-300 mb-4">
          We collect the following information:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Wallet addresses (when connected to the platform)</li>
          <li>Contact form submissions (name, email, message)</li>
          <li>Token creation and transaction data (publicly available on-chain)</li>
          <li>Basic analytics data (page views, interaction patterns)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Data Usage</h2>
        <p className="text-gray-300 mb-4">
          We use collected data for:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Providing and improving our services</li>
          <li>Responding to user inquiries and support requests</li>
          <li>Platform analytics and performance optimization</li>
          <li>Legal compliance and security purposes</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Data Storage</h2>
        <p className="text-gray-300 mb-4">
          All user data is stored securely using industry-standard encryption. We do not store private keys or sensitive wallet information. Contact form data is retained only as long as necessary for communication purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
        <p className="text-gray-300 mb-4">
          We may use third-party services for:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Analytics and usage tracking</li>
          <li>Email communication</li>
          <li>Blockchain data indexing</li>
        </ul>
        <p className="text-gray-300 mb-4">
          These services may collect additional data according to their own privacy policies.
        </p>
      </section>
    </div>
  );
}
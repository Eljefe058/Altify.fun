import React from 'react';

export default function TermsOfService() {
  return (
    <div className="prose prose-invert max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Non-Custodial Service</h2>
        <p className="text-gray-300 mb-4">
          Altify.fun is a non-custodial platform that provides token creation tools. We do not hold, control, or have access to any user funds or tokens. Users maintain full control and responsibility for their assets at all times.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Legal Compliance</h2>
        <p className="text-gray-300 mb-4">
          Users must comply with all applicable laws and regulations in their jurisdiction. It is the user's responsibility to ensure their use of Altify.fun complies with local laws regarding cryptocurrency creation and trading.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. No Warranties</h2>
        <p className="text-gray-300 mb-4">
          The platform is provided "as is" without any warranties, express or implied. We do not guarantee uninterrupted service, security, or accuracy of information provided through the platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Limited Liability</h2>
        <p className="text-gray-300 mb-4">
          Altify.fun and its team shall not be liable for any damages, losses, or claims arising from:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Use or inability to use the platform</li>
          <li>Token creation or trading activities</li>
          <li>Unauthorized access to user accounts</li>
          <li>Technical failures or interruptions</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Indemnification</h2>
        <p className="text-gray-300 mb-4">
          Users agree to indemnify and hold harmless Altify.fun, its employees, and affiliates from any claims, damages, or expenses arising from their use of the platform or violation of these terms.
        </p>
      </section>
    </div>
  );
}
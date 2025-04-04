import React from 'react';

export default function ContactForm() {
  return (
    <div className="bg-[#2a2a2a] rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white resize-none"
            placeholder="How can we help you?"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-[#7a5cff] hover:bg-[#6a4cef] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
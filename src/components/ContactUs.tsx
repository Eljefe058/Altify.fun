import React from 'react';
import { Mail } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="bg-[#2a2a2a] rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
      <div className="flex items-center gap-3 text-gray-300">
        <Mail className="w-5 h-5" />
        <a href="mailto:support@altify.fun" className="hover:text-white transition-colors">
          support@altify.fun
        </a>
      </div>
    </div>
  );
}
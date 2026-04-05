import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="h-16 border-b border-neutral-800 flex items-center px-8">
        <h2 className="text-xl font-semibold text-white">Paramètres</h2>
      </header>
      <div className="p-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-2xl">
          <div className="flex items-center mb-6">
            <SettingsIcon className="text-purple-500 mr-3" size={24} />
            <h3 className="text-lg font-medium text-white">Configuration des canaux</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-black border border-neutral-800 rounded-lg">
              <div>
                <h4 className="text-white font-medium">LinkedIn</h4>
                <p className="text-sm text-gray-400">Connectez votre compte LinkedIn</p>
              </div>
              <button className="px-4 py-2 bg-neutral-800 text-white rounded-md text-sm hover:bg-neutral-700 transition-colors">
                Connecter
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black border border-neutral-800 rounded-lg">
              <div>
                <h4 className="text-white font-medium">WhatsApp</h4>
                <p className="text-sm text-gray-400">Connectez via WhatsApp Business API</p>
              </div>
              <button className="px-4 py-2 bg-neutral-800 text-white rounded-md text-sm hover:bg-neutral-700 transition-colors">
                Connecter
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black border border-neutral-800 rounded-lg">
              <div>
                <h4 className="text-white font-medium">SMS</h4>
                <p className="text-sm text-gray-400">Connectez via Twilio ou équivalent</p>
              </div>
              <button className="px-4 py-2 bg-neutral-800 text-white rounded-md text-sm hover:bg-neutral-700 transition-colors">
                Connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

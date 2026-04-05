import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Shield, Smartphone, Bell, Camera, User as UserIcon } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';
  const userName = user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      <header className="h-16 border-b border-neutral-800 flex items-center px-8 shrink-0 bg-neutral-950/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-xl font-semibold text-white">Profil</h2>
      </header>
      
      <div className="max-w-5xl w-full mx-auto p-6 lg:p-8">
        {/* Banner & Avatar */}
        <div className="relative mb-20">
          <div className="h-40 bg-gradient-to-r from-purple-900/40 via-purple-800/20 to-black rounded-2xl border border-neutral-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-neutral-900 border-4 border-black flex items-center justify-center text-4xl text-purple-500 font-bold shadow-xl">
                {userInitial}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-neutral-800 rounded-full text-white hover:bg-purple-600 transition-colors border-4 border-black group-hover:scale-105">
                <Camera size={16} />
              </button>
            </div>
            <div className="mb-3">
              <h1 className="text-2xl font-bold text-white capitalize">{userName}</h1>
              <p className="text-purple-400 font-medium text-sm">Administrateur</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <UserIcon className="text-purple-500" size={20} />
                <h3 className="text-lg font-medium text-white">Informations personnelles</h3>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Prénom</label>
                    <input 
                      type="text" 
                      defaultValue={userName} 
                      className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all capitalize" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Nom</label>
                    <input 
                      type="text" 
                      placeholder="Votre nom" 
                      className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Adresse e-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 text-gray-500" size={18} />
                    <input 
                      type="email" 
                      disabled 
                      value={user?.email || ''} 
                      className="w-full bg-black/50 border border-neutral-800 rounded-lg pl-11 pr-4 py-2.5 text-gray-500 cursor-not-allowed" 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">L'adresse e-mail ne peut pas être modifiée ici.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Numéro de téléphone</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-3 text-gray-500" size={18} />
                    <input 
                      type="tel" 
                      placeholder="+33 6 00 00 00 00" 
                      className="w-full bg-black border border-neutral-800 rounded-lg pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-900/20">
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Security & Notifications */}
          <div className="space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <Shield className="text-purple-500" size={20} />
                <h3 className="text-lg font-medium text-white">Sécurité</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-gray-400 mb-2.5">Mot de passe</p>
                  <button className="w-full bg-black border border-neutral-700 hover:border-neutral-500 text-white px-4 py-2.5 rounded-lg text-sm transition-colors flex justify-center">
                    Changer le mot de passe
                  </button>
                </div>
                <div className="pt-5 border-t border-neutral-800/50">
                  <p className="text-sm text-gray-400 mb-1.5">ID Utilisateur (Interne)</p>
                  <div className="bg-black border border-neutral-800 rounded-lg p-3">
                    <p className="text-xs font-mono text-gray-500 break-all select-all">{user?.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <Bell className="text-purple-500" size={20} />
                <h3 className="text-lg font-medium text-white">Notifications</h3>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-sm font-medium text-gray-200 block">E-mails de résumé</span>
                    <span className="text-xs text-gray-500">Recevoir un récapitulatif quotidien</span>
                  </div>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5.5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-purple-600"></div>
                  </div>
                </label>
                
                <div className="h-px bg-neutral-800/50 w-full"></div>
                
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-sm font-medium text-gray-200 block">Notifications Push</span>
                    <span className="text-xs text-gray-500">Nouveaux messages entrants</span>
                  </div>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5.5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-purple-600"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

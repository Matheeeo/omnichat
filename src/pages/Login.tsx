import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Si la confirmation d'email est désactivée dans Supabase, l'utilisateur sera connecté automatiquement.
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-purple-500">
          <MessageSquare size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          OmniChat
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Centralisez LinkedIn, WhatsApp et SMS
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-neutral-800">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Adresse e-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-black text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-black text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-black disabled:opacity-50 transition-colors"
              >
                {loading ? 'Chargement...' : (isSignUp ? "S'inscrire" : 'Se connecter')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-900 text-gray-400">
                  Ou
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full flex justify-center py-2 px-4 border border-neutral-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-transparent hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-black transition-colors"
              >
                {isSignUp ? 'Déjà un compte ? Se connecter' : "Créer un compte"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

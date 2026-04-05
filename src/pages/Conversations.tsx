import React, { useState } from 'react';
import { MessageSquare, Linkedin, Phone, Send, User } from 'lucide-react';
import clsx from 'clsx';

type Platform = 'linkedin' | 'whatsapp' | 'sms';

interface Conversation {
  id: string;
  name: string;
  platform: Platform;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Jean Dupont', platform: 'linkedin', lastMessage: 'Super, on se voit demain !', time: '10:30', unread: 2 },
  { id: '2', name: 'Marie Martin', platform: 'whatsapp', lastMessage: 'Tu as reçu le dossier ?', time: 'Hier', unread: 0 },
  { id: '3', name: '+33 6 12 34 56 78', platform: 'sms', lastMessage: 'Merci pour votre retour.', time: 'Mar', unread: 0 },
  { id: '4', name: 'Lucie Bernard', platform: 'linkedin', lastMessage: 'Je regarde ça tout de suite.', time: 'Lun', unread: 0 },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', text: 'Bonjour Jean, es-tu dispo pour un call ?', sender: 'me', time: '10:00' },
    { id: 'm2', text: 'Oui, vers 14h ça te va ?', sender: 'them', time: '10:15' },
    { id: 'm3', text: 'Parfait, je t\'envoie l\'invitation.', sender: 'me', time: '10:20' },
    { id: 'm4', text: 'Super, on se voit demain !', sender: 'them', time: '10:30' },
  ],
  '2': [
    { id: 'm5', text: 'Salut Marie, le dossier est prêt.', sender: 'me', time: 'Hier 15:00' },
    { id: 'm6', text: 'Tu as reçu le dossier ?', sender: 'them', time: 'Hier 18:30' },
  ],
  '3': [
    { id: 'm7', text: 'Votre rendez-vous est confirmé pour jeudi.', sender: 'me', time: 'Mar 09:00' },
    { id: 'm8', text: 'Merci pour votre retour.', sender: 'them', time: 'Mar 09:15' },
  ],
};

const PlatformIcon = ({ platform, size = 16 }: { platform: Platform; size?: number }) => {
  switch (platform) {
    case 'linkedin': return <Linkedin size={size} className="text-blue-500" />;
    case 'whatsapp': return <Phone size={size} className="text-green-500" />;
    case 'sms': return <MessageSquare size={size} className="text-purple-500" />;
  }
};

export default function Conversations() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const selectedConv = MOCK_CONVERSATIONS.find(c => c.id === selectedId);
  const messages = selectedId ? MOCK_MESSAGES[selectedId] || [] : [];

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Liste des conversations */}
      <div className="w-80 border-r border-neutral-800 flex flex-col bg-neutral-950">
        <header className="h-16 border-b border-neutral-800 flex items-center px-6 shrink-0">
          <h2 className="text-lg font-semibold text-white">Boîte de réception</h2>
        </header>
        
        <div className="flex-1 overflow-y-auto">
          {MOCK_CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={clsx(
                'w-full text-left p-4 border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors flex items-start gap-3',
                selectedId === conv.id ? 'bg-neutral-900' : ''
              )}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400">
                  <User size={20} />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-neutral-950 rounded-full p-0.5">
                  <PlatformIcon platform={conv.platform} size={14} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-medium text-white truncate">{conv.name}</h3>
                  <span className="text-xs text-gray-500 shrink-0 ml-2">{conv.time}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
              </div>
              
              {conv.unread > 0 && (
                <div className="shrink-0 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white mt-1">
                  {conv.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col bg-black">
        {selectedConv ? (
          <>
            {/* En-tête du chat */}
            <header className="h-16 border-b border-neutral-800 flex items-center px-6 shrink-0 bg-neutral-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-base font-medium text-white flex items-center gap-2">
                    {selectedConv.name}
                    <PlatformIcon platform={selectedConv.platform} size={16} />
                  </h2>
                  <p className="text-xs text-gray-500 capitalize">Via {selectedConv.platform}</p>
                </div>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    'flex max-w-[75%]',
                    msg.sender === 'me' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                  )}
                >
                  <div
                    className={clsx(
                      'px-4 py-2 rounded-2xl',
                      msg.sender === 'me' 
                        ? 'bg-purple-600 text-white rounded-br-sm' 
                        : 'bg-neutral-800 text-gray-100 rounded-bl-sm'
                    )}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className={clsx(
                      'text-[10px] mt-1 block',
                      msg.sender === 'me' ? 'text-purple-200 text-right' : 'text-gray-400'
                    )}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Répondre via ${selectedConv.platform}...`}
                  className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500 py-1"
                />
                <button className="p-2 text-purple-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-full transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
            <div className="flex space-x-4 mb-6">
              <div className="p-4 bg-neutral-900 rounded-full text-blue-500"><Linkedin size={24} /></div>
              <div className="p-4 bg-neutral-900 rounded-full text-green-500"><Phone size={24} /></div>
              <div className="p-4 bg-neutral-900 rounded-full text-purple-500"><MessageSquare size={24} /></div>
            </div>
            <MessageSquare size={48} className="mb-4 text-neutral-700" />
            <p>Sélectionnez une conversation pour commencer.</p>
            <p className="text-sm mt-2 text-neutral-600">LinkedIn, WhatsApp et SMS centralisés.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Linkedin, Phone, MessageSquare, User, Clock, Sparkles, Calendar, ArrowRight, Check, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

type Platform = 'linkedin' | 'whatsapp' | 'sms';
type ActionType = 'reply' | 'follow_up' | 'send_deliverable' | 'schedule' | 'waiting';
type Status = 'overdue' | 'today' | 'waiting' | 'upcoming' | 'done';

interface ActionItem {
  id: string;
  type: ActionType;
  contact: string;
  platform: Platform;
  snippet: string;
  time: string;
  status: Status;
}

const MOCK_ACTIONS: ActionItem[] = [
  { id: '1', type: 'send_deliverable', contact: 'Marc Leroy', platform: 'whatsapp', snippet: "Peux-tu m'envoyer le deck ?", time: 'Hier, 18:00', status: 'overdue' },
  { id: '2', type: 'reply', contact: 'Sophie Martin', platform: 'linkedin', snippet: "Quelles sont vos dispos ?", time: "Aujourd'hui, 14:00", status: 'today' },
  { id: '3', type: 'follow_up', contact: '+33 6 12 34 56 78', platform: 'sms', snippet: "Je vous confirme ça vite.", time: "Aujourd'hui, 16:30", status: 'today' },
  { id: '4', type: 'waiting', contact: 'Client Alpha', platform: 'whatsapp', snippet: "(Vous) Voici la proposition", time: "Jusqu'au 12 Oct.", status: 'waiting' },
];

const PlatformIcon = ({ platform, size = 14 }: { platform: Platform; size?: number }) => {
  switch (platform) {
    case 'linkedin': return <Linkedin size={size} className="text-blue-500" />;
    case 'whatsapp': return <Phone size={size} className="text-green-500" />;
    case 'sms': return <MessageSquare size={size} className="text-purple-500" />;
  }
};

const ActionBadge = ({ type }: { type: ActionType }) => {
  switch (type) {
    case 'reply':
      return <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">Répondre plus tard</span>;
    case 'follow_up':
      return <span className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20">Relancer</span>;
    case 'send_deliverable':
      return <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">Envoyer livrable</span>;
    case 'schedule':
      return <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">Planifier</span>;
    case 'waiting':
      return <span className="px-2.5 py-1 rounded-md bg-neutral-500/10 text-neutral-400 text-xs font-medium border border-neutral-500/20">Attente retour</span>;
  }
};

export default function Actions() {
  const [actions, setActions] = useState(MOCK_ACTIONS);

  const toggleDone = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const renderGroup = (title: string, status: Status, count: number, colorClass: string) => {
    const groupActions = actions.filter(a => a.status === status);
    if (groupActions.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 px-2">
          <h3 className={clsx("text-xs font-bold uppercase tracking-wider", colorClass)}>
            ▼ {title} ({count})
          </h3>
          <div className="flex-1 h-px bg-neutral-800/50"></div>
        </div>
        
        <div className="space-y-2">
          {groupActions.map(action => (
            <div key={action.id} className="group flex items-center gap-4 p-4 bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/50 hover:border-neutral-700 rounded-xl transition-all">
              
              {/* Checkbox */}
              <button 
                onClick={() => toggleDone(action.id)}
                className={clsx(
                  "shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                  action.status === 'waiting' 
                    ? "border-neutral-700 bg-neutral-800/50 text-neutral-600 cursor-not-allowed" 
                    : "border-neutral-600 hover:border-purple-500 hover:bg-purple-500/10 text-transparent hover:text-purple-500"
                )}
                disabled={action.status === 'waiting'}
              >
                {action.status === 'waiting' ? <MoreHorizontal size={12} /> : <Check size={14} className="opacity-0 group-hover:opacity-100" />}
              </button>

              {/* Avatar & Platform */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400 border border-neutral-700">
                  <User size={18} />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-neutral-950 rounded-full p-0.5 border border-neutral-800">
                  <PlatformIcon platform={action.platform} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-3 truncate">
                  <p className="text-sm font-medium text-white truncate">{action.contact}</p>
                  <div className="mt-1">
                    <ActionBadge type={action.type} />
                  </div>
                </div>
                
                <div className="md:col-span-6 truncate">
                  <p className="text-sm text-gray-400 truncate">"{action.snippet}"</p>
                </div>

                <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-4">
                  <span className={clsx(
                    "text-xs font-medium whitespace-nowrap",
                    action.status === 'overdue' ? 'text-red-400' : 'text-gray-500'
                  )}>
                    {action.time}
                  </span>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {action.type === 'reply' && (
                      <button className="p-1.5 text-purple-400 hover:bg-purple-500/20 rounded-md transition-colors tooltip-trigger" title="Brouillon IA">
                        <Sparkles size={16} />
                      </button>
                    )}
                    {action.status !== 'waiting' && (
                      <button className="p-1.5 text-gray-400 hover:bg-neutral-700 hover:text-white rounded-md transition-colors" title="Repousser">
                        <Clock size={16} />
                      </button>
                    )}
                    <button className="p-1.5 text-gray-400 hover:bg-neutral-700 hover:text-white rounded-md transition-colors flex items-center gap-1" title="Ouvrir la conversation">
                      <span className="text-xs font-medium hidden xl:inline-block pr-1">Ouvrir</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-black">
      <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-8 shrink-0 bg-neutral-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">Actions</h2>
          <span className="bg-neutral-800 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">
            {actions.length} en cours
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <Calendar size={16} />
            Vue Calendrier
          </button>
        </div>
      </header>
      
      <div className="max-w-6xl w-full mx-auto p-6 lg:p-8">
        {renderGroup('En retard', 'overdue', actions.filter(a => a.status === 'overdue').length, 'text-red-500')}
        {renderGroup("Aujourd'hui", 'today', actions.filter(a => a.status === 'today').length, 'text-purple-500')}
        {renderGroup("En attente de l'autre", 'waiting', actions.filter(a => a.status === 'waiting').length, 'text-gray-500')}
        
        {actions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4 border border-neutral-800">
              <Check className="text-purple-500" size={32} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Inbox Zero !</h3>
            <p className="text-gray-500 max-w-sm">Vous avez traité toutes vos actions en cours. Profitez de ce moment de calme.</p>
          </div>
        )}
      </div>
    </div>
  );
}

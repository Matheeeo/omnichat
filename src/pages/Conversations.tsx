'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  MessageSquare, Link2, Phone, Send, Mail, ArrowLeft,
  Search, X, Archive, ArchiveRestore, Brain,
} from 'lucide-react'
import clsx from 'clsx'

type ChannelType = 'outlook' | 'whatsapp' | 'sms' | 'linkedin' | 'internal'
type Priority = 'low' | 'normal' | 'high' | 'urgent'

type RawConv = {
  id: string
  status: string
  priority: Priority
  is_read: boolean
  ai_summary: string | null
  last_message_at: string | null
  subject: string | null
  contacts: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null
  channel_connections: { channel: ChannelType; label: string } | { channel: ChannelType; label: string }[] | null
}

type Conversation = {
  id: string
  status: string
  priority: Priority
  is_read: boolean
  ai_summary: string | null
  last_message_at: string | null
  subject: string | null
  contact: { full_name: string | null; email: string | null } | null
  channel: ChannelType | null
}

type Message = {
  id: string
  body: string | null
  direction: 'inbound' | 'outbound'
  sent_at: string | null
}

type Toast = { id: number; text: string }

const CHANNEL_LABELS: Record<ChannelType, string> = {
  outlook: 'Email', whatsapp: 'WhatsApp', sms: 'SMS', linkedin: 'LinkedIn', internal: 'Interne',
}

const CHANNEL_FILTERS = ['Email', 'WhatsApp', 'SMS', 'LinkedIn'] as const
type ChannelFilter = typeof CHANNEL_FILTERS[number]

const CHANNEL_TO_DB: Record<ChannelFilter, ChannelType> = {
  Email: 'outlook', WhatsApp: 'whatsapp', SMS: 'sms', LinkedIn: 'linkedin',
}

function normalize(raw: RawConv): Conversation {
  const contact = Array.isArray(raw.contacts) ? (raw.contacts[0] ?? null) : raw.contacts
  const cc = Array.isArray(raw.channel_connections) ? (raw.channel_connections[0] ?? null) : raw.channel_connections
  return {
    id: raw.id, status: raw.status, priority: raw.priority, is_read: raw.is_read,
    ai_summary: raw.ai_summary, last_message_at: raw.last_message_at, subject: raw.subject,
    contact, channel: cc?.channel ?? null,
  }
}

function ChannelIcon({ channel, size = 16 }: { channel: ChannelType; size?: number }) {
  switch (channel) {
    case 'linkedin': return <Link2 size={size} className="text-blue-500" />
    case 'whatsapp': return <Phone size={size} className="text-green-500" />
    case 'sms': return <MessageSquare size={size} className="text-purple-400" />
    case 'outlook': return <Mail size={size} className="text-sky-400" />
    default: return <MessageSquare size={size} className="text-gray-400" />
  }
}

function priorityDot(p: Priority) {
  if (p === 'urgent') return 'bg-red-500'
  if (p === 'high') return 'bg-orange-400'
  if (p === 'normal') return 'bg-amber-400'
  return 'bg-gray-600'
}

function priorityBadge(p: Priority): string | null {
  if (p === 'urgent') return 'Urgent'
  if (p === 'high') return 'Haute'
  return null
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'maintenant'
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}j`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function formatDateLabel(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (d.toDateString() === yesterday.toDateString()) return 'Hier'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
}

function groupByDate(msgs: Message[]): [string, Message[]][] {
  const map: Record<string, Message[]> = {}
  for (const m of msgs) {
    const key = formatDateLabel(m.sent_at)
    if (!map[key]) map[key] = []
    map[key].push(m)
  }
  return Object.entries(map)
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [tab, setTab] = useState<'inbox' | 'archived'>('inbox')
  const [channelFilter, setChannelFilter] = useState<ChannelFilter | null>(null)
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [thread, setThread] = useState<Message[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [archiving, setArchiving] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)
  const toastCounter = useRef(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchConversations = useCallback(async () => {
    let query = supabase
      .from('conversations')
      .select('id, status, priority, is_read, ai_summary, last_message_at, subject, contacts(full_name, email), channel_connections(channel, label)')
      .order('last_message_at', { ascending: false })

    if (tab === 'archived') {
      query = query.eq('status', 'archived')
    } else {
      query = query.neq('status', 'archived').neq('status', 'spam')
    }

    if (debouncedSearch) {
      query = query.or(`ai_summary.ilike.*${debouncedSearch}*,subject.ilike.*${debouncedSearch}*`)
    }

    const { data, error } = await query
    if (error) { console.error('[fetch]', error); return }

    let normalized = ((data ?? []) as unknown as RawConv[]).map(normalize)

    if (channelFilter) {
      const dbChannel = CHANNEL_TO_DB[channelFilter]
      normalized = normalized.filter(c => c.channel === dbChannel)
    }

    setConversations(normalized)
    setLoading(false)
  }, [tab, channelFilter, debouncedSearch])

  useEffect(() => {
    setLoading(true)
    setConversations([])
    fetchConversations()
    clearInterval(pollRef.current)
    pollRef.current = setInterval(fetchConversations, 10000)
    return () => clearInterval(pollRef.current)
  }, [fetchConversations])

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [thread])

  const showToast = (text: string) => {
    const id = ++toastCounter.current
    setToasts(prev => [...prev, { id, text }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const openConversation = async (conv: Conversation) => {
    setSelected(conv)
    setThread([])
    setThreadLoading(true)
    setSendError('')
    if (!conv.is_read) {
      supabase.from('conversations').update({ is_read: true }).eq('id', conv.id).then()
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, is_read: true } : c))
    }
    const { data } = await supabase
      .from('messages').select('id, body, direction, sent_at')
      .eq('conversation_id', conv.id).order('sent_at', { ascending: true })
    setThread((data as Message[]) ?? [])
    setThreadLoading(false)
  }

  const handleArchiveToggle = async (conv: Conversation) => {
    const isArchiving = tab === 'inbox'
    setArchiving(true)
    setConversations(prev => prev.filter(c => c.id !== conv.id))
    setSelected(null)
    const { error } = await supabase
      .from('conversations').update({ status: isArchiving ? 'archived' : 'open' }).eq('id', conv.id)
    if (error) { showToast('Erreur — réessaie') }
    else {
      showToast(isArchiving ? 'Conversation archivée' : 'Conversation restaurée')
      if (!isArchiving) setTab('inbox')
    }
    setArchiving(false)
  }

  const sendReply = async () => {
    if (!selected || !replyText.trim() || sending) return
    if (selected.channel !== 'outlook') {
      setSendError(`Réponse via ${CHANNEL_LABELS[selected.channel ?? 'internal']} non disponible pour l'instant`)
      return
    }
    setSending(true)
    setSendError('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selected.id,
          message: replyText,
          subject: selected.subject || selected.ai_summary || undefined,
        }),
      })
      const data = await res.json() as { success?: boolean; message_id?: string; error?: string }
      if (res.ok && data.success) {
        setThread(prev => [...prev, {
          id: data.message_id || `local-${Date.now()}`,
          body: replyText, direction: 'outbound', sent_at: new Date().toISOString(),
        }])
        setReplyText('')
        showToast('Message envoyé ✓')
      } else {
        setSendError(data.error || 'Envoi échoué')
      }
    } catch { setSendError('Erreur réseau') }
    finally { setSending(false) }
  }

  const switchTab = (t: 'inbox' | 'archived') => {
    setTab(t); setSearch(''); setChannelFilter(null); setSelected(null)
  }

  const unreadCount = conversations.filter(c => !c.is_read).length

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white shadow-xl">
            {t.text}
          </div>
        ))}
      </div>

      {/* ── Liste ── */}
      <div className={clsx(
        'shrink-0 border-r border-neutral-800 flex flex-col bg-neutral-950 w-full md:w-96',
        selected ? 'hidden md:flex' : 'flex'
      )}>
        <div className="px-4 pt-4 pb-2 border-b border-neutral-800 space-y-2.5">
          {/* Onglets */}
          <div className="flex items-center gap-2">
            {(['inbox', 'archived'] as const).map(t => (
              <button key={t} onClick={() => switchTab(t)}
                className={clsx('relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  tab === t ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white')}
              >
                {t === 'inbox' ? 'Boîte de réception' : 'Archives'}
                {t === 'inbox' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-[10px] flex items-center justify-center font-bold border-2 border-neutral-950">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          {/* Recherche */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-8 pr-8 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          {/* Filtres canal */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {CHANNEL_FILTERS.map(f => (
              <button key={f} onClick={() => setChannelFilter(prev => prev === f ? null : f)}
                className={clsx('px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 border transition-colors',
                  channelFilter === f
                    ? 'bg-purple-600/20 text-purple-400 border-purple-600/40'
                    : 'text-gray-500 border-neutral-800 hover:text-gray-300')}
              >{f}</button>
            ))}
          </div>
        </div>

        {/* Liste conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center pt-12">
              <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center pt-16 text-gray-500 text-sm px-4">
              <MessageSquare size={32} className="mx-auto mb-3 text-neutral-700" />
              <p>{search ? 'Aucun résultat' : channelFilter ? `Aucun message ${channelFilter}` : tab === 'archived' ? 'Aucune archive' : 'Boîte vide'}</p>
            </div>
          ) : (
            conversations.map(conv => {
              const name = conv.contact?.full_name || conv.contact?.email || 'Inconnu'
              const badge = priorityBadge(conv.priority)
              return (
                <button key={conv.id} onClick={() => openConversation(conv)}
                  className={clsx(
                    'w-full text-left border-b border-neutral-800/50 hover:bg-neutral-900/70 transition-colors',
                    selected?.id === conv.id ? 'bg-neutral-900' : ''
                  )}
                >
                  <div className="px-4 py-3.5 flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-gray-300 font-semibold text-sm">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      {!conv.is_read && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-neutral-950" />
                      )}
                      {conv.channel && (
                        <div className="absolute -bottom-1 -right-1 bg-neutral-950 rounded-full p-0.5">
                          <ChannelIcon channel={conv.channel} size={12} />
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      {/* Ligne nom + temps */}
                      <div className="flex justify-between items-start mb-1">
                        <span className={clsx('text-sm truncate flex-1 pr-2', conv.is_read ? 'text-gray-300 font-normal' : 'text-white font-semibold')}>
                          {name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {badge && (
                            <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded',
                              conv.priority === 'urgent' ? 'bg-red-500/15 text-red-400' : 'bg-orange-400/15 text-orange-400'
                            )}>{badge}</span>
                          )}
                          <span className="text-[11px] text-gray-500">{timeAgo(conv.last_message_at)}</span>
                          <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', priorityDot(conv.priority))} />
                        </div>
                      </div>

                      {/* Sujet */}
                      {conv.subject && (
                        <p className="text-xs text-gray-400 truncate mb-1.5">{conv.subject}</p>
                      )}

                      {/* Résumé IA — visible directement dans la carte */}
                      {conv.ai_summary && (
                        <div className="flex items-start gap-1.5">
                          <Brain size={11} className="text-purple-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{conv.ai_summary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Panneau chat ── */}
      <div className={clsx('flex-1 flex flex-col bg-black overflow-hidden', selected ? 'flex' : 'hidden md:flex')}>
        {selected ? (
          <>
            {/* Header chat */}
            <div className="h-16 border-b border-neutral-800 flex items-center px-4 md:px-6 shrink-0 bg-neutral-950/50">
              <button onClick={() => setSelected(null)} className="md:hidden mr-2 text-gray-400 hover:text-white p-1 -ml-1 shrink-0">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-gray-300 font-semibold text-sm shrink-0">
                  {(selected.contact?.full_name || selected.contact?.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium text-white truncate">
                      {selected.contact?.full_name || selected.contact?.email || 'Inconnu'}
                    </h2>
                    {selected.channel && <ChannelIcon channel={selected.channel} size={15} />}
                  </div>
                  <p className="text-xs text-gray-500">
                    {selected.contact?.email || ''}{selected.channel ? ` · ${CHANNEL_LABELS[selected.channel]}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleArchiveToggle(selected)} disabled={archiving}
                  className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg border border-neutral-700 text-xs text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-40">
                  {archiving
                    ? <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                    : tab === 'archived' ? <ArchiveRestore size={13} /> : <Archive size={13} />
                  }
                  <span className="hidden sm:inline">{tab === 'archived' ? 'Restaurer' : 'Archiver'}</span>
                </button>
                <button onClick={() => setSelected(null)} className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg border border-neutral-700 text-gray-400 hover:text-white hover:bg-neutral-800 text-lg">
                  ×
                </button>
              </div>
            </div>

            {/* Résumé IA en haut de la conversation */}
            {selected.ai_summary && (
              <div className="mx-4 mt-3 mb-1 px-3 py-2.5 rounded-xl bg-purple-600/10 border border-purple-600/20 shrink-0 flex items-start gap-2">
                <Brain size={14} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-0.5">Résumé IA</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{selected.ai_summary}</p>
                </div>
              </div>
            )}

            {/* Thread */}
            <div ref={threadRef} className="flex-1 overflow-y-auto p-4 space-y-1">
              {threadLoading ? (
                <div className="flex justify-center pt-12">
                  <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : thread.length === 0 ? (
                <div className="text-center pt-16 text-gray-600 text-sm">Aucun message</div>
              ) : (
                groupByDate(thread).map(([date, msgs]) => (
                  <div key={date}>
                    <div className="text-center my-3 text-[11px] text-gray-600">{date}</div>
                    <div className="flex flex-col gap-1.5">
                      {msgs.map(m => (
                        <div key={m.id} className={clsx('flex max-w-[78%]', m.direction === 'outbound' ? 'ml-auto justify-end' : 'mr-auto justify-start')}>
                          <div className={clsx('px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                            m.direction === 'outbound' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-neutral-800 text-gray-100 rounded-bl-sm')}>
                            {m.body}
                            <div className={clsx('text-[10px] mt-1 text-right', m.direction === 'outbound' ? 'text-purple-200' : 'text-gray-500')}>
                              {m.sent_at ? new Date(m.sent_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Zone de réponse */}
            {tab === 'inbox' && (
              <div className="p-4 border-t border-neutral-800 bg-neutral-950 shrink-0">
                {sendError && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                    {sendError}
                  </div>
                )}
                <div className={clsx('flex items-center gap-2 bg-neutral-900 border rounded-full px-4 py-2 transition-colors',
                  selected.channel === 'outlook' ? 'border-neutral-700 focus-within:border-purple-500' : 'border-neutral-800/50')}>
                  <input type="text" value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendReply() } }}
                    placeholder={selected.channel === 'outlook' ? 'Répondre par email...' : `${CHANNEL_LABELS[selected.channel ?? 'internal']} — bientôt disponible`}
                    disabled={selected.channel !== 'outlook'}
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none disabled:cursor-not-allowed py-1"
                  />
                  <button onClick={() => { void sendReply() }}
                    disabled={!replyText.trim() || sending || selected.channel !== 'outlook'}
                    className={clsx('p-2 rounded-full transition-colors shrink-0',
                      replyText.trim() && !sending && selected.channel === 'outlook'
                        ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                        : 'text-gray-600 cursor-not-allowed')}>
                    {sending
                      ? <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                      : <Send size={17} />
                    }
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <div className="flex gap-4 mb-6">
              <div className="p-4 bg-neutral-900 rounded-full text-blue-500"><Link2 size={22} /></div>
              <div className="p-4 bg-neutral-900 rounded-full text-green-500"><Phone size={22} /></div>
              <div className="p-4 bg-neutral-900 rounded-full text-purple-400"><MessageSquare size={22} /></div>
              <div className="p-4 bg-neutral-900 rounded-full text-sky-400"><Mail size={22} /></div>
            </div>
            <p className="text-sm">Sélectionnez une conversation pour commencer.</p>
            <p className="text-xs mt-1 text-neutral-700">LinkedIn · WhatsApp · SMS · Email — centralisés.</p>
          </div>
        )}
      </div>
    </div>
  )
}

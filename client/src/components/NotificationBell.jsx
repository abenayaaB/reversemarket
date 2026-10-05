import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, CheckCheck, Clock3, Sparkles, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  getNotifications,
  getReadNotificationIds,
  relativeNotificationTime,
  saveReadNotificationIds,
} from '../services/notificationService'

export default function NotificationBell({ compact = false, collapsed = false, navigateOnClick = false }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [read, setRead] = useState(getReadNotificationIds)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    try {
      const next = await getNotifications(profile.id, profile.role)
      setNotifications(next.slice(0, 12))
    } catch (error) {
      console.error('Notification load failed:', error.message)
    } finally {
      setLoading(false)
    }
  }, [profile?.id, profile?.role])

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 60000)
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [load])

  const unread = useMemo(
    () => notifications.filter((item) => !read.includes(item.id)).length,
    [notifications, read]
  )

  const markAllRead = () => {
    const next = Array.from(new Set([...read, ...notifications.map((item) => item.id)]))
    setRead(next)
    saveReadNotificationIds(next)
  }

  const markRead = (id) => {
    const next = Array.from(new Set([...read, id]))
    setRead(next)
    saveReadNotificationIds(next)
  }

  const handleBellClick = () => {
    if (navigateOnClick) {
      navigate(profile?.role === 'provider' ? '/provider/notifications' : '/customer/notifications')
      return
    }
    setOpen((value) => !value)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleBellClick}
        className={`relative flex items-center gap-3 rounded-xl text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 ${compact ? 'grid h-10 w-10 place-items-center' : collapsed ? 'w-full justify-center px-3 py-3' : 'w-full px-3 py-3'}`}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {!collapsed && !compact && <span>Notifications</span>}
        {unread > 0 && (
          <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-fuchsia-500 px-1 text-[9px] font-bold text-white ring-2 ring-slate-50">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && !navigateOnClick && (
        <>
          <button className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-label="Close notifications" />
          <div className={`absolute z-50 mt-2 w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 ${compact ? 'right-0' : 'left-0'}`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="font-bold text-slate-900">Notifications</p>
                <p className="text-xs text-slate-400">Live marketplace updates</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={markAllRead} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600" title="Mark all read">
                  <CheckCheck size={16} />
                </button>
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title="Close">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-400">
                  <Sparkles className="mx-auto mb-2 animate-pulse text-brand-500" size={20} />
                  Checking updates...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="mx-auto text-slate-300" size={24} />
                  <p className="mt-2 text-sm font-semibold text-slate-700">You're all caught up</p>
                  <p className="mt-1 text-xs text-slate-400">New offer activity will appear here.</p>
                </div>
              ) : notifications.map((item) => {
                const isRead = read.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => markRead(item.id)}
                    className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${!isRead ? 'bg-brand-50/40' : ''}`}
                  >
                    <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.tone === 'selected' ? 'bg-emerald-100 text-emerald-600' : item.tone === 'rejected' ? 'bg-red-100 text-red-600' : item.tone === 'shortlisted' ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'}`}>
                      <Bell size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{item.text}</span>
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><Clock3 size={11} /> {relativeNotificationTime(item.time)}</span>
                    </span>
                    {!isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-fuchsia-500" />}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate(profile?.role === 'provider' ? '/provider/notifications' : '/customer/notifications')
              }}
              className="w-full border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-brand-600 transition hover:bg-brand-50"
            >
              View all notifications
            </button>
          </div>
        </>
      )}
    </div>
  )
}

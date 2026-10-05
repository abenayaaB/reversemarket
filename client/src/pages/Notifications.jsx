import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, CheckCheck, Clock3, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import {
  getNotifications,
  getReadNotificationIds,
  relativeNotificationTime,
  saveReadNotificationIds,
} from '../services/notificationService'
import { formatINR } from '../utils/helpers'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'

export default function Notifications() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [read, setRead] = useState(getReadNotificationIds)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (background = false) => {
    if (!profile?.id) return
    background ? setRefreshing(true) : setLoading(true)
    setError('')
    try {
      const data = await getNotifications(profile.id, profile.role)
      setNotifications(data)
    } catch (e) {
      setError(e.message || 'Could not load notifications.')
    } finally {
      background ? setRefreshing(false) : setLoading(false)
    }
  }, [profile?.id, profile?.role])

  useEffect(() => {
    load()
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
    if (read.includes(id)) return
    const next = [...read, id]
    setRead(next)
    saveReadNotificationIds(next)
  }

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600">
            <Bell size={18} />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">Workspace updates</span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Notifications</h1>
          <p className="mt-1 text-slate-500">Live marketplace activity from your requirements and offers.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => load(true)} disabled={refreshing} className="btn-ghost">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          {unread > 0 && (
            <button type="button" onClick={markAllRead} className="btn-primary">
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="card overflow-hidden !p-0">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            text="New offer activity will appear here automatically."
            actionLabel={profile?.role === 'customer' ? 'Post requirement' : 'Browse requirements'}
            actionTo={profile?.role === 'customer' ? '/customer/requirements/new' : '/provider/requirements'}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((item) => {
              const isRead = read.includes(item.id)
              const target = profile?.role === 'customer'
                ? `/customer/requirements/${item.requirementId}`
                : (item.tone === 'selected' || item.tone === 'review' ? '/provider/offers' : `/provider/requirements/${item.requirementId}`)

              return (
                <Link
                  key={item.id}
                  to={target}
                  onClick={() => markRead(item.id)}
                  className={`group flex gap-4 p-5 transition hover:bg-slate-50 ${!isRead ? 'bg-brand-50/45' : ''}`}
                >
                  <span className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${item.tone === 'selected' ? 'bg-emerald-100 text-emerald-600' : item.tone === 'rejected' ? 'bg-red-100 text-red-600' : item.tone === 'shortlisted' ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'}`}>
                    <Bell size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-bold text-slate-900 group-hover:text-brand-700">{item.title}</span>
                      {!isRead && <span className="h-2 w-2 rounded-full bg-fuchsia-500" />}
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">{item.text}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1"><Clock3 size={12} /> {relativeNotificationTime(item.time)}</span>
                      {item.price != null && <span>{formatINR(item.price)}</span>}
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-violet-50 p-4 text-sm text-slate-600">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 shrink-0 text-brand-500" size={18} />
          <p>Notifications are generated from real marketplace activity in your account. No sample or dummy notifications are used.</p>
        </div>
      </div>
    </div>
  )
}

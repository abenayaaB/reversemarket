import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  FilePlus2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  MapPinned,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react'
import Logo from './Logo'
import NotificationBell from './NotificationBell'
import { useAuth } from '../hooks/useAuth'

const LINKS = {
  customer: [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/requirements', label: 'My requirements', icon: FileText, end: true },
    { to: '/customer/requirements/new', label: 'Post requirement', icon: FilePlus2 },
    { to: '/customer/map', label: 'Marketplace map', icon: MapPinned },
    { to: '/customer/shortlist', label: 'Shortlist', icon: Star },
    { to: '/customer/profile', label: 'Profile', icon: UserRound },
  ],
  provider: [
    { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/provider/requirements', label: 'Browse requirements', icon: Search },
    { to: '/provider/offers', label: 'My offers', icon: BriefcaseBusiness },
    { to: '/provider/map', label: 'Marketplace map', icon: MapPinned },
    { to: '/provider/profile', label: 'Profile', icon: UserRound },
  ],
}

export default function Navbar({ publicMode = false }) {
  const { session, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const links = profile ? LINKS[profile.role] || [] : []

  const handleLogout = async () => {
    await signOut()
    setOpen(false)
    navigate('/')
  }

  if (publicMode || !session || !profile) {
    return (
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">Log in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>
    )
  }

  const navClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-white text-brand-700 shadow-sm ring-1 ring-brand-100'
        : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
    }`

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-xl md:hidden">
        <Logo to="/" />
        <div className="flex items-center gap-1">
          <NotificationBell compact />
          <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" aria-label="Open navigation">
            <Menu size={21} />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Close navigation" />
          <aside className="relative flex h-full w-[290px] flex-col bg-slate-50 p-4 shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between px-1 pb-5">
              <Logo to="/" />
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white" aria-label="Close navigation"><X size={19} /></button>
            </div>
            <SidebarContent links={links} navClass={navClass} onNavigate={() => setOpen(false)} />
            <div className="mt-auto space-y-2 border-t border-slate-200 pt-4">
              <NotificationBell navigateOnClick />
              <button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-sm"><LogOut size={17} /> Log out</button>
            </div>
          </aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-slate-200/80 bg-slate-50/95 backdrop-blur-xl md:flex">
        <div className="flex h-20 items-center px-5">
          <Logo to="/" />
        </div>

        <div className="px-3">
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 p-4 text-white shadow-lg shadow-brand-500/20">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20"><UserRound size={19} /></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{profile.full_name}</p>
                <p className="mt-0.5 text-xs capitalize text-indigo-100">{profile.role} workspace</p>
              </div>
            </div>
          </div>
        </div>

        <SidebarContent links={links} navClass={navClass} />

        <div className="mt-auto border-t border-slate-200/80 p-3">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace updates</p>
          <div className="space-y-1">
            <NotificationBell navigateOnClick />
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-red-600"><LogOut size={18} /> Log out</button>
          </div>
        </div>
      </aside>
    </>
  )
}

function SidebarContent({ links, navClass, onNavigate }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-3">
      <nav className="space-y-1">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
        {links.map((item) => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass} onClick={onNavigate}>
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-brand-700"><Sparkles size={16} /><span className="text-xs font-bold">Smart marketplace</span></div>
        <p className="mt-2 text-xs leading-5 text-slate-500">Compare real offers using transparent budget, delivery and relevance signals.</p>
      </div>
    </div>
  )
}

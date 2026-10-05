import { Link } from 'react-router-dom'
export default function EmptyState({ icon: Icon, title, text, actionLabel, actionTo }) {
  return (
    <div className="card flex flex-col items-center py-14 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500"><Icon size={26} /></span>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {actionLabel && <Link to={actionTo} className="btn-primary mt-6">{actionLabel}</Link>}
    </div>
  )
}

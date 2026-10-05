export default function StatusBadge({ status, map }) {
  const s = map[status] || { label: status, style: 'bg-slate-100 text-slate-700' }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.style}`}>{s.label}</span>
}

import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Alert({ type = 'error', children }) {
  const ok = type === 'success'
  const Icon = ok ? CheckCircle2 : AlertCircle
  return (
    <div role={ok ? 'status' : 'alert'}
      className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

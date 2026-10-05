import { Loader2 } from 'lucide-react'
export default function Spinner({ full = false }) {
  return (
    <div className={`grid place-items-center ${full ? 'min-h-screen' : 'py-16'}`}>
      <Loader2 className="animate-spin text-brand-500" size={28} />
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowLeftRight } from 'lucide-react'

export default function Logo({ light = false, to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-extrabold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">
        <ArrowLeftRight size={18} />
      </span>
      <span className={light ? 'text-white' : 'text-brand-900'}>ReverseMarket</span>
    </Link>
  )
}

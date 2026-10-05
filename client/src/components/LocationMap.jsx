import { ExternalLink, MapPin } from 'lucide-react'

export default function LocationMap({ location, className = '' }) {
  const query = String(location || '').trim()
  if (!query) return null

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

  return (
    <section className={`overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <MapPin size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">Location</p>
            <p className="truncate text-xs text-slate-500">{query}</p>
          </div>
        </div>
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn-ghost shrink-0 !px-3 !py-2 text-xs">
          Open map <ExternalLink size={13} />
        </a>
      </div>

      <div className="relative h-[300px] bg-slate-100 sm:h-[340px]">
        <iframe
          title={`Map showing ${query}`}
          src={embedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/10 to-transparent" />
      </div>
    </section>
  )
}

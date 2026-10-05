export default function StatCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5">
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-brand-50 opacity-70 blur-2xl transition group-hover:bg-violet-100" />
      <div className="relative flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-100 text-brand-600 ring-1 ring-brand-100 transition group-hover:scale-105">
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-[0.1em] text-slate-400">{label}</p>
          {loading ? (
            <div className="mt-2 h-7 w-12 rounded-lg shimmer" />
          ) : (
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{value ?? 0}</p>
          )}
        </div>
      </div>
    </div>
  )
}

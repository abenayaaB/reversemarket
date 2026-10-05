export default function CardSkeletons({ count = 2 }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }, (_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />)}
    </div>
  )
}

export default function FormField({ id, label, error, hint, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

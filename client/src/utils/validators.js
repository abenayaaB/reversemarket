const pad = (n) => String(n).padStart(2, '0')

/** Today as YYYY-MM-DD in the user's local time zone. */
export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Tomorrow as YYYY-MM-DD, the earliest allowed deadline. */
export const tomorrowISO = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Returns { field: message } for every invalid field. Empty object means valid. */
export function validateRequirement(v) {
  const e = {}
  const title = v.title.trim()
  if (!title) e.title = 'Enter a title.'
  else if (title.length < 5) e.title = 'Title must be at least 5 characters.'
  else if (title.length > 120) e.title = 'Title must be 120 characters or fewer.'

  if (!v.category) e.category = 'Choose a category.'
  if (!v.description.trim()) e.description = 'Describe what you need.'
  if (!v.location.trim()) e.location = 'Enter a location.'

  const budget = Number(v.budget)
  if (String(v.budget).trim() === '') e.budget = 'Enter your budget.'
  else if (!Number.isFinite(budget) || budget <= 0) e.budget = 'Budget must be greater than 0.'
  else if (budget > 1_000_000_000) e.budget = 'Budget is too large.'

  if (!v.deadline) e.deadline = 'Pick a deadline.'
  else if (v.deadline <= todayISO()) e.deadline = 'Deadline must be a future date.'
  return e
}

export const CATEGORIES = [
  'Web Development',
  'Graphic Design',
  'Photography',
  'Video Production',
  'Marketing',
  'Event Services',
  'Tutoring',
  'Repair Services',
  'Printing',
  'Other',
]

export const REQUIREMENT_STATUS = {
  open: {
    label: 'Open',
    style: 'bg-slate-100 text-slate-700',
  },
  closed: {
    label: 'Closed',
    style: 'bg-blue-50 text-blue-700',
  },
  completed: {
    label: 'Completed',
    style: 'bg-emerald-100 text-emerald-800',
  },
  cancelled: {
    label: 'Cancelled',
    style: 'bg-red-50 text-red-700',
  },
}

export const OFFER_STATUS = {
  submitted: {
    label: 'Submitted',
    style: 'bg-slate-100 text-slate-700',
  },
  shortlisted: {
    label: 'Shortlisted',
    style: 'bg-amber-50 text-amber-700',
  },
  selected: {
    label: 'Selected',
    style: 'bg-emerald-50 text-emerald-700',
  },
  rejected: {
    label: 'Not selected',
    style: 'bg-red-50 text-red-700',
  },
}

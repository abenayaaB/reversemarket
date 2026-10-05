import { supabase } from '../lib/supabase'

const READ_KEY = 'reversemarket_read_notifications'

export function getReadNotificationIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveReadNotificationIds(ids) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(new Set(ids)).slice(-150)))
  } catch {
    // Ignore storage failures; notifications still work for the current view.
  }
}

export function relativeNotificationTime(value) {
  if (!value) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function customerNotificationText(status, requirementStatus) {
  if (requirementStatus === 'completed' && status === 'selected') return 'Project completed — leave a rating and feedback.'
  if (status === 'shortlisted') return 'An offer was shortlisted.'
  if (status === 'selected') return 'A provider was selected.'
  if (status === 'rejected') return 'An offer was marked rejected.'
  return 'A new offer was received.'
}

function providerNotificationText(status, requirementStatus) {
  if (requirementStatus === 'completed' && status === 'selected') return 'The customer marked your project completed.'
  if (status === 'selected') return 'Your offer was selected!'
  if (status === 'shortlisted') return 'Your offer was shortlisted.'
  if (status === 'rejected') return 'Your offer was not selected.'
  return 'Your offer was submitted.'
}

export async function getNotifications(profileId, role) {
  if (!profileId) return []

  if (role === 'customer') {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        id,
        requirement_id,
        status,
        created_at,
        updated_at,
        price,
        requirement:requirements!offers_requirement_id_fkey!inner (
          id,
          title,
          customer_id,
          status
        )
      `)
      .eq('requirement.customer_id', profileId)
      .order('updated_at', { ascending: false })
      .limit(40)

    if (error) throw error

    return (data || []).map((offer) => ({
      id: `customer-${offer.id}-${offer.status}`,
      title: offer.requirement?.title || 'Your requirement',
      text: customerNotificationText(offer.status, offer.requirement?.status),
      time: offer.status === 'submitted' ? offer.created_at : offer.updated_at,
      tone: offer.status,
      price: offer.price,
      requirementId: offer.requirement_id,
    }))
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 20)
  }

  const { data, error } = await supabase
    .from('offers')
    .select(`
      id,
      requirement_id,
      status,
      created_at,
      updated_at,
      price,
      requirement:requirements!offers_requirement_id_fkey (
        id,
        title,
        status
      )
    `)
    .eq('provider_id', profileId)
    .order('updated_at', { ascending: false })
    .limit(40)

  if (error) throw error

  const offerNotifications = (data || []).map((offer) => ({
    id: `provider-${offer.id}-${offer.status}-${offer.requirement?.status || ''}`,
    title: offer.requirement?.title || 'Requirement',
    text: providerNotificationText(offer.status, offer.requirement?.status),
    time: offer.status === 'submitted' ? offer.created_at : offer.updated_at,
    tone: offer.status,
    price: offer.price,
    requirementId: offer.requirement_id,
  }))

  let feedbackNotifications = []
  const reviewResult = await supabase
    .from('provider_reviews')
    .select('id, requirement_id, rating, created_at')
    .eq('provider_id', profileId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!reviewResult.error) {
    const requirementIds = (reviewResult.data || []).map((review) => review.requirement_id)
    if (requirementIds.length) {
      const { data: requirementData } = await supabase
        .from('requirements')
        .select('id, title')
        .in('id', requirementIds)

      const titles = Object.fromEntries((requirementData || []).map((item) => [item.id, item.title]))
      feedbackNotifications = (reviewResult.data || []).map((review) => ({
        id: `provider-review-${review.id}`,
        title: titles[review.requirement_id] || 'Completed project',
        text: `Customer left you a ${review.rating}/5 rating and feedback.`,
        time: review.created_at,
        tone: 'review',
        price: null,
        requirementId: review.requirement_id,
      }))
    }
  }

  return [...offerNotifications, ...feedbackNotifications]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 20)
}

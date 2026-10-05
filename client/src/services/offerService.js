import { supabase } from '../lib/supabase'

export async function createOffer({
  requirementId,
  providerId,
  price,
  deliveryDate,
  message,
}) {
  const { data, error } = await supabase
    .from('offers')
    .insert({
      requirement_id: requirementId,
      provider_id: providerId,
      price: Number(price),
      delivery_date: deliveryDate,
      message: message.trim(),
      status: 'submitted',
    })
    .select('*')
    .single()

  if (error) throw error

  return data
}

export async function getMyOffer(requirementId, providerId) {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('requirement_id', requirementId)
    .eq('provider_id', providerId)
    .maybeSingle()

  if (error) throw error

  return data
}

export async function getOffersForRequirement(requirementId) {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      id,
      requirement_id,
      provider_id,
      price,
      delivery_date,
      message,
      status,
      created_at,
      provider:profiles!offers_provider_id_fkey (
        id,
        full_name,
        company_name,
        bio
      )
    `)
    .eq('requirement_id', requirementId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return data || []
}

export async function updateOfferStatus(offerId, status) {
  const allowed = [
    'submitted',
    'shortlisted',
    'selected',
    'rejected',
  ]

  if (!allowed.includes(status)) {
    throw new Error('Invalid offer status.')
  }

  const { data, error } = await supabase
    .from('offers')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', offerId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function closeRequirement(requirementId) {
  const { data, error } = await supabase
    .from('requirements')
    .update({
      status: 'closed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requirementId)
    .select('*')
    .single()

  if (error) throw error
  return data
}
export async function getOffersForRequirements(requirementIds) {
  const ids = Array.from(new Set((requirementIds || []).filter(Boolean)))
  if (!ids.length) return []

  const { data, error } = await supabase
    .from('offers')
    .select(`
      id,
      requirement_id,
      provider_id,
      price,
      delivery_date,
      message,
      status,
      created_at,
      updated_at,
      provider:profiles!offers_provider_id_fkey (
        id,
        full_name,
        company_name,
        bio
      )
    `)
    .in('requirement_id', ids)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

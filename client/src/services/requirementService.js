import { supabase } from '../lib/supabase'

// Requirements are scoped to the logged-in customer.
// Supabase RLS also enforces ownership at the database level.

export async function createRequirement(userId, v) {
  const budget = Number(v.budget)

  const { data, error } = await supabase
    .from('requirements')
    .insert({
      customer_id: userId,
      title: v.title.trim(),
      category: v.category,
      description: v.description.trim(),
      budget_min: budget,
      budget_max: budget,
      deadline: v.deadline,
      location: v.location.trim(),
      status: 'open',
    })
    .select('id')
    .single()

  if (error) throw error

  return data
}

export async function getMyRequirements(userId) {
  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data || []
}

export async function getMyRequirement(id, userId) {
  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('id', id)
    .eq('customer_id', userId)
    .maybeSingle()

  if (error) {
    if (error.code === '22P02') return null
    throw error
  }

  return data
}

export async function deleteRequirement(id, userId) {
  const { error } = await supabase
    .from('requirements')
    .delete()
    .eq('id', id)
    .eq('customer_id', userId)

  if (error) throw error
}

export async function updateRequirementStatus(id, userId, status) {
  const { data, error } = await supabase
    .from('requirements')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('customer_id', userId)
    .select('*')
    .single()

  if (error) throw error

  return data
}

// Kept for compatibility with existing cards/components.
export function summarize(r) {
  return {
    offerCount: r?.offers?.length || 0,
    bestMatch: null,
  }
}

import { createContext, useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Profile load failed:', error.message)
      setProfile(null)
      return null
    }

    setProfile(data || null)
    return data || null
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return

      setSession(data.session)

      if (data.session) {
        await loadProfile(data.session.user.id)
      }

      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)

        if (!currentSession) {
          setProfile(null)
        } else {
          setTimeout(() => {
            loadProfile(currentSession.user.id)
          }, 0)
        }
      }
    )

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = async (email, password) => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) throw error

    await loadProfile(data.user.id)

    return data
  }

  const signUp = async ({
    email,
    password,
    ...meta
  }) => {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: meta,
        },
      })

    if (error) throw error

    if (data.session) {
      await loadProfile(data.user.id)
    }

    return data
  }

  const updateProfile = async (values) => {
    if (!session?.user?.id) {
      throw new Error('You must be logged in to update your profile.')
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: values.full_name.trim(),
        phone: values.phone?.trim() || null,
        company_name: values.company_name?.trim() || null,
        bio: values.bio?.trim() || null,
        location: values.location?.trim() || null,
      })
      .eq('id', session.user.id)
      .select('*')
      .single()

    if (error) throw error

    setProfile(data)
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        reloadProfile: () =>
          session?.user?.id
            ? loadProfile(session.user.id)
            : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

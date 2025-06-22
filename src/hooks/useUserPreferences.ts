import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserPreferences {
  selectedMetrics: string[]
  defaultDateRange: string
  defaultChartType: 'line' | 'bar'
}

const DEFAULT_PREFERENCES: UserPreferences = {
  selectedMetrics: ['total_investment', 'leads_generated', 'conversion_rate', 'avg_roas'],
  defaultDateRange: '30',
  defaultChartType: 'line'
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single()

        if (data?.preferences) {
          setPreferences(data.preferences)
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences }
    setPreferences(updatedPreferences)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preferences: updatedPreferences,
            updated_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }

  return {
    preferences,
    loading,
    savePreferences
  }
}
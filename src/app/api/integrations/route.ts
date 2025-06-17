import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto/encryption'

// GET - List integrations
export async function GET() {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get integrations
    const { data: integrations, error } = await supabase
      .from('integration_configs')
      .select('id, platform, name, is_active, last_sync_at, last_sync_status, last_sync_error, created_at')
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create integration
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { platform, credentials, name } = await req.json()

    // Validate input
    if (!platform || !credentials || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Encrypt credentials
    const encryptedCredentials = encrypt(JSON.stringify(credentials))

    // Create integration
    const { data: integration, error } = await supabase
      .from('integration_configs')
      .insert({
        company_id: userData.company_id,
        platform,
        name,
        credentials_encrypted: encryptedCredentials,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Remove encrypted credentials from response
    const { credentials_encrypted, ...safeIntegration } = integration

    return NextResponse.json({ integration: safeIntegration })
  } catch (error) {
    console.error('Error creating integration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
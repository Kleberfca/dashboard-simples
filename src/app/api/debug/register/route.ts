import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, companyName } = await req.json()
    
    const supabase = await createClient()
    
    // Test database connection
    const { data: test, error: testError } = await supabase
      .from('companies')
      .select('count')
      .limit(1)
    
    if (testError) {
      return NextResponse.json({ 
        error: 'Database connection error', 
        details: testError 
      }, { status: 500 })
    }
    
    // Try to create company directly
    const companySlug = companyName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        slug: companySlug,
        is_active: true,
        settings: {}
      })
      .select()
      .single()
    
    if (companyError) {
      return NextResponse.json({ 
        error: 'Company creation failed', 
        details: companyError,
        code: companyError.code,
        message: companyError.message 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      company 
    })
    
  } catch (error) {
    console.error('Debug register error:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error 
    }, { status: 500 })
  }
}
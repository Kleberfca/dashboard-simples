declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      
      // Security
      ENCRYPTION_KEY: string
      CRON_SECRET: string
      
      // App
      NEXT_PUBLIC_APP_URL: string
      
      // OAuth (optional)
      GOOGLE_CLIENT_ID?: string
      GOOGLE_CLIENT_SECRET?: string
      FACEBOOK_APP_ID?: string
      FACEBOOK_APP_SECRET?: string
      
      // Rate Limiting (optional)
      RATE_LIMIT_PER_HOUR?: string
      
      // Node
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

export {}
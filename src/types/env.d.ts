// src/types/env.d.ts

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      
      // Criptografia
      ENCRYPTION_KEY: string
      
      // Cron
      CRON_SECRET: string
      
      // App
      NEXT_PUBLIC_APP_URL: string
      NEXT_PUBLIC_APP_NAME?: string
      
      // APIs Externas (opcionais)
      GOOGLE_ADS_DEVELOPER_TOKEN?: string
      FACEBOOK_APP_ID?: string
      FACEBOOK_APP_SECRET?: string
      TIKTOK_APP_ID?: string
      TIKTOK_APP_SECRET?: string
      
      // Ambiente
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

// Necessário para que o arquivo seja tratado como um módulo
export {}
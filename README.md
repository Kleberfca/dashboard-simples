# Marketing Dashboard - Sistema Multicanal

Dashboard integrado para visualização de métricas de marketing de múltiplas plataformas (Google Ads, Facebook, Instagram, TikTok).

## 🚀 Instalação Rápida

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > API e copie:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_key_aqui

# Criptografia (exatamente 32 caracteres)
ENCRYPTION_KEY=sua_chave_de_32_caracteres_aqui_

# Cron Secret (gere uma string aleatória)
CRON_SECRET=sua_chave_secreta_cron_aqui

# URL da Aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Executar Migrations

No Supabase Dashboard:
1. Vá em SQL Editor
2. Cole o conteúdo de `/supabase/migrations/001_initial_schema.sql`
3. Execute

### 5. Iniciar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📋 Checklist de Configuração

- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto Supabase criado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations executadas
- [ ] Servidor rodando (`npm run dev`)

## 🔧 Configurações Importantes

### Chave de Criptografia
Gere uma chave de 32 caracteres:
```javascript
// No console do navegador ou Node.js:
crypto.randomBytes(16).toString('hex')
```

### Configurar Row Level Security (RLS)
Execute no Supabase SQL Editor após as migrations:
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
```

## 🚀 Deploy na Vercel

1. Faça push do código para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy!

### Configurar Cron Jobs na Vercel
As variáveis de ambiente devem incluir:
```
CRON_SECRET=mesma_chave_do_env_local
```

## 📱 Uso do Sistema

1. **Criar Conta**: Acesse `/register`
2. **Login**: Use suas credenciais em `/login`
3. **Configurar Integrações**: Vá em Integrações e conecte suas plataformas
4. **Visualizar Dashboard**: Métricas sincronizadas automaticamente a cada hora

## 🔒 Segurança

- Todas as credenciais são criptografadas com AES-256-GCM
- Multi-tenancy com RLS no Supabase
- Autenticação via Supabase Auth
- HTTPS obrigatório em produção

## 📞 Suporte

Para dúvidas ou problemas:
- Documentação Supabase: https://supabase.com/docs
- Documentação Next.js: https://nextjs.org/docs

## ⚡ Performance

- Caching automático de métricas
- Sincronização assíncrona
- Otimização de queries com índices
- CDN para assets estáticos
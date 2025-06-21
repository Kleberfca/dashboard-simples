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

# APIs Externas (opcional - para integrações reais)
GOOGLE_ADS_DEVELOPER_TOKEN=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
TIKTOK_APP_ID=
TIKTOK_APP_SECRET=
```

### 4. Executar Migrations

No Supabase Dashboard:
1. Vá em SQL Editor
2. Cole o conteúdo de `/supabase/migrations/001_initial_schema.sql`
3. Execute
4. Cole o conteúdo de `/supabase/migrations/002_campaigns_update.sql`
5. Execute

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
ALTER TABLE report_logs ENABLE ROW LEVEL SECURITY;
```

## 🚀 Deploy na Vercel

1. Faça push do código para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy!

### Configurar Cron Jobs na Vercel
1. O arquivo `vercel.json` já está configurado
2. As variáveis de ambiente devem incluir `CRON_SECRET`
3. O cron job executará a cada hora automaticamente

## 📱 Uso do Sistema

1. **Criar Conta**: Acesse `/register`
2. **Login**: Use suas credenciais em `/login`
3. **Dashboard**: Visualize métricas em tempo real
4. **Integrações**: Configure suas plataformas de marketing
5. **Campanhas**: Gerencie e acompanhe performance
6. **Relatórios**: Exporte dados em PDF, Excel ou CSV

## 🎨 Funcionalidades

### ✅ Implementadas
- Sistema de autenticação completo
- Dashboard com gráficos interativos
- Gestão de campanhas (CRUD completo)
- Sistema de integrações
- Geração de relatórios
- Design responsivo
- Modo escuro elegante
- Animações e transições suaves

### 🚧 Em Desenvolvimento
- Sincronização real com APIs externas
- Exportação de relatórios em PDF
- Sistema de notificações
- Webhooks para eventos

## 🔒 Segurança

- Todas as credenciais são criptografadas com AES-256-GCM
- Multi-tenancy com RLS no Supabase
- Autenticação via Supabase Auth
- HTTPS obrigatório em produção
- Proteção de rotas com middleware

## 📊 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/          # Páginas de autenticação
│   ├── (dashboard)/     # Páginas do dashboard
│   ├── api/             # API Routes
│   └── page.tsx         # Landing page
├── components/
│   ├── dashboard/       # Componentes do dashboard
│   ├── integrations/    # Componentes de integração
│   ├── layout/          # Componentes de layout
│   └── ui/              # Componentes de UI
├── lib/
│   ├── crypto/          # Criptografia
│   ├── integrations/    # Lógica de integração
│   └── supabase/        # Cliente Supabase
└── types/               # TypeScript types
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm run start

# Verificar tipos TypeScript
npm run type:check

# Lint
npm run lint
```

## 📞 Suporte

Para dúvidas ou problemas:
- Documentação Supabase: https://supabase.com/docs
- Documentação Next.js: https://nextjs.org/docs
- Issues do GitHub: [Criar issue](https://github.com/seu-usuario/dashboard-simples/issues)

## ⚡ Performance

- Caching automático de métricas
- Sincronização assíncrona
- Otimização de queries com índices
- CDN para assets estáticos
- Lazy loading de componentes

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
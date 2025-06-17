# Scripts de Desenvolvimento

## 🔧 Comandos Úteis

### Gerar Chave de Criptografia (32 caracteres)
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Gerar CRON Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Instalar Supabase CLI
```bash
npm install -g supabase
```

### Gerar tipos do Supabase
```bash
npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/lib/supabase/database.types.ts
```

### Resetar banco de dados local
```bash
npx supabase db reset
```

### Build para produção
```bash
npm run build
```

## 📝 Dados de Teste

### Criar usuário de teste no Supabase SQL Editor:
```sql
-- Criar empresa de teste
INSERT INTO companies (name, slug) 
VALUES ('Empresa Demo', 'empresa-demo')
RETURNING id;

-- Use o ID retornado acima
INSERT INTO users (id, email, name, company_id, role)
VALUES (
  gen_random_uuid(),
  'demo@example.com',
  'Usuário Demo',
  'ID_DA_EMPRESA_ACIMA',
  'admin'
);
```

### Inserir métricas de teste:
```sql
-- Inserir campanhas de teste
INSERT INTO campaigns (company_id, name, platform, status)
VALUES 
  ('COMPANY_ID', 'Campanha Google - Brand', 'google_ads', 'active'),
  ('COMPANY_ID', 'Campanha Facebook - Conversões', 'facebook_ads', 'active');

-- Inserir métricas dos últimos 30 dias
INSERT INTO daily_metrics (company_id, campaign_id, date, impressions, clicks, cost, leads, revenue)
SELECT 
  'COMPANY_ID',
  'CAMPAIGN_ID',
  current_date - interval '1 day' * generate_series(0, 29),
  floor(random() * 10000 + 1000)::int,
  floor(random() * 500 + 50)::int,
  floor(random() * 1000 + 100)::numeric(10,2),
  floor(random() * 50 + 5)::int,
  floor(random() * 5000 + 500)::numeric(10,2)
FROM generate_series(0, 29);
```

## 🐛 Troubleshooting

### Erro de CORS
Adicione no Supabase Dashboard > Settings > API:
- Adicione `http://localhost:3000` em Allowed Origins

### Erro de RLS
Verifique se as policies estão criadas:
```sql
-- Verificar policies
SELECT * FROM pg_policies;
```

### Limpar cache do Next.js
```bash
rm -rf .next
npm run dev
```

## 🚀 Deploy Checklist

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Supabase em produção configurado
- [ ] Domínio customizado (opcional)
- [ ] SSL certificado ativo
- [ ] Cron jobs habilitados na Vercel
- [ ] Monitoramento configurado
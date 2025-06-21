# 🚀 Checklist de Implantação - Dashboard Simples

## 📋 Pré-requisitos

- [ ] Node.js 18.17.0 ou superior instalado
- [ ] NPM 10.0.0 ou superior instalado
- [ ] Conta no Supabase criada
- [ ] Conta na Vercel criada (para deploy)
- [ ] Git configurado

## 🔧 Configuração Local

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase
- [ ] Criar novo projeto no Supabase
- [ ] Copiar URL e chaves do projeto
- [ ] Criar arquivo `.env.local` baseado em `.env.example`
- [ ] Preencher variáveis de ambiente

### 3. Executar Migrations
No Supabase Dashboard > SQL Editor:
- [ ] Executar `001_initial_schema.sql`
- [ ] Executar `002_campaigns_update.sql`
- [ ] Executar `003_sync_logs.sql`

### 4. Gerar Chave de Criptografia
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```
- [ ] Adicionar ao `.env.local` como `ENCRYPTION_KEY`

### 5. Gerar CRON Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
- [ ] Adicionar ao `.env.local` como `CRON_SECRET`

## 🏃 Desenvolvimento Local

### 1. Iniciar Servidor
```bash
npm run dev
```
- [ ] Verificar se está rodando em http://localhost:3000

### 2. Criar Conta de Teste
- [ ] Acessar /register
- [ ] Criar nova conta
- [ ] Verificar acesso ao dashboard

### 3. Testar Funcionalidades
- [ ] Dashboard carregando
- [ ] Integrações funcionando
- [ ] Campanhas CRUD
- [ ] Relatórios gerando
- [ ] Configurações salvando

## 🚢 Deploy em Produção

### 1. Preparar Código
- [ ] Commit de todas as alterações
- [ ] Push para GitHub
- [ ] Criar branch de produção

### 2. Configurar Vercel
- [ ] Importar projeto do GitHub
- [ ] Configurar variáveis de ambiente:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ENCRYPTION_KEY`
  - `CRON_SECRET`
  - `NEXT_PUBLIC_APP_URL` (URL de produção)
  - `NEXT_PUBLIC_APP_NAME`

### 3. Deploy
- [ ] Fazer deploy inicial
- [ ] Verificar build sem erros
- [ ] Testar URL de produção

### 4. Configurar Domínio (Opcional)
- [ ] Adicionar domínio customizado
- [ ] Configurar DNS
- [ ] Verificar SSL

## ✅ Verificação Final

### Funcionalidades
- [ ] Registro de usuário funcionando
- [ ] Login funcionando
- [ ] Dashboard carregando dados
- [ ] Integrações salvando
- [ ] Campanhas CRUD completo
- [ ] Relatórios gerando
- [ ] Configurações persistindo

### Segurança
- [ ] HTTPS ativo
- [ ] Variáveis de ambiente seguras
- [ ] RLS ativo no Supabase
- [ ] Criptografia funcionando

### Performance
- [ ] Tempo de carregamento < 3s
- [ ] Sem erros no console
- [ ] Imagens otimizadas
- [ ] Cache configurado

### Monitoramento
- [ ] Vercel Analytics ativo
- [ ] Logs configurados
- [ ] Alertas de erro

## 🐛 Troubleshooting

Se encontrar erros:
1. Verifique os logs da Vercel
2. Verifique os logs do Supabase
3. Confirme variáveis de ambiente
4. Teste localmente primeiro
5. Consulte `docs/troubleshooting.md`

## 📞 Próximos Passos

Após deploy bem-sucedido:
1. Configure integrações reais com APIs
2. Ative sincronização automática
3. Configure backups regulares
4. Implemente monitoramento
5. Documente processos

---

**Tempo estimado:** 1-2 horas para configuração completa
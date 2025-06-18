# Troubleshooting - Marketing Dashboard

## Erros Comuns e Soluções

### 1. Erro: "A propriedade 'from' não existe no tipo 'Promise<SupabaseClient<Database, "public", any>>'"

**Causa:** A função `createClient()` no Next.js 15 agora retorna uma Promise.

**Solução:** Adicione `await` antes de `createClient()`:
```typescript
// ❌ Errado
const supabase = createClient()

// ✅ Correto
const supabase = await createClient()
```

### 2. Erro: "O parâmetro 'company' implicitamente tem um tipo 'any'"

**Causa:** TypeScript não consegue inferir o tipo automaticamente.

**Solução:** Defina uma interface ou use type assertion:
```typescript
// Defina a interface
interface Company {
  id: string;
}

// Use no código
batch.map((company: Company) => ...)
```

### 3. Erro: "Definição circular do alias de importação"

**Causa:** Importações circulares entre arquivos.

**Solução:** 
- Refatore o código para evitar dependências circulares
- Use o padrão Singleton corretamente
- Exporte funções em vez de instâncias quando possível

### 4. Erro ao sincronizar: "column companies.is_active does not exist"

**Causa:** O campo `is_active` não existe na tabela `companies`.

**Solução:** Execute a migration:
```sql
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
```

## Checklist de Verificação

Antes de reportar um erro, verifique:

- [ ] Todas as dependências estão instaladas (`npm install`)
- [ ] As variáveis de ambiente estão configuradas (`.env.local`)
- [ ] As migrations foram executadas no Supabase
- [ ] O cache do Next.js foi limpo (`rm -rf .next`)
- [ ] Você está usando as versões corretas das dependências

## Comandos Úteis para Debug

```bash
# Limpar cache e reinstalar
rm -rf node_modules .next package-lock.json
npm install
npm run dev

# Verificar tipos TypeScript
npx tsc --noEmit

# Verificar ESLint
npm run lint

# Gerar tipos do Supabase
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

## Logs e Monitoramento

Para debug em produção:

1. **Vercel Logs:**
   - Acesse o dashboard da Vercel
   - Vá em Functions > Logs

2. **Supabase Logs:**
   - Dashboard Supabase > Logs > API Logs

3. **Console do Browser:**
   - Verifique erros no console (F12)
   - Aba Network para verificar requisições

## Suporte

Se o erro persistir:

1. Verifique a documentação oficial:
   - [Next.js 15 Docs](https://nextjs.org/docs)
   - [Supabase Docs](https://supabase.com/docs)

2. Busque por issues similares:
   - [GitHub Next.js](https://github.com/vercel/next.js/issues)
   - [GitHub Supabase](https://github.com/supabase/supabase/issues)
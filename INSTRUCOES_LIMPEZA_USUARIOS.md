# 🧹 Instruções: Limpar Usuários e Criar Master

## ⚠️ ATENÇÃO: Operação Destrutiva

Este processo **DELETA TODOS OS USUÁRIOS** do banco de dados. Use com **EXTREMA CAUTELA**.

---

## ✅ O que é Mantido vs Deletado

### **MANTIDO (Seguro):**
- ✅ Módulos (collection `modules`)
- ✅ Quizzes (collection `quizzes`)
- ✅ Todo conteúdo educacional
- ✅ Estrutura do banco de dados

### **DELETADO:**
- ❌ Todos os usuários (collection `users`)
- ❌ Todos os dados de progresso
- ❌ Pontos, streaks, tentativas

---

## 🚀 Passo a Passo Seguro

### **Opção 1: Limpar e Criar Master (Recomendado)**

```powershell
# 1. Ir para diretório do backend
cd "Back End"

# 2. Definir variáveis de ambiente (OBRIGATÓRIO)
$env:CONFIRM_DELETE="true"
$env:MASTER_EMAIL="master@notemusic.com"
$env:MASTER_PASSWORD="Master123!@#"
$env:MASTER_NAME="Master"

# 3. Executar script
node scripts/cleanUsersAndCreateMaster.js
```

### **Opção 2: Apenas Limpar (Depois criar master separadamente)**

```powershell
# 1. Limpar usuários
cd "Back End"
$env:CONFIRM_DELETE="true"
node scripts/cleanUsersOnly.js

# 2. Criar master
$env:MASTER_EMAIL="master@notemusic.com"
$env:MASTER_PASSWORD="Master123!@#"
node scripts/createMasterUser.js
```

---

## 🛡️ Validações de Segurança

O script valida automaticamente:

1. ✅ **Conteúdo educacional existe:**
   - Se não houver módulos → **ERRO** (não executa)
   - Se não houver quizzes → **ERRO** (não executa)

2. ✅ **Confirmação explícita:**
   - Requer `CONFIRM_DELETE=true`
   - Sem isso, script **NÃO executa**

3. ✅ **Logs detalhados:**
   - Mostra quantos usuários serão deletados
   - Mostra progresso da criação do master
   - Validação final dos dados

---

## 📊 Resultado Esperado

Após executar, você terá:

```
✅ PROCESSO CONCLUÍDO COM SUCESSO!
📊 RESUMO:
   👥 Usuários deletados: X
   ✅ Usuário master criado: master@notemusic.com
   📚 Módulos completados: Y
   📝 Quizzes completados: Z
   💰 Pontos totais: W
   🎯 Nível: maestro
```

### **Credenciais do Master:**
- **Email:** `master@notemusic.com`
- **Senha:** `Master123!@#`
- **Nome:** `Master`

**⚠️ IMPORTANTE:** Altere a senha após primeiro login!

---

## 🧪 Como Testar

### **1. Verificar antes:**
```bash
# Ver quantos usuários existem
# (via MongoDB Compass ou mongo shell)
db.users.countDocuments()
```

### **2. Executar script:**
```powershell
cd "Back End"
$env:CONFIRM_DELETE="true"
$env:MASTER_EMAIL="master@notemusic.com"
$env:MASTER_PASSWORD="Master123!@#"
node scripts/cleanUsersAndCreateMaster.js
```

### **3. Verificar depois:**
```bash
# Deve ter apenas 1 usuário (o master)
db.users.countDocuments()  # Deve retornar 1

# Verificar master
db.users.findOne({ email: "master@notemusic.com" })

# Verificar que módulos/quizzes ainda existem
db.modules.countDocuments({ isActive: true })
db.quizzes.countDocuments({ isActive: true })
```

### **4. Testar login:**
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"master@notemusic.com","password":"Master123!@#"}'
```

---

## ⚠️ Avisos Importantes

1. **Backup (Opcional mas Recomendado):**
   ```bash
   # Fazer backup antes (opcional)
   mongodump --uri="sua-connection-string" --out=backup-antes-limpeza
   ```

2. **Ambiente:**
   - ✅ Teste primeiro em **desenvolvimento local**
   - ✅ Só execute em produção se tiver certeza

3. **MongoDB URI:**
   - ✅ Certifique-se que `MONGODB_URI` está correto
   - ✅ Verifique se está conectando ao banco correto

---

## ✅ Checklist Antes de Executar

- [ ] Backup feito (opcional mas recomendado)
- [ ] `MONGODB_URI` configurado corretamente
- [ ] Módulos e quizzes existem no banco
- [ ] `CONFIRM_DELETE=true` definido
- [ ] Credenciais do master definidas
- [ ] Ambiente de desenvolvimento (testar primeiro)

---

## 🔐 Segurança

- ✅ Requer confirmação explícita (`CONFIRM_DELETE=true`)
- ✅ Valida conteúdo antes de deletar
- ✅ Logs detalhados
- ✅ Validação final dos dados
- ✅ Não afeta módulos/quizzes

---

## 📝 Notas

- ✅ Scripts são **seguros** (validam tudo antes)
- ✅ **Não quebra** a aplicação
- ✅ Fácil de reverter (apenas recriar usuários se necessário)
- ✅ Logs detalhados para debug


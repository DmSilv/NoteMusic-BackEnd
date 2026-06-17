# 🧹 Guia: Limpar Usuários e Criar Usuário Master

## ⚠️ ATENÇÃO: Scripts Destrutivos

Estes scripts **DELETAM TODOS OS USUÁRIOS** do banco de dados. Use com **EXTREMA CAUTELA**.

---

## 📋 O que os Scripts Fazem

### ✅ **O que é MANTIDO:**
- ✅ Módulos (collection `modules`)
- ✅ Quizzes (collection `quizzes`)
- ✅ Todo conteúdo educacional

### ❌ **O que é DELETADO:**
- ❌ Todos os usuários (collection `users`)
- ❌ Todos os dados de progresso dos usuários
- ❌ Todos os pontos, streaks, etc.

---

## 🔧 Scripts Disponíveis

### 1. **`cleanUsersAndCreateMaster.js`** (Recomendado)

**O que faz:**
- ✅ Deleta TODOS os usuários
- ✅ Cria usuário master com tudo completo
- ✅ Validações de segurança

**Como usar:**
```bash
cd "Back End"

# Definir variáveis de ambiente
$env:CONFIRM_DELETE="true"
$env:MASTER_EMAIL="master@notemusic.com"
$env:MASTER_PASSWORD="Master123!@#"
$env:MASTER_NAME="Master"

# Executar
node scripts/cleanUsersAndCreateMaster.js
```

### 2. **`cleanUsersOnly.js`** (Apenas Limpar)

**O que faz:**
- ✅ Deleta TODOS os usuários
- ❌ NÃO cria usuário master

**Como usar:**
```bash
cd "Back End"
$env:CONFIRM_DELETE="true"
node scripts/cleanUsersOnly.js
```

### 3. **`createMasterUser.js`** (Apenas Criar)

**O que faz:**
- ✅ Cria usuário master com tudo completo
- ❌ NÃO deleta usuários existentes

**Como usar:**
```bash
cd "Back End"
$env:MASTER_EMAIL="master@notemusic.com"
$env:MASTER_PASSWORD="Master123!@#"
$env:MASTER_NAME="Master"
node scripts/createMasterUser.js
```

---

## 🛡️ Medidas de Segurança

### 1. **Validação de Conteúdo**

Antes de deletar, o script valida:
- ✅ Existem módulos no banco?
- ✅ Existem quizzes no banco?
- ✅ Se não existir, **NÃO executa** (proteção)

### 2. **Confirmação Explícita**

Requer variável de ambiente:
```bash
CONFIRM_DELETE=true  # Deve ser explicitamente 'true'
```

### 3. **Logs Detalhados**

Todos os passos são logados:
- Quantos usuários serão deletados
- Quantos módulos/quizzes foram mantidos
- Progresso do usuário master criado

### 4. **Validação Final**

Após executar, valida:
- ✅ Usuários deletados corretamente
- ✅ Módulos/quizzes ainda existem
- ✅ Usuário master foi criado corretamente

---

## 📝 Passo a Passo Seguro

### **Opção 1: Limpar e Criar Master (Recomendado)**

```bash
# 1. Ir para diretório do backend
cd "Back End"

# 2. Definir variáveis de ambiente
$env:CONFIRM_DELETE="true"
$env:MASTER_EMAIL="master@notemusic.com"
$env:MASTER_PASSWORD="Master123!@#"
$env:MASTER_NAME="Master"

# 3. Verificar conexão com banco
# Certifique-se que MONGODB_URI está configurado no .env

# 4. Executar script
node scripts/cleanUsersAndCreateMaster.js

# 5. Verificar resultado
# Deve mostrar:
# ✅ Usuários deletados: X
# ✅ Usuário master criado: master@notemusic.com
# ✅ Módulos completados: Y
# ✅ Quizzes completados: Z
```

### **Opção 2: Apenas Limpar (Depois criar master separadamente)**

```bash
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

## ✅ Validações do Script

O script verifica:

1. ✅ **Conteúdo educacional existe:**
   - Se não houver módulos → **ERRO** (não executa)
   - Se não houver quizzes → **ERRO** (não executa)

2. ✅ **Usuários a deletar:**
   - Conta quantos usuários serão deletados
   - Mostra aviso antes de deletar

3. ✅ **Usuário master:**
   - Verifica se já existe
   - Cria com dados corretos
   - Valida progresso completo

4. ✅ **Resultado final:**
   - Verifica dados salvos
   - Mostra resumo completo

---

## 🔍 O que o Usuário Master Terá

### **Progresso Completo:**
- ✅ Todos os módulos completados
- ✅ Todos os quizzes completados (100% de acerto)
- ✅ Nível: Maestro
- ✅ Pontos máximos calculados
- ✅ Sem tentativas usadas (pode refazer tudo)

### **Credenciais Padrão:**
- **Email:** `master@notemusic.com`
- **Senha:** `Master123!@#`
- **Nome:** `Master`

**⚠️ IMPORTANTE:** Altere a senha após primeiro login!

---

## 🧪 Como Testar

### **1. Antes de Executar:**

```bash
# Verificar quantos usuários existem
# (conectar ao MongoDB e executar)
db.users.countDocuments()

# Verificar módulos e quizzes
db.modules.countDocuments({ isActive: true })
db.quizzes.countDocuments({ isActive: true })
```

### **2. Executar Script:**

```bash
cd "Back End"
$env:CONFIRM_DELETE="true"
$env:MASTER_EMAIL="master@notemusic.com"
$env:MASTER_PASSWORD="Master123!@#"
node scripts/cleanUsersAndCreateMaster.js
```

### **3. Verificar Resultado:**

```bash
# Verificar que usuários foram deletados
# (deve retornar 0 ou 1 se master foi criado)
db.users.countDocuments()

# Verificar usuário master
db.users.findOne({ email: "master@notemusic.com" })

# Verificar que módulos/quizzes ainda existem
db.modules.countDocuments({ isActive: true })
db.quizzes.countDocuments({ isActive: true })
```

### **4. Testar Login:**

```bash
# Fazer login com usuário master
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
   - ✅ Certifique-se que `MONGODB_URI` está correto no `.env`
   - ✅ Verifique se está conectando ao banco correto

4. **Conteúdo:**
   - ✅ Certifique-se que módulos e quizzes existem
   - ✅ Script valida isso automaticamente

---

## 🔐 Segurança

### **Proteções Implementadas:**
- ✅ Requer `CONFIRM_DELETE=true` explicitamente
- ✅ Valida conteúdo antes de deletar
- ✅ Logs detalhados de tudo que faz
- ✅ Validação final dos dados

### **O que NÃO é afetado:**
- ✅ Módulos (collection `modules`)
- ✅ Quizzes (collection `quizzes`)
- ✅ Estrutura do banco de dados
- ✅ Índices do MongoDB

---

## 📊 Resultado Esperado

Após executar `cleanUsersAndCreateMaster.js`:

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

---

## 🚨 Em Caso de Erro

Se algo der errado:

1. **Verificar logs** - Script mostra erros detalhados
2. **Verificar conexão** - MongoDB está acessível?
3. **Verificar conteúdo** - Módulos/quizzes existem?
4. **Restaurar backup** (se tiver feito)

---

## ✅ Checklist Antes de Executar

- [ ] Backup feito (opcional mas recomendado)
- [ ] `MONGODB_URI` configurado corretamente
- [ ] Módulos e quizzes existem no banco
- [ ] `CONFIRM_DELETE=true` definido
- [ ] Credenciais do master definidas
- [ ] Ambiente de desenvolvimento (testar primeiro)

---

## 🎯 Próximos Passos

Após criar usuário master:

1. **Fazer login** com credenciais do master
2. **Verificar progresso** - deve mostrar tudo completo
3. **Alterar senha** - por segurança
4. **Testar funcionalidades** - garantir que tudo funciona

---

## 📝 Notas

- ✅ Scripts são **idempotentes** (podem ser executados múltiplas vezes)
- ✅ Validações garantem que não quebra a aplicação
- ✅ Logs detalhados para debug
- ✅ Fácil de reverter (apenas recriar usuários se necessário)


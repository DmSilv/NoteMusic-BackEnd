# 🏗️ Arquitetura: Onde os Dados Ficam Salvos

## 📊 Diagrama de Arquitetura

```
┌─────────────┐         ┌─────────────┐
│  Frontend   │         │  Frontend   │
│  (App)      │         │  (App)      │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │ HTTP Requests          │ HTTP Requests
       │                       │
┌──────▼───────────────────────▼──────┐
│         Backend 1 (Local)            │
│  - Processa requisições              │
│  - Lê/Escreve no MongoDB             │
│  - Cache temporário (memória)        │
└──────┬───────────────────────┬──────┘
       │                       │
       │                       │
┌──────▼───────────────────────▼──────┐
│         Backend 2 (Railway)          │
│  - Processa requisições              │
│  - Lê/Escreve no MongoDB             │
│  - Cache temporário (memória)        │
└──────┬───────────────────────┬──────┘
       │                       │
       └───────────┬───────────┘
                   │
         ┌─────────▼─────────┐
         │   MongoDB Atlas   │
         │  (Banco de Dados) │
         │                   │
         │  Collections:     │
         │  - users          │
         │  - modules        │
         │  - quizzes        │
         └───────────────────┘
```

---

## ✅ Respostas Diretas

### **1. Onde ficam salvos os dados?**

**TODOS os dados ficam salvos no MONGODB (banco de dados), NÃO no backend.**

- ✅ **Usuários** → MongoDB Collection `users`
- ✅ **Quizzes Completados** → `users.completedQuizzes[]`
- ✅ **Tentativas de Quiz** → `users.quizAttempts[]`
- ✅ **Módulos Completados** → `users.completedModules[]`
- ✅ **Pontos** → `users.totalPoints`
- ✅ **Módulos** → MongoDB Collection `modules`
- ✅ **Quizzes** → MongoDB Collection `quizzes`

### **2. Se tiver 2 backends acessando o mesmo banco, funciona?**

**SIM! Funciona perfeitamente!**

Se você criar um usuário no **Backend 1 (Local)** e tentar fazer login no **Backend 2 (Railway)**, **VAI FUNCIONAR** porque ambos acessam o **mesmo MongoDB**.

---

## 🔄 Fluxo de Dados

### **Cenário: Criar Usuário no Backend 1, Logar no Backend 2**

```
1. Backend 1 (Local):
   POST /api/auth/register
   → Busca no MongoDB: usuário existe?
   → NÃO existe
   → Cria usuário no MongoDB
   → await user.save() ✅ SALVO NO MONGODB

2. Backend 2 (Railway):
   POST /api/auth/login
   → Busca no MongoDB: usuário existe?
   → SIM! (mesmo banco)
   → Valida senha
   → Retorna token ✅ FUNCIONA!
```

### **Cenário: Completar Quiz no Backend 1, Verificar no Backend 2**

```
1. Backend 1 (Local):
   POST /api/quiz/:id/submit/private
   → Busca usuário no MongoDB
   → Adiciona quiz aos completados
   → await user.save() ✅ SALVO NO MONGODB

2. Backend 2 (Railway):
   GET /api/quiz/:id/completion-status
   → Busca usuário no MongoDB
   → Verifica completedQuizzes[]
   → Retorna: isCompleted: true ✅ DADOS ATUALIZADOS!
```

---

## 🗄️ Estrutura no MongoDB

### **Collection: users**

```javascript
{
  _id: ObjectId("..."),
  name: "João",
  email: "joao@test.com",
  password: "$2a$10$...", // Hash bcrypt
  
  // ✅ DADOS SALVOS AQUI:
  completedModules: [
    {
      moduleId: ObjectId("..."),
      completedAt: ISODate("2024-...")
    }
  ],
  
  completedQuizzes: [
    {
      quizId: ObjectId("..."),
      score: 8,
      percentage: 80,
      passed: true,
      completedAt: ISODate("2024-...")
    }
  ],
  
  quizAttempts: [
    {
      quizId: ObjectId("..."),
      attempts: 2,
      lastAttempt: ISODate("2024-..."),
      cooldownUntil: null,
      isBlocked: false
    }
  ],
  
  totalPoints: 150,
  streak: 5,
  level: "virtuoso"
}
```

---

## 🔍 Como Verificar

### **1. Verificar no Código:**

Todos os salvamentos usam `.save()`:

```javascript
// ✅ Salva no MongoDB
await user.save();        // Salva usuário
await quiz.save();        // Salva quiz
await module.save();      // Salva módulo
```

### **2. Verificar no MongoDB Compass:**

1. Conectar ao MongoDB
2. Selecionar database `notemusic`
3. Abrir collection `users`
4. Ver dados do usuário

### **3. Teste Prático:**

```bash
# Backend 1 - Criar usuário
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@test.com","password":"123456"}'

# Backend 2 - Fazer login (deve funcionar!)
curl -X POST https://seu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@test.com","password":"123456"}'
```

---

## ⚠️ Diferença: Cache vs Banco de Dados

### **Cache (Backend - Temporário):**
```javascript
// Cache em memória (NodeCache)
cache.set(key, data, duration);
// ❌ É limpo quando servidor reinicia
// ❌ NÃO é compartilhado entre backends
// ✅ Apenas para performance
```

### **Banco de Dados (MongoDB - Permanente):**
```javascript
// Salva no MongoDB
await user.save();
// ✅ Persiste permanentemente
// ✅ Compartilhado entre todos os backends
// ✅ Fonte única da verdade
```

---

## 🎯 Vantagens desta Arquitetura

1. **Escalabilidade:**
   - Pode ter múltiplos backends
   - Cada um processa requisições independentemente
   - Todos acessam o mesmo banco

2. **Alta Disponibilidade:**
   - Se um backend cair, outro continua funcionando
   - Dados sempre disponíveis no MongoDB

3. **Sincronização:**
   - Dados sempre sincronizados
   - Mudanças em um backend aparecem no outro

4. **Flexibilidade:**
   - Pode trocar de backend sem perder dados
   - Pode ter backend local + produção

5. **Backup:**
   - Dados centralizados
   - Fácil fazer backup do MongoDB

---

## 🔐 Segurança

### **Configuração Correta:**

1. **MongoDB com autenticação:**
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/notemusic
   ```

2. **Backends com acesso:**
   - Ambos precisam da mesma `MONGODB_URI`
   - Ambos podem ler/escrever no mesmo banco

3. **Isolamento de dados:**
   - Cada usuário vê apenas seus dados
   - Validação por JWT token
   - Queries filtradas por `userId`

---

## 📝 Conclusão

### **Resumo:**

1. ✅ **Dados ficam no MongoDB** (banco de dados)
2. ✅ **Backend apenas processa** (não armazena)
3. ✅ **Múltiplos backends funcionam** (compartilham banco)
4. ✅ **Criar em um, usar no outro** (funciona perfeitamente)

### **Isso é o comportamento correto e esperado!**

A arquitetura está correta. O MongoDB é a **fonte única da verdade**, e os backends são **stateless** (não guardam estado), o que permite escalabilidade e alta disponibilidade.


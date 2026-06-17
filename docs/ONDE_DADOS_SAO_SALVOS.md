# 📊 Onde os Dados São Salvos?

## ✅ Resposta Direta

**TODOS os dados são salvos no BANCO DE DADOS (MongoDB), NÃO no backend.**

O backend é apenas um **servidor que lê e escreve** no banco de dados. Ele não armazena dados permanentemente.

---

## 🗄️ Estrutura de Armazenamento

### **Dados Salvos no MongoDB:**

| Dado | Onde Fica | Exemplo |
|------|-----------|---------|
| **Usuários** | MongoDB → Collection `users` | Email, senha, nome |
| **Quizzes Completados** | MongoDB → `users.completedQuizzes[]` | Array dentro do documento do usuário |
| **Tentativas de Quiz** | MongoDB → `users.quizAttempts[]` | Array dentro do documento do usuário |
| **Módulos Completados** | MongoDB → `users.completedModules[]` | Array dentro do documento do usuário |
| **Pontos** | MongoDB → `users.totalPoints` | Campo no documento do usuário |
| **Streak** | MongoDB → `users.streak` | Campo no documento do usuário |
| **Módulos** | MongoDB → Collection `modules` | Conteúdo educacional |
| **Quizzes** | MongoDB → Collection `quizzes` | Perguntas e respostas |

### **Dados NÃO Salvos no Backend:**

- ❌ Cache em memória (apenas temporário, é limpo quando servidor reinicia)
- ❌ Sessões (usa JWT stateless)
- ❌ Dados de usuários (tudo vai para MongoDB)

---

## 🔄 Como Funciona o Salvamento

### **Exemplo: Completar um Quiz**

```javascript
// 1. Frontend envia requisição
POST /api/quiz/:quizId/submit/private

// 2. Backend busca usuário do MongoDB
const user = await User.findById(userId);

// 3. Backend atualiza dados em memória
user.completedQuizzes.push({
  quizId: quizId,
  score: score,
  passed: true
});

// 4. ✅ SALVA NO MONGODB (persistente)
await user.save(); // ← Isto salva no banco de dados!

// 5. Backend retorna resposta
res.json({ success: true });
```

**Resultado:** Dados ficam salvos no MongoDB, não no backend.

---

## 🌐 Múltiplos Backends Acessando o Mesmo Banco

### ✅ **SIM, funciona perfeitamente!**

Se você tiver **2 backends acessando o mesmo MongoDB**, eles **compartilham os mesmos dados**.

### **Cenário:**

```
Backend 1 (Local)          Backend 2 (Railway)
     |                           |
     |                           |
     └───────────┬───────────────┘
                 |
          MongoDB (mesmo banco)
```

### **Exemplo Prático:**

1. **Backend 1 (Local):**
   ```javascript
   // Criar usuário
   POST /api/auth/register
   { name: "João", email: "joao@test.com", password: "123456" }
   ```
   ✅ **Salva no MongoDB**

2. **Backend 2 (Railway):**
   ```javascript
   // Fazer login com o mesmo usuário
   POST /api/auth/login
   { email: "joao@test.com", password: "123456" }
   ```
   ✅ **Funciona!** Busca o usuário do mesmo MongoDB

3. **Backend 1 (Local):**
   ```javascript
   // Completar quiz
   POST /api/quiz/:quizId/submit/private
   ```
   ✅ **Salva no MongoDB**

4. **Backend 2 (Railway):**
   ```javascript
   // Verificar status
   GET /api/quiz/:quizId/completion-status
   ```
   ✅ **Retorna dados atualizados!** Busca do mesmo MongoDB

---

## 🔍 Como Verificar

### **1. Verificar no Código:**

Todos os salvamentos usam `.save()` do Mongoose:

```javascript
// ✅ Salva no MongoDB
await user.save();
await quiz.save();
await module.save();
```

### **2. Verificar no MongoDB:**

```javascript
// Conectar ao MongoDB
use notemusic

// Ver usuário
db.users.findOne({ email: "usuario@exemplo.com" })

// Ver dados salvos
{
  _id: ObjectId("..."),
  name: "Usuário",
  email: "usuario@exemplo.com",
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
      lastAttempt: ISODate("2024-...")
    }
  ],
  totalPoints: 150
}
```

---

## ⚠️ Importante: Cache vs Banco de Dados

### **Cache (Temporário):**
- ✅ Apenas para **performance**
- ❌ **NÃO persiste** (é limpo quando servidor reinicia)
- ❌ **NÃO compartilhado** entre backends
- ✅ Usado para acelerar respostas

### **Banco de Dados (Permanente):**
- ✅ **Persiste** permanentemente
- ✅ **Compartilhado** entre todos os backends
- ✅ **Fonte única da verdade**
- ✅ Dados reais do usuário

---

## 🧪 Teste Prático

### **Teste 1: Criar usuário em um backend, logar no outro**

```bash
# Backend 1 (Local)
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@test.com","password":"123456"}'

# Backend 2 (Railway) - Deve funcionar!
curl -X POST https://seu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@test.com","password":"123456"}'
```

**Resultado:** ✅ Funciona! Ambos acessam o mesmo MongoDB.

### **Teste 2: Completar quiz em um backend, verificar no outro**

```bash
# Backend 1 - Completar quiz
curl -X POST http://localhost:3333/api/quiz/ID/submit/private \
  -H "Authorization: Bearer TOKEN"

# Backend 2 - Verificar status (deve mostrar completo)
curl -X GET https://seu-backend.railway.app/api/quiz/ID/completion-status \
  -H "Authorization: Bearer TOKEN"
```

**Resultado:** ✅ Funciona! Dados compartilhados.

---

## 📝 Resumo

### **Onde os dados ficam:**
- ✅ **MongoDB (Banco de Dados)** = Dados permanentes
- ❌ **Backend** = Apenas processa requisições (não armazena)

### **Múltiplos backends:**
- ✅ **SIM**, podem acessar o mesmo banco
- ✅ **SIM**, compartilham os mesmos dados
- ✅ **SIM**, se criar usuário em um, pode logar no outro
- ✅ **SIM**, se completar quiz em um, aparece no outro

### **Isso é o comportamento correto!**
- ✅ Banco de dados é a **fonte única da verdade**
- ✅ Backends são **stateless** (não guardam estado)
- ✅ Permite **escalabilidade** (múltiplos servidores)
- ✅ Permite **alta disponibilidade**

---

## 🔐 Segurança

- ✅ Cada backend precisa ter acesso ao MongoDB
- ✅ MongoDB deve ter autenticação configurada
- ✅ Connection string deve ser segura (não expor em código)
- ✅ Usar variáveis de ambiente para `MONGODB_URI`

---

## 🚀 Vantagens

1. **Escalabilidade:** Pode ter múltiplos backends
2. **Alta Disponibilidade:** Se um backend cair, outro continua funcionando
3. **Sincronização:** Dados sempre sincronizados
4. **Backup:** Dados centralizados no MongoDB
5. **Flexibilidade:** Pode trocar de backend sem perder dados


# 📱 Autenticação em Múltiplos Dispositivos

## ✅ Resposta: **SIM, uma mesma conta pode logar em múltiplos dispositivos simultaneamente**

---

## 🔍 Como Funciona

### **Sistema de Autenticação JWT (JSON Web Token)**

O sistema usa **JWT stateless**, o que significa:

1. **Cada login gera um token único**
2. **Tokens são independentes** entre dispositivos
3. **Não há limite de dispositivos** ativos
4. **Não há controle de sessões** no servidor

### **Fluxo de Login:**

```
Usuário faz login no Celular 1
  ↓
Backend gera Token JWT 1 (válido por 7 dias)
  ↓
Token salvo no AsyncStorage do Celular 1

Usuário faz login no Celular 2
  ↓
Backend gera Token JWT 2 (válido por 7 dias) [NOVO TOKEN]
  ↓
Token salvo no AsyncStorage do Celular 2

✅ Ambos os dispositivos podem usar simultaneamente!
```

---

## 📋 Características do Sistema Atual

### ✅ **Permite:**
- ✅ Login em múltiplos dispositivos simultaneamente
- ✅ Cada dispositivo tem seu próprio token
- ✅ Tokens válidos independentemente
- ✅ Progresso sincronizado entre dispositivos (via MongoDB)

### ❌ **Não Implementado:**
- ❌ Limite de dispositivos
- ❌ Revogação de tokens (logout em um dispositivo não afeta outros)
- ❌ Lista de dispositivos ativos
- ❌ Notificação quando login em novo dispositivo

---

## 🔐 Detalhes Técnicos

### **Geração do Token:**

```javascript inside
// Back End/src/controllers/auth.controller.js
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'  // 7 dias
  });
};

// Cada login gera um NOVO token
exports.login = async (req, res, next) => {
  // ...
  const token = generateToken(user._id);  // Novo token a cada login
  res.json({ success: true, token, user });
}
```

### **Validação do Token:**

```javascript inside
// Back End/src/middlewares/auth.js
exports.protect = async (req, res, next) => {
  // Verifica se token é válido
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // Busca usuário e valida
  req.user = await User.findById(decoded.id);
  
  // ✅ Não verifica se já existe outro dispositivo logado
  // ✅ Não revoga tokens anteriores
}
```

### **Armazenamento no Frontend:**

```typescript inside
// NoteMusic/app/contexts/AuthContext.tsx
const login = async (loginData) => {
  const response = await apiService.login(loginData);
  
  // Salva token no AsyncStorage do dispositivo atual
  await AsyncStorage.setItem('@NoteMusic:token', response.token);
  await AsyncStorage.setItem('@NoteMusic:user', JSON.stringify(response.user));
}

// Cada dispositivo tem seu próprio AsyncStorage
// Tokens não conflitam entre dispositivos
```

---

## 💡 Exemplo Prático

### **Cenário: Usuário com 2 Celulares**

**Celular 1 (Android):**
- Login: 15/01/2024 10:00
- Token gerado: `eyJhbGci...` (expira em 22/01/2024)
- Usuário completa módulo A

**Celular 2 (iOS):**
- Login: 15/01/2024 14:00 (mesma conta)
- Token gerado: `eyJhbGci...` (DIFERENTE, expira em 22/01/2024)
- ✅ Login bem-sucedido
- ✅ Vê módulo A já completo (dados do MongoDB)

**Resultado:**
- ✅ Ambos dispositivos funcionando simultaneamente
- ✅ Progresso sincronizado via backend
- ✅ Tokens independentes

---

## ⚠️ Implicações

### **Vantagens:**
1. ✅ **Conveniência**: Usuário pode trocar de dispositivo facilmente
2. ✅ **Sincronização**: Progresso sempre atualizado em todos dispositivos
3. ✅ **Simplicidade**: Não precisa gerenciar sessões no servidor

### **Considerações:**
1. ⚠️ **Segurança**: Se token for comprometido, válido até expirar (7 dias)
2. ⚠️ **Logout parcial**: Fazer logout em um dispositivo não revoga tokens em outros
3. ⚠️ **Múltiplos acessos**: Não há forma de "forçar logout" de outros dispositivos

---

## 🔒 Se Desejar Implementar Limitações (Opcional)

### **Opção 1: Limitar Número de Dispositivos**

```javascript inside
// Adicionar ao User schema
activeDevices: [{
  deviceId: String,
  deviceName: String,
  lastLogin: Date,
  token: String
}],

// No login, verificar limite
if (user.activeDevices.length >= MAX_DEVICES) {
  // Remover dispositivo mais antigo ou negar login
}
```

### **Opção 2: Revogação de Tokens (Logout em Todos)**

```javascript inside
// Adicionar campo no User
tokenVersion: Number,

// Incrementar a cada logout
user.tokenVersion += 1;

// Validar token
if (decoded.tokenVersion < user.tokenVersion) {
  return res.status(401).json({ message: 'Token revogado' });
}
```

### **Opção 3: Lista de Dispositivos Ativos**

```javascript inside
// Endpoint para listar dispositivos
GET /api/auth/devices

// Endpoint para remover dispositivo
DELETE /api/auth/devices/:deviceId
```

---

## 📝 Resumo

| Pergunta | Resposta |
|----------|----------|
| **Pode logar em múltiplos dispositivos?** | ✅ Sim |
| **Há limite de dispositivos?** | ❌ Não |
| **Logout em um dispositivo afeta outros?** | ❌ Não |
| **Tokens são independentes?** | ✅ Sim |
| **Progresso sincroniza entre dispositivos?** | ✅ Sim (via MongoDB) |
| **Tokens expiram?** | ✅ Sim (7 dias) |

---

## ✅ Conclusão

**Uma mesma conta PODE fazer login em quantos dispositivos quiser simultaneamente.**

O sistema atual foi projetado para permitir isso, facilitando o uso em múltiplos dispositivos sem restrições. Se desejar implementar limitações de segurança, seria necessário adicionar controle de sessões e dispositivos ativos.


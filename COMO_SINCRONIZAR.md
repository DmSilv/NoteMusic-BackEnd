# 🔄 Como Sincronizar o Banco de Produção

## ❌ Erro Encontrado

```
MongoParseError: Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
```

**Causa**: A URL de conexão do MongoDB do Railway não está configurada.

## ✅ Solução: Configurar a URL do Railway

Você precisa criar um arquivo `.env` com a URL de conexão do banco de dados do Railway.

### Passo 1: Obter a URL do Railway

1. Acesse: https://railway.app
2. Faça login na sua conta
3. Abra o projeto **NoteMusic**
4. Vá na aba **Variables** (variáveis)
5. Procure pela variável `MONGODB_URI`
6. Clique em **Copy** para copiar o valor

A URL terá o formato:
```
mongodb+srv://usuario:senha@cluster.mongodb.net/notemusic?retryWrites=true&w=majority
```

### Passo 2: Criar o Arquivo .env

1. Na pasta `Back End`, crie um arquivo chamado `.env`
2. Cole o seguinte conteúdo:

```env
MONGODB_URI=mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.mongodb.net/notemusic?retryWrites=true&w=majority
```

**Substitua** `SEU_USUARIO`, `SUA_SENHA` e `SEU_CLUSTER` pelos valores copiados do Railway.

### Passo 3: Executar a Sincronização

Depois de criar o arquivo `.env`, execute:

```bash
cd "Back End"
node sync-production-database.js
```

## 🎯 Exemplo Completo

Se você tiver a URL do Railway assim:
```
mongodb+srv://admin:123456@cluster0.abc123.mongodb.net/notemusic?retryWrites=true&w=majority
```

Seu arquivo `.env` deve ficar assim:
```env
MONGODB_URI=mongodb+srv://admin:123456@cluster0.abc123.mongodb.net/notemusic?retryWrites=true&w=majority
```

## ⚠️ Importante

- **NÃO** compartilhe o arquivo `.env` publicamente
- **NÃO** faça commit do `.env` no GitHub
- O arquivo `.env` já está no `.gitignore` por segurança

## 🔄 Alternativa: Sincronização sem .env

Se você preferir não criar o arquivo `.env`, pode passar a URL diretamente na linha de comando:

### No PowerShell (Windows):
```powershell
$env:MONGODB_URI="mongodb+srv://usuario:senha@cluster.mongodb.net/notemusic"
node sync-production-database.js
```

### No CMD (Windows):
```cmd
set MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/notemusic
node sync-production-database.js
```

## 📋 Checklist

Antes de executar a sincronização:

- [ ] MongoDB local está rodando
- [ ] Backend local tem os 22 módulos
- [ ] URL do Railway foi copiada
- [ ] Arquivo `.env` foi criado com a URL correta
- [ ] Backend local não está rodando na porta 3333 (para evitar conflitos)

## 🎉 Depois da Sincronização

Após sincronizar, verifique se funcionou:

```bash
node test-compare-backends.js
```

Você deve ver que ambos os backends têm 22 módulos!

## 🆘 Precisa de Ajuda?

Se não conseguir a URL do Railway:
1. Verifique se está logado na conta correta
2. Verifique se o projeto NoteMusic existe no Railway
3. Se não encontrar a variável MONGODB_URI, crie uma nova variável com o nome correto

---

**Dúvidas?** Abra uma issue no GitHub ou entre em contato!





# Backend NoteMusic API

API REST para o aplicativo NoteMusic - Plataforma de ensino musical gamificada.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **Bcrypt** - Criptografia de senhas
- **Express Validator** - Validação de dados
- **Helmet** - Segurança
- **CORS** - Cross-Origin Resource Sharing

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- MongoDB (local ou MongoDB Atlas)
- NPM ou Yarn

## 🔧 Instalação

1. Clone o repositório
2. Entre na pasta do backend:
```bash
cd "Back End"
```

3. Instale as dependências:
```bash
npm install
```

4. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Edite o arquivo `.env` com suas configurações

5. Inicie o servidor:
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

## 🗄️ Configuração do Banco de Dados

### Opção 1: MongoDB Local
1. Instale o MongoDB: https://www.mongodb.com/try/download/community
2. Inicie o MongoDB
3. Use a connection string: `mongodb://localhost:27017/notemusic`

### Opção 2: MongoDB Atlas (Recomendado)
1. Crie uma conta em: https://www.mongodb.com/cloud/atlas
2. Crie um cluster gratuito
3. Configure um usuário do banco
4. Pegue a connection string e coloque no `.env`

## 📚 Estrutura da API

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado
- `PUT /api/auth/updatepassword` - Atualizar senha
- `POST /api/auth/forgotpassword` - Recuperar senha

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil

### Módulos
- `GET /api/modules` - Listar módulos
- `GET /api/modules/:id` - Detalhes do módulo

### Quiz
- `GET /api/quiz/:moduleId` - Quiz do módulo
- `POST /api/quiz/:quizId/submit` - Enviar respostas

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens). Para acessar rotas protegidas:

1. Faça login para receber o token
2. Envie o token no header:
```
Authorization: Bearer SEU_TOKEN_AQUI
```

## 📝 Exemplos de Requisições

### Registro
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "level": "iniciante"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senha123"
}
```

## 🛠️ Desenvolvimento

### Estrutura de Pastas
```
src/
├── config/        # Configurações
├── controllers/   # Lógica dos endpoints
├── models/       # Modelos do MongoDB
├── routes/       # Definição de rotas
├── middlewares/  # Middlewares
├── services/     # Lógica de negócio
├── utils/        # Utilitários
└── validators/   # Validações
```

### Próximos Passos
- [ ] Implementar envio de emails
- [ ] Adicionar upload de arquivos
- [ ] Implementar sistema de notificações
- [ ] Adicionar testes automatizados
- [ ] Implementar cache com Redis
- [ ] Adicionar documentação com Swagger

## 📱 Integração com o Frontend

O frontend React Native deve:
1. Armazenar o token JWT no AsyncStorage
2. Enviar o token em todas as requisições autenticadas
3. Renovar o token quando expirar
4. Tratar erros de autenticação

## 🚀 Deploy

Para fazer deploy da API:

### Heroku
1. Crie uma conta no Heroku
2. Instale o Heroku CLI
3. Execute:
```bash
heroku create nome-do-app
heroku addons:create mongolab
git push heroku main
```

### Railway
1. Acesse railway.app
2. Conecte seu GitHub
3. Configure as variáveis de ambiente
4. Deploy automático

### Render
1. Acesse render.com
2. Crie um novo Web Service
3. Conecte o repositório
4. Configure as variáveis
5. Deploy

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Abra uma issue no GitHub
- Entre em contato com a equipe

## 📄 Licença

Este projeto está sob a licença MIT.
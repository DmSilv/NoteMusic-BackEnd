# NoteMusic Backend API

Backend completo para o aplicativo NoteMusic - Uma aplicação educacional de música gamificada.

## 🎵 Sobre o Projeto

O NoteMusic Backend é uma API REST desenvolvida em Node.js que fornece toda a infraestrutura necessária para um aplicativo de ensino musical gamificado. A API gerencia autenticação de usuários, módulos educacionais, quizzes, sistema de gamificação e progresso do usuário.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados
- **dotenv** - Gerenciamento de variáveis de ambiente
- **cors** - Controle de CORS
- **helmet** - Segurança HTTP
- **express-rate-limit** - Rate limiting

## 📁 Estrutura do Projeto

```
src/
├── config/
│   └── database.js           # Configuração do MongoDB
├── controllers/
│   ├── auth.controller.js    # Autenticação
│   ├── user.controller.js    # Usuários
│   ├── module.controller.js  # Módulos educacionais
│   ├── quiz.controller.js    # Quizzes
│   └── gamification.controller.js # Gamificação
├── middlewares/
│   ├── auth.js              # Middleware de autenticação
│   └── errorHandler.js      # Tratamento de erros
├── models/
│   ├── User.js              # Schema do usuário
│   ├── Module.js            # Schema dos módulos
│   └── Quiz.js              # Schema dos quizzes
├── routes/
│   ├── auth.routes.js       # Rotas de autenticação
│   ├── user.routes.js       # Rotas de usuários
│   ├── module.routes.js     # Rotas de módulos
│   ├── quiz.routes.js       # Rotas de quizzes
│   └── gamification.routes.js # Rotas de gamificação
├── services/
│   └── gamification.service.js # Lógica de gamificação
├── utils/
│   ├── constants.js         # Constantes da aplicação
│   ├── responseHelpers.js   # Helpers de resposta
│   └── seedData.js          # Dados para seed
├── validators/
│   └── custom.validators.js # Validadores customizados
└── app.js                   # Configuração do Express
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js (v14 ou superior)
- MongoDB Atlas ou MongoDB local
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/Daniel-Mingoranse/NoteMusic-BackEnd.git
cd NoteMusic-BackEnd
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3333
NODE_ENV=development
MONGODB_URI=sua_string_de_conexao_mongodb
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:8081
```

### 4. Popule o banco de dados (opcional)
```bash
npm run seed
```

### 5. Inicie o servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📚 API Endpoints

### 🔐 Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário

### 👤 Usuários
- `GET /api/users/profile` - Obter perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/progress` - Obter progresso do usuário
- `GET /api/users/ranking` - Obter ranking
- `GET /api/users/basic-info` - Informações básicas (público)

### 📖 Módulos
- `GET /api/modules` - Listar módulos (público)
- `GET /api/modules/categories` - Listar categorias (público)
- `GET /api/modules/:id` - Obter módulo específico
- `POST /api/modules/:id/complete` - Marcar módulo como completo

### 🧩 Quizzes
- `GET /api/quiz/:moduleId` - Obter quiz (público)
- `POST /api/quiz/:quizId/submit` - Submeter quiz (público)
- `GET /api/quiz/daily-challenge` - Desafio diário (público)
- `GET /api/quiz/history` - Histórico de quizzes (protegido)

### 🏆 Gamificação
- `GET /api/gamification/stats` - Estatísticas (público)
- `GET /api/gamification/achievements` - Conquistas (protegido)
- `GET /api/gamification/leaderboard` - Ranking (protegido)
- `GET /api/gamification/level-progress` - Progresso de nível (protegido)

## 🔒 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer <seu_jwt_token>
```

## 🎮 Sistema de Gamificação

### Níveis de Usuário
- **Aprendiz** - Nível inicial
- **Intermediário** - Nível médio
- **Avançado** - Nível expert

### Elementos Gamificados
- **Streak** - Dias consecutivos de estudo
- **Progresso** - Percentual de conclusão
- **Conquistas** - Badges por marcos alcançados
- **Ranking** - Classificação entre usuários
- **Pontos** - Sistema de pontuação por atividades

## 🧪 Testando a API

### Usuário de Teste (após seed)
- **Email:** `teste@notemusic.com`
- **Senha:** `senha123`

### Exemplo de uso com curl:
```bash
# Login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@notemusic.com","password":"senha123"}'

# Obter módulos (público)
curl http://localhost:3333/api/modules

# Obter perfil (protegido)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3333/api/users/profile
```

## 🔄 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com nodemon
- `npm run seed` - Popula o banco com dados de teste

## 🌐 Deploy

### Variáveis de Ambiente para Produção
Certifique-se de configurar todas as variáveis de ambiente necessárias:
- `PORT` - Porta do servidor
- `NODE_ENV=production`
- `MONGODB_URI` - String de conexão do MongoDB
- `JWT_SECRET` - Chave secreta para JWT
- `FRONTEND_URL` - URL do frontend em produção

### Plataformas Recomendadas
- [Render](https://render.com)
- [Railway](https://railway.app)
- [Heroku](https://heroku.com)
- [Vercel](https://vercel.com)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Daniel Mingoranse** - [GitHub](https://github.com/Daniel-Mingoranse)

## 🙏 Agradecimentos

- Comunidade Node.js
- MongoDB pela excelente documentação
- Todos os contribuidores de código aberto

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
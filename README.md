# NoteMusic Backend API

Backend completo para o aplicativo NoteMusic - Uma aplicação educacional de música gamificada com foco em música de orquestra e teoria musical avançada.

## 🎵 Sobre o Projeto

O NoteMusic Backend é uma API REST desenvolvida em Node.js que fornece toda a infraestrutura necessária para um aplicativo de ensino musical gamificado. A API gerencia autenticação de usuários, módulos educacionais, quizzes, sistema de gamificação e progresso do usuário, com ênfase especial em música de orquestra e teoria musical.

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
│   ├── auth.controller.js    # Autenticação e redefinição de senha
│   ├── user.controller.js    # Usuários
│   ├── module.controller.js  # Módulos educacionais
│   ├── quiz.controller.js    # Quizzes e desafios diários
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
│   └── seedData.js          # Dados para seed (expandido)
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

### 4. Popule o banco de dados
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
- `POST /api/auth/forgotpassword` - Solicitar redefinição de senha
- `POST /api/auth/changetemppassword` - Alterar senha temporária
- `GET /api/auth/me` - Obter usuário atual
- `PUT /api/auth/updatepassword` - Atualizar senha

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
- `GET /api/modules/next-recommended` - Próximo módulo recomendado

### 🧩 Quizzes
- `GET /api/quiz/:moduleId` - Obter quiz (público)
- `GET /api/quiz/:moduleId/private` - Obter quiz (protegido)
- `POST /api/quiz/:quizId/submit` - Submeter quiz (público)
- `POST /api/quiz/:quizId/submit/private` - Submeter quiz (protegido)
- `GET /api/quiz/daily-challenge` - Desafio diário (público)
- `GET /api/quiz/daily-challenge/private` - Desafio diário (protegido)
- `GET /api/quiz/history` - Histórico de quizzes (protegido)

### 🏆 Gamificação
- `GET /api/gamification/stats` - Estatísticas (público)
- `GET /api/gamification/stats/detailed` - Estatísticas detalhadas (protegido)
- `GET /api/gamification/achievements` - Conquistas (protegido)
- `GET /api/gamification/challenges` - Desafios personalizados (protegido)
- `GET /api/gamification/leaderboard` - Ranking (protegido)
- `GET /api/gamification/level-progress` - Progresso de nível (protegido)

## 🔒 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer <seu_jwt_token>
```

### 🔑 Sistema de Redefinição de Senha

O sistema implementa um método seguro de redefinição de senha:

1. **Solicitar redefinição**: `POST /api/auth/forgotpassword`
2. **Senha temporária**: Uma senha aleatória é gerada e enviada (em desenvolvimento, retornada na resposta)
3. **Login com senha temporária**: Usuário faz login com a senha temporária
4. **Alterar senha**: `POST /api/auth/changetemppassword` para definir nova senha permanente

**Nota**: Em produção, a senha temporária deve ser enviada por email.

## 🎮 Sistema de Gamificação

### Níveis de Usuário
- **Aprendiz** - Nível inicial (0-999 pontos)
- **Intermediário** - Nível médio (1000-2999 pontos)
- **Avançado** - Nível expert (3000+ pontos)

### Elementos Gamificados
- **Streak** - Dias consecutivos de estudo
- **Progresso** - Percentual de conclusão
- **Conquistas** - Badges por marcos alcançados
- **Ranking** - Classificação entre usuários
- **Pontos** - Sistema de pontuação por atividades
- **Desafios Diários** - Quizzes especiais com bônus de pontos

### 🎯 Desafios Diários

Os desafios diários são quizzes especiais que:
- Podem ser feitos apenas **uma vez por dia**
- Oferecem **bônus de 50 pontos** extras
- São **únicos para cada usuário** baseado em seu nível
- **Renovam automaticamente** a cada 24 horas
- **Bloqueiam tentativas múltiplas** no mesmo dia

## 🎵 Conteúdo Musical

### Categorias Disponíveis
1. **Propriedades do Som** - Frequência, timbre, intensidade, duração
2. **Escalas Maiores** - Estrutura, formação e aplicação
3. **Figuras Musicais** - Notas, valores e leitura musical
4. **Ritmos Ternários** - Compassos e divisões ternárias
5. **Compasso Simples** - Métrica e acentuação
6. **Andamento e Dinâmica** - Velocidade e intensidade
7. **Solfejo Básico** - Leitura e entoação musical
8. **Articulação Musical** - Técnicas de execução
9. **Intervalos Musicais** - Distâncias entre notas
10. **Expressão Musical** - Interpretação e sentimento
11. **Síncopa e Contratempo** - Ritmos sincopados
12. **Compasso Composto** - Compassos compostos

### 🎼 Foco em Música de Orquestra

O sistema inclui módulos específicos sobre:
- **Instrumentos de Cordas** - Violino, viola, violoncelo, contrabaixo
- **Instrumentos de Sopro** - Madeiras e metais
- **Orquestração** - Técnicas de arranjo orquestral
- **Análise Musical** - Forma, harmonia e estrutura
- **Harmonia Funcional** - Progressões e cadências

## 🧪 Testando a API

### Usuário de Teste (após seed)
- **Email:** `teste@notemusic.com`
- **Senha:** `senha123`

### Executar testes automatizados
```bash
node test-api.js
```

### Exemplo de uso com curl:
```bash
# Login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@notemusic.com","password":"senha123"}'

# Obter módulos (público)
curl http://localhost:3333/api/modules

# Obter desafio diário (público)
curl http://localhost:3333/api/quiz/daily-challenge

# Obter perfil (protegido)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3333/api/users/profile

# Solicitar redefinição de senha
curl -X POST http://localhost:3333/api/auth/forgotpassword \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@notemusic.com"}'
```

## 🔄 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com nodemon
- `npm run seed` - Popula o banco com dados de teste
- `node test-api.js` - Executa testes automatizados da API

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
- Músicos e educadores musicais que inspiraram este projeto

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
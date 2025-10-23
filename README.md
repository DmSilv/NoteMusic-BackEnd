# NoteMusic Backend - Reset de Banco de Dados

Este diretório contém o backend da aplicação NoteMusic, incluindo os novos scripts para gerenciar o conteúdo educacional do banco de dados.

## Como Usar o Script de Reset de Banco de Dados

O script `resetDatabase.js` permite limpar e recriar todo o conteúdo educacional (módulos e quizzes) da aplicação de maneira estruturada.

### Passo a passo para executar:

1. Certifique-se de que o MongoDB esteja rodando
2. Edite o arquivo `resetDatabase.js` e altere `CONFIRM_RESET` para `true`
3. Execute o script:

```bash
# No PowerShell
cd "Back End"
node scripts/resetDatabase.js

# No CMD
cd "Back End"
node scripts/resetDatabase.js

# Em sistemas Linux/Mac
cd "Back End"
node scripts/resetDatabase.js
```

### Importante:

- O script manterá os usuários existentes, mas resetará seu progresso
- Todos os módulos, quizzes e desafios diários serão recriados
- As perguntas são organizadas por níveis (aprendiz, virtuoso, maestro) e categorias

## Conteúdo Educacional

O novo conteúdo está estruturado em três níveis:

1. **Aprendiz**: Fundamentos da música (propriedades do som, notação básica)
2. **Virtuoso**: Conhecimentos intermediários (intervalos musicais)
3. **Maestro**: Conhecimentos avançados (harmonia avançada)

Cada módulo possui:
- Conteúdo teórico estruturado
- Exemplos práticos
- Quiz com perguntas de diferentes níveis de dificuldade
- Sistema de pontuação progressivo

## Sistema de Gamificação

Após o reset, o sistema de gamificação continuará funcionando com:
- Pontuação progressiva por questões corretas
- Bônus por desempenho excelente (acima de 90%)
- Bônus por streaks (dias consecutivos)
- Bônus para desafios diários
- Progresso por categorias e níveis
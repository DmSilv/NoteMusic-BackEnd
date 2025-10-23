# 🎵 Sistema de Conteúdo Musical - NoteMusic

## 📚 Visão Geral

Este sistema implementa conteúdo completo de teoria musical baseado no método CCB MTS (Conservatório de Música), com estrutura progressiva e perguntas lúdicas para facilitar o aprendizado.

## 🎯 Estrutura Pedagógica

### **Nível APRENDIZ** - Fundamentos
- Propriedades do Som
- Notas Musicais e Solfejo
- Figuras Musicais Básicas
- Compasso Simples 4/4

### **Nível VIRTUOSO** - Desenvolvimento
- Escalas Maiores - A Fórmula Mágica
- Intervalos Musicais
- Ritmos Ternários
- Dinâmica Musical

### **Nível MAESTRO** - Avançado
- Harmonia Básica - Acordes
- Síncopa e Contratempo
- Modos Gregos
- Forma Musical

## 🚀 Como Executar

### 1. População Básica
```bash
cd Back End/scripts
node runPopulation.js
```

### 2. População Completa
```bash
cd Back End/scripts
node runCompletePopulation.js
```

## 📊 Características das Perguntas

### ✨ Elementos Lúdicos
- **Emojis musicais** para engajamento visual
- **Metáforas do cotidiano** para facilitar compreensão
- **Analogias criativas** que conectam teoria e prática

### 🎯 Estratégias Pedagógicas
- **Progressão gradual**: Fácil → Médio → Difícil
- **Contexto prático**: Aplicação real dos conceitos
- **Dicas inteligentes**: Alternativas que ensinam
- **Explicações didáticas**: Aprendizado em cada resposta

### 📈 Sistema de Pontuação
- **Fácil**: 10 pontos
- **Médio**: 15 pontos
- **Difícil**: 20 pontos

## 🎼 Exemplos de Perguntas

### Nível Aprendiz - Propriedades do Som
```
🎵 Qual das propriedades do som determina se uma nota é grave ou aguda?

A) Timbre
B) Altura ✅
C) Intensidade
D) Duração

Explicação: A altura é a propriedade que determina se um som é grave (baixo) ou agudo (alto). 
É como a diferença entre a voz de um homem (grave) e de uma mulher (aguda).
```

### Nível Virtuoso - Escalas Maiores
```
🎹 Qual é a "fórmula mágica" das escalas maiores?

A) T-T-ST-T-T-T-ST ✅
B) ST-T-T-ST-T-T-T
C) T-ST-T-T-ST-T-T
D) T-T-T-ST-T-T-ST

Explicação: A fórmula T-T-ST-T-T-T-ST é o "DNA" de todas as escalas maiores. 
T = Tom, ST = Semitom. É como uma receita que sempre funciona!
```

## 🔧 Estrutura Técnica

### Arquivos Principais
- `completeMusicalContent.js` - Conteúdo completo
- `runCompletePopulation.js` - Script de execução
- `musicalContentData.js` - Dados básicos

### Modelos de Dados
- **Module**: Informações do módulo + conteúdo teórico
- **Quiz**: Perguntas + opções + explicações

### Configurações
- **Tempo limite**: 10 minutos por quiz
- **Pontuação mínima**: 70%
- **Tentativas**: 3 por quiz
- **Níveis**: 3 (Aprendiz, Virtuoso, Maestro)

## 📈 Métricas de Qualidade

### Perguntas por Quiz
- **Mínimo**: 5 perguntas
- **Máximo**: 10 perguntas
- **Média**: 7 perguntas

### Distribuição de Dificuldade
- **Fácil**: 40% das perguntas
- **Médio**: 40% das perguntas
- **Difícil**: 20% das perguntas

### Elementos Pedagógicos
- ✅ Explicações em todas as respostas
- ✅ Contexto prático
- ✅ Analogias musicais
- ✅ Progressão lógica
- ✅ Engajamento visual

## 🎯 Próximos Passos

1. **Expandir conteúdo** para níveis Virtuoso e Maestro
2. **Adicionar módulos** de harmonia avançada
3. **Implementar exercícios** práticos
4. **Criar sistema** de progressão gamificada
5. **Adicionar áudios** para exemplos musicais

## 📞 Suporte

Para dúvidas sobre o conteúdo musical ou implementação técnica, consulte:
- Documentação do método CCB MTS
- Referências de teoria musical
- Especialistas em pedagogia musical

---

**Desenvolvido com ❤️ para o aprendizado musical**




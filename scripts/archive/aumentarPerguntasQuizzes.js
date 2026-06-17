const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/Quiz');
const Module = require('../../src/models/Module');
const aprendizQuestions = require('../../perguntas_nivel_aprendiz.json');
const virtuosoQuestions = require('../../perguntas_nivel_virtuoso.json');

// ✅ METAS DE PERGUNTAS POR NÍVEL
const TARGET_QUESTIONS = {
  'aprendiz': 6,    // 5-6 perguntas
  'virtuoso': 8,    // 7-8 perguntas
  'maestro': 10     // 10+ perguntas
};

// ✅ MAPEAMENTO DE CATEGORIAS (slug → theme do JSON)
const categoryMapping = {
  'propriedades-som': 'PROPRIEDADES DO SOM',
  'escalas-maiores': 'ESCALAS',
  'figuras-musicais': 'NOTAÇÃO',
  'ritmo-ternarios': 'RITMO',
  'compasso-simples': 'COMPASSO',
  'andamento-dinamica': 'ANDAMENTO E DINÂMICA',
  'solfegio-basico': 'SOLFEGIO',
  'articulacao-musical': 'ARTICULAÇÃO',
  'intervalos-musicais': 'INTERVALOS',
  'expressao-musical': 'EXPRESSÃO',
  'sincopa-contratempo': 'SÍNCOPA E CONTRATEMPO',
  'compasso-composto': 'COMPASSO COMPOSTO'
};

// ✅ FUNÇÃO PARA CONVERTER PERGUNTA DO JSON PARA FORMATO DO QUIZ
function convertQuestionToQuizFormat(jsonQuestion) {
  const options = jsonQuestion.options.map((opt, index) => ({
    id: String.fromCharCode(65 + index), // A, B, C, D
    label: opt,
    isCorrect: index === jsonQuestion.correctAnswer,
    explanation: jsonQuestion.explanation || ''
  }));

  return {
    question: jsonQuestion.question,
    options: options,
    category: jsonQuestion.theme || jsonQuestion.module || 'GENERAL',
    difficulty: jsonQuestion.difficulty === 'aprendiz' ? 'facil' : 
                jsonQuestion.difficulty === 'virtuoso' ? 'medio' : 'dificil',
    points: 10
  };
}

// ✅ FUNÇÃO PARA BUSCAR PERGUNTAS DISPONÍVEIS POR CATEGORIA E NÍVEL
function getAvailableQuestions(level, category, excludeIds = []) {
  const questionsPool = level === 'aprendiz' ? aprendizQuestions.questions : virtuosoQuestions.questions;
  const categoryTheme = categoryMapping[category] || category.toUpperCase();
  
  // Filtrar perguntas por categoria/tema
  const available = questionsPool.filter(q => {
    const matchesCategory = q.theme === categoryTheme || 
                           q.module === categoryTheme ||
                           q.category === category ||
                           (q.theme && q.theme.includes(categoryTheme.split(' ')[0])) ||
                           (q.module && q.module.includes(categoryTheme.split(' ')[0]));
    
    const matchesLevel = q.difficulty === level || q.level === level;
    const notExcluded = !excludeIds.includes(q.id);
    
    return matchesCategory && matchesLevel && notExcluded;
  });

  return available;
}

// ✅ FUNÇÃO PARA VERIFICAR SE PERGUNTA JÁ EXISTE NO QUIZ
function questionAlreadyExists(quizQuestion, newQuestion) {
  // Comparar por texto da pergunta (normalizado)
  const existingText = quizQuestion.question.toLowerCase().trim();
  const newText = newQuestion.question.toLowerCase().trim();
  
  if (existingText === newText) return true;
  
  // Comparar por primeira palavra significativa (se muito similar)
  const existingWords = existingText.split(/\s+/).slice(0, 5).join(' ');
  const newWords = newText.split(/\s+/).slice(0, 5).join(' ');
  
  return existingWords === newWords;
}

// ✅ FUNÇÃO PRINCIPAL PARA AUMENTAR PERGUNTAS
async function aumentarPerguntasQuizzes() {
  try {
    console.log('🚀 AUMENTANDO QUANTIDADE DE PERGUNTAS NOS QUIZZES');
    console.log('='.repeat(80));
    
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    // Estatísticas
    const stats = {
      totalQuizzes: 0,
      quizzesProcessed: 0,
      quizzesUpdated: 0,
      questionsAdded: 0,
      quizzesSkipped: 0,
      errors: 0
    };

    // Buscar todos os quizzes ativos
    const quizzes = await Quiz.find({ isActive: true, type: 'module' })
      .populate('moduleId', 'category level');
    
    stats.totalQuizzes = quizzes.length;
    console.log(`📊 Total de quizzes encontrados: ${stats.totalQuizzes}\n`);

    // Processar cada quiz
    for (const quiz of quizzes) {
      try {
        const module = quiz.moduleId;
        if (!module) {
          console.log(`⚠️  Quiz "${quiz.title}" sem módulo associado - pulando`);
          stats.quizzesSkipped++;
          continue;
        }

        const level = quiz.level || module.level;
        const category = module.category;
        const targetCount = TARGET_QUESTIONS[level] || 6;
        const currentCount = quiz.questions.length;

        stats.quizzesProcessed++;
        
        console.log(`\n📝 Processando: ${quiz.title}`);
        console.log(`   Nível: ${level} | Categoria: ${category}`);
        console.log(`   Perguntas atuais: ${currentCount} | Meta: ${targetCount}`);

        // Se já tem perguntas suficientes, pular
        if (currentCount >= targetCount) {
          console.log(`   ✅ Já possui ${currentCount} perguntas (meta: ${targetCount})`);
          continue;
        }

        // Obter IDs das perguntas já existentes
        const existingQuestionIds = quiz.questions.map(q => q.id).filter(Boolean);
        
        // Buscar perguntas disponíveis
        const availableQuestions = getAvailableQuestions(level, category, existingQuestionIds);
        console.log(`   📚 Perguntas disponíveis no JSON: ${availableQuestions.length}`);

        if (availableQuestions.length === 0) {
          console.log(`   ⚠️  Nenhuma pergunta disponível no JSON para esta categoria/nível`);
          stats.quizzesSkipped++;
          continue;
        }

        // Filtrar perguntas que já existem (por texto)
        const questionsToAdd = [];
        const existingTexts = quiz.questions.map(q => q.question.toLowerCase().trim());
        
        for (const jsonQuestion of availableQuestions) {
          const newQuestion = convertQuestionToQuizFormat(jsonQuestion);
          const newText = newQuestion.question.toLowerCase().trim();
          
          // Verificar se já existe
          const isDuplicate = existingTexts.some(existingText => {
            // Comparação mais flexível
            const existingWords = existingText.split(/\s+/).slice(0, 5).join(' ');
            const newWords = newText.split(/\s+/).slice(0, 5).join(' ');
            return existingWords === newWords;
          });

          if (!isDuplicate) {
            questionsToAdd.push(newQuestion);
            existingTexts.push(newText); // Adicionar à lista para evitar duplicatas
            
            if (questionsToAdd.length + currentCount >= targetCount) {
              break; // Já temos o suficiente
            }
          }
        }

        const needed = targetCount - currentCount;
        const toAdd = questionsToAdd.slice(0, needed);
        
        if (toAdd.length === 0) {
          console.log(`   ⚠️  Não foi possível adicionar novas perguntas (todas são duplicadas ou não há disponíveis)`);
          stats.quizzesSkipped++;
          continue;
        }

        // Adicionar perguntas ao quiz
        quiz.questions.push(...toAdd);
        
        // Atualizar timeLimit baseado no número de perguntas
        quiz.timeLimit = Math.max(quiz.questions.length * 2 * 60, 180); // Mínimo 3 minutos
        
        // Salvar
        await quiz.save();
        
        stats.quizzesUpdated++;
        stats.questionsAdded += toAdd.length;
        
        console.log(`   ✅ Adicionadas ${toAdd.length} perguntas (total: ${quiz.questions.length})`);
        console.log(`   ⏱️  TimeLimit atualizado: ${quiz.timeLimit}s (${Math.round(quiz.timeLimit/60)} minutos)`);

      } catch (error) {
        console.error(`   ❌ Erro ao processar quiz "${quiz.title}":`, error.message);
        stats.errors++;
      }
    }

    // Relatório final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL');
    console.log('='.repeat(80));
    console.log(`   Total de quizzes: ${stats.totalQuizzes}`);
    console.log(`   Quizzes processados: ${stats.quizzesProcessed}`);
    console.log(`   Quizzes atualizados: ${stats.quizzesUpdated}`);
    console.log(`   Perguntas adicionadas: ${stats.questionsAdded}`);
    console.log(`   Quizzes pulados (já tinha meta): ${stats.quizzesSkipped}`);
    console.log(`   Erros: ${stats.errors}`);
    
    // Verificação final
    console.log('\n🔍 VERIFICAÇÃO POR NÍVEL:');
    for (const level of ['aprendiz', 'virtuoso', 'maestro']) {
      const quizzes = await Quiz.find({ level, isActive: true, type: 'module' });
      const avgQuestions = quizzes.reduce((sum, q) => sum + q.questions.length, 0) / quizzes.length || 0;
      const target = TARGET_QUESTIONS[level];
      
      console.log(`   ${level.toUpperCase()}: ${quizzes.length} quizzes | Média: ${avgQuestions.toFixed(1)} perguntas (meta: ${target})`);
    }

    console.log('\n✅ Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  aumentarPerguntasQuizzes()
    .then(() => {
      console.log('\n🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro ao executar script:', error);
      process.exit(1);
    });
}

module.exports = aumentarPerguntasQuizzes;


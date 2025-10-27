const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../src/models/Quiz');

// Conectar ao banco
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
};

// Validar todas as perguntas de teoria musical
const validateMusicQuestions = async () => {
  try {
    console.log('🔍 Validando todas as perguntas de teoria musical...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    // Definir as respostas corretas para verificação
    const correctAnswers = {
      // Propriedades do Som
      "Qual propriedade do som determina se uma nota é grave ou aguda?": "Altura",
      "O que diferencia o som de um violino e um piano tocando a mesma nota?": "Timbre",
      "Qual símbolo musical indica que uma nota deve ser tocada com pouca intensidade?": "p (piano)",
      "Qual figura musical representa a maior duração em um compasso simples?": "Semibreve",
      "O que significa o símbolo de crescendo (<) na partitura?": "Aumentar gradualmente a intensidade",
      
      // Notação Musical
      "Quantas linhas possui um pentagrama padrão?": "5 linhas",
      "Em uma partitura com clave de Sol, onde se localiza a nota Sol?": "Na segunda linha",
      "Quantos tempos vale uma mínima?": "2 tempos",
      "Qual figura musical representa a metade da duração de uma semínima?": "Colcheia",
      "O que indica a fração 4/4 no início de uma partitura?": "A fórmula de compasso",
      
      // Intervalos Musicais
      "Qual é o intervalo entre as notas Dó e Mi?": "3ª maior",
      "Qual intervalo é considerado 'consonância perfeita'?": "5ª justa",
      "Quantos tons tem um intervalo de 3ª menor?": "1,5 tons",
      "Qual é o intervalo entre as notas Fá e Si?": "4ª aumentada",
      "Na escala maior, qual é o intervalo formado entre o 1º e o 5º graus?": "5ª justa"
    };
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Validando quiz: ${quiz.title}`);
      
      // Para cada questão
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        
        // Limpar a pergunta para comparação (remover emojis e prefixos)
        const cleanQuestion = question.question
          .replace(/^[🎵🎶🎹🎼🎸🎺🥁🎻]/, '')
          .replace(/^Na teoria musical, /, '')
          .replace(/^De acordo com os princípios da música, /, '')
          .replace(/^Em termos de notação musical, /, '')
          .replace(/^Considerando os conceitos básicos, /, '')
          .replace(/^No contexto da harmonia musical, /, '')
          .replace(/^Analisando a estrutura musical, /, '')
          .trim();
        
        // Verificar se esta pergunta está em nossa lista de verificação
        let expectedAnswer = null;
        for (const [key, value] of Object.entries(correctAnswers)) {
          if (cleanQuestion.includes(key) || key.includes(cleanQuestion)) {
            expectedAnswer = value;
            break;
          }
        }
        
        if (expectedAnswer) {
          console.log(`\n📝 Questão ${i+1}: "${question.question}"`);
          
          // Verificar as opções
          const options = question.options;
          const correctOptionIndex = options.findIndex(opt => opt.isCorrect);
          
          if (correctOptionIndex === -1) {
            console.log('❌ Nenhuma opção marcada como correta');
            continue;
          }
          
          const correctOption = options[correctOptionIndex];
          console.log(`✅ Opção marcada como correta: "${correctOption.label}"`);
          
          // Verificar se a resposta correta contém o texto esperado
          const isExpectedAnswer = correctOption.label.toLowerCase().includes(expectedAnswer.toLowerCase());
          
          if (isExpectedAnswer) {
            console.log('✅ A resposta está correta conforme o esperado');
          } else {
            console.log(`⚠️ A resposta não parece ser a esperada. Esperava: "${expectedAnswer}"`);
            
            // Procurar a opção que contém o texto esperado
            const expectedOptionIndex = options.findIndex(opt => 
              opt.label.toLowerCase().includes(expectedAnswer.toLowerCase())
            );
            
            if (expectedOptionIndex !== -1) {
              console.log(`ℹ️ Opção com o texto esperado: "${options[expectedOptionIndex].label}"`);
            } else {
              console.log('❌ Nenhuma opção contém o texto esperado');
            }
          }
          
          // Verificar se a explicação está presente
          if (question.explanation && question.explanation.length > 30) {
            console.log('✅ Explicação está presente e detalhada');
          } else {
            console.log('⚠️ Explicação ausente ou muito curta');
          }
        }
      }
    }
    
    console.log('\n✅ Validação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao validar perguntas de teoria musical:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await validateMusicQuestions();
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();


























const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/Quiz');

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

// Corrigir as perguntas restantes de teoria musical
const fixRemainingMusicQuestions = async () => {
  try {
    console.log('🔧 Corrigindo perguntas restantes de teoria musical...');
    
    // Corrigir pergunta sobre a figura musical de maior duração
    await fixSemibreveQuestion();
    
    // Atualizar todas as explicações para garantir que sejam detalhadas
    await updateAllExplanations();
    
    console.log('✅ Correções concluídas!');
  } catch (error) {
    console.error('❌ Erro ao corrigir perguntas restantes:', error);
  }
};

// Corrigir a pergunta sobre a semibreve
const fixSemibreveQuestion = async () => {
  try {
    console.log('\n🔍 Procurando pergunta sobre figura musical de maior duração...');
    
    // Buscar quizzes de figuras musicais ou propriedades do som
    const quizzes = await Quiz.find({ 
      title: { $regex: /propriedades|figura|musical/i }
    });
    
    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz relacionado encontrado');
      return;
    }
    
    console.log(`📊 Encontrados ${quizzes.length} quizzes potenciais`);
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Analisando quiz: ${quiz.title}`);
      
      // Procurar a pergunta sobre figura musical de maior duração
      const figuraQuestionIndex = quiz.questions.findIndex(q => 
        q.question.toLowerCase().includes('figura musical') && 
        q.question.toLowerCase().includes('maior duração')
      );
      
      if (figuraQuestionIndex === -1) {
        console.log('❌ Pergunta sobre figura musical de maior duração não encontrada neste quiz');
        continue;
      }
      
      const question = quiz.questions[figuraQuestionIndex];
      console.log(`✅ Pergunta encontrada: "${question.question}"`);
      
      // Verificar as opções
      console.log('📋 Opções atuais:');
      question.options.forEach((opt, i) => {
        console.log(`   ${i+1}. ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
      });
      
      // Procurar a opção "semibreve"
      const semibreveIndex = question.options.findIndex(opt => 
        opt.label.toLowerCase().includes('semibreve')
      );
      
      if (semibreveIndex === -1) {
        console.log('❌ Opção "semibreve" não encontrada');
        continue;
      }
      
      // Verificar se a opção "semibreve" já está marcada como correta
      if (question.options[semibreveIndex].isCorrect) {
        console.log('✅ Opção "semibreve" já está correta');
      } else {
        console.log('🔧 Marcando opção "semibreve" como correta');
        
        // Marcar "semibreve" como correta
        quiz.questions[figuraQuestionIndex].options[semibreveIndex].isCorrect = true;
        
        // Marcar as outras como incorretas
        for (let i = 0; i < question.options.length; i++) {
          if (i !== semibreveIndex) {
            quiz.questions[figuraQuestionIndex].options[i].isCorrect = false;
          }
        }
        
        await quiz.save();
        console.log('✅ Opção "semibreve" marcada como correta');
      }
      
      // Atualizar a explicação
      quiz.questions[figuraQuestionIndex].explanation = 
        "A semibreve (whole note) é a figura musical de maior duração no sistema moderno de notação musical, valendo 4 tempos em um compasso quaternário (4/4). As demais figuras são subdivisões dela: mínima (2 tempos), semínima (1 tempo), colcheia (1/2 tempo), semicolcheia (1/4 tempo), fusa (1/8 tempo) e semifusa (1/16 tempo).";
      
      await quiz.save();
      console.log('✅ Explicação atualizada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir pergunta sobre semibreve:', error);
  }
};

// Atualizar todas as explicações para garantir que sejam detalhadas
const updateAllExplanations = async () => {
  try {
    console.log('\n🔍 Atualizando todas as explicações...');
    
    // Definir explicações detalhadas para perguntas comuns
    const detailedExplanations = {
      // Propriedades do Som
      "Qual propriedade do som determina se uma nota é grave ou aguda?": 
        "A altura (pitch) é a propriedade acústica relacionada à frequência das ondas sonoras. Quanto maior a frequência, mais agudo é o som; quanto menor, mais grave. É medida em Hertz (Hz). Por exemplo, a nota Lá 440Hz é o padrão de afinação para orquestras.",
      
      "O que diferencia o som de um violino e um piano tocando a mesma nota?": 
        "O timbre é a qualidade sonora que permite distinguir sons da mesma altura e intensidade produzidos por fontes diferentes. É determinado pelos harmônicos (frequências secundárias) que acompanham a frequência fundamental. Cada instrumento possui um envelope sonoro único com ataque, sustentação e decaimento característicos.",
      
      "Qual símbolo musical indica que uma nota deve ser tocada com pouca intensidade?": 
        "Na notação musical, 'p' (piano) indica que o som deve ser executado com baixa intensidade. A escala completa de dinâmicas vai de ppp (pianississimo - extremamente suave) a fff (fortississimo - extremamente forte). Estas indicações italianas são universalmente utilizadas na música ocidental desde o período barroco.",
      
      "O que significa o símbolo de crescendo (<) na partitura?": 
        "O crescendo (<) é uma indicação de dinâmica que orienta o músico a aumentar gradualmente a intensidade do som durante o trecho marcado. Seu oposto é o diminuendo ou decrescendo (>), que indica redução gradual da intensidade. Estas indicações são essenciais para a expressividade musical, permitindo nuances na interpretação.",
      
      // Notação Musical
      "Quantas linhas possui um pentagrama padrão?": 
        "O pentagrama (staff) padrão consiste em exatamente 5 linhas horizontais equidistantes e 4 espaços entre elas. É neste sistema que as notas musicais são escritas, tanto nas linhas quanto nos espaços. Quando necessário, podem ser adicionadas linhas suplementares acima ou abaixo do pentagrama para acomodar notas mais agudas ou graves.",
      
      "Quantos tempos vale uma mínima?": 
        "A mínima (half note) vale 2 tempos em um compasso simples. Representa metade da duração de uma semibreve (4 tempos) e o dobro de uma semínima (1 tempo). É representada por uma nota com cabeça branca e haste. Em compassos compostos, como 6/8, seu valor relativo se mantém, mas a unidade de tempo muda.",
      
      "O que indica a fração 4/4 no início de uma partitura?": 
        "A fração 4/4 indica a fórmula de compasso (time signature). O numerador (4) representa o número de unidades de tempo por compasso, e o denominador (4) indica que a semínima é a unidade de tempo. Também conhecido como compasso quaternário simples ou 'common time', pode ser representado pelo símbolo C. É o compasso mais utilizado na música ocidental.",
      
      // Intervalos Musicais
      "Qual é o intervalo entre as notas Dó e Mi?": 
        "O intervalo entre Dó e Mi é uma 3ª maior, abrangendo 2 tons (ou 4 semitons). Na teoria musical ocidental, a 3ª maior é um dos intervalos fundamentais para a construção de acordes maiores. Este intervalo tem uma qualidade sonora brilhante e estável, sendo a base da sonoridade dos acordes maiores que transmitem sensações de alegria ou resolução.",
      
      "Qual intervalo é considerado 'consonância perfeita'?": 
        "Na teoria tradicional, os intervalos de uníssono, 4ª justa, 5ª justa e oitava são considerados consonâncias perfeitas. A 5ª justa (7 semitons) é especialmente importante na música ocidental, sendo a base do ciclo de quintas e da relação entre tônica e dominante. As consonâncias perfeitas têm uma estabilidade acústica devido à proporção simples entre as frequências das notas.",
      
      "Quantos tons tem um intervalo de 3ª menor?": 
        "Um intervalo de 3ª menor contém 1,5 tons (ou 3 semitons). Exemplos incluem Lá-Dó, Mi-Sol e Si-Ré. A 3ª menor é fundamental para a construção de acordes menores e para definir o modo menor. Este intervalo possui uma qualidade sonora mais melancólica ou introspectiva em comparação com a 3ª maior, sendo essencial para expressar emoções como tristeza ou nostalgia na música."
    };
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    
    let questionsUpdated = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Atualizando explicações no quiz: ${quiz.title}`);
      let quizModified = false;
      
      // Para cada questão
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        
        // Verificar se a explicação é curta ou ausente
        if (!question.explanation || question.explanation.length < 30) {
          console.log(`📝 Questão sem explicação detalhada: "${question.question.substring(0, 40)}..."`);
          
          // Procurar uma explicação detalhada para esta pergunta
          let foundExplanation = false;
          for (const [key, value] of Object.entries(detailedExplanations)) {
            if (question.question.toLowerCase().includes(key.toLowerCase()) || 
                key.toLowerCase().includes(question.question.toLowerCase())) {
              quiz.questions[i].explanation = value;
              foundExplanation = true;
              questionsUpdated++;
              quizModified = true;
              console.log('✅ Explicação atualizada');
              break;
            }
          }
          
          if (!foundExplanation) {
            console.log('⚠️ Não foi encontrada uma explicação detalhada para esta pergunta');
          }
        }
      }
      
      // Salvar o quiz se foi modificado
      if (quizModified) {
        await quiz.save();
        console.log(`✅ Quiz ${quiz.title} atualizado com explicações detalhadas`);
      }
    }
    
    console.log(`\n📊 Total de explicações atualizadas: ${questionsUpdated}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar explicações:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await fixRemainingMusicQuestions();
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();






























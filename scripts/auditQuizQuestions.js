/**
 * Auditoria completa de perguntas de quiz — somente leitura.
 * Uso: node scripts/auditQuizQuestions.js [--json]
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../src/models/module.model');
const Quiz = require('../src/models/quiz.model');
const { modulesData, quizQuestionsData, dailyChallengeQuestions } = require('../src/utils/seedData');

const QUESTIONS_PER_QUIZ = 3;
const DAILY_CHALLENGE_LIMIT = 5;

function normalizeText(s) {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getCorrectOption(q) {
  const correct = q.options.filter((o) => o.isCorrect);
  return correct;
}

function auditQuestionIntegrity(q, ctx) {
  const issues = [];
  const correct = getCorrectOption(q);

  if (!q.question || !q.question.trim()) {
    issues.push({ type: 'INTEGRIDADE', msg: 'Pergunta vazia' });
  }
  if (!q.options || q.options.length < 2) {
    issues.push({ type: 'INTEGRIDADE', msg: 'Menos de 2 alternativas' });
  }
  if (correct.length === 0) {
    issues.push({ type: 'CORRIGIR RESPOSTA', msg: 'Nenhuma alternativa marcada como correta' });
  } else if (correct.length > 1) {
    issues.push({
      type: 'CORRIGIR RESPOSTA',
      msg: `${correct.length} alternativas marcadas como corretas: ${correct.map((c) => c.id).join(', ')}`,
    });
  }
  if (q.options?.some((o) => !o.label || !o.label.trim())) {
    issues.push({ type: 'INTEGRIDADE', msg: 'Alternativa com label vazio' });
  }

  return issues.map((i) => ({ ...i, ...ctx }));
}

function classifyPedagogical(q, moduleLevel, moduleTitle) {
  const issues = [];
  const text = normalizeText(q.question);

  // Duplicatas globais tratadas fora
  if (q.difficulty === 'dificil' && moduleLevel === 'aprendiz') {
    issues.push({
      type: 'REVISAR NÍVEL',
      msg: `Dificuldade "dificil" em módulo aprendiz`,
      suggestion: 'Ajustar difficulty para facil/medio ou mover para virtuoso/maestro',
    });
  }
  if (q.difficulty === 'facil' && moduleLevel === 'maestro') {
    issues.push({
      type: 'REVISAR NÍVEL',
      msg: `Dificuldade "facil" em módulo maestro`,
      suggestion: 'Considerar dificil ou reformular para conteúdo avançado',
    });
  }

  // Ambiguidade conhecida
  if (text.includes('qual destes intervalos é considerado consonante')) {
    issues.push({
      type: 'REFORMULAR PERGUNTA',
      msg: 'Várias alternativas são consonantes (terça, quarta, quinta, sexta, oitava)',
      suggestion:
        'Especificar: "Qual destes intervalos é uma terça consonante?" ou usar "Qual intervalo NÃO é dissonante?"',
      suggestedQuestion: 'Qual destes intervalos é uma terça consonante na música tonal?',
      suggestedOptions: [
        { id: 'A', label: 'Segunda menor', isCorrect: false },
        { id: 'B', label: 'Terça maior', isCorrect: true },
        { id: 'C', label: 'Sétima menor', isCorrect: false },
        { id: 'D', label: 'Segunda aumentada', isCorrect: false },
      ],
    });
  }

  if (moduleTitle?.includes('Cadências') && moduleLevel === 'aprendiz') {
    issues.push({
      type: 'REVISAR NÍVEL',
      msg: 'Cadências harmônicas são conteúdo intermediário/avançado para nível aprendiz',
      suggestion: 'Mover módulo/quiz para virtuoso ou simplificar perguntas',
    });
  }

  if (moduleTitle?.includes('Tríades') && moduleLevel === 'aprendiz') {
    issues.push({
      type: 'REVISAR NÍVEL',
      msg: 'Tríades em nível aprendiz — aceitável como intro, mas duplica quiz virtuoso',
      suggestion: 'Diferenciar perguntas do módulo virtuoso ou fundir módulos',
    });
  }

  if (moduleTitle?.includes('Sustenido') && q.category === 'figuras-musicais') {
    // moduleTitles alias wrong - not a question issue
  }

  return issues.map((i) => ({ ...i, question: q.question }));
}

async function auditSourceData() {
  const inventory = [];
  const allIssues = [];
  const questionTexts = new Map();

  for (const set of quizQuestionsData) {
    const quizTitle = `Quiz - ${set.moduleTitle}`;
    set.questions.forEach((q, idx) => {
      const id = `${set.moduleTitle}::${idx}`;
      const correct = q.options.find((o) => o.isCorrect);
      const obs = [];

      const norm = normalizeText(q.question);
      if (questionTexts.has(norm)) {
        const prev = questionTexts.get(norm);
        obs.push(`DUPLICATA de "${prev.moduleTitle}" (${prev.level})`);
        allIssues.push({
          type: 'REMOVER OU SUBSTITUIR',
          module: set.moduleTitle,
          quiz: quizTitle,
          level: set.level,
          questionIndex: idx,
          question: q.question,
          msg: `Pergunta duplicada (também em ${prev.moduleTitle} / ${prev.level})`,
          suggestion: 'Substituir por pergunta nova no módulo secundário mantendo limite de 3',
        });
      } else {
        questionTexts.set(norm, { moduleTitle: set.moduleTitle, level: set.level });
      }

      const integrity = auditQuestionIntegrity(q, {
        source: 'seed',
        module: set.moduleTitle,
        quiz: quizTitle,
        level: set.level,
        questionIndex: idx,
        question: q.question,
      });
      allIssues.push(...integrity);

      const ped = classifyPedagogical(q, set.level, set.moduleTitle);
      ped.forEach((p) =>
        allIssues.push({
          ...p,
          module: set.moduleTitle,
          quiz: quizTitle,
          level: set.level,
          questionIndex: idx,
        })
      );

      inventory.push({
        modulo: set.moduleTitle,
        quiz: quizTitle,
        nivel: set.level,
        id: id,
        pergunta: q.question,
        alternativas: q.options.map((o) => `${o.id}) ${o.label}${o.isCorrect ? ' ✓' : ''}`),
        respostaCorreta: correct ? `${correct.id}) ${correct.label}` : 'NENHUMA',
        dificuldade: q.difficulty,
        pontos: q.points,
        observacao: obs.join('; ') || '—',
      });
    });
  }

  // Level mismatches seed vs quiz data
  for (const set of quizQuestionsData) {
    const mod = modulesData.find((m) => m.title === set.moduleTitle);
    if (mod && mod.level !== set.level) {
      allIssues.push({
        type: 'REVISAR NÍVEL',
        module: set.moduleTitle,
        quiz: `Quiz - ${set.moduleTitle}`,
        level: set.level,
        msg: `quizQuestionsData.level="${set.level}" mas seedData.level="${mod.level}" — seed.js NÃO vincula este quiz`,
        suggestion: `Alinhar level em quizQuestionsData para "${mod.level}" ou renomear módulo`,
      });
    }
  }

  // Orphan quiz sets (not in seed modules)
  for (const set of quizQuestionsData) {
    const mod = modulesData.find((m) => m.title === set.moduleTitle);
    if (!mod) {
      allIssues.push({
        type: 'REVISAR NÍVEL',
        module: set.moduleTitle,
        level: set.level,
        msg: 'Conjunto de perguntas sem módulo correspondente em seedData (só via aliases no banco expandido)',
        suggestion: 'Adicionar ao seedData ou garantir módulo no banco com alias',
      });
    }
  }

  return { inventory, allIssues, questionTexts };
}

async function auditDatabase() {
  const dbInventory = [];
  const dbIssues = [];

  const modules = await Module.find({}).sort({ level: 1, order: 1 }).lean();
  const quizzes = await Quiz.find({ type: { $in: ['module', 'daily-challenge'] } }).lean();

  for (const quiz of quizzes) {
    const mod = modules.find((m) => String(m._id) === String(quiz.moduleId));
    const moduleTitle = mod?.title || '(módulo não encontrado)';
    const moduleLevel = mod?.level || quiz.level;

    if (quiz.questions.length !== QUESTIONS_PER_QUIZ && quiz.type === 'module') {
      dbIssues.push({
        type: 'REVISAR NÍVEL',
        module: moduleTitle,
        quiz: quiz.title,
        level: quiz.level,
        msg: `Quiz tem ${quiz.questions.length} perguntas (esperado ${QUESTIONS_PER_QUIZ} no padrão do app)`,
      });
    }

    if (mod && mod.level !== quiz.level) {
      dbIssues.push({
        type: 'REVISAR NÍVEL',
        module: moduleTitle,
        quiz: quiz.title,
        level: quiz.level,
        msg: `Nível do quiz (${quiz.level}) difere do módulo (${mod.level})`,
      });
    }

    quiz.questions.forEach((q, idx) => {
      const integrity = auditQuestionIntegrity(q, {
        source: 'db',
        module: moduleTitle,
        quiz: quiz.title,
        level: quiz.level,
        questionIndex: idx,
        question: q.question,
        quizId: String(quiz._id),
      });
      dbIssues.push(...integrity);

      const correct = q.options.find((o) => o.isCorrect);
      dbInventory.push({
        modulo: moduleTitle,
        quiz: quiz.title,
        nivel: quiz.level,
        id: `${quiz._id}::${idx}`,
        pergunta: q.question,
        alternativas: q.options.map((o) => `${o.id}) ${o.label}${o.isCorrect ? ' ✓' : ''}`),
        respostaCorreta: correct ? `${correct.id}) ${correct.label}` : 'NENHUMA',
        dificuldade: q.difficulty,
        pontos: q.points,
        observacao: mod?.level !== quiz.level ? 'nível quiz ≠ módulo' : '—',
      });
    });
  }

  // Modules without proper quiz
  for (const mod of modules) {
    const quiz = quizzes.find((q) => String(q.moduleId) === String(mod._id) && q.type === 'module');
    if (!quiz) {
      dbIssues.push({
        type: 'INTEGRIDADE',
        module: mod.title,
        level: mod.level,
        msg: 'Módulo sem quiz vinculado',
      });
    } else if (
      quiz.questions.some((q) => q.question.includes('Qual é o tema principal do módulo'))
    ) {
      dbIssues.push({
        type: 'REMOVER OU SUBSTITUIR',
        module: mod.title,
        quiz: quiz.title,
        level: mod.level,
        msg: 'Quiz auto-gerado (fallback do seed) — perguntas genéricas, não pedagógicas',
        suggestion: 'Corrigir level mismatch em quizQuestionsData e rodar updateQuizContent.js',
      });
    }
  }

  return { dbInventory, dbIssues, moduleCount: modules.length, quizCount: quizzes.length };
}

async function main() {
  const jsonOut = process.argv.includes('--json');

  const { inventory, allIssues } = await auditSourceData();

  let dbResult = null;
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic', {
      serverSelectionTimeoutMS: 5000,
    });
    dbResult = await auditDatabase();
    await mongoose.disconnect();
  } catch (e) {
    console.warn('⚠️ Banco indisponível — relatório baseado apenas em quizQuestionsData.js\n');
  }

  const summary = {
    fase1: {
      colecoes: ['modules', 'quizzes', 'users', 'quizattempts'],
      estrutura: 'questions[] embarcado em Quiz; options[].isCorrect; validação por índice 0-based',
      limitePadrao: `${QUESTIONS_PER_QUIZ} perguntas/quiz módulo; ${DAILY_CHALLENGE_LIMIT} no daily challenge`,
      fonteCanonica: 'src/utils/quizQuestionsData.js',
    },
    fase2: {
      totalPerguntasFonte: inventory.length,
      totalConjuntos: quizQuestionsData.length,
      modulosSeed: modulesData.length,
    },
    fase4: {
      porTipo: {},
      itens: [...allIssues, ...(dbResult?.dbIssues || [])],
    },
  };

  for (const item of summary.fase4.itens) {
    summary.fase4.porTipo[item.type] = (summary.fase4.porTipo[item.type] || 0) + 1;
  }

  const okCount =
    inventory.length -
    new Set(
      allIssues
        .filter((i) => i.questionIndex !== undefined)
        .map((i) => `${i.module}::${i.questionIndex}`)
    ).size;

  if (jsonOut) {
    console.log(
      JSON.stringify({ summary, inventory, dbInventory: dbResult?.dbInventory, issues: summary.fase4.itens }, null, 2)
    );
    return;
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  AUDITORIA DE QUIZ — NoteMusic (Fases 1–4, somente leitura)');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('## FASE 1 — Estrutura\n');
  console.log('- Coleções: modules, quizzes (questions embarcadas), users, quizattempts');
  console.log('- Resposta correta: options[].isCorrect (API valida por índice numérico)');
  console.log('- Níveis: aprendiz | virtuoso | maestro');
  console.log('- Limite pedagógico: 3 perguntas/quiz módulo; 5 no daily challenge');
  console.log('- Fonte canônica: src/utils/quizQuestionsData.js');
  console.log('- Seed: scripts/seed/seed.js + scripts/updateQuizContent.js\n');

  if (dbResult) {
    console.log(`📊 Banco: ${dbResult.moduleCount} módulos, ${dbResult.quizCount} quizzes\n`);
  }

  console.log('## FASE 2 — Inventário (fonte canônica)\n');
  console.log(`Total: ${inventory.length} perguntas em ${quizQuestionsData.length} conjuntos\n`);

  let currentModule = '';
  inventory.forEach((item) => {
    if (item.modulo !== currentModule) {
      currentModule = item.modulo;
      console.log(`\n── Módulo: ${item.modulo} (${item.nivel}) ──`);
    }
    console.log(`  [${item.id}] ${item.pergunta}`);
    console.log(`    Alt: ${item.alternativas.join(' | ')}`);
    console.log(`    Correta: ${item.respostaCorreta}`);
    if (item.observacao !== '—') console.log(`    ⚠ ${item.observacao}`);
  });

  console.log('\n\n## FASE 4 — Relatório de problemas (ANTES de corrigir)\n');
  const grouped = {};
  for (const issue of summary.fase4.itens) {
    if (!grouped[issue.type]) grouped[issue.type] = [];
    grouped[issue.type].push(issue);
  }

  for (const [type, items] of Object.entries(grouped)) {
    console.log(`\n### ${type} (${items.length})\n`);
    items.forEach((it, i) => {
      console.log(`${i + 1}. [${it.module || '?'}] ${it.question ? `"${it.question.slice(0, 60)}..."` : ''}`);
      console.log(`   Problema: ${it.msg}`);
      if (it.suggestion) console.log(`   Sugestão: ${it.suggestion}`);
      if (it.suggestedQuestion) console.log(`   Nova pergunta: ${it.suggestedQuestion}`);
    });
  }

  console.log('\n\n## Resumo quantitativo\n');
  console.log(`Perguntas na fonte: ${inventory.length}`);
  console.log(`Estimativa OK (sem issue): ~${Math.max(0, okCount)}`);
  Object.entries(summary.fase4.porTipo).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  console.log('\n## FASE 5 — Limite de perguntas\n');
  console.log(`- Padrão do app: ${QUESTIONS_PER_QUIZ} perguntas por quiz de módulo`);
  console.log(`- Daily challenge: ${DAILY_CHALLENGE_LIMIT} perguntas fixas`);
  console.log('- Ao corrigir: substituir in-place, não aumentar quantidade\n');

  console.log('## Próximo passo (Fase 6 — aguardando sua aprovação)\n');
  console.log('1. Corrigir level mismatch (Modulação, Compasso Composto)');
  console.log('2. Substituir perguntas duplicadas nos módulos extras');
  console.log('3. Reformular pergunta de intervalos consonantes');
  console.log('4. Revisar nível de Cadências e Tríades (aprendiz)');
  console.log('5. Rodar: node scripts/updateQuizContent.js\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

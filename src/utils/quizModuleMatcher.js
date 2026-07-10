/**
 * Localiza módulo no banco ou lista em memória para vincular quizQuestionsData.
 * Suporta moduleTitle, moduleTitles (aliases) e moduleLevels (níveis alternativos).
 */
function getSearchTitles(quizData) {
  return [quizData.moduleTitle, ...(quizData.moduleTitles || [])].filter(Boolean);
}

function getSearchLevels(quizData) {
  return [quizData.level, ...(quizData.moduleLevels || [])].filter(Boolean);
}

function findModuleInList(modules, quizData) {
  const titles = getSearchTitles(quizData);
  const levels = getSearchLevels(quizData);

  for (const title of titles) {
    for (const level of levels) {
      const found = modules.find((m) => m.title === title && m.level === level);
      if (found) {
        return { module: found, matchedTitle: title };
      }
    }
  }

  for (const title of titles) {
    const found = modules.find((m) => m.title === title);
    if (found) {
      return { module: found, matchedTitle: title };
    }
  }

  return null;
}

async function findModuleInDb(Module, quizData) {
  const titles = getSearchTitles(quizData);
  const levels = getSearchLevels(quizData);

  for (const title of titles) {
    for (const level of levels) {
      const module = await Module.findOne({ title, level });
      if (module) {
        return { module, matchedTitle: title };
      }
    }
  }

  for (const title of titles) {
    const module = await Module.findOne({ title });
    if (module) {
      return { module, matchedTitle: title };
    }
  }

  return null;
}

module.exports = {
  getSearchTitles,
  getSearchLevels,
  findModuleInList,
  findModuleInDb,
};

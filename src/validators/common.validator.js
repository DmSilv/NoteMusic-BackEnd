const INAPPROPRIATE_WORDS = [
  'porra', 'merda', 'caralho', 'puta', 'fdp', 'pqp', 'vsf', 'krl', 'crl',
  'cu', 'bosta', 'buceta', 'pica', 'pau', 'viado', 'bicha', 'puto',
  'idiota', 'burro', 'babaca', 'imbecil', 'cretino', 'otario', 'otário',
  'vagabundo', 'safado', 'desgraça', 'desgraca', 'lixo',
  'sexo', 'porn', 'xxx', 'nude', 'pelad',
  'maconha', 'cocaina', 'crack', 'droga',
  'fuck', 'shit', 'bitch', 'ass', 'dick', 'cock', 'damn',
  'admin', 'teste', 'test', 'null', 'undefined',
];

// Valida apenas o formato do domínio (não restringe a uma lista fixa de
// provedores). Uma whitelist rejeitava e-mails reais e válidos (ex.:
// nome@empresa.com.br, nome@vivo.com.br) só por não estarem na lista, o que
// não é um critério confiável — express-validator já garante o formato do
// e-mail via .isEmail() antes deste check rodar.
const isValidEmailDomain = (email) => {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;

  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(domain);
};

const isRespectfulName = (name) => {
  const nameLower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  return !INAPPROPRIATE_WORDS.some((word) => {
    const wordPattern = new RegExp(`\\b${word}\\b|${word}`, 'i');
    return wordPattern.test(nameLower);
  });
};

module.exports = {
  INAPPROPRIATE_WORDS,
  isValidEmailDomain,
  isRespectfulName,
};

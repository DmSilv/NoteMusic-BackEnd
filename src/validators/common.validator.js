const VALID_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'yahoo.com.br',
  'ymail.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'proton.me',
  'aol.com',
  'zoho.com',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'edu',
  'edu.br',
  'ac.uk',
  'edu.au',
];

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

const isValidEmailDomain = (email) => {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;

  return VALID_EMAIL_DOMAINS.some((validDomain) => (
    domain === validDomain || domain.endsWith(`.${validDomain}`)
  ));
};

const isRespectfulName = (name) => {
  const nameLower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  return !INAPPROPRIATE_WORDS.some((word) => {
    const wordPattern = new RegExp(`\\b${word}\\b|${word}`, 'i');
    return wordPattern.test(nameLower);
  });
};

module.exports = {
  VALID_EMAIL_DOMAINS,
  INAPPROPRIATE_WORDS,
  isValidEmailDomain,
  isRespectfulName,
};

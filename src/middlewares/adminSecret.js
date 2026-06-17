/**
 * Exige header x-admin-secret para rotas administrativas.
 * Em produção, ADMIN_SECRET é obrigatório.
 */
const requireAdminSecret = (req, res, next) => {
  const secret = req.headers['x-admin-secret'] || req.body?.secret;
  const expected = process.env.ADMIN_SECRET || process.env.CACHE_CLEAR_SECRET;

  if (process.env.NODE_ENV === 'production' && !expected) {
    return res.status(503).json({
      success: false,
      message: 'ADMIN_SECRET não configurado no servidor',
    });
  }

  if (!expected) {
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Acesso negado',
    });
  }

  if (secret !== expected) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Secret inválido.',
    });
  }

  next();
};

module.exports = requireAdminSecret;

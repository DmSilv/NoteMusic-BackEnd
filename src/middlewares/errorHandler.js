const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro no console para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Erro de Mongoose - ID inválido
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado';
    error = { message, statusCode: 404 };
  }

  // Erro de Mongoose - Duplicação
  if (err.code === 11000 || err?.cause?.code === 11000) {
    const keyValue = err.keyValue || err?.cause?.keyValue || {};
    const fields = Object.keys(keyValue);
    // Índice composto type+dailyChallengeDate: mensagem genérica de "type" confundia
    if (fields.includes('dailyChallengeDate') || fields.includes('type')) {
      error = {
        message: 'Desafio diário já existe para esta data',
        statusCode: 409
      };
    } else {
      const field = fields[0] || 'campo';
      error = { message: `Este ${field} já está em uso`, statusCode: 400 };
    }
  }

  // Erro de Mongoose - Validação
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = { message, statusCode: 401 };
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erro no servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
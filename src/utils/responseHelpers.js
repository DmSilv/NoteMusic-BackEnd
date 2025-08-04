// Helpers para respostas padronizadas

exports.successResponse = (res, data, message = 'Operação realizada com sucesso', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

exports.errorResponse = (res, message = 'Erro ao processar requisição', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

exports.validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Erro de validação',
    errors: errors.array ? errors.array() : errors
  });
};

exports.paginatedResponse = (res, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return res.json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};
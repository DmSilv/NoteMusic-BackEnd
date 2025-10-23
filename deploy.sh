#!/bin/bash

# Script de Deploy Automático - NoteMusic Backend
# Para usar com Render.com, Railway, ou Vercel

echo "🚀 Iniciando deploy do NoteMusic Backend..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado. Execute este script no diretório Back End"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --production

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  Aviso: MONGODB_URI não configurado"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  Aviso: JWT_SECRET não configurado"
fi

# Executar testes (se existirem)
if [ -f "test.js" ] || [ -d "tests" ]; then
    echo "🧪 Executando testes..."
    npm test || echo "⚠️  Testes falharam, mas continuando o deploy..."
fi

# Iniciar aplicação
echo "🎵 Iniciando NoteMusic Backend..."
npm start














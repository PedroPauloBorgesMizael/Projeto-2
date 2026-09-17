#!/bin/sh
set -e

echo "==> Executando migrations do banco de dados com Prisma..."
npx prisma migrate deploy

echo "==> Iniciando o servidor HelpHome API..."
exec "$@"

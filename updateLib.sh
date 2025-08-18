#!/bin/bash

set -e  # Para o script em qualquer erro

LIB_PATH="node_modules/@datamize-io/bitrix-lib-node"

if [ -d "$LIB_PATH" ]; then
  echo "📦 Entrando na lib bitrix-lib-node para build..."
  cd "$LIB_PATH"
  tsc
  echo "✅ Setup finalizado com sucesso."
else
  echo "⚠️  A pasta $LIB_PATH não existe. Pulando build."
fi
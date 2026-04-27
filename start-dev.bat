@echo off
REM Abre o backend em uma janela separada
start "API - Família Financeira" cmd /k "cd /d C:\projetos\familia-financeira\backend\api && npm run start:dev"

REM Abre o frontend em outra janela separada
start "WEB - Família Financeira" cmd /k "cd /d C:\projetos\familia-financeira\frontend && npm run dev"
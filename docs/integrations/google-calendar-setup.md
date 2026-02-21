# Google Calendar API - Configuração SBCE CRM

## ✅ **Status: CONFIGURADO**
- **Projeto Google Cloud**: SBCE CRM
- **Client ID**: (configure no .env como `VITE_GOOGLE_CLIENT_ID`)
- **Client Secret**: (configure no .env como `VITE_GOOGLE_CLIENT_SECRET` — nunca commite o valor real)
- **APIs Habilitadas**: ✅ Google Calendar, ✅ Google Meet, ✅ Google Drive

## 🔧 **Configuração Atual**

### URLs de Redirecionamento Configuradas:
- `http://localhost:5173/auth/google/callback` (desenvolvimento)

### Escopos Necessários:
```
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/calendar.calendars
```

## 🚀 **Como Testar**

1. **Vá para a aba "Integrations" no SBCE CRM**
2. **Clique em "Conectar" no Google Calendar**
3. **Autorize o acesso na janela do Google**
4. **Teste a conexão**

## 📋 **Próximas Integrações**

### Google Meet API
- **Objetivo**: Transcrição de reuniões e análise com IA
- **Status**: Pronto para configurar
- **Credenciais**: Mesmas do Calendar

### Gmail API  
- **Objetivo**: Monitoramento de emails automático
- **Status**: Pronto para configurar
- **Credenciais**: Mesmas do Calendar

### Google Drive API
- **Objetivo**: Armazenamento de documentos e propostas
- **Status**: Pronto para configurar  
- **Credenciais**: Mesmas do Calendar

### Google Forms API
- **Objetivo**: Captura de leads automatizada
- **Status**: Pronto para configurar
- **Credenciais**: Mesmas do Calendar

## 🔗 **Links Úteis**

- **Google Cloud Console**: https://console.cloud.google.com/
- **Projeto SBCE CRM**: https://console.cloud.google.com/apis/dashboard?project=sbce-crm
- **APIs Habilitadas**: https://console.cloud.google.com/apis/library?project=sbce-crm

## 📞 **Suporte**

Se precisar de ajuda:
1. Verifique se as APIs estão habilitadas no Google Cloud Console
2. Confirme se as URLs de redirecionamento estão corretas
3. Teste a conexão na aba Integrations do SBCE CRM

**Tudo está pronto para começar a integração! 🎉**
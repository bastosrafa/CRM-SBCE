# Configuração do Evolution Manager para WhatsApp

## 🚀 Guia Rápido para Conectar WhatsApp Real

### 1. **Instalar Evolution Manager**

```bash
# Clone o repositório
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Instale as dependências
npm install

# Configure o arquivo .env
cp .env.example .env
```

### 2. **Configurar arquivo .env**

```env
# Porta do Evolution Manager
PORT=8080

# Token de API (pode ser qualquer string)
AUTHENTICATION_API_KEY=sua-chave-aqui

# Configurações do banco de dados (opcional)
DATABASE_ENABLED=false

# Webhook URL (seu CRM)
WEBHOOK_GLOBAL_URL=http://localhost:5173/api/whatsapp/webhook

# Configurações de logs
LOG_LEVEL=ERROR
```

### 3. **Iniciar Evolution Manager**

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Ou iniciar em modo produção
npm start
```

O Evolution Manager estará rodando em: `http://localhost:8080`

### 4. **Configurar no CRM**

1. **Acesse o CRM** e vá para "Integração WhatsApp"
2. **Clique em "Configurar"**
3. **Preencha os campos:**
   - **URL Base:** `http://localhost:8080`
   - **Token de API:** `sua-chave-aqui` (mesmo valor do .env)
4. **Clique em "Testar Conexão"** para verificar
5. **Salve a configuração**

### 5. **Conectar WhatsApp**

1. **Clique em "Conectar WhatsApp"**
2. **Aguarde o QR Code aparecer**
3. **Abra o WhatsApp no celular**
4. **Toque em Menu (⋮) > Dispositivos conectados**
5. **Toque em "Conectar um dispositivo"**
6. **Escaneie o QR Code**

## 🔧 Solução de Problemas

### Erro: `ERR_CONNECTION_REFUSED`

**Causa:** Evolution Manager não está rodando

**Solução:**
1. Verifique se o Evolution Manager está rodando na porta 8080
2. Teste acessando `http://localhost:8080` no navegador
3. Verifique se a URL no CRM está correta

### Erro: `401 Unauthorized`

**Causa:** Token de API incorreto

**Solução:**
1. Verifique se o token no CRM é igual ao do arquivo .env
2. Reinicie o Evolution Manager após alterar o .env

### QR Code não aparece

**Causa:** Problema na criação da instância

**Solução:**
1. Verifique os logs do Evolution Manager
2. Teste a conexão primeiro
3. Verifique se não há instâncias duplicadas

### QR Code expira muito rápido

**Causa:** Problema de conectividade

**Solução:**
1. Verifique se o webhook está configurado corretamente
2. Teste a conectividade entre CRM e Evolution Manager

## 📱 Testando a Conexão

### 1. **Teste Básico**
```bash
curl -X GET "http://localhost:8080/instance/fetchInstances" \
  -H "apikey: sua-chave-aqui"
```

### 2. **Teste de Criação de Instância**
```bash
curl -X POST "http://localhost:8080/instance/create" \
  -H "apikey: sua-chave-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "teste",
    "qrcode": true,
    "integration": "whatsapp"
  }'
```

## 🔗 URLs Úteis

- **Evolution Manager:** http://localhost:8080
- **Documentação:** https://doc.evolution-api.com/
- **GitHub:** https://github.com/EvolutionAPI/evolution-api

## 📝 Notas Importantes

1. **Sempre use HTTPS em produção**
2. **Mantenha o token de API seguro**
3. **Configure webhooks para receber mensagens**
4. **Monitore os logs para problemas**
5. **Faça backup das instâncias configuradas**

## 🆘 Suporte

Se ainda tiver problemas:

1. **Verifique os logs** do Evolution Manager
2. **Execute o diagnóstico** no CRM
3. **Teste a conectividade** com curl
4. **Verifique se todas as dependências** estão instaladas




# 🏥 API Health Check Monitor

Sistema automatizado de monitoramento de APIs com envio de relatórios por email a cada 1 hora.

## 📋 Descrição

Este projeto monitora automaticamente os endpoints de sua API, executando testes periódicos e enviando relatórios detalhados por email com os resultados. Ideal para manter o controle da saúde da API em produção.

## ✨ Funcionalidades

- ✅ **Monitoramento Automático**: Executa testes a cada 1 hora
- 📧 **Envio Inteligente de Emails**: 
  - **Com ERRO**: Envia imediatamente para todos os destinatários (TO + CC)
  - **Com SUCESSO**: Envia apenas 1x por dia às 17:30 para o destinatário principal
- 📊 **Dashboard Visual**: Email com gráficos e estatísticas
- 🔍 **Testes Detalhados**: 17 endpoints testados
- 📋 **Logs Persistentes**: Histórico completo em arquivos
- ⚡ **Execução Imediata**: Primeira execução ao iniciar
- 🎨 **Interface Colorida**: Logs com cores no terminal

## 🧪 Endpoints Monitorados

### 1. Repositórios (8 testes)
- Buscar RCA
- Validar CNPJ RCA
- Validar CEP
- Validar Email (com e sem tipo)
- Validar Telefone (com e sem tipo)
- Validar Situação do Cliente

### 2. Controller Refatorado (1 teste)
- Consulta APIs (endpoint principal)

### 3. Busca de Seqpessoa (1 teste)
- Buscar Seqpessoa APV

### 4. Controle do Scheduler (1 teste)
- Status do Scheduler

### 5. Limite Diário (1 teste)
- Status do Limite Diário

### 6. RH (2 testes)
- Buscar Funcionário
- Dados Funcionário

### 7. BLIP (3 testes)
- Validar Cliente
- Consultar Títulos RCA
- Buscar Empresa Cliente por CNPJ

## 🚀 Instalação

### Opção 1: Docker (Recomendado) 🐳

#### Pré-requisitos
- Docker
- Docker Compose

#### Passo a Passo

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd API-HEALTH-CHECKER
```

2. **Configure as variáveis de ambiente**

Copie o arquivo de exemplo e edite com suas configurações:
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Configurações de Email
EMAILREMETENTE=seu.email@empresa.com
EMAILDESTINATARIO=destinatario@empresa.com
EMAILCC=copia1@empresa.com,copia2@empresa.com

# Configurações SMTP
SMTPHOST=smtp.gmail.com
SMTPPORT=587
SMTPUSER=seu.email@empresa.com
SMTPPASS=sua_senha_app

# Configurações da API a ser monitorada
API_BASE_URL=https://url.da.sua.API
API_USERNAME=usuario
API_TOKEN=seu_token_aqui
```

3. **Inicie o container**
```bash
# Build e iniciar em background
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Parar o container
docker-compose down
```

4. **Comandos úteis Docker**
```bash
# Ver status do container
docker-compose ps

# Reiniciar o container
docker-compose restart

# Ver logs
docker-compose logs -f api-health-checker

# Parar e remover tudo
docker-compose down -v

# Rebuild após mudanças no código
docker-compose up -d --build
```

### Opção 2: Instalação Local

#### Pré-requisitos

- Node.js >= 14.0.0
- npm ou yarn
- Conta de email configurada (Gmail recomendado)

#### Passo a Passo

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd API-HEALTH-CHECKER
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Edite o arquivo `.env` com suas configurações:

```env
NODE_ENV=development

# Configurações de Email
EMAILREMETENTE="Seu Nome <seu.email@empresa.com>"
EMAILDESTINATARIO=destinatario@empresa.com
EMAILCC=copia1@empresa.com,copia2@empresa.com

# Configurações SMTP
SMTPHOST=smtp.gmail.com
SMTPPORT=587
SMTPUSER=seu.email@empresa.com
SMTPPASS=sua_senha_app

# Configurações da API a ser monitorada
API_BASE_URL=https://url.da.sua.API
API_USERNAME=usuario
API_TOKEN=seu_token_aqui
```

### 📧 Configuração do Gmail

Para usar o Gmail como servidor SMTP:

1. Acesse sua conta Google
2. Vá em **Segurança** > **Verificação em duas etapas**
3. Ative a verificação em duas etapas
4. Vá em **Senhas de app**
5. Gere uma senha para "Email"
6. Use essa senha no campo `SMTPPASS`

### ⚠️ Importante

- **API_TOKEN**: Obtenha o token de autenticação com a equipe responsável
- **EMAILCC**: 
  - Destinatários em cópia recebem APENAS emails de ERRO
  - Use `#` no início para desabilitar temporáriamente (ex: `#email@exemplo.com`)
  - Relatórios de sucesso (17:30) vão apenas para EMAILDESTINATARIO

## 🎮 Como Usar

### Com Docker (Recomendado)

```bash
# Iniciar em background
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Parar o monitor
docker-compose down

# Reiniciar após mudanças no .env
docker-compose restart
```

### Instalação Local

**Iniciar o Monitor:**
```bash
npm start
```

**Modo Desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Parar o Monitor:**
Pressione `Ctrl + C` no terminal

### Comportamento do Sistema

O sistema irá:
1. Executar os testes imediatamente
2. Verificar se há falhas:
   - **Se houver falhas**: Envia email para todos (TO + CC)
   - **Se tudo estiver OK**: Aguarda o relatório diário das 17:30
3. Agendar execuções:
   - Testes: A cada 1 hora
   - Relatório de sucesso: Diariamente às 17:30
   - Limpeza de logs: Diariamente às 3h

## 📁 Estrutura do Projeto

```
API-HEALTH-CHECKER/
├── config/
│   └── smtp.js              # Configuração SMTP
├── logs/                    # Logs gerados automaticamente
│   └── health-check-YYYY-MM-DD.log
├── src/
│   ├── middleware/
│   │   └── emailConfig.js   # Configuração do Nodemailer
│   ├── emailReporter.js     # Gerador de relatórios HTML
│   ├── healthChecker.js     # Executor dos testes
│   ├── loggers.js           # Sistema de logs
│   └── scheduler.js         # Agendador de tarefas
├── .dockerignore            # Arquivos ignorados no build Docker
├── .env                     # Variáveis de ambiente (não versionado)
├── .env.example             # Exemplo de configuração
├── .gitignore               # Arquivos ignorados pelo Git
├── docker-compose.yml       # Configuração Docker Compose
├── Dockerfile               # Imagem Docker
├── index.js                 # Arquivo principal
├── package.json             # Dependências do projeto
└── README.md                # Este arquivo
```

## 📊 Formato do Relatório

O email enviado contém:

- **Cabeçalho**: "Health Check - API" com status visual
- **Status Geral**: Indicador visual (✅ Saudável / ⚠️ Alertas / 🚨 Problemas)
- **Informações**: Data, horário e URL da API configurada
- **Resumo Executivo**: Total de testes, sucessos, falhas e taxa de sucesso
- **Tabela Detalhada**: Cada endpoint com status, código HTTP, tempo de resposta
- **Alertas**: Destacados quando há falhas
- **Design Responsivo**: Visualização perfeita em desktop e mobile

### 📧 Lógica de Envio

**Relatório com ERRO (Falhas detectadas)**:
- ⏰ **Quando**: Imediatamente após detectar falha
- 👥 **Para quem**: EMAILDESTINATARIO + EMAILCC (todos)
- 🚨 **Assunto**: "🚨 API com Problemas - Health Check API (X% sucesso)"

**Relatório com SUCESSO (100% OK)**:
- ⏰ **Quando**: Apenas 1x por dia às 17:30
- 👤 **Para quem**: Apenas EMAILDESTINATARIO (sem CC)
- ✅ **Assunto**: "✅ API Saudável - Health Check API (100% sucesso)"

## 🔧 Personalização

### Alterar Frequência de Execução

Edite o arquivo `src/scheduler.js`:

```javascript
// Alterar frequência dos testes (linha ~91)
// Executar a cada 30 minutos
this.task = cron.schedule('*/30 * * * *', () => { ... });

// Executar a cada 2 horas
this.task = cron.schedule('0 */2 * * *', () => { ... });

// Alterar horário do relatório diário (linha ~100)
// Executar às 9h da manhã
this.taskRelatorioSucesso = cron.schedule('0 9 * * *', () => { ... });

// Executar às 18h
this.taskRelatorioSucesso = cron.schedule('0 18 * * *', () => { ... });
```

### Adicionar Novos Endpoints

Edite o arquivo `src/healthChecker.js` e adicione:

```javascript
await this.testarEndpoint(
    'Nome do Teste',
    'GET',  // ou 'POST'
    `${this.baseUrl}/seu/endpoint`,
    200,    // status esperado
    dados   // opcional, para POST
);
```

### Customizar Email

Edite o arquivo `src/emailReporter.js` para alterar:
- Cores e estilos CSS
- Estrutura HTML
- Conteúdo do email

## 📝 Logs

Os logs são salvos automaticamente em:
- **Diretório**: `./logs/`
- **Formato**: `health-check-YYYY-MM-DD.log`
- **Conteúdo**: Timestamp, nível (INFO/ERROR/SUCCESS/WARN), mensagem
- **Retenção**: Últimos 30 dias (logs antigos são deletados automaticamente)
- **Limpeza**: Automática às 3h da manhã + ao iniciar a aplicação

### 🔄 Rotação Automática de Logs

O sistema implementa rotação automática para evitar acúmulo excessivo:
- ✅ **Mantém**: Logs dos últimos 30 dias
- 🗑️ **Deleta**: Logs com mais de 30 dias automaticamente
- ⏰ **Quando**: Às 3h da manhã + ao iniciar o sistema
- 💾 **Espaço estimado**: ~1.8MB/mês (máximo ~54MB com 30 dias)

Exemplo:
```
[20/10/2025, 14:30:00] [INFO] Iniciando execução do Health Check...
[20/10/2025, 14:30:05] [SUCCESS] Buscar RCA - Status: 200 (1234ms)
[20/10/2025, 14:30:10] [ERROR] Validar CEP - Status esperado: 200, recebido: 404
```

### 🛠️ Alterar Período de Retenção

Para alterar o período de retenção de logs, edite `src/loggers.js`:

```javascript
const DIAS_RETENCAO = 30; // Altere para o número de dias desejado
```

## 🐛 Troubleshooting

### Erro ao enviar email

- Verifique as credenciais SMTP no `.env`
- Confirme que a senha de app do Gmail está correta
- Verifique se o firewall não está bloqueando a porta 587

### API não responde

- Confirme que a API está rodando na URL configurada
- Verifique as credenciais (username e token)
- Teste manualmente os endpoints com Postman/Insomnia
- Se usar `localhost`, prefira `127.0.0.1` para evitar problemas com IPv6

### Erro ECONNREFUSED

- Verifique se a API está realmente rodando
- Use `127.0.0.1` em vez de `localhost` no `API_BASE_URL`
- Confirme que a porta está correta na URL configurada

### Scheduler não executa

- Verifique se o processo está rodando (`ps aux | grep node`)
- Confirme que não há erros no log
- Reinicie a aplicação

### Problemas com Docker

**Container não inicia:**
```bash
# Ver logs de erro
docker-compose logs

# Verificar se o .env existe
ls -la .env

# Rebuild do container
docker-compose up -d --build
```

**Logs não aparecem:**
```bash
# Verificar se o volume está montado
docker-compose exec api-health-checker ls -la /app/logs

# Ver logs do container
docker-compose logs -f api-health-checker
```

**Mudanças no .env não aplicam:**
```bash
# Reiniciar o container
docker-compose restart

# Ou recriar completamente
docker-compose down
docker-compose up -d
```

**Timezone incorreto:**
- O container usa `America/Sao_Paulo` por padrão
- Para alterar, edite `TZ` no `docker-compose.yml`

## 🐳 Docker - Detalhes Técnicos

### Características da Imagem

- **Base**: `node:18-alpine` (imagem leve)
- **Tamanho**: ~150MB
- **Timezone**: America/Sao_Paulo (configurado automaticamente)
- **Recursos**: Limitado a 256MB RAM e 0.5 CPU
- **Restart**: Automático (unless-stopped)

**Nota sobre Timezone:**
- O container é configurado automaticamente para `America/Sao_Paulo`
- Agendamentos (17:30, 3h) usam horário de Brasília
- Para testar: `docker-compose exec api-health-checker node test-timezone.js`

### Volumes

- `./logs:/app/logs` - Logs persistem no host mesmo após remover o container

### Segurança

- Não expõe portas por padrão
- Variáveis sensíveis via `.env` (não commitadas)
- Executa com usuário não-root (node)

### Produção

Para deploy em produção:

1. **Ajuste recursos** no `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
```

2. **Use secrets** para variáveis sensíveis:
```yaml
secrets:
  smtp_pass:
    file: ./secrets/smtp_pass.txt
```

3. **Configure logging driver**:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 📦 Dependências

- **axios**: Cliente HTTP para fazer requisições
- **dotenv**: Gerenciamento de variáveis de ambiente
- **node-cron**: Agendador de tarefas
- **nodemailer**: Envio de emails

## 📄 Licença

Este projeto está sob a licença MIT.

## 👤 Autor

**Cristhian Cintra**
- GitHub: [@CintraB](https://github.com/CintraB)

## 🔐 Segurança

- **Nunca commite o arquivo `.env`** com credenciais reais
- Use variáveis de ambiente em produção
- Mantenha os tokens de API seguros
- Rotacione as senhas de app do Gmail periodicamente

---
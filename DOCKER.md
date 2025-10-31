# 🐳 Guia Rápido Docker

## Início Rápido

```bash
# 1. Copiar configuração de exemplo
cp .env.example .env

# 2. Editar .env com suas credenciais
nano .env  # ou use seu editor preferido

# 3. Iniciar container
docker-compose up -d

# 4. Ver logs
docker-compose logs -f
```

## Comandos Essenciais

### Gerenciamento do Container

```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Ver status
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs das últimas 100 linhas
docker-compose logs --tail=100
```

### Build e Rebuild

```bash
# Build inicial
docker-compose build

# Rebuild após mudanças no código
docker-compose up -d --build

# Rebuild forçado (sem cache)
docker-compose build --no-cache
```

### Manutenção

```bash
# Entrar no container
docker-compose exec api-health-checker sh

# Ver arquivos de log dentro do container
docker-compose exec api-health-checker ls -la /app/logs

# Limpar tudo (container + volumes)
docker-compose down -v

# Limpar imagens não utilizadas
docker image prune -a
```

## Estrutura de Volumes

```
Host                    Container
./logs           →      /app/logs
```

Os logs são persistidos no host, então mesmo removendo o container os logs permanecem.

## Variáveis de Ambiente

Todas as variáveis são carregadas do arquivo `.env`:

```env
API_BASE_URL=https://url.da.sua.API
API_USERNAME=usuario
API_TOKEN=seu_token

EMAILREMETENTE=seu.email@empresa.com
EMAILDESTINATARIO=destinatario@empresa.com
EMAILCC=copia@empresa.com

SMTPHOST=smtp.gmail.com
SMTPPORT=587
SMTPUSER=seu.email@empresa.com
SMTPPASS=sua_senha_app
```

## Testar Timezone

Para verificar se o timezone está configurado corretamente:

```bash
# Dentro do container
docker-compose exec api-health-checker date

# Deve mostrar horário de Brasília (BRT/BRST)
# Exemplo: Mon Oct 21 11:00:00 -03 2025

# Testar com script Node.js
docker-compose exec api-health-checker node test-timezone.js
```

Saída esperada:
```
TZ = America/Sao_Paulo
Offset em minutos: -180
Offset em horas: -3
✅ TIMEZONE CORRETO! (America/Sao_Paulo)
```

## Troubleshooting

### Container não inicia

```bash
# Ver erro detalhado
docker-compose logs

# Verificar se .env existe
ls -la .env

# Rebuild
docker-compose up -d --build
```

### Mudanças no .env não aplicam

```bash
# Método 1: Reiniciar
docker-compose restart

# Método 2: Recriar
docker-compose down
docker-compose up -d
```

### Ver uso de recursos

```bash
# Estatísticas em tempo real
docker stats api-health-checker

# Uso de disco
docker system df
```

## Produção

### Ajustar Recursos

Edite `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'      # Aumentar CPU
      memory: 512M     # Aumentar RAM
```

### Logs do Docker

Adicione ao `docker-compose.yml`:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Auto-restart

Já configurado como `unless-stopped`. O container reinicia automaticamente após:
- Reboot do servidor
- Crash da aplicação
- Erro fatal

Para desabilitar:
```yaml
restart: "no"
```

## Monitoramento

### Ver logs em tempo real

```bash
# Todos os logs
docker-compose logs -f

# Apenas erros
docker-compose logs -f | grep ERROR

# Últimas 50 linhas
docker-compose logs --tail=50 -f
```

### Verificar saúde do container

```bash
# Status
docker-compose ps

# Processos dentro do container
docker-compose top

# Uso de recursos
docker stats api-health-checker
```

## Backup

### Backup dos logs

```bash
# Comprimir logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/

# Copiar para outro local
cp logs-backup-*.tar.gz /caminho/backup/
```

### Backup da configuração

```bash
# Backup do .env (cuidado com credenciais!)
cp .env .env.backup

# Backup completo do projeto
tar -czf api-health-checker-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=logs \
  .
```

## Dicas

1. **Sempre use `-d`** para rodar em background
2. **Use `logs -f`** para debug em tempo real
3. **Faça backup do `.env`** antes de mudanças
4. **Monitore recursos** com `docker stats`
5. **Limpe imagens antigas** periodicamente com `docker image prune`

## Links Úteis

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Node.js Alpine Image](https://hub.docker.com/_/node)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

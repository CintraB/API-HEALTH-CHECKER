const cron = require('node-cron');
const HealthChecker = require('./healthChecker');
const { enviarRelatorioEmail } = require('./emailReporter');
const logger = require('./loggers');
require('dotenv').config();

class HealthCheckScheduler {
    constructor() {
        this.task = null;
        this.taskRelatorioSucesso = null;
        this.taskLimpezaLogs = null;
        this.isRunning = false;
        this.ultimaExecucao = null;
        this.proximaExecucao = null;
        this.ultimoRelatorioSucesso = null;
        
        // Configurações da API
        this.baseUrl = process.env.API_BASE_URL;
        this.username = process.env.API_USERNAME;
        this.token = process.env.API_TOKEN;
    }

    async executarHealthCheck(forcaEnvioSucesso = false) {
        try {
            logger.info('Iniciando execução do Health Check...');
            this.ultimaExecucao = new Date();

            // Criar instância do health checker
            const healthChecker = new HealthChecker(this.baseUrl, this.username, this.token);

            // Executar todos os testes
            await healthChecker.executarTodosOsTestes();

            // Obter resultados
            const resultados = healthChecker.obterResultados();

            // Lógica de envio de email
            const temFalhas = resultados.falha > 0;
            
            if (temFalhas) {
                // Se tem falhas, envia email IMEDIATAMENTE para TODOS
                logger.warn('Falhas detectadas! Enviando email para todos os destinatários...');
                await enviarRelatorioEmail(resultados, false); // false = envia para todos
            } else if (forcaEnvioSucesso) {
                // Relatório diário de sucesso às 17:30 - APENAS para destinatário principal
                logger.info('Enviando relatório diário de sucesso (17:30)...');
                await enviarRelatorioEmail(resultados, true); // true = apenas destinatário principal
                this.ultimoRelatorioSucesso = new Date();
            } else {
                // Tudo OK, mas não é hora do relatório diário
                logger.success('Todos os testes passaram! Email não enviado (aguardando relatório das 17:30).');
            }

            logger.success('Health Check concluído com sucesso!');
            
            // Calcular próxima execução
            this.calcularProximaExecucao();

        } catch (error) {
            logger.error('Erro ao executar Health Check', error);
        }
    }

    calcularProximaExecucao() {
        const agora = new Date();
        const proxima = new Date(agora.getTime() + 60 * 60 * 1000); // +1 hora
        this.proximaExecucao = proxima;
        logger.info(`Próxima execução agendada para: ${proxima.toLocaleString('pt-BR')}`);
    }

    iniciar() {
        if (this.isRunning) {
            logger.warn('Scheduler já está em execução!');
            return;
        }

        logger.info('Iniciando scheduler do Health Check...');
        logger.info(`Base URL: ${this.baseUrl}`);
        logger.info(`Usuário: ${this.username}`);
        logger.info('Frequência de Testes: A cada 1 hora (0 */1 * * *)');
        logger.info('Envio de Emails:');
        logger.info('   - Com ERRO: Imediato para todos');
        logger.info('   - Com SUCESSO: Apenas às 17:30 para destinatário principal');

        // Executar imediatamente na primeira vez
        logger.info('Executando primeira verificação...');
        this.executarHealthCheck();

        // Agendar execução a cada 1 hora
        // Formato cron: minuto hora dia mês dia-da-semana
        // '0 */1 * * *' = A cada hora no minuto 0
        this.task = cron.schedule('0 */1 * * *', () => {
            logger.info('\n' + '='.repeat(80));
            logger.info('EXECUÇÃO AGENDADA DO HEALTH CHECK (A CADA HORA)');
            logger.info('='.repeat(80));
            this.executarHealthCheck(false); // false = não força envio de sucesso
        });

        // Agendar relatório diário de sucesso às 17:30
        // '30 17 * * *' = Todos os dias às 17:30
        this.taskRelatorioSucesso = cron.schedule('30 17 * * *', () => {
            logger.info('\n' + '='.repeat(80));
            logger.info('RELATÓRIO DIÁRIO DE SUCESSO (17:30)');
            logger.info('='.repeat(80));
            this.executarHealthCheck(true); // true = força envio de sucesso
        });

        // Agendar limpeza de logs antigos às 3h da manhã
        // '0 3 * * *' = Todos os dias às 3h
        this.taskLimpezaLogs = cron.schedule('0 3 * * *', () => {
            logger.info('\n' + '='.repeat(80));
            logger.info('LIMPEZA AUTOMÁTICA DE LOGS ANTIGOS (3h)');
            logger.info('='.repeat(80));
            logger.limparLogsAntigos();
        });

        this.isRunning = true;
        this.calcularProximaExecucao();
        logger.success('Scheduler iniciado com sucesso!');
        logger.info('Relatório diário de sucesso agendado para 17:30');
        logger.info('Limpeza de logs agendada para 3h (mantém últimos 30 dias)');
    }

    parar() {
        if (!this.isRunning) {
            logger.warn('Scheduler não está em execução!');
            return;
        }

        if (this.task) {
            this.task.stop();
            this.task = null;
        }

        if (this.taskRelatorioSucesso) {
            this.taskRelatorioSucesso.stop();
            this.taskRelatorioSucesso = null;
        }

        if (this.taskLimpezaLogs) {
            this.taskLimpezaLogs.stop();
            this.taskLimpezaLogs = null;
        }

        this.isRunning = false;
        this.proximaExecucao = null;
        logger.info('Scheduler parado.');
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            ultimaExecucao: this.ultimaExecucao ? this.ultimaExecucao.toLocaleString('pt-BR') : 'Nunca',
            proximaExecucao: this.proximaExecucao ? this.proximaExecucao.toLocaleString('pt-BR') : 'N/A',
            ultimoRelatorioSucesso: this.ultimoRelatorioSucesso ? this.ultimoRelatorioSucesso.toLocaleString('pt-BR') : 'Nunca',
            baseUrl: this.baseUrl,
            username: this.username
        };
    }

    // Método para executar manualmente (útil para testes)
    async executarManualmente() {
        logger.info('Execução manual solicitada...');
        await this.executarHealthCheck();
    }
}

module.exports = HealthCheckScheduler;

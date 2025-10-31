const HealthCheckScheduler = require('./src/scheduler');
const logger = require('./src/loggers');
require('dotenv').config();

// Banner de inicialização
function exibirBanner() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║          API HEALTH CHECK MONITOR v1.0 - VN                ║');
    console.log('║           Monitoramento Automático de APIs                 ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');
}

// Função principal
async function main() {
    try {
        exibirBanner();

        logger.info('Iniciando aplicação...');
        
        // Verificar variáveis de ambiente
        const requiredEnvVars = [
            'API_BASE_URL',
            'API_USERNAME', 
            'API_TOKEN',
            'EMAILREMETENTE',
            'EMAILDESTINATARIO',
            'SMTPHOST',
            'SMTPPORT',
            'SMTPUSER',
            'SMTPPASS'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            logger.error(`Variáveis de ambiente faltando: ${missingVars.join(', ')}`);
            logger.error('Por favor, configure o arquivo .env corretamente.');
            process.exit(1);
        }

        logger.success('Variáveis de ambiente carregadas');

        // Criar e iniciar o scheduler
        const scheduler = new HealthCheckScheduler();
        
        // Iniciar o scheduler
        scheduler.iniciar();

        // Handlers para encerramento gracioso
        process.on('SIGINT', () => {
            logger.info('\nRecebido sinal de interrupção (SIGINT)');
            scheduler.parar();
            logger.info('Aplicação encerrada.');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            logger.info('\nRecebido sinal de término (SIGTERM)');
            scheduler.parar();
            logger.info('Aplicação encerrada.');
            process.exit(0);
        });

        // Manter o processo rodando
        logger.info('Aplicação rodando. Pressione Ctrl+C para encerrar.');
        logger.info('Logs sendo salvos em: ./logs/');
        
    } catch (error) {
        logger.error('Erro fatal na aplicação', error);
        process.exit(1);
    }
}

// Executar aplicação
main();

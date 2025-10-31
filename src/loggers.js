const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
const DIAS_RETENCAO = 30; // Mantém logs dos últimos 30 dias

// Criar diretório de logs se não existir
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Função para limpar logs antigos
function limparLogsAntigos() {
    try {
        const agora = new Date();
        const arquivos = fs.readdirSync(logsDir);
        let arquivosDeletados = 0;
        
        arquivos.forEach(arquivo => {
            // Apenas arquivos de log do health check
            if (arquivo.startsWith('health-check-') && arquivo.endsWith('.log')) {
                const caminhoCompleto = path.join(logsDir, arquivo);
                const stats = fs.statSync(caminhoCompleto);
                const diasDesdeModificacao = (agora - stats.mtime) / (1000 * 60 * 60 * 24);
                
                // Deletar se for mais antigo que DIAS_RETENCAO
                if (diasDesdeModificacao > DIAS_RETENCAO) {
                    fs.unlinkSync(caminhoCompleto);
                    arquivosDeletados++;
                    console.log(`[LOGGER] Log antigo deletado: ${arquivo} (${Math.floor(diasDesdeModificacao)} dias)`);
                }
            }
        });
        
        if (arquivosDeletados > 0) {
            console.log(`[LOGGER] ${arquivosDeletados} arquivo(s) de log antigo(s) deletado(s)`);
        }
        
        // Informar quantos logs estão sendo mantidos
        const logsRestantes = fs.readdirSync(logsDir).filter(f => 
            f.startsWith('health-check-') && f.endsWith('.log')
        ).length;
        console.log(`[LOGGER] Logs ativos: ${logsRestantes} arquivo(s) (últimos ${DIAS_RETENCAO} dias)`);
        
    } catch (error) {
        console.error('[LOGGER] Erro ao limpar logs antigos:', error.message);
    }
}

// Executar limpeza ao carregar o módulo
limparLogsAntigos();

function formatarDataHora() {
    const data = new Date();
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function escreverLog(nivel, mensagem, erro = null) {
    const timestamp = formatarDataHora();
    const logMessage = erro 
        ? `[${timestamp}] [${nivel}] ${mensagem} - ${erro.message || erro}`
        : `[${timestamp}] [${nivel}] ${mensagem}`;
    
    console.log(logMessage);
    
    // Salvar em arquivo
    const dataArquivo = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `health-check-${dataArquivo}.log`);
    
    fs.appendFileSync(logFile, logMessage + '\n', 'utf8');
}

const logger = {
    info: (mensagem) => escreverLog('INFO', mensagem),
    error: (mensagem, erro = null) => escreverLog('ERROR', mensagem, erro),
    warn: (mensagem) => escreverLog('WARN', mensagem),
    success: (mensagem) => escreverLog('SUCCESS', mensagem),
    limparLogsAntigos: limparLogsAntigos // Expor função para uso externo
};

module.exports = logger;

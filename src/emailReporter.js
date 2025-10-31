const transporter = require('./middleware/emailConfig');
const logger = require('./loggers');
require('dotenv').config();

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

function formatarDataHoje() {
    const data = new Date();
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function gerarCorpoEmailHTML(resultados) {
    const { total, sucesso, falha, detalhes, dataHora } = resultados;
    const taxaSucesso = total > 0 ? (sucesso / total * 100).toFixed(1) : 0;
    const dataHoje = formatarDataHoje();
    const baseUrl = process.env.API_BASE_URL || 'URL não configurada';
    
    // Definir cor e status baseado na taxa de sucesso
    let statusCor = '#28a745'; // Verde
    let statusTexto = '✅ API Saudável';
    let statusEmoji = '🎉';
    
    if (taxaSucesso < 100 && taxaSucesso >= 80) {
        statusCor = '#ffc107'; // Amarelo
        statusTexto = '⚠️ API com Alertas';
        statusEmoji = '⚠️';
    } else if (taxaSucesso < 80) {
        statusCor = '#dc3545'; // Vermelho
        statusTexto = '❌ API com Problemas';
        statusEmoji = '🚨';
    }

    // Gerar linhas da tabela de detalhes
    const linhasDetalhes = detalhes.map(detalhe => {
        const statusIcon = detalhe.status === 'SUCESSO' ? '✅' : '❌';
        const statusClass = detalhe.status === 'SUCESSO' ? 'success' : 'error';
        
        return `
            <tr class="${statusClass}">
                <td>${statusIcon} ${detalhe.teste}</td>
                <td>${detalhe.status}</td>
                <td>${detalhe.codigo || 'N/A'}</td>
                <td>${detalhe.tempoResposta || 'N/A'}</td>
                <td style="font-size: 11px; color: #666;">${detalhe.erro ? detalhe.erro.substring(0, 50) + '...' : '-'}</td>
            </tr>
        `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .header p {
                    margin: 10px 0 0 0;
                    opacity: 0.9;
                }
                .status-badge {
                    display: inline-block;
                    padding: 15px 30px;
                    margin: 20px 0;
                    border-radius: 50px;
                    font-size: 20px;
                    font-weight: bold;
                    background-color: ${statusCor};
                    color: white;
                }
                .content {
                    padding: 30px;
                }
                .summary {
                    display: flex;
                    justify-content: space-around;
                    margin: 30px 0;
                    text-align: center;
                }
                .summary-item {
                    flex: 1;
                    padding: 20px;
                    margin: 0 10px;
                    border-radius: 8px;
                    background-color: #f8f9fa;
                }
                .summary-item h3 {
                    margin: 0 0 10px 0;
                    font-size: 32px;
                    font-weight: bold;
                }
                .summary-item p {
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                }
                .summary-item.total { border-left: 4px solid #007bff; }
                .summary-item.success { border-left: 4px solid #28a745; }
                .summary-item.error { border-left: 4px solid #dc3545; }
                .summary-item.rate { border-left: 4px solid #ffc107; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th {
                    background-color: #667eea;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                }
                td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #dee2e6;
                }
                tr.success {
                    background-color: #f8fff8;
                }
                tr.error {
                    background-color: #fff8f8;
                }
                tr:hover {
                    background-color: #f5f5f5;
                }
                .footer {
                    background-color: #f8f9fa;
                    padding: 20px 30px;
                    text-align: center;
                    border-top: 1px solid #dee2e6;
                    font-size: 13px;
                    color: #666;
                }
                .footer strong {
                    color: #667eea;
                }
                .info-box {
                    background-color: #e7f3ff;
                    border-left: 4px solid #007bff;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${statusEmoji} Health Check - API</h1>
                    <p>Relatório de Monitoramento Automático</p>
                    <div class="status-badge">${statusTexto}</div>
                </div>
                
                <div class="content">
                    <div class="info-box">
                        <strong>📅 Data do Relatório:</strong> ${dataHoje}<br>
                        <strong>🕐 Horário da Execução:</strong> ${formatarDataHora()}<br>
                        <strong>🔗 Base URL:</strong> ${baseUrl}
                    </div>

                    <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                        📊 Resumo Executivo
                    </h2>
                    
                    <div class="summary">
                        <div class="summary-item total">
                            <h3>${total}</h3>
                            <p>Total de Testes</p>
                        </div>
                        <div class="summary-item success">
                            <h3>${sucesso}</h3>
                            <p>Sucessos ✅</p>
                        </div>
                        <div class="summary-item error">
                            <h3>${falha}</h3>
                            <p>Falhas ❌</p>
                        </div>
                        <div class="summary-item rate">
                            <h3>${taxaSucesso}%</h3>
                            <p>Taxa de Sucesso</p>
                        </div>
                    </div>

                    <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 40px;">
                        📋 Detalhamento dos Testes
                    </h2>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Endpoint</th>
                                <th>Status</th>
                                <th>Código HTTP</th>
                                <th>Tempo</th>
                                <th>Observações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${linhasDetalhes}
                        </tbody>
                    </table>

                    ${falha > 0 ? `
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <strong>⚠️ Atenção:</strong> Foram detectadas ${falha} falha(s) nos testes. 
                        Recomenda-se verificar os logs detalhados e investigar os endpoints com problemas.
                    </div>
                    ` : ''}
                </div>

                <div class="footer">
                    <p>
                        Este e-mail foi enviado automaticamente pelo sistema de <strong>Health Check API Monitor 🤖</strong><br>
                        Monitoramento executado a cada 1 hora<br>
                        <em>Não responda este e-mail</em>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
}

async function enviarRelatorioEmail(resultados, apenasDestinatarioPrincipal = false) {
    try {
        const { total, sucesso, falha } = resultados;
        const taxaSucesso = total > 0 ? (sucesso / total * 100).toFixed(1) : 0;
        
        let statusSubject = '✅ API Saudável';
        if (taxaSucesso < 100 && taxaSucesso >= 80) {
            statusSubject = '⚠️ API com Alertas';
        } else if (taxaSucesso < 80) {
            statusSubject = '🚨 API com Problemas';
        }

        // Definir destinatários baseado no tipo de relatório
        const mailOptions = {
            from: process.env.EMAILREMETENTE,
            to: process.env.EMAILDESTINATARIO,
            subject: `${statusSubject} - Health Check API (${taxaSucesso}% sucesso)`,
            html: gerarCorpoEmailHTML(resultados)
        };

        // Se NÃO for apenas destinatário principal (ou seja, tem erro), adiciona CC
        if (!apenasDestinatarioPrincipal && process.env.EMAILCC) {
            // Remove # do início se existir (comentário)
            const emailCC = process.env.EMAILCC.replace(/^#/, '').trim();
            if (emailCC) {
                mailOptions.cc = emailCC;
                logger.info(`Enviando para: ${process.env.EMAILDESTINATARIO} + CC: ${emailCC}`);
            }
        } else {
            logger.info(`Enviando apenas para: ${process.env.EMAILDESTINATARIO} (relatório diário)`);
        }

        const info = await transporter.sendMail(mailOptions);
        logger.success(`Email enviado com sucesso! ID: ${info.messageId}`);
        return true;

    } catch (error) {
        logger.error('Erro ao enviar email', error);
        return false;
    }
}

module.exports = {
    enviarRelatorioEmail,
    gerarCorpoEmailHTML
};

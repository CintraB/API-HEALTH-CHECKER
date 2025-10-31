const transporter = require('./src/middleware/emailConfig.js');
const logger = require('./src/loggers.js');
const path = require('path');
require('dotenv').config();

function formatarDataHoje() {
  const data = new Date();
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}


async function construirCorpoEmail(filePath) {
  try {
    const resolvedPath = path.resolve(filePath); //corrige path
    const filename = path.basename(resolvedPath); //extrai nome do arquivo
    const dataHoje = formatarDataHoje();

    const mailSent = await transporter.sendMail({

      subject: 'Relatório Processos em andamento',
      from: process.env.EMAILREMETENTE,
      to: process.env.EMAILDESTINATARIO,
      cc: process.env.EMAILCC,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
          <h2 style="color: #0055aa;">Relatório de Processos</h2>
          <p>Boa tarde,</p>
          <p>Conforme alinhado, envio em anexo o relatório atualizado com o progresso dos processos em desenvolvimento na data ${dataHoje}.</p>

          <hr style="margin: 20px 0;" />
          <p style="font-size: 13px; color: #666;">
            Este e-mail foi enviado automaticamente pelo robô <strong>Tui 1.2 🤖</strong><br />
          </p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          path: filePath,
        }
      ]
    });
  } catch (error) {
    logger.error('Erro ao enviar o email ', error);
  }
}

module.exports = {
  construirCorpoEmail,
};

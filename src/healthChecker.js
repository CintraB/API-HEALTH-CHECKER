const axios = require('axios');
const logger = require('./loggers');

class HealthChecker {
    constructor(baseUrl, username, token) {
        this.baseUrl = baseUrl;
        this.auth = {
            username: username,
            password: token
        };
        this.resultados = {
            total: 0,
            sucesso: 0,
            falha: 0,
            detalhes: [],
            dataHora: new Date().toISOString()
        };
    }

    async testarEndpoint(nome, metodo, url, statusEsperado = 200, dados = null) {
        this.resultados.total++;
        const inicio = Date.now();

        try {
            logger.info(`Testando: ${nome}`);

            let response;
            const config = {
                auth: this.auth,
                timeout: 40000,
                validateStatus: () => true // Aceita qualquer status
            };

            if (metodo === 'GET') {
                response = await axios.get(url, config);
            } else if (metodo === 'POST') {
                response = await axios.post(url, dados, config);
            } else {
                throw new Error(`Método ${metodo} não suportado`);
            }

            const tempoResposta = Date.now() - inicio;

            if (response.status === statusEsperado) {
                logger.success(`${nome} - Status: ${response.status} (${tempoResposta}ms)`);
                this.resultados.sucesso++;
                this.resultados.detalhes.push({
                    teste: nome,
                    status: 'SUCESSO',
                    codigo: response.status,
                    tempoResposta: `${tempoResposta}ms`,
                    url: url
                });
                return { sucesso: true, response };
            } else {
                logger.error(`${nome} - Status esperado: ${statusEsperado}, recebido: ${response.status}`);
                this.resultados.falha++;
                this.resultados.detalhes.push({
                    teste: nome,
                    status: 'FALHA',
                    codigo: response.status,
                    tempoResposta: `${tempoResposta}ms`,
                    erro: response.data ? JSON.stringify(response.data).substring(0, 200) : 'Sem resposta',
                    url: url
                });
                return { sucesso: false, response };
            }

        } catch (error) {
            const tempoResposta = Date.now() - inicio;
            logger.error(`${nome} - Erro`, error);
            this.resultados.falha++;
            this.resultados.detalhes.push({
                teste: nome,
                status: 'ERRO',
                tempoResposta: `${tempoResposta}ms`,
                erro: error.message,
                url: url
            });
            return { sucesso: false, error };
        }
    }

    async executarTodosOsTestes() {
        logger.info('='.repeat(60));
        logger.info('INICIANDO HEALTH CHECK DA API');
        logger.info(`Base URL: ${this.baseUrl}`);
        logger.info(`Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
        logger.info('='.repeat(60));

        // 1. Repositórios (8 testes)
        logger.info('\n--- 1. Testando Endpoints de Repositório ---');
        
        await this.testarEndpoint(
            'Buscar RCA',
            'GET',
            `${this.baseUrl}/cctablet/rca/555`
        );

        await this.testarEndpoint(
            'Validar CNPJ RCA',
            'GET',
            `${this.baseUrl}/cctablet/valida_cnpj_rca/3859930000193`
        );

        await this.testarEndpoint(
            'Validar CEP',
            'GET',
            `${this.baseUrl}/cctablet/valida_cep/37710326`
        );

        await this.testarEndpoint(
            'Validar Email (com tipo)',
            'GET',
            `${this.baseUrl}/cctablet/valida_email/joycegarciasarracini123@gmail.com/cliente`
        );

        await this.testarEndpoint(
            'Validar Telefone (com tipo)',
            'GET',
            `${this.baseUrl}/cctablet/valida_telefone/19989601978/cliente`
        );

        await this.testarEndpoint(
            'Validar Situação do Cliente',
            'GET',
            `${this.baseUrl}/cctablet/valida_situacao_cliente/40630223000157`
        );

        await this.testarEndpoint(
            'Validar Email (sem tipo)',
            'GET',
            `${this.baseUrl}/cctablet/valida_email/joycegarciasarracini123@gmail.com`
        );

        await this.testarEndpoint(
            'Validar Telefone (sem tipo)',
            'GET',
            `${this.baseUrl}/cctablet/valida_telefone/19989601978`
        );

        // 2. Controller Refatorado (1 teste)
        logger.info('\n--- 2. Testando Endpoint Principal (Refatorado) ---');
        
        await this.testarEndpoint(
            'Consulta APIs - Controller Refatorado',
            'GET',
            `${this.baseUrl}/cctablet/consulta_apis/40630223000157`
        );

        // 3. Busca de Seqpessoa (1 teste)
        logger.info('\n--- 3. Testando Busca de Seqpessoa ---');
        
        await this.testarEndpoint(
            'Buscar Seqpessoa APV',
            'GET',
            `${this.baseUrl}/cctablet/seqpessoa_apv/40630223000157`
        );

        // 4. Controle do Scheduler (1 teste)
        logger.info('\n--- 4. Testando Controle do Scheduler ---');
        
        await this.testarEndpoint(
            'Status do Scheduler',
            'GET',
            `${this.baseUrl}/cctablet/processamento/status`
        );

        // 5. Limite Diário (1 teste)
        logger.info('\n--- 5. Testando Limite Diário ---');
        
        await this.testarEndpoint(
            'Status do Limite Diário',
            'GET',
            `${this.baseUrl}/cctablet/limite_diario/status`
        );

        // 6. RH (2 testes)
        logger.info('\n--- 6. Testando Endpoints RH ---');
        
        await this.testarEndpoint(
            'Buscar Funcionário',
            'POST',
            `${this.baseUrl}/rh/buscar_funcionario`,
            200,
            { dados: 'CRISTH' }
        );

        await this.testarEndpoint(
            'Dados Funcionário',
            'POST',
            `${this.baseUrl}/rh/dados_funcionario`,
            200,
            {
                cracha: '1007',
                nome: 'FABIO BENEDITO DOS SANTOS'
            }
        );

        // 7. BLIP (3 testes)
        logger.info('\n--- 7. Testando Endpoints BLIP ---');
        
        await this.testarEndpoint(
            'Validar Cliente BLIP',
            'POST',
            `${this.baseUrl}/blip/validar_cliente`,
            200,
            {
                cnpj: '09096291000138',
                email: 'jadsoncampinas@hotmail.com',
                telefones: ['19992943543', '', '19996115022']
            }
        );

        await this.testarEndpoint(
            'Consultar Títulos RCA BLIP',
            'POST',
            `${this.baseUrl}/blip/consultar_titulos_rca`,
            200,
            {
                cod_rca: '555',
                seqpessoa: 41063,
                cnpj: '17097937000120'
            }
        );

        await this.testarEndpoint(
            'Buscar Empresa Cliente BLIP',
            'GET',
            `${this.baseUrl}/blip/empresa_cliente/09096291000138`
        );

        // 8. Solicitação de Crédito (3 testes)
        logger.info('\n--- 8. Testando Endpoints Solicitação de Crédito ---');
        
        // Teste 24: Buscar Dados do Cliente por CNPJ
        const resultadoCliente = await this.testarEndpoint(
            'Buscar Dados do Cliente por CNPJ',
            'POST',
            `${this.baseUrl}/solicitacao_credito/cliente`,
            200,
            { cnpj: '44534878000182' }
        );
        
        if (resultadoCliente.sucesso && resultadoCliente.response) {
            try {
                const dados = resultadoCliente.response.data;
                logger.info('Verificando dados retornados...');
                if (dados.dados) {
                    const cliente = dados.dados;
                    logger.success(`Cliente: ${cliente.nomerazao || 'N/A'}`);
                    logger.info(`SEQPESSOA: ${cliente.seqpessoa || 'N/A'}`);
                    logger.info(`Limite Global: R$ ${(cliente.limite_global || 0).toFixed(2)}`);
                    logger.info(`Soma Segmentos: R$ ${(cliente.soma_segmentos || 0).toFixed(2)}`);
                }
            } catch (error) {
                logger.error(`Erro ao processar resposta: ${error.message}`);
            }
        }
        
        // Teste 25: Buscar Títulos do Cliente
        const resultadoTitulos = await this.testarEndpoint(
            'Buscar Títulos do Cliente',
            'POST',
            `${this.baseUrl}/solicitacao_credito/titulos`,
            200,
            { seqpessoa: 69306 }
        );
        
        if (resultadoTitulos.sucesso && resultadoTitulos.response) {
            try {
                const dados = resultadoTitulos.response.data;
                if (dados.dados) {
                    const titulos = dados.dados;
                    logger.info(`Títulos em atraso: ${titulos.nro_de_atrasos || 0}`);
                    logger.info(`Pagamentos em dia: ${titulos.pagtos_em_dia || 0}`);
                }
            } catch (error) {
                logger.error(`Erro ao processar resposta: ${error.message}`);
            }
        }
        
        // Teste 26: Buscar Média de Compras
        const resultadoCompras = await this.testarEndpoint(
            'Buscar Média de Compras (últimos 6 meses)',
            'POST',
            `${this.baseUrl}/solicitacao_credito/media_compras`,
            200,
            { seqpessoa: 69306 }
        );
        
        if (resultadoCompras.sucesso && resultadoCompras.response) {
            try {
                const dados = resultadoCompras.response.data;
                logger.info('Verificando dados de compras...');
                if ('eh_rede' in dados) {
                    logger.info(`É rede: ${dados.eh_rede ? 'Sim' : 'Não'}`);
                    if (dados.eh_rede) {
                        logger.info(`Clientes na rede: ${(dados.seqpessoas_rede || []).length}`);
                    }
                }
                if (dados.dados) {
                    const compras = dados.dados;
                    logger.success(`Meses com compras: ${compras.length}`);
                    if (compras.length > 0) {
                        const total = compras.reduce((sum, c) => sum + (c.vlr_total_mes || 0), 0);
                        logger.info(`Total de compras: R$ ${total.toFixed(2)}`);
                    }
                }
            } catch (error) {
                logger.error(`Erro ao processar resposta: ${error.message}`);
            }
        }

        // 9. Solicitação de Bônus (2 testes)
        logger.info('\n--- 9. Testando Endpoints Solicitação de Bônus ---');
        
        // Teste 27: Buscar Valor Realizado
        const resultadoValorRealizado = await this.testarEndpoint(
            'Buscar Valor Realizado',
            'POST',
            `${this.baseUrl}/solicitacao_bonus/valor_realizado`,
            200,
            {
                conta_contabil: '41104036',
                centro_custo: '6060'
            }
        );
        
        if (resultadoValorRealizado.sucesso && resultadoValorRealizado.response) {
            try {
                const dados = resultadoValorRealizado.response.data;
                logger.info('Verificando valor realizado...');
                if (dados.dados) {
                    const valorInfo = dados.dados;
                    logger.success(`Conta Contábil: ${valorInfo.conta_contabil || 'N/A'}`);
                    logger.info(`Centro de Custo: ${valorInfo.centro_custo || 'N/A'}`);
                    logger.info(`Valor Realizado: R$ ${(valorInfo.valor_realizado || 0).toFixed(2)}`);
                }
            } catch (error) {
                logger.error(`Erro ao processar resposta: ${error.message}`);
            }
        }
        
        // Teste 28: Buscar Valor Orçado
        const resultadoValorOrcado = await this.testarEndpoint(
            'Buscar Valor Orçado',
            'POST',
            `${this.baseUrl}/solicitacao_bonus/valor_orcado`,
            200,
            {
                conta_contabil: '41104036',
                centro_custo: '6060'
            }
        );
        
        if (resultadoValorOrcado.sucesso && resultadoValorOrcado.response) {
            try {
                const dados = resultadoValorOrcado.response.data;
                logger.info('Verificando valor orçado...');
                if (dados.dados) {
                    const valorInfo = dados.dados;
                    logger.success(`Conta Contábil: ${valorInfo.conta_contabil || 'N/A'}`);
                    logger.info(`Centro de Custo: ${valorInfo.centro_custo || 'N/A'}`);
                    logger.info(`Valor Orçado: R$ ${(valorInfo.valor_orcado || 0).toFixed(2)}`);
                }
            } catch (error) {
                logger.error(`Erro ao processar resposta: ${error.message}`);
            }
        }

        // Gerar relatório final
        this.gerarRelatorioFinal();
        return this.resultados;
    }

    gerarRelatorioFinal() {
        logger.info('\n' + '='.repeat(60));
        logger.info('RELATÓRIO FINAL');
        logger.info('='.repeat(60));

        const { total, sucesso, falha } = this.resultados;
        const taxaSucesso = total > 0 ? (sucesso / total * 100).toFixed(1) : 0;

        logger.info(`Total de testes: ${total}`);
        logger.success(`Sucessos: ${sucesso}`);
        logger.error(`Falhas: ${falha}`);
        logger.info(`Taxa de Sucesso: ${taxaSucesso}%`);

        if (taxaSucesso === '100.0') {
            logger.success('TODOS OS TESTES PASSARAM! API está saudável!');
        } else if (taxaSucesso >= 80) {
            logger.warn('Maioria dos testes passou, mas há algumas falhas.');
        } else {
            logger.error('Muitos testes falharam. API com problemas!');
        }

        logger.info('='.repeat(60));
    }

    obterResultados() {
        return this.resultados;
    }
}

module.exports = HealthChecker;

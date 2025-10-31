// Script para testar se o timezone está configurado corretamente
console.log('='.repeat(60));
console.log('TESTE DE CONFIGURAÇÃO DE TIMEZONE');
console.log('='.repeat(60));

// Variável de ambiente TZ
console.log('\n1. Variável de ambiente TZ:');
console.log(`   TZ = ${process.env.TZ || 'NÃO DEFINIDA'}`);

// Data/hora atual
console.log('\n2. Data/Hora atual:');
const agora = new Date();
console.log(`   UTC: ${agora.toISOString()}`);
console.log(`   Local (pt-BR): ${agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
console.log(`   toString(): ${agora.toString()}`);

// Offset do timezone
console.log('\n3. Offset do timezone:');
const offset = agora.getTimezoneOffset();
console.log(`   Offset em minutos: ${offset}`);
console.log(`   Offset em horas: ${offset / 60}`);
console.log(`   Esperado para America/Sao_Paulo: -180 minutos (-3 horas)`);

// Verificação
console.log('\n4. Verificação:');
if (offset === -180) {
    console.log('   ✅ TIMEZONE CORRETO! (America/Sao_Paulo)');
} else {
    console.log(`   ❌ TIMEZONE INCORRETO! Offset atual: ${offset}, esperado: -180`);
}

// Teste com node-cron (horário de agendamento)
console.log('\n5. Teste de agendamento:');
console.log('   Agendamento às 17:30 será executado às:');
const teste1730 = new Date();
teste1730.setHours(17, 30, 0, 0);
console.log(`   ${teste1730.toLocaleString('pt-BR')}`);

console.log('\n' + '='.repeat(60));

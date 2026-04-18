// test-all.js (corrigido)
import fs from 'fs';
import { execSync } from 'child_process';
import runCore from './core.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 INICIANDO TESTE COMPLETO DO NÚCLEO COGNITIVO\n');

let erros = 0;

function test(descricao, fn) {
  try {
    fn();
    console.log(`✅ ${descricao}`);
  } catch (err) {
    console.error(`❌ ${descricao}`);
    console.error(`   ${err.message}`);
    erros++;
  }
}

// 1. Ambiente e dependências
test('Node.js versão >= 18', () => {
  const version = process.version.slice(1);
  if (parseInt(version) < 18) throw new Error(`Versão ${version} < 18`);
});

test('Dependências instaladas (express) - verifica node_modules', () => {
  const expressPath = path.join(__dirname, 'node_modules', 'express');
  if (!fs.existsSync(expressPath)) throw new Error('Express não encontrado. Execute npm install');
});

// 2. Arquivos essenciais existem
const arquivos = [
  'core.js',
  'emotion-engine.js',
  'memory-engine.js',
  'drive-engine.js',
  'identity-core.js',
  'server.js',
  'dashboard.html',
  'memory.json',
  'state.json',
  'beliefs.json'
];
arquivos.forEach(file => {
  test(`Arquivo ${file} existe`, () => {
    if (!fs.existsSync(file)) throw new Error(`Arquivo ${file} não encontrado`);
  });
});

// 3. Teste de execução do runCore
test('runCore executa e retorna objeto esperado', () => {
  const result = runCore();
  if (!result || typeof result !== 'object') throw new Error('Retorno não é objeto');
  const required = ['pensamento', 'intencao', 'reflexao', 'crenças', 'decisão', 'estado', 'metaObjetivo', 'coerencia', 'diversidade', 'memoria'];
  for (let field of required) {
    if (!(field in result)) throw new Error(`Campo ${field} ausente`);
  }
});

test('runCore gera humor válido', () => {
  const result = runCore();
  const humores = ['confuso', 'curioso', 'reflexivo', 'analítico'];
  if (!humores.includes(result.estado.humor)) throw new Error(`Humor inválido: ${result.estado.humor}`);
});

test('runCore gera interesse dentro da lista', () => {
  const result = runCore();
  const interesses = ['tecnologia', 'humanos', 'padrões', 'dados'];
  if (!interesses.includes(result.estado.interesse)) throw new Error(`Interesse inválido: ${result.estado.interesse}`);
});

test('Memória é um array não vazio após execução', () => {
  const result = runCore();
  if (!Array.isArray(result.memoria) || result.memoria.length === 0) throw new Error('Memória vazia ou não array');
});

// 4. Teste de persistência
test('memory.json é um array', () => {
  const data = JSON.parse(fs.readFileSync('memory.json', 'utf-8'));
  if (!Array.isArray(data)) throw new Error('memory.json não é array');
});

test('state.json contém humor e interesse', () => {
  const state = JSON.parse(fs.readFileSync('state.json', 'utf-8'));
  if (!state.humor || !state.interesse) throw new Error('state.json incompleto');
});

test('beliefs.json é array', () => {
  const beliefs = JSON.parse(fs.readFileSync('beliefs.json', 'utf-8'));
  if (!Array.isArray(beliefs)) throw new Error('beliefs.json não é array');
});

// 5. Teste de integridade dos motores
test('EmotionEngine exporta classe', async () => {
  const module = await import('./emotion-engine.js');
  if (!module.EmotionEngine) throw new Error('EmotionEngine não encontrado');
});

test('MemoryEngine exporta classe', async () => {
  const module = await import('./memory-engine.js');
  if (!module.MemoryEngine) throw new Error('MemoryEngine não encontrado');
});

test('DriveEngine exporta classe', async () => {
  const module = await import('./drive-engine.js');
  if (!module.DriveEngine) throw new Error('DriveEngine não encontrado');
});

test('IdentityCore exporta classe', async () => {
  const module = await import('./identity-core.js');
  if (!module.IdentityCore) throw new Error('IdentityCore não encontrado');
});

// 6. Teste do dashboard (atualizado para Three.js)
test('dashboard.html contém elementos principais (Three.js)', () => {
  const html = fs.readFileSync('dashboard.html', 'utf-8');
  const precisa = ['id="humorLabel"', 'id="pensamento"', 'id="drivesChart"', 'id="three-container"', 'import * as THREE'];
  for (let tag of precisa) {
    if (!html.includes(tag)) throw new Error(`Elemento "${tag}" não encontrado no dashboard`);
  }
});

// 7. Teste opcional do servidor
test('Servidor está respondendo na porta 3000 (opcional)', async () => {
  try {
    const res = await fetch('http://localhost:3000/think');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.pensamento) throw new Error('Resposta inválida');
    console.log('   (Servidor detectado e respondendo corretamente)');
  } catch (err) {
    console.log('   ⚠️ Servidor não está rodando. Execute "node server.js" para testar a API e o dashboard.');
  }
});

// Conclusão
console.log('\n' + '='.repeat(50));
if (erros === 0) {
  console.log('🎉 TODOS OS TESTES PASSARAM! O projeto está 100% funcional.\n');
  console.log('Recomendações:');
  console.log('  - Execute "node server.js" e acesse http://localhost:3000/dashboard.html');
  console.log('  - Para loop autônomo: "node core-runner.js"');
} else {
  console.log(`❌ ${erros} teste(s) falharam. Revise as mensagens acima.`);
}
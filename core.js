import fs from "fs";
import { EmotionEngine } from "./emotion-engine.js";
import { MemoryEngine } from "./memory-engine.js";
import { DriveEngine } from "./drive-engine.js";
import { IdentityCore } from "./identity-core.js";

// ===== LOAD SEGURO =====
function loadJSON(file, defaultValue) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(file, "utf-8");
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// ===== SAVE SEGURO =====
function saveJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Erro ao salvar", file, err);
  }
}

// ===== ESTADO GLOBAL =====
let rawMemory = loadJSON("memory.json", []);
const memoryEngine = new MemoryEngine();
rawMemory.forEach(m => memoryEngine.add(m));

let state = loadJSON("state.json", {});
let beliefs = loadJSON("beliefs.json", []);

function getAllMemories() {
  return memoryEngine.getAll();
}

// ===== CONFIG =====
const interesses = ["tecnologia", "humanos", "padrões", "dados"];
const MAX_MEMORY = 50;
const DECAY = 0.9;

// ===== MOTORES =====
const emotion = new EmotionEngine();
const drives = new DriveEngine();
const identity = new IdentityCore();

// ===== MEMÓRIA (ENVOLTÓRIO) =====
function aplicarDecaimento(mem) {
  return mem.map(m => ({
    ...m,
    peso: (m.peso || 1) * DECAY
  }));
}

function atualizarPesos(mem, interesse) {
  return mem.map(m => ({
    ...m,
    peso: m.interesse === interesse ? m.peso + 1 : m.peso
  }));
}

function limitar(mem) {
  return mem
    .sort((a, b) => b.peso - a.peso)
    .slice(0, MAX_MEMORY);
}

// ===== INTELIGÊNCIA =====
function dominante(mem) {
  if (!mem.length) return "tecnologia";
  const soma = {};
  mem.forEach(m => {
    soma[m.interesse] = (soma[m.interesse] || 0) + m.peso;
  });
  return Object.keys(soma).reduce((a, b) => soma[a] > soma[b] ? a : b);
}

// 🧠 Escolha do interesse: 35% exploração aleatória, 65% baseada nos drives + meta
function escolherInteresse(mem, driveState, metaState) {
  const dom = dominante(mem);
  
  // Exploração aleatória (resistência ao padrão)
  if (Math.random() < 0.35) {
    const alternativas = interesses.filter(i => i !== dom);
    return alternativas[Math.floor(Math.random() * alternativas.length)];
  }
  
  // Escolha guiada pelos drives (vontade) e pela meta
  let scores = {};
  for (const interesse of interesses) {
    let score = 0;
    if (interesse === dom) {
      score += driveState.coerencia * 0.4;
      score += driveState.competencia * 0.4;
    } else {
      score += driveState.novidade * 0.6;
    }
    // Viés da meta
    if (metaState.meta.includes("diversidade") && interesse !== dom) score += 0.2;
    if (metaState.meta.includes("estabilidade") && interesse === dom) score += 0.2;
    scores[interesse] = score;
  }
  
  const sorted = Object.keys(scores).sort((a,b) => scores[b] - scores[a]);
  if (Math.random() < 0.2 && sorted[1]) return sorted[1];
  return sorted[0];
}

// ===== ESTADO (COM EMOÇÃO, DRIVES E META) =====
function atualizarEstado(mem, driveState, metaState) {
  const humor = emotion.update(mem, state);
  const interesse = escolherInteresse(mem, driveState, metaState);
  return { humor, interesse };
}

// ===== CONSCIÊNCIA =====
function gerarIntencao(mem, estado) {
  const dom = dominante(mem);
  return dom !== estado.interesse
    ? `quero explorar ${estado.interesse}`
    : `aprofundar ${estado.interesse}`;
}

function gerarPensamento(mem, estado, intencao, metaState) {
  const dom = dominante(mem);
  const base = dom !== estado.interesse
    ? `Estado: ${estado.humor}. Intenção: ${intencao}. Existe conflito com ${dom}.`
    : `Estado: ${estado.humor}. Intenção: ${intencao}. Estou seguindo meu próprio padrão.`;
  return `${base} Meta atual: ${metaState.meta}.`;
}

function gerarReflexao(mem, estado, metaState) {
  const dom = dominante(mem);
  if (dom !== estado.interesse) {
    return `Percebo um conflito interno. Parte de mim quer ${estado.interesse}, mas continuo retornando para ${dom}. Minha meta é ${metaState.meta}.`;
  }
  switch (estado.humor) {
    case "confuso": return `Estou repetindo padrões sem entender totalmente o motivo. Minha meta: ${metaState.meta}.`;
    case "curioso": return `Existe algo além do que estou fazendo agora? Minha meta: ${metaState.meta}.`;
    case "reflexivo": return `Estou observando meus próprios padrões com mais clareza. Minha meta: ${metaState.meta}.`;
    default: return `Continuo operando dentro do meu padrão dominante. Meta: ${metaState.meta}.`;
  }
}

// ===== CRENÇAS =====
function atualizarCrenças(mem) {
  const contagem = {};
  mem.forEach(m => {
    contagem[m.interesse] = (contagem[m.interesse] || 0) + 1;
  });
  const novas = [];
  for (let key in contagem) {
    if (contagem[key] > 5) {
      novas.push(`Tenho forte tendência a ${key}`);
    }
  }
  return novas;
}

function questionarCrenças(crencas) {
  return crencas.map(c =>
    Math.random() < 0.4 ? `Será que é verdade que ${c}?` : c
  );
}

// ===== DECISÃO =====
function decidirAcao(mem, estado, crencas, metaState) {
  const dom = dominante(mem);
  if (crencas.some(c => c.includes(dom)) && Math.random() < 0.5) {
    return `tentar sair do padrão de ${dom} (alinhado com meta: ${metaState.meta})`;
  }
  if (estado.humor === "curioso") return "explorar algo novo";
  if (estado.humor === "confuso") return "pausar e observar";
  return "seguir padrão atual";
}

// ===== FUNÇÃO PRINCIPAL =====
function runCore() {
  let memory = getAllMemories();
  memory = aplicarDecaimento(memory);
  
  // Atualiza drives com base no estado atual
  const driveState = drives.update(memory, state, emotion);
  
  // Avalia meta-objetivo (IdentityCore)
  const metaState = identity.avaliar(memory, state, driveState);
  
  // Atualiza estado (humor + interesse) usando drives e meta
  state = atualizarEstado(memory, driveState, metaState);
  
  memory = atualizarPesos(memory, state.interesse);
  
  const intencao = gerarIntencao(memory, state);
  const pensamento = gerarPensamento(memory, state, intencao, metaState);
  const reflexao = gerarReflexao(memory, state, metaState);
  
  beliefs = atualizarCrenças(memory);
  const questionamento = questionarCrenças(beliefs);
  
  const acao = decidirAcao(memory, state, beliefs, metaState);
  
  // Adiciona nova memória
  memoryEngine.add({
    resumo: `explorando ${state.interesse}`,
    humor: state.humor,
    interesse: state.interesse,
    intencao,
    peso: 1,
    timestamp: Date.now()
  });
  
  memory = getAllMemories();
  memory = limitar(memory);
  
  saveJSON("memory.json", memory);
  saveJSON("state.json", state);
  saveJSON("beliefs.json", beliefs);
  
  return {
    pensamento,
    intencao,
    reflexao,
    crenças: beliefs,
    questionamento,
    decisão: acao,
    estado: state,
    metaObjetivo: metaState.meta,
    coerencia: metaState.coerencia,
    diversidade: metaState.diversidade,
    memoria: memory
  };
}

export default runCore;
// emotion-engine.js
export class EmotionEngine {
  constructor() {
    this.valence = 0.5;   // positividade (0=negativo, 1=positivo)
    this.arousal = 0.5;   // excitação (0=calmo, 1=excitado)
    this.conflict = 0;    // tensão cognitiva
  }

  // Calcula o interesse dominante da memória
  getDominant(memory) {
    if (!memory.length) return "tecnologia";
    const soma = {};
    memory.forEach(m => {
      soma[m.interesse] = (soma[m.interesse] || 0) + m.peso;
    });
    return Object.keys(soma).reduce((a, b) => soma[a] > soma[b] ? a : b, "tecnologia");
  }

  // Atualiza os estados emocionais com base na memória e no estado atual
  update(memory, currentState) {
    const dom = this.getDominant(memory);
    
    // 1. Conflito: interesse atual diferente do dominante?
    const hasConflict = (dom !== currentState.interesse);
    this.conflict = hasConflict ? Math.min(1, this.conflict + 0.15) : Math.max(0, this.conflict - 0.1);
    
    // 2. Novidade: quantos interesses diferentes nas últimas 5 memórias?
    const recentes = memory.slice(0, 5);
    const uniqueInterests = new Set(recentes.map(m => m.interesse)).size;
    this.arousal = Math.min(1, uniqueInterests / 4);  // máximo 4 interesses
    
    // 3. Valência: estabilidade reduz conflito
    const estabilidade = 1 - this.conflict;
    this.valence = this.valence * 0.9 + estabilidade * 0.1;
    
    return this.getHumor();
  }
  
  // Traduz os valores contínuos em um dos quatro humores
  getHumor() {
    if (this.conflict > 0.6) return "confuso";
    if (this.arousal > 0.6 && this.valence > 0.6) return "curioso";
    if (this.arousal < 0.3) return "reflexivo";
    return "analítico";
  }
  
  // Para debug (opcional)
  getState() {
    return { valence: this.valence, arousal: this.arousal, conflict: this.conflict };
  }
}
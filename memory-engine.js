// memory-engine.js
export class MemoryEngine {
  constructor(maxLongTerm = 100) {
    this.shortTerm = [];   // últimos 10 eventos
    this.longTerm = [];    // consolidados
    this.maxLongTerm = maxLongTerm;
  }

  // Adiciona um novo evento
  add(event) {
    const memory = {
      ...event,
      peso: 1,
      acessos: 0,
      timestamp: Date.now(),
      tipo: event.importancia > 0.7 ? 'episodica' : 'semantica'
    };
    
    this.shortTerm.unshift(memory);
    if (this.shortTerm.length > 10) this.shortTerm.pop();
    
    this.longTerm.push(memory);
    this.consolidate();
  }

  // Consolida memórias antigas (similares -> funde)
  consolidate() {
    // Agrupa por interesse e dia
    const groups = new Map();
    for (const mem of this.longTerm) {
      const day = Math.floor(mem.timestamp / 86400000);
      const key = `${mem.interesse}_${day}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(mem);
    }
    
    // Substitui grupos por uma memória consolidada
    const newLongTerm = [];
    for (const group of groups.values()) {
      if (group.length === 1) {
        newLongTerm.push(group[0]);
      } else {
        // Funde: média de pesos, soma de acessos
        const avgPeso = group.reduce((s, m) => s + m.peso, 0) / group.length;
        const totalAcessos = group.reduce((s, m) => s + (m.acessos || 0), 0);
        newLongTerm.push({
          ...group[0],
          peso: avgPeso,
          acessos: totalAcessos,
          consolidado: true,
          ocorrencias: group.length
        });
      }
    }
    
    // Mantém apenas os mais recentes/importantes
    this.longTerm = newLongTerm
      .sort((a, b) => b.peso - a.peso)
      .slice(0, this.maxLongTerm);
  }

  // Recupera memórias relevantes para um interesse
  recall(interesse, limit = 5) {
    const relevantes = this.longTerm
      .filter(m => m.interesse === interesse)
      .sort((a, b) => b.peso - a.peso)
      .slice(0, limit);
    
    // Reforça pelo acesso
    relevantes.forEach(m => m.acessos = (m.acessos || 0) + 1);
    return relevantes;
  }

  // Retorna todas as memórias (curto + longo prazo)
  getAll() {
    return [...this.shortTerm, ...this.longTerm];
  }
}
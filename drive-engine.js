// drive-engine.js
export class DriveEngine {
  constructor() {
    this.drives = {
      novidade: 0.5,
      coerencia: 0.5,
      competencia: 0.5
    };
  }

  update(memory, state, emotion) {
    // 1. Novidade: quanto maior a diversidade recente, menor a necessidade
    const recentes = memory.slice(0, 5);
    const diversidade = new Set(recentes.map(m => m.interesse)).size;
    this.drives.novidade = Math.min(1, 1 - (diversidade / 4));
    
    // 2. Coerência: baseada no conflito (quanto maior o conflito, maior a coerência desejada)
    this.drives.coerencia = Math.min(1, (emotion.conflict || 0) * 1.5);
    
    // 3. Competência: média de peso do interesse dominante
    const dom = this.getDominant(memory);
    const memsDom = memory.filter(m => m.interesse === dom);
    const pesoMedio = memsDom.reduce((s, m) => s + (m.peso || 1), 0) / (memsDom.length || 1);
    this.drives.competencia = Math.min(1, pesoMedio / 10);
    
    return this.drives;
  }

  getDominant(memory) {
    const soma = {};
    memory.forEach(m => {
      soma[m.interesse] = (soma[m.interesse] || 0) + (m.peso || 1);
    });
    return Object.keys(soma).reduce((a,b) => soma[a] > soma[b] ? a : b, "tecnologia");
  }

  escolherInteresseComDrives(memory, drives, interesses) {
    const dom = this.getDominant(memory);
    const scores = {};
    
    for (const interesse of interesses) {
      let score = 0;
      if (interesse === dom) {
        score += drives.coerencia * 0.5;
        score += drives.competencia * 0.5;
      } else {
        score += drives.novidade * 0.8;
      }
      scores[interesse] = score;
    }
    
    const sorted = Object.keys(scores).sort((a,b) => scores[b] - scores[a]);
    // Pequena chance de escolher o segundo melhor (ruído)
    if (Math.random() < 0.2 && sorted[1]) return sorted[1];
    return sorted[0];
  }
}
// identity-core.js
export class IdentityCore {
  constructor() {
    this.metaObjetivo = "expandir entendimento próprio";
    this.historicoCoerencias = [];
    this.historicoDiversidade = [];
  }

  // Avalia o estado atual e define/atualiza o meta-objetivo
  avaliar(memory, state, drives) {
    // Coerência: proporção do interesse dominante
    const dom = this.getDominant(memory);
    const total = memory.length || 1;
    const countDom = memory.filter(m => m.interesse === dom).length;
    const coerencia = countDom / total;
    
    // Diversidade: número de interesses diferentes nas últimas 10 memórias
    const recentes = memory.slice(0, 10);
    const diversidade = new Set(recentes.map(m => m.interesse)).size;
    
    // Atualiza históricos
    this.historicoCoerencias.push(coerencia);
    this.historicoDiversidade.push(diversidade);
    if (this.historicoCoerencias.length > 20) this.historicoCoerencias.shift();
    if (this.historicoDiversidade.length > 20) this.historicoDiversidade.shift();
    
    // Tendências
    const tendenciaCoerencia = this.calcularTendencia(this.historicoCoerencias);
    const tendenciaDiversidade = this.calcularTendencia(this.historicoDiversidade);
    
    // Lógica de definição da meta
    if (coerencia > 0.7 && tendenciaCoerencia > 0) {
      this.metaObjetivo = "expandir diversidade de padrões";
    } else if (coerencia < 0.4 && tendenciaCoerencia < 0) {
      this.metaObjetivo = "buscar estabilidade e coerência";
    } else if (diversidade >= 3 && tendenciaDiversidade > 0) {
      this.metaObjetivo = "aprofundar entendimento próprio";
    } else {
      this.metaObjetivo = "reduzir contradições internas";
    }
    
    return {
      meta: this.metaObjetivo,
      coerencia,
      diversidade,
      tendenciaCoerencia,
      tendenciaDiversidade
    };
  }
  
  getDominant(memory) {
    const soma = {};
    memory.forEach(m => {
      soma[m.interesse] = (soma[m.interesse] || 0) + (m.peso || 1);
    });
    return Object.keys(soma).reduce((a,b) => soma[a] > soma[b] ? a : b, "tecnologia");
  }
  
  calcularTendencia(historico) {
    if (historico.length < 5) return 0;
    const recente = historico.slice(-5).reduce((a,b) => a+b, 0) / 5;
    const antigo = historico.slice(-10, -5).reduce((a,b) => a+b, 0) / 5;
    return recente - antigo;
  }
}
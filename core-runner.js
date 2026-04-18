import runCore from "./core.js";

const INTERVALO = 3000; // 3 segundos

console.log("🚀 Núcleo iniciado (loop direto)...\n");

function rodarCore() {
    const resultado = runCore();
    console.log("\n==============================");
    console.log(`🧠 CICLO - ${new Date().toLocaleTimeString()}`);
    console.log(`😊 Humor: ${resultado.estado.humor} | Interesse: ${resultado.estado.interesse}`);
    console.log(`💭 Pensamento: ${resultado.pensamento}`);
    console.log(`🎯 Meta: ${resultado.metaObjetivo}`);
    console.log(`⚡ Decisão: ${resultado.decisão}`);
    console.log(`📊 Coerência: ${resultado.coerencia?.toFixed(3)} | Diversidade: ${resultado.diversidade}`);
    console.log("==============================\n");
}

// Executa imediatamente e depois no intervalo
rodarCore();
setInterval(rodarCore, INTERVALO);
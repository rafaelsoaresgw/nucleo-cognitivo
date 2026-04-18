import runCore from "./core.js";

console.log("🧪 Testando núcleo...\n");

const resultado = runCore();

console.log("RESULTADO:\n");
console.log(JSON.stringify(resultado, null, 2));
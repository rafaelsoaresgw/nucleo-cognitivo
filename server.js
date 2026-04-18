import express from "express";
import cors from "cors";
import runCore from "./core.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Configuração CORS usando a biblioteca oficial
// Opção 1: Permitir todas as origens (mais simples para teste)
// app.use(cors());

// Opção 2: Permitir apenas origens específicas (recomendado para produção)
const allowedOrigins = [
  'https://rafaelsoaresgw.github.io',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'A política CORS não permite acesso a partir desta origem.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Serve arquivos estáticos (HTML, CSS, JS, imagens) da pasta atual
app.use(express.static(__dirname));

// ===== ROTAS DA API =====

// Rota original: retorna o resultado completo do ciclo cognitivo
app.get("/think", (req, res) => {
  const result = runCore();
  res.json(result);
});

// Rota interativa: recebe uma pergunta e responde com o estado interno do núcleo
app.get("/ask", (req, res) => {
  const pergunta = req.query.q || "sem pergunta";
  const resultado = runCore();
  res.json({
    perguntaRecebida: pergunta,
    meuEstado: resultado.estado,
    meuPensamento: resultado.pensamento,
    minhaReflexao: resultado.reflexao,
    minhaDecisao: resultado.decisão,
    nota: "Não sei responder sua pergunta. Só posso compartilhar meu processo interno."
  });
});

// Rota de exportação de dados (CSV ou JSON)
app.get("/export", (req, res) => {
  const format = req.query.format || "json";
  const result = runCore();
  const { memoria, estado, metaObjetivo, coerencia, diversidade, crenças } = result;

  const exportData = {
    timestamp: new Date().toISOString(),
    estado,
    metaObjetivo,
    coerencia,
    diversidade,
    crenças,
    memoria: memoria.map(m => ({
      timestamp: m.timestamp,
      interesse: m.interesse,
      humor: m.humor,
      peso: m.peso,
      intencao: m.intencao,
      resumo: m.resumo,
      consolidado: m.consolidado || false,
      ocorrencias: m.ocorrencias || 1
    }))
  };

  if (format === "csv") {
    const csvRows = [
      ["timestamp", "interesse", "humor", "peso", "intencao", "consolidado", "ocorrencias"]
    ];
    for (const mem of exportData.memoria) {
      csvRows.push([
        mem.timestamp,
        mem.interesse,
        mem.humor,
        mem.peso,
        `"${mem.intencao.replace(/"/g, '""')}"`,
        mem.consolidado,
        mem.ocorrencias
      ]);
    }
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=nucleo-export.csv");
    return res.send(csvContent);
  }

  res.json(exportData);
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
  console.log("📁 Dashboard: http://localhost:3000/dashboard.html");
  console.log("Endpoints:");
  console.log("  GET /think");
  console.log("  GET /ask?q=...");
  console.log("  GET /export?format=csv");
});
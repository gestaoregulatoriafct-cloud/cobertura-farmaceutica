"use client";

import { useState } from "react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  async function onUpload() {
    if (!file) return;
    setMsg("Enviando...");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/import", { method: "POST", body: fd });
    const data = await res.json();
    setMsg(data?.message || "OK");
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Importar planilha</h1>
      <p className="text-sm text-zinc-700">
        Selecione a “última tabela” (.xlsx). O sistema cria filiais, farmacêuticos e escalas e marca o que precisar de revisão.
      </p>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block"
      />

      <button onClick={onUpload} className="px-4 py-2 rounded bg-black text-white">
        Importar
      </button>

      {msg ? <div className="text-sm">{msg}</div> : null}

      <div className="text-xs text-zinc-500">
        Dica: depois vá em <b>Rede</b> e <b>RH</b>.
      </div>
    </div>
  );
}

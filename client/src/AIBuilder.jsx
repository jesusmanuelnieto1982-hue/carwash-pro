import React, { useState } from "react";
import API from "../api/api";

export default function AIBuilder() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await API.post("/owner/ai/generate-business", { prompt });
      setResult(res.data.module);
    } catch {
      setResult({ error: "Error generando negocio" });
    }
    setLoading(false);
  };
  import { useEffect, useState } from "react";
  import API from "../api/api";

  const [dynamicModules, setDynamicModules] = useState({});

  useEffect(() => {
    API.get("/owner/business-modules").then((res) => {
      const modules = {};
      res.data.forEach((m) => {
        modules[m.key] = m;
      });
      setDynamicModules(modules);
    });
  }, []);
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">AI Business Generator</h2>

      <textarea
        className="w-full border p-2 mt-2"
        placeholder="Ej: negocio de limpieza de sofás a domicilio"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={generate}
        className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
      >
        {loading ? "Creando..." : "Crear Negocio"}
      </button>

      {result && (
        <pre className="bg-gray-100 p-2 mt-4 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

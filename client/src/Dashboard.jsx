import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import {
  Truck,
  Scale,
  Hash,
  DollarSign,
  MapPin,
  Zap,
  BrainCircuit,
  Package,
  LogOut,
  Mail,
  Send,
} from "lucide-react";

export default function Dashboard({ user, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [aiDecision, setAiDecision] = useState(null);
  const [records, setRecords] = useState([]);

  const [formData, setFormData] = useState({
    vehiculo: "Unit 101",
    origin: "",
    destination: "",
    miles: "",
    amount: "",
    weight: "",
    trailer_type: "Dry Van",
    commodity: "",
  });

  // --- 1. AI MARKET SCANNER ---
  const handleScanMarket = async () => {
    setIsScanning(true);
    try {
      const { data: loads, error } = await supabase
        .from("market_loads")
        .select("*");

      if (error) throw error;
      if (!loads || loads.length === 0)
        return alert("No hay cargas disponibles en el mercado.");

      const { data: aiResponse, error: aiError } =
        await supabase.functions.invoke("nieto-sync-ai", {
          body: { loads, user_context: user },
        });

      if (aiError) throw aiError;

      const best = aiResponse.bestLoad || aiResponse.best_load;

      setFormData({
        ...formData,
        origin: best.origin,
        destination: best.destination,
        miles: best.miles,
        amount: best.offer_amount,
        weight: best.weight,
        commodity: best.commodity || "General Freight",
      });

      setAiDecision({
        reason: aiResponse.reason,
        score: aiResponse.score,
        email_draft_en: aiResponse.email_draft_en || aiResponse.email_draft,
        broker_email: best.broker_email || "jesusmanuelnieto1982@gmail.com",
      });
    } catch (err) {
      console.error("AI Error:", err);
      alert("Error en el cerebro de la IA.");
    } finally {
      setIsScanning(false);
    }
  };

  // --- 2. ENVÍO DE CORREO ---
  const handleSendEmail = async () => {
    if (!aiDecision) return;
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-dispatch-email", {
        body: {
          to: "jesusmanuelnieto1982@gmail.com",
          subject: `Load Inquiry: ${formData.origin} to ${formData.destination}`,
          html: `<p>${aiDecision.email_draft_en}</p>`,
        },
      });

      if (error) throw error;
      alert("📧 ¡Correo enviado exitosamente!");
    } catch (err) {
      alert("Error al enviar correo.");
    } finally {
      setIsSending(false);
    }
  };

  // --- 3. ANÁLISIS DE RENTABILIDAD ---
  const [analysis, setAnalysis] = useState({
    msg: "Esperando datos...",
    status: "NEUTRAL",
    rpm: 0,
  });

  useEffect(() => {
    const m = parseFloat(formData.miles);
    const a = parseFloat(formData.amount);
    if (m > 0 && a > 0) {
      const rpm = a / m;
      let msg = rpm < 2.0 ? "❌ MALA" : rpm < 2.8 ? "✅ OK" : "🔥 EXCELENTE";
      let status = rpm < 2.0 ? "DANGER" : rpm < 2.8 ? "WARNING" : "SUCCESS";
      setAnalysis({ msg, status, rpm });
    }
  }, [formData.miles, formData.amount]);

  // --- 4. GUARDAR CARGA (ELIMINANDO EL ERROR DE COLUMN 'AMOUNT') ---
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada. Logueate de nuevo.");

      // Enviamos exactamente lo que la tabla operaciones_saas espera
      const response = await fetch(
        "http://localhost:3000/api/v1/owner/commit-load",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            industria: "logistics",
            monto: parseFloat(formData.amount), // USAMOS 'monto' NO 'amount'
            status: "Booked",
            detalles_json: {
              ...formData,
              rpm_calculado: analysis.rpm.toFixed(2),
              fecha_registro: new Date().toISOString(),
            },
          }),
        },
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error en el servidor");

      alert("🚀 ¡Carga de Nashville Registrada!");
      fetchRecords(); // Actualizar tabla visual
    } catch (err) {
      console.error("Save Error:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    const { data } = await supabase
      .from("operaciones_saas")
      .select("*")
      .eq("industria", "logistics")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setRecords(data);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="min-h-screen bg-[#070708] text-white p-6 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
        <h1 className="text-2xl font-black italic tracking-tighter">
          NIETO <span className="text-blue-600">SYNC</span>
        </h1>
        <button
          onClick={onLogout}
          className="text-red-500 font-black text-xs flex items-center gap-2"
        >
          <LogOut size={14} /> Logout
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSave}
            className="bg-[#111113] p-8 rounded-[2rem] border border-white/5 shadow-2xl"
          >
            <h3 className="text-blue-500 font-black text-xs uppercase mb-6 flex items-center gap-2">
              <Package size={16} /> Dashboard Operativo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                className="bg-black border border-white/10 p-4 rounded-xl"
                placeholder="Unit"
                value={formData.vehiculo}
                onChange={(e) =>
                  setFormData({ ...formData, vehiculo: e.target.value })
                }
              />
              <select
                className="bg-black border border-white/10 p-4 rounded-xl"
                value={formData.trailer_type}
                onChange={(e) =>
                  setFormData({ ...formData, trailer_type: e.target.value })
                }
              >
                <option>Dry Van</option>
                <option>Reefer</option>
                <option>Flatbed</option>
              </select>
              <input
                className="bg-black border border-white/10 p-4 rounded-xl"
                placeholder="Origin"
                value={formData.origin}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
              />
              <input
                className="bg-black border border-white/10 p-4 rounded-xl"
                placeholder="Destination"
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
              />
              <input
                className="bg-black border border-white/10 p-4 rounded-xl font-bold text-blue-400"
                placeholder="Miles"
                value={formData.miles}
                onChange={(e) =>
                  setFormData({ ...formData, miles: e.target.value })
                }
              />
              <input
                className="bg-black border border-white/10 p-4 rounded-xl font-bold text-green-400"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-blue-600 py-6 rounded-2xl font-black uppercase shadow-lg disabled:opacity-50"
            >
              {loading ? "Processing..." : "Commit Load"}
            </button>
          </form>

          <div className="bg-[#111113] p-6 rounded-[2rem] border border-white/5">
            <h3 className="text-slate-500 font-black text-[10px] uppercase mb-4 tracking-widest">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center"
                >
                  <p className="font-bold text-sm uppercase">
                    {r.detalles_json?.origin} ➔ {r.detalles_json?.destination}
                  </p>
                  <p className="text-green-500 font-black text-lg">
                    ${r.monto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className={`p-8 rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-500 ${analysis.status === "DANGER" ? "bg-red-900/30 border-red-500" : analysis.status === "WARNING" ? "bg-orange-900/30 border-orange-500" : analysis.status === "SUCCESS" ? "bg-green-900/30 border-green-500" : "bg-[#111113]"}`}
          >
            <h4 className="font-black uppercase text-xs mb-4 flex items-center gap-2">
              <BrainCircuit size={18} /> AI Analysis
            </h4>
            <p className="text-xl font-black italic mb-6">"{analysis.msg}"</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/60 p-4 rounded-2xl text-center">
                <p className="text-[8px] uppercase text-slate-500">RPM</p>
                <p className="text-xl font-black text-blue-400">
                  ${analysis.rpm.toFixed(2)}
                </p>
              </div>
              <div className="bg-black/60 p-4 rounded-2xl text-center">
                <p className="text-[8px] uppercase text-slate-500">AI Score</p>
                <p className="text-xl font-black text-white">
                  {aiDecision?.score || "--"}%
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleScanMarket}
            disabled={isScanning}
            className="w-full bg-blue-600/10 border border-blue-500/30 p-8 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-blue-600/20 transition-all shadow-xl"
          >
            <Zap
              className={`text-yellow-500 ${isScanning ? "animate-spin" : ""}`}
              size={32}
            />
            <div className="text-center text-blue-400 font-black uppercase text-sm tracking-widest">
              Scan Market Now
            </div>
          </button>

          {aiDecision && (
            <div className="bg-[#111113] p-6 rounded-[2rem] border border-blue-500/20">
              <h4 className="text-[10px] font-black uppercase text-blue-500 mb-3 flex items-center gap-2">
                <Mail size={12} /> Email Draft
              </h4>
              <p className="text-[11px] text-slate-400 italic mb-4">
                "{aiDecision.email_draft_en}"
              </p>
              <button
                onClick={handleSendEmail}
                disabled={isSending}
                className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2"
              >
                {isSending ? (
                  "SENDING..."
                ) : (
                  <>
                    <Send size={14} /> Send Email
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

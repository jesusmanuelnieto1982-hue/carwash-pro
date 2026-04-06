import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { BUSINESS_CONFIG } from "./businessConfig";
import SelectorFlota from "./SelectorFlota";
import { dispatcherLogic } from "./dispatcher";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Truck,
  BrainCircuit,
  Settings,
  TrendingUp,
} from "lucide-react";

export default function Dashboard({ user, onLogout }) {
  // --- ESTADOS PRINCIPALES ---
  const [debugCategory] = useState(
    user?.empresas?.categoria_slug || "freight-load",
  );
  const [activeTab, setActiveTab] = useState("registro");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DE FLOTA ---
  const [showSelector, setShowSelector] = useState(false);
  const [miFlota, setMiFlota] = useState([]);
  const [cargandoFlota, setCargandoFlota] = useState(true);

  // --- FORMULARIO Y AI ---
  const [formData, setFormData] = useState({
    miles: "",
    amount: "",
    origin: "",
    destination: "",
    vehiculo: "",
  });
  const [aiAdvice, setAiAdvice] = useState("Esperando datos de carga...");

  const config =
    BUSINESS_CONFIG[debugCategory] || BUSINESS_CONFIG["freight-load"];

  const ui =
    config.themeColor === "orange"
      ? {
          text: "text-orange-500",
          bg: "bg-orange-600",
          border: "border-orange-500/20",
        }
      : {
          text: "text-blue-500",
          bg: "bg-blue-600",
          border: "border-blue-500/20",
        };

  // --- LÓGICA DE NEGOCIO ---
  const verificarFlota = async () => {
    setCargandoFlota(true);
    try {
      const empId = user?.empresa_id;
      if (!empId) {
        setShowSelector(true);
        return;
      }

      const { data, error } = await supabase
        .from("flota_configurada")
        .select("tipo_slug")
        .eq("empresa_id", empId);

      if (data && data.length > 0) {
        setMiFlota(data.map((f) => f.tipo_slug));
        setShowSelector(false);
      } else {
        setShowSelector(true);
      }
    } catch (err) {
      console.error("Error verificando flota:", err);
    } finally {
      setCargandoFlota(false);
    }
  };

  const fetchRecords = async () => {
    if (!user?.empresa_id) return;
    setLoading(true);
    const { data } = await supabase
      .from("operaciones_saas")
      .select("*")
      .eq("empresa_id", user.empresa_id)
      .order("created_at", { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    verificarFlota();
    fetchRecords();
  }, [user?.empresa_id]);

  const updateAiAdvice = (miles, amount) => {
    if (!miles || !amount || miles <= 0) {
      setAiAdvice("Esperando datos válidos para analizar...");
      return;
    }
    const analysis = dispatcherLogic.calculateNetProfit(amount, miles);
    if (analysis.rpm < 1.5) {
      setAiAdvice(
        "❌ ALERTA: Rate muy bajo. El promedio es >$2.10. Negocia $200+.",
      );
    } else if (analysis.net < 100) {
      setAiAdvice("⚠️ PRECAUCIÓN: Margen muy ajustado tras Diesel y Seguros.");
    } else {
      setAiAdvice("✅ EXCELENTE: Esta carga supera tu Break-Even. ¡Dale play!");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.vehiculo) return alert("Selecciona un vehículo de tu flota");

    const analysis = dispatcherLogic.calculateNetProfit(
      formData.amount,
      formData.miles,
    );
    setLoading(true);
    try {
      const { error } = await supabase.from("operaciones_saas").insert([
        {
          empresa_id: user?.empresa_id,
          categoria_slug: debugCategory,
          monto: parseFloat(formData.amount),
          detalles_json: { ...formData, ...analysis },
          status: "Paid",
        },
      ]);

      if (error) throw error;

      setFormData({
        miles: "",
        amount: "",
        origin: "",
        destination: "",
        vehiculo: "",
      });
      fetchRecords();
      setActiveTab("historial");
    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (cargandoFlota)
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-blue-500 font-black tracking-widest uppercase animate-pulse">
        Initializing Nieto Sync...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex overflow-hidden font-sans">
      {/* MODAL SELECTOR DE FLOTA */}
      {showSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1120]/95 backdrop-blur-md p-4">
          <div className="relative">
            {/* Cambiado de onConfigurado a onComplete para match con el Selector */}
            <SelectorFlota
              user={user}
              onComplete={() => {
                setShowSelector(false);
                verificarFlota();
              }}
            />
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-72 bg-[#111827] border-r border-white/5 p-6 flex flex-col shadow-2xl z-20">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Truck className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-xs uppercase tracking-tighter leading-none">
              Nieto Sync
            </h1>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">
              Logistics OS
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("registro")}
            className={`flex items-center gap-4 w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "registro" ? `${ui.bg} text-white shadow-xl` : "text-slate-500 hover:bg-white/5"}`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`flex items-center gap-4 w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "historial" ? `${ui.bg} text-white shadow-xl` : "text-slate-500 hover:bg-white/5"}`}
          >
            <Package size={16} /> Load History
          </button>

          <button
            onClick={() => setShowSelector(true)}
            className="flex items-center gap-4 w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 border border-white/5 mt-4 hover:bg-white/5"
          >
            <Settings size={16} /> Manage Fleet
          </button>
        </nav>

        <button
          onClick={onLogout}
          className="p-4 bg-red-500/5 text-red-500 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2 ml-1">
              Operations Center
            </p>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter">
              {config.label} <span className={ui.text}>Sync</span>
            </h1>
          </div>
          <div className="bg-[#111827] p-6 rounded-[2rem] border border-white/5 text-right min-w-[200px]">
            <p className="text-slate-500 text-[9px] font-black uppercase mb-1">
              Total Gross Revenue
            </p>
            <h2 className="text-3xl font-black text-white">
              $
              {records
                .reduce((acc, c) => acc + (parseFloat(c.monto) || 0), 0)
                .toLocaleString()}
            </h2>
          </div>
        </header>

        {activeTab === "registro" ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* FORMULARIO */}
            <form onSubmit={handleSave} className="xl:col-span-2 space-y-6">
              <div className="bg-[#111827] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-2">
                      Equipment Selection
                    </label>
                    <select
                      required
                      value={formData.vehiculo}
                      className="w-full bg-[#0b1120] p-5 rounded-2xl text-white font-bold border border-white/5 mt-2 outline-none focus:border-blue-500"
                      onChange={(e) =>
                        setFormData({ ...formData, vehiculo: e.target.value })
                      }
                    >
                      <option value="">Select Truck...</option>
                      {miFlota.map((v) => (
                        <option key={v} value={v}>
                          {v.replace(/_/g, " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    required
                    placeholder="Origin"
                    value={formData.origin}
                    className="bg-[#0b1120] p-5 rounded-2xl border border-white/5 text-sm font-bold focus:border-blue-500 outline-none"
                    onChange={(e) =>
                      setFormData({ ...formData, origin: e.target.value })
                    }
                  />
                  <input
                    required
                    placeholder="Destination"
                    value={formData.destination}
                    className="bg-[#0b1120] p-5 rounded-2xl border border-white/5 text-sm font-bold focus:border-blue-500 outline-none"
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                  />
                  <input
                    required
                    type="number"
                    placeholder="Total Miles"
                    value={formData.miles}
                    className="bg-[#0b1120] p-5 rounded-2xl border border-white/5 text-sm font-black text-blue-400 outline-none"
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, miles: val });
                      updateAiAdvice(val, formData.amount);
                    }}
                  />
                  <input
                    required
                    type="number"
                    placeholder="Gross Amount ($)"
                    value={formData.amount}
                    className="bg-[#0b1120] p-5 rounded-2xl border border-white/5 text-sm font-black text-green-400 outline-none"
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, amount: val });
                      updateAiAdvice(formData.miles, val);
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-10 ${ui.bg} py-8 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:brightness-110 transition-all disabled:opacity-50`}
                >
                  {loading ? "COMMITTING..." : "COMMIT LOAD TO SYNC"}
                </button>
              </div>
            </form>

            {/* AI ANALYST PANEL */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <BrainCircuit
                  className="absolute -bottom-4 -right-4 text-white/10"
                  size={140}
                />
                <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6">
                  AI Dispatch Analyst
                </h3>
                <p className="text-blue-100 text-sm font-bold italic leading-relaxed">
                  "{aiAdvice}"
                </p>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-[8px] font-black uppercase text-blue-200">
                      Rate Per Mile
                    </p>
                    <p className="text-xl font-black">
                      ${(formData.amount / (formData.miles || 1)).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-blue-200 text-right">
                      Est. Net Profit
                    </p>
                    <p className="text-xl font-black text-green-300">
                      $
                      {dispatcherLogic
                        .calculateNetProfit(formData.amount, formData.miles)
                        .net.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* HISTORIAL */
          <div className="space-y-3">
            {records.map((r) => (
              <div
                key={r.id}
                className="bg-[#111827] p-6 rounded-[2rem] border border-white/5 flex justify-between items-center hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`${ui.bg} w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[10px]`}
                  >
                    {r.detalles_json?.vehiculo?.substring(0, 2).toUpperCase() ||
                      "TR"}
                  </div>
                  <div>
                    <p className="text-white font-black text-[11px] uppercase">
                      {r.detalles_json?.origin} → {r.detalles_json?.destination}
                    </p>
                    <p className="text-slate-500 text-[9px] uppercase font-bold">
                      {new Date(r.created_at).toLocaleDateString()} •{" "}
                      {r.detalles_json?.vehiculo}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-500 font-black text-xl">
                    ${parseFloat(r.monto).toLocaleString()}
                  </p>
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">
                    Confirmed
                  </p>
                </div>
              </div>
            ))}
            {records.length === 0 && (
              <div className="text-center py-20 text-slate-600 font-black uppercase tracking-widest text-xs">
                No records found in sync
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Camera,
  Mic,
  CheckCircle,
  Navigation,
  LogOut,
  Truck,
  MapPin,
  DollarSign,
  Milestone,
} from "lucide-react";

// Configuración de Supabase (Asegúrate de tener tus .env configurados)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DriverDashboard = ({ user, onLogout }) => {
  const [isListening, setIsListening] = useState(false);
  const [aiText, setAiText] = useState("Esperando comando de voz...");
  const [status, setStatus] = useState("En Ruta");
  const [activeLoad, setActiveLoad] = useState(null);
  const [loadingLoad, setLoadingLoad] = useState(true);

  // Identificador de la unidad de este chofer
  const MY_UNIT_ID = "Unit 101";

  // --- 1. BUSCAR CARGA ASIGNADA (Lo que viene de tu Dashboard Owner) ---
  const fetchActiveLoad = async () => {
    setLoadingLoad(true);
    try {
      // Buscamos en 'operaciones_saas' la carga activa para esta unidad
      const { data, error } = await supabase
        .from("operaciones_saas")
        .select("*")
        .eq("status", "Booked") // Solo cargas reservadas
        // Filtramos por la unidad en los detalles JSON
        .contains("detalles_json", { vehiculo: MY_UNIT_ID })
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 es "no rows found", no es un error crítico

      if (data) {
        setActiveLoad(data);
        console.log("✅ Carga activa encontrada:", data);
      } else {
        setActiveLoad(null);
        console.log("ℹ️ No hay cargas activas para", MY_UNIT_ID);
      }
    } catch (err) {
      console.error("❌ Error buscando carga:", err.message);
    } finally {
      setLoadingLoad(false);
    }
  };

  useEffect(() => {
    fetchActiveLoad();

    // Opcional: Suscribirse a cambios en tiempo real para actualizar la carga automáticamente
    const subscription = supabase
      .channel("public:operaciones_saas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "operaciones_saas" },
        fetchActiveLoad,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // --- 2. REGISTRO DE EVENTOS (VOZ Y GPS) ---
  const saveToLog = async (text, type, category = "General") => {
    try {
      const { error } = await supabase.from("ai_logs").insert([
        {
          user_id: user?.id,
          raw_text: text,
          action_type: type,
          category: category,
          unidad_id: MY_UNIT_ID,
        },
      ]);
      if (error) throw error;
    } catch (err) {
      console.error("Error de sincronización:", err.message);
    }
  };

  // --- 3. ACCIONES DEL CHOFER ---
  const handleArrival = async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const geoText = `Llegada confirmada en Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
        await saveToLog(geoText, "Entrega", "GPS");
        setStatus("En Destino");
        alert("📍 Ubicación de llegada enviada con éxito.");
      });
    } else {
      alert("GPS no disponible en este dispositivo.");
    }
  };

  // Función para abrir Google Maps
  const handleNavigation = () => {
    if (!activeLoad?.detalles_json?.destination) return;

    const destination = encodeURIComponent(
      activeLoad.detalles_json.destination,
    );
    // Usamos el formato 'google.navigation:q=' para abrir la app directamente en Android/iOS
    const mapUrl = `google.navigation:q=${destination}`;

    // Intentamos abrir la app nativa, si falla, abrimos la versión web
    window.location.href = mapUrl;

    // Fallback por si la app nativa no abre (después de un pequeño delay)
    setTimeout(() => {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
        "_blank",
      );
    }, 500);
  };

  const startAssistant = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Navegador no compatible con voz.");

    const recognition = new SpeechRecognition();
    recognition.lang = "es-US";
    recognition.onstart = () => {
      setIsListening(true);
      setAiText("Escuchando...");
    };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setAiText(transcript);
      const isExpense =
        transcript.toLowerCase().includes("diesel") ||
        transcript.toLowerCase().includes("gas");
      await saveToLog(transcript, isExpense ? "Gasto" : "Nota", "IA_VOICE");
    };
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white p-5 font-sans flex flex-col">
      {/* Header con Marca */}
      <header className="flex justify-between items-center mb-6 border-b border-blue-500/10 pb-4">
        <div className="flex items-center gap-2">
          <Truck className="text-[#0066FF]" size={24} />
          <h1 className="text-xl font-black italic tracking-tighter uppercase">
            NIETO <span className="text-[#0066FF] not-italic">SYNC</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-500 font-mono">
            {MY_UNIT_ID}
          </span>
          <button
            onClick={onLogout}
            className="p-2.5 bg-red-500/10 rounded-full border border-red-500/20 active:bg-red-500/20"
          >
            <LogOut size={16} className="text-red-500" />
          </button>
        </div>
      </header>

      {/* --- 📦 SECCIÓN 1: INFORMACIÓN DEL VIAJE (NUEVA Y PROTAGONISTA) --- */}
      <div className="bg-[#111113] border-2 border-blue-600/30 rounded-[2.5rem] p-7 mb-6 shadow-2xl relative overflow-hidden">
        {/* Indicador de Status */}
        <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {status}
          </span>
        </div>

        {loadingLoad ? (
          <div className="text-center py-10 text-gray-500 text-sm italic">
            Buscando carga asignada...
          </div>
        ) : activeLoad ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={18} className="text-blue-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                Detalles del Viaje Activo
              </span>
            </div>

            {/* Ruta Grande */}
            <div className="flex items-center justify-between gap-2 mb-6">
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                  Origen
                </p>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">
                  {activeLoad.detalles_json?.origin || "N/A"}
                </h2>
              </div>
              <div className="text-blue-600 text-4xl font-light px-2">➔</div>
              <div className="flex-1 text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                  Destino
                </p>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-blue-400">
                  {activeLoad.detalles_json?.destination || "N/A"}
                </h2>
              </div>
            </div>

            {/* Info Secundaria y Pago */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
              <div className="flex items-center gap-2.5 bg-black/30 p-4 rounded-xl">
                <Milestone size={20} className="text-gray-500" />
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">
                    Millas
                  </p>
                  <p className="text-lg font-black">
                    {activeLoad.detalles_json?.miles || "--"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-black/30 p-4 rounded-xl col-span-1">
                <Truck size={20} className="text-gray-500" />
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">
                    Tráiler
                  </p>
                  <p className="text-sm font-black uppercase">
                    {activeLoad.detalles_json?.trailer_type || "--"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-green-500/10 p-4 rounded-xl border border-green-500/20 text-right justify-end">
                <div>
                  <p className="text-[9px] text-green-500 uppercase font-bold">
                    Pago Estimado
                  </p>
                  <p className="text-2xl font-black text-green-400">
                    ${activeLoad.monto || "0"}
                  </p>
                </div>
                <DollarSign size={24} className="text-green-500" />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <PackageSearch size={40} className="mx-auto text-gray-700 mb-4" />
            <p className="text-lg font-bold text-gray-600">
              No tienes cargas asignadas.
            </p>
            <p className="text-xs text-gray-700 mt-1">
              Espera a que el despachador te asigne un viaje.
            </p>
          </div>
        )}
      </div>

      {/* --- 🗺️ SECCIÓN 2: ACCIONES CLAVE (GPS Y NAVEGACIÓN) --- */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <button
          onClick={handleArrival}
          className="col-span-3 bg-[#FF851B] hover:bg-[#e67616] text-black font-black py-6 rounded-3xl uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-orange-500/10"
        >
          <CheckCircle size={22} /> Confirmar Llegada (GPS)
        </button>

        {/* BOTÓN NAVEGACIÓN - AHORA FUNCIONAL */}
        <button
          onClick={handleNavigation}
          disabled={!activeLoad}
          className={`col-span-2 flex flex-col items-center justify-center gap-2.5 p-5 rounded-3xl border transition-all ${activeLoad ? "bg-green-600/10 border-green-500/30 active:bg-green-600/20" : "bg-[#111113] border-white/5 opacity-30 pointer-events-none"}`}
        >
          <Navigation
            size={28}
            className={activeLoad ? "text-green-400" : "text-gray-600"}
          />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Navegar al Destino
          </span>
        </button>
      </div>

      {/* --- 🎙️ SECCIÓN 3: ASISTENTE DE VOZ (MÁS PEQUEÑO Y ABAJO) --- */}
      <div className="mt-auto">
        <button
          onClick={startAssistant}
          className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center gap-5 ${isListening ? "border-red-500 bg-red-500/10 animate-pulse" : "border-white/10 bg-[#111113]"}`}
        >
          <div
            className={`p-4 rounded-full ${isListening ? "bg-red-500" : "bg-[#0066FF]"} shadow-lg`}
          >
            <Mic size={24} />
          </div>
          <div className="flex-1 text-left">
            <span className="font-black text-[10px] tracking-[0.3em] uppercase block text-gray-400 mb-1">
              {isListening ? "Grabando Nota..." : "Asistente de Voz IA"}
            </span>
            <p className="text-[11px] text-gray-200 italic line-clamp-2">
              {aiText}
            </p>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById("cam").click();
            }}
            className="p-3 bg-white/5 rounded-full border border-white/10 active:bg-white/10"
          >
            <Camera size={20} className="text-gray-400" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              id="cam"
              className="hidden"
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default DriverDashboard;

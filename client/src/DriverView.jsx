import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import {
  Camera,
  MapPin,
  Navigation,
  CheckCircle,
  Loader2,
  Zap,
} from "lucide-react";

export default function DriverView({ user }) {
  const [load, setLoad] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState(null);

  // 1. SEGUIMIENTO GPS EN TIEMPO REAL (Geofencing)
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });

        // Actualizar ubicación en Supabase para que el Dispatcher lo vea
        if (load) {
          await supabase
            .from("operaciones_saas")
            .update({ driver_lat: latitude, driver_lng: longitude })
            .eq("id", load.id);
        }
      },
      (err) => console.error("Error GPS:", err),
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [load]);

  // 2. CARGAR CARGA ACTIVA
  const fetchActiveLoad = async () => {
    const { data } = await supabase
      .from("operaciones_saas")
      .select("*")
      .eq("status", "Booked")
      .limit(1)
      .single();
    if (data) setLoad(data);
  };

  useEffect(() => {
    fetchActiveLoad();
  }, []);

  // 3. CAPTURA DE BOL CON OCR (IA VISION)
  const handleCaptureBOL = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Subir a Supabase Storage
      const fileName = `bol/${load.id}_${Date.now()}.jpg`;
      const { data: uploadData } = await supabase.storage
        .from("bol-facturas")
        .upload(fileName, file);

      const {
        data: { publicUrl },
      } = supabase.storage.from("bol-facturas").getPublicUrl(fileName);

      // Llamar a la IA para procesar el documento
      const { data: aiResponse } = await supabase.functions.invoke(
        "nieto-sync-ocr",
        {
          body: { imageUrl: publicUrl, loadId: load.id },
        },
      );

      alert("🚀 Documento procesado por IA y guardado.");
      fetchActiveLoad();
    } catch (err) {
      alert("Error al procesar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!load)
    return (
      <div className="p-10 text-center text-slate-500">
        Esperando carga asignada...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#070708] text-white p-4">
      {/* HEADER TÉCNICO */}
      <div className="flex justify-between items-center mb-6 bg-[#111113] p-4 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-blue-500 font-black text-xs uppercase tracking-widest">
            Active Trip
          </h2>
          <p className="text-lg font-bold">
            Unit {load.detalles_json.vehiculo}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase">GPS Signal</p>
          <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
            <Zap size={10} fill="currentColor" /> Live
          </div>
        </div>
      </div>

      {/* MAPA VISUAL SIMBOLICO */}
      <div className="bg-[#111113] p-6 rounded-[2.5rem] border border-blue-500/20 mb-4">
        <div className="relative pl-8 space-y-8">
          <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-blue-600 via-purple-600 to-green-600"></div>

          <div className="relative">
            <div className="absolute -left-[29px] bg-blue-600 p-1.5 rounded-full ring-4 ring-blue-600/20">
              <Navigation size={14} />
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase">
              Origin
            </p>
            <p className="font-bold">{load.detalles_json.origin}</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[29px] bg-green-600 p-1.5 rounded-full ring-4 ring-green-600/20">
              <CheckCircle size={14} />
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase">
              Destination
            </p>
            <p className="font-bold">{load.detalles_json.destination}</p>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN MODERNA */}
      <div className="grid grid-cols-1 gap-4">
        <label className="relative flex flex-col items-center justify-center bg-blue-600 p-6 rounded-[2rem] font-black uppercase shadow-xl active:scale-95 transition-all cursor-pointer">
          {uploading ? (
            <Loader2 className="animate-spin" size={28} />
          ) : (
            <>
              <Camera className="mb-2" size={28} />
              <span>Scan BOL (AI OCR)</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCaptureBOL}
          />
        </label>

        <button
          onClick={async () => {
            await supabase
              .from("operaciones_saas")
              .update({ status: "Delivered" })
              .eq("id", load.id);
            alert("Carga Finalizada");
            setLoad(null);
          }}
          className="bg-[#111113] border border-white/10 p-6 rounded-[2rem] font-black uppercase text-sm text-green-500"
        >
          Confirm Delivery
        </button>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Building2,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { supabase } from "./lib/supabase";

// CONFIGURACIÓN DE INDUSTRIAS
const BUSINESS_CONFIG = {
  "freight-load": { label: "Logística y Carga (Freight)", color: "#0066FF" },
  cleaning: { label: "Servicios de Limpieza", color: "#10b981" },
  "tow-truck": { label: "Grúas y Remolque", color: "#f59e0b" },
  marketing: { label: "Agencia de Marketing", color: "#8b5cf6" },
};

export default function Register({ onRegisterSuccess, onGoToLogin }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    category: "freight-load",
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password.trim(),
      });

      if (authError) throw authError;

      // 2. Crear la empresa vinculada
      const { error: compError } = await supabase.from("empresas").insert([
        {
          nombre: formData.companyName,
          categoria_slug: formData.category,
          admin_id: authData.user.id,
        },
      ]);

      if (compError) throw compError;

      // 3. Crear registro en tabla 'users' para compatibilidad
      const { error: userError } = await supabase.from("users").insert([
        {
          email: formData.email.trim(),
          password: formData.password.trim(),
          full_name: formData.fullName,
        },
      ]);

      if (userError) throw userError;

      alert("¡Infraestructura Nieto Sync desplegada con éxito!");
      onRegisterSuccess({ email: formData.email });
    } catch (error) {
      alert("Error en el despliegue: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        {/* LOGO SIN FONDO BLANCO - SOLO LETRAS IMPONENTES */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-3">
            <span className="text-white font-[1000] text-5xl tracking-tighter uppercase italic">
              NIETO
            </span>
            <span className="text-[#0066FF] font-[1000] text-5xl tracking-tighter uppercase italic">
              SYNC
            </span>
          </div>
        </div>

        {/* CONTENEDOR DEL FORMULARIO */}
        <div className="bg-[#16191f] border border-white/5 rounded-[3rem] p-10 shadow-[0_25px_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Decoración de fondo sutil */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0066FF]/5 blur-[80px] rounded-full"></div>

          <button
            onClick={onGoToLogin}
            className="flex items-center gap-2 text-slate-500 hover:text-[#0066FF] text-[10px] uppercase tracking-[0.3em] font-black mb-10 transition-colors"
          >
            <ArrowLeft size={14} /> Volver al Login
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Registro Business
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              {step === 1
                ? "Configura tus credenciales de acceso."
                : "Define la identidad de tu empresa."}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {step === 1 ? (
              <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                <div className="relative">
                  <User
                    className="absolute left-4 top-4 text-slate-600"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Nombre Completo"
                    required
                    className="w-full bg-[#0a0a0b] border border-white/5 p-4 pl-12 rounded-2xl focus:border-[#0066FF] outline-none text-sm font-bold text-white transition-all shadow-inner placeholder:text-slate-700"
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-4 text-slate-600"
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder="Email Corporativo"
                    required
                    className="w-full bg-[#0a0a0b] border border-white/5 p-4 pl-12 rounded-2xl focus:border-[#0066FF] outline-none text-sm font-bold text-white transition-all shadow-inner placeholder:text-slate-700"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-4 text-slate-600"
                    size={18}
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    required
                    className="w-full bg-[#0a0a0b] border border-white/5 p-4 pl-12 rounded-2xl focus:border-[#0066FF] outline-none text-sm font-bold text-white transition-all shadow-inner placeholder:text-slate-700"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-[#0066FF] hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 uppercase"
                >
                  Siguiente paso <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <Building2
                    className="absolute left-4 top-4 text-slate-600"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Nombre de la Empresa"
                    required
                    className="w-full bg-[#0a0a0b] border border-white/5 p-4 pl-12 rounded-2xl focus:border-[#0066FF] outline-none text-sm font-bold text-white transition-all shadow-inner placeholder:text-slate-700"
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 ml-2 tracking-widest">
                    Especialidad Operativa
                  </label>
                  <select
                    className="w-full bg-[#0a0a0b] border border-white/5 p-4 rounded-2xl focus:border-[#0066FF] outline-none text-sm font-bold text-white transition-all appearance-none cursor-pointer"
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    value={formData.category}
                  >
                    {Object.keys(BUSINESS_CONFIG).map((key) => (
                      <option key={key} value={key}>
                        {BUSINESS_CONFIG[key].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-[#0066FF] hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 uppercase"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Finalizar Registro"
                    )}{" "}
                    {!loading && <CheckCircle2 size={18} />}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Dashboard from "./Dashboard";
import DriverDashboard from "./DriverDashboard"; // IMPORTAMOS LA NUEVA PANTALLA
import { Zap, Loader2, Mail, Lock, ShieldCheck, UserPlus } from "lucide-react";
import logoNieto from "./assets/logo.png";

export default function App() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user.email);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const fetchProfile = async (userEmail) => {
    const { data } = await supabase
      .from("users")
      .select("*, empresas(*)")
      .ilike("email", userEmail.trim())
      .single();
    setUserData(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setAuthLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (authError) {
      setError("Acceso denegado.");
      setAuthLoading(false);
    } else {
      await fetchProfile(data.user.email);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserData(null);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
        <Zap className="text-blue-500 animate-pulse" size={48} />
        <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.5em]">
          Sincronizando Estación...
        </p>
      </div>
    );

  // --- LÓGICA DE REDIRECCIÓN INTELIGENTE ---
  if (userData) {
    // Si el usuario es un conductor o driver, muestra la Cara B
    if (userData.role === "driver" || userData.role === "conductor") {
      return <DriverDashboard user={userData} onLogout={handleLogout} />;
    }
    // De lo contrario, muestra el Dashboard de Administrador
    return <Dashboard user={userData} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 text-white font-sans antialiased relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>

      <div className="max-w-md w-full bg-[#111113]/80 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5 shadow-2xl z-10">
        <div className="flex justify-center mb-8">
          <img
            src={logoNieto}
            alt="Logo"
            className="h-20 w-auto object-contain"
          />
        </div>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-[1000] tracking-tighter italic uppercase">
            NIETO <span className="text-[#0066FF] not-italic">SYNC</span>
          </h2>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mt-3">
            LOGISTICS OPERATING SYSTEM
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-center text-xs mb-4 font-bold uppercase tracking-widest">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <Mail
              className="absolute left-4 top-4 text-slate-600 group-focus-within:text-[#0066FF]"
              size={20}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-12 p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#0066FF] outline-none font-bold transition-all text-white"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock
              className="absolute left-4 top-4 text-slate-600 group-focus-within:text-[#0066FF]"
              size={20}
            />
            <input
              type="password"
              placeholder="Security Key"
              className="w-full pl-12 p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#0066FF] outline-none font-bold transition-all text-white"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-[#0066FF] hover:bg-blue-600 text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-3 tracking-[0.2em] text-[11px] mt-4 uppercase"
          >
            {authLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                INICIAR DESPLIEGUE <ShieldCheck size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5">
          <button className="w-full bg-transparent hover:bg-blue-600/10 text-white border-2 border-white/10 hover:border-[#0066FF] font-black py-5 rounded-2xl transition-all flex justify-center items-center gap-3 text-[11px] uppercase tracking-[0.2em]">
            <UserPlus size={18} className="text-[#0066FF]" /> REGISTRAR NUEVA
            ESTACIÓN
          </button>
        </div>
      </div>
    </div>
  );
}

// ===============================
// CONFIGURACIÓN SUPABASE
// ===============================
const SUPABASE_URL = "https://aoldtijqziyiynwqgdol.supabase.co";
const SUPABASE_KEY = "sb_publishable_jSvN9UF744NRKfP_8h-f_A_s9DRmEWV";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===============================
// LOGIN
// ===============================
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    document.getElementById("loginError").textContent =
      "Credenciales incorrectas";
    return;
  }

  window.location.href = "admin.html";
}

// ===============================
// PROTEGER ADMIN.HTML
// ===============================
async function protectAdmin() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = "login.html";
  }
}

// ===============================
// LOGOUT
// ===============================
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}
function togglePassword() {
  const input = document.getElementById("password");
  input.type = input.type === "password" ? "text" : "password";
}

// ===============================
// CONFIGURACIÓN SUPABASE
// ===============================
const SUPABASE_URL = "https://aoldtijqziyiynwqgdol.supabase.co";
const SUPABASE_KEY = "sb_publishable_jSvN9UF744NRKfP_8h-f_A_s9DRmEWV";

// Cliente único para toda la app
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===============================
// CONFIGURACIÓN DEL NEGOCIO ACTUAL
// ===============================
// ESTE ES EL QUE EVITA QUE SE MEZCLEN SERVICIOS DE OTRAS MARCAS
const BUSINESS_ID = "f9c61a1f-3625-4847-9da6-f59693bb4d51"; // Carwash Pro

// ===============================
// IDIOMA INICIAL
// ===============================
function getInitialLanguage() {
  const saved = localStorage.getItem("lang");
  if (saved) return saved;

  return (navigator.language || "").startsWith("es") ? "es" : "en";
}

let currentLang = getInitialLanguage();
localStorage.setItem("lang", currentLang);

// ===============================
// TEXTOS ESTÁTICOS
// ===============================
function updateStaticText() {
  const t = {
    es: {
      appTitle: "Carwash Pro",
      formTitle: "Reserva tu servicio",
      name: "Nombre",
      phone: "Teléfono",
      service: "Servicio",
      date: "Fecha",
      time: "Hora",
      placeholderName: "Tu nombre",
      placeholderPhone: "Tu número",
      selectService: "Selecciona un servicio",
      submit: "Reservar",
      errorServices: "Error cargando servicios.",
      errorBooking: "Error al guardar la reserva",
      okBooking: "Reserva enviada correctamente",
    },
    en: {
      appTitle: "Carwash Pro",
      formTitle: "Book your service",
      name: "Name",
      phone: "Phone",
      service: "Service",
      date: "Date",
      time: "Time",
      placeholderName: "Your name",
      placeholderPhone: "Your phone",
      selectService: "Select a service",
      submit: "Book",
      errorServices: "Error loading services.",
      errorBooking: "Error saving booking",
      okBooking: "Booking sent successfully",
    },
  };

  const tr = t[currentLang];

  document.getElementById("app-title").textContent = tr.appTitle;
  document.getElementById("form-title").textContent = tr.formTitle;

  document.getElementById("label-name").textContent = tr.name;
  document.getElementById("label-phone").textContent = tr.phone;
  document.getElementById("label-service").textContent = tr.service;
  document.getElementById("label-date").textContent = tr.date;
  document.getElementById("label-time").textContent = tr.time;

  document.getElementById("customer_name").placeholder = tr.placeholderName;
  document.getElementById("customer_phone").placeholder = tr.placeholderPhone;
  document.getElementById("btn-submit").textContent = tr.submit;

  const serviceSelect = document.getElementById("service");
  if (serviceSelect.options.length > 0) {
    serviceSelect.options[0].textContent = tr.selectService;
  }
}

// ===============================
// BOTONES DE IDIOMA
// ===============================
document.getElementById("btn-es").onclick = () => {
  currentLang = "es";
  localStorage.setItem("lang", "es");
  updateStaticText();
  loadServices();
};

document.getElementById("btn-en").onclick = () => {
  currentLang = "en";
  localStorage.setItem("lang", "en");
  updateStaticText();
  loadServices();
};

// ===============================
// CARGAR SERVICIOS DESDE SUPABASE (FILTRADOS POR NEGOCIO)
// ===============================
async function loadServices() {
  const { data, error } = await supabaseClient
    .from("services")
    .select("*")
    .eq("business_id", BUSINESS_ID); // ← AQUÍ SE FILTRA SOLO CARWASH PRO

  const statusEl = document.getElementById("status");

  if (error) {
    console.error("Error cargando servicios:", error);
    statusEl.textContent =
      currentLang === "es"
        ? "Error cargando servicios."
        : "Error loading services.";
    return;
  }

  statusEl.textContent = "";
  fillServiceSelect(data);
}

// ===============================
// LLENAR SELECT
// ===============================
function fillServiceSelect(services) {
  const select = document.getElementById("service");

  const placeholder =
    currentLang === "es" ? "Selecciona un servicio" : "Select a service";

  select.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;

  services.forEach((service) => {
    const name = currentLang === "es" ? service.name_es : service.name_en;
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = name;
    select.appendChild(option);
  });
}

// ===============================
// SUBMIT DEL FORMULARIO (BOOKINGS)
// ===============================
document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const statusEl = document.getElementById("status");

  const name = document.getElementById("customer_name").value;
  const phone = document.getElementById("customer_phone").value;
  const serviceId = document.getElementById("service").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  const { data, error } = await supabaseClient.from("bookings").insert([
    {
      customer_name: name,
      customer_phone: phone,
      service_id: serviceId,
      date: date,
      time: time,
      status: "pending",
      business_id: BUSINESS_ID, // ← ESTA LÍNEA ES LA QUE FALTABA
    },
  ]);

  if (error) {
    console.error("Error guardando reserva:", error);
    statusEl.textContent =
      currentLang === "es"
        ? "Error al guardar la reserva"
        : "Error saving booking";
  } else {
    statusEl.textContent =
      currentLang === "es"
        ? "Reserva enviada correctamente"
        : "Booking sent successfully";
    e.target.reset();
    loadServices();
  }
});

// ===============================
// INICIALIZACIÓN
// ===============================
updateStaticText();
loadServices();

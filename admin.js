// ===============================
// CONFIGURACIÓN SUPABASE
// ===============================
const SUPABASE_URL = "https://aoldtijqziyiynwqgdol.supabase.co";
const SUPABASE_KEY = "sb_publishable_jSvN9UF744NRKfP_8h-f_A_s9DRmEWV";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ID del negocio actual
const BUSINESS_ID = "f9c61a1f-3625-4847-9da6-f59693bb4d51";

// ===============================
// CARGAR RESERVAS (FILTRADO POR NEGOCIO)
// ===============================
async function loadBookings() {
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("*, services(name_es, name_en)")
    .eq("business_id", BUSINESS_ID)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error cargando reservas:", error);
    document.getElementById("status").textContent = "Error cargando reservas";
    return;
  }

  fillTable(data);
}

// ===============================
// LLENAR TABLA
// ===============================
function fillTable(bookings) {
  const tbody = document.querySelector("#bookingsTable tbody");
  tbody.innerHTML = "";

  bookings.forEach((b) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${b.customer_name}</td>
      <td>${b.customer_phone}</td>
      <td>${b.services?.name_es || "Servicio"}</td>
      <td>${b.date}</td>
      <td>${b.time}</td>
      <td>
        <span class="status-badge status-${b.status || "pending"}">
          ${b.status || "pending"}
        </span>
      </td>
      <td>
        <button onclick="changeStatus('${b.id}', 'confirmed')">Confirmar</button>
        <button onclick="changeStatus('${b.id}', 'completed')">Completar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ===============================
// CAMBIAR ESTADO
// ===============================
async function changeStatus(id, newStatus) {
  const { error } = await supabaseClient
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    alert("Error cambiando estado");
    return;
  }

  loadBookings();
}

// ===============================
// INICIALIZACIÓN
// ===============================
loadBookings();

// ===============================
// CARGAR RESERVAS
// ===============================
async function loadBookings() {
  // Traer solo reservas activas
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .neq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando reservas:", error);
    return;
  }

  const tbody = document.querySelector("#bookingsTable tbody");
  tbody.innerHTML = "";

  // ===============================
  // ESTADÍSTICAS REALES
  // ===============================
  const { data: allBookings } = await supabaseClient
    .from("bookings")
    .select("status");

  let pending = 0;
  let confirmed = 0;
  let completed = 0;

  allBookings.forEach((b) => {
    if (b.status === "pending") pending++;
    if (b.status === "confirmed") confirmed++;
    if (b.status === "completed") completed++;
  });

  // ===============================
  // RENDERIZAR SOLO ACTIVAS
  // ===============================
  data.forEach((booking) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${booking.customer_name}</td>
      <td>${booking.customer_phone}</td>
      <td>${booking.service_id}</td>
      <td>${booking.date}</td>
      <td>${booking.time}</td>
      <td>
        <span class="status-badge status-${booking.status}">
          ${booking.status}
        </span>
      </td>
      <td>
        <button class="btn-confirm" onclick="updateStatus('${booking.id}', 'confirmed')">Confirmar</button>
        <button class="btn-complete" onclick="updateStatus('${booking.id}', 'completed')">Completar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Actualizar tarjetas de estadísticas
  document.getElementById("stat-pending").textContent = pending;
  document.getElementById("stat-confirmed").textContent = confirmed;
  document.getElementById("stat-completed").textContent = completed;
}

// ===============================
// ACTUALIZAR ESTADO
// ===============================
async function updateStatus(id, status) {
  const { error } = await supabaseClient
    .from("bookings")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error actualizando estado:", error);
    return;
  }

  loadBookings();
}

// ===============================
// INICIAR PANEL
// ===============================
protectAdmin();
loadBookings();

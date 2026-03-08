// ===============================
// CARGAR RESERVAS
// ===============================
async function loadBookings() {
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando reservas:", error);
    return;
  }

  const tbody = document.querySelector("#bookingsTable tbody");
  tbody.innerHTML = "";

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
        <button onclick="updateStatus('${booking.id}', 'confirmed')" style="background:#3498db">Confirmar</button>
        <button onclick="updateStatus('${booking.id}', 'completed')" style="background:#2ecc71">Completar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
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

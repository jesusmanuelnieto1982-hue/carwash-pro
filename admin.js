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
      <td>${booking.name}</td>
      <td>${booking.phone}</td>
      <td>${booking.service}</td>
      <td>${booking.date}</td>
      <td>${booking.time}</td>
      <td>${booking.status}</td>
      <td>
        <button onclick="updateStatus('${booking.id}', 'confirmado')">Confirmar</button>
        <button onclick="updateStatus('${booking.id}', 'completado')">Completar</button>
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

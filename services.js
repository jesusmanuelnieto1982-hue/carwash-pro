const supabaseClient = supabase.createClient(
  "https://aoldtijqziyiynwqgdol.supabase.co",
  "sb_publishable_jSvN9UF744NRKfP_8h-f_A_s9DRmEWV",
);

// ===============================
// CARGAR SERVICIOS
// ===============================
async function loadServices() {
  const { data, error } = await supabaseClient
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando servicios:", error);
    return;
  }

  const tbody = document.getElementById("servicesTable");
  tbody.innerHTML = "";

  data.forEach((service) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${service.name}</td>
      <td>$${service.price}</td>
      <td>${service.duration} min</td>
      <td>${service.active ? "Activo" : "Inactivo"}</td>
      <td>
        <button onclick="toggleService('${service.id}', ${service.active})">
          ${service.active ? "Desactivar" : "Activar"}
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ===============================
// AGREGAR SERVICIO
// ===============================
async function addService() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const duration = document.getElementById("duration").value;
  const description = document.getElementById("description").value;

  const { error } = await supabaseClient
    .from("services")
    .insert([{ name, price, duration, description }]);

  if (error) {
    console.error("Error agregando servicio:", error);
    return;
  }

  loadServices();
}

// ===============================
// ACTIVAR / DESACTIVAR SERVICIO
// ===============================
async function toggleService(id, currentState) {
  const { error } = await supabaseClient
    .from("services")
    .update({ active: !currentState })
    .eq("id", id);

  if (error) {
    console.error("Error actualizando servicio:", error);
    return;
  }

  loadServices();
}

loadServices();

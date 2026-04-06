import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// --- ESTE ES EL MOTOR DE LA PWA ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) =>
        console.log("Nieto Sync: App lista para usar offline", reg),
      )
      .catch((err) => console.error("Nieto Sync: Error en el motor PWA", err));
  });
}

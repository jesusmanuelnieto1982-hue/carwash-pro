// src/businessConfig.js
import {
  Truck,
  Package,
  Droplets,
  LayoutDashboard,
  Wrench,
  Camera,
  Video,
  Cpu,
  Globe,
  Palette,
  Smartphone,
  ShoppingCart,
} from "lucide-react";

export const BUSINESS_CONFIG = {
  // ===============================
  // 🚛 LOGÍSTICA & TRANSPORTE
  // ===============================
  "freight-load": {
    label: "Freight / Carga",
    themeColor: "blue",
    icon: Truck,
    moduleName: "Freight Pro",
    aiType: "DISPATCHER",
    formFields: [
      { name: "origin", label: "Origen", type: "text" },
      { name: "destination", label: "Destino", type: "text" },
      { name: "weight", label: "Peso", type: "text" },
    ],
  },
  "courier-express": {
    label: "Courier Express",
    themeColor: "cyan",
    icon: Package,
    moduleName: "Courier Sync",
    aiType: "SERVICE",
    formFields: [
      { name: "pickup", label: "Recoger en", type: "text" },
      { name: "dropoff", label: "Entregar en", type: "text" },
    ],
  },
  "last-mile": {
    label: "Last Mile Delivery",
    themeColor: "indigo",
    icon: Truck,
    moduleName: "Last Mile Pro",
    aiType: "SERVICE",
    formFields: [
      { name: "route", label: "Ruta", type: "text" },
      { name: "packages", label: "Paquetes", type: "number" },
    ],
  },
  "moving-services": {
    label: "Moving Services",
    themeColor: "orange",
    icon: Package,
    moduleName: "Moving Pro",
    aiType: "SERVICE",
    formFields: [
      { name: "from", label: "Desde", type: "text" },
      { name: "to", label: "Hacia", type: "text" },
    ],
  },
  "dispatch-pro": {
    label: "Dispatch Pro",
    themeColor: "blue",
    icon: Truck,
    moduleName: "Dispatch AI",
    aiType: "DISPATCHER",
    formFields: [
      { name: "load_id", label: "Load ID", type: "text" },
      { name: "rate", label: "Rate", type: "number" },
    ],
  },
  // ===============================
  // 🧼 LIMPIEZA & MANTENIMIENTO
  // ===============================
  "cleaning-services": {
    label: "Cleaning & Deep Cleaning",
    themeColor: "cyan",
    icon: Droplets,
    moduleName: "Cleaning Manager",
    aiType: "SERVICE",
    formFields: [
      { name: "client_name", label: "Nombre del Cliente", type: "text" },
      {
        name: "service_type",
        label: "Tipo de Servicio",
        type: "select",
        options: ["Cleaning Pro", "Deep Cleaning"],
      },
      { name: "address", label: "Dirección", type: "text" },
    ],
  },
  "handyman-pro": {
    label: "Maintenance & Repairs",
    themeColor: "orange",
    icon: Wrench,
    moduleName: "Service Master",
    aiType: "SERVICE",
    formFields: [
      {
        name: "category",
        label: "Especialidad",
        type: "select",
        options: [
          "Handyman Services",
          "Plumbing",
          "Electrical",
          "HVAC",
          "Pest Control",
          "Painting Services",
        ],
      },
      {
        name: "task_description",
        label: "Descripción de la Tarea",
        type: "text",
      },
    ],
  },
  // ===============================
  // 🎨 MARKETING & CREATIVIDAD
  // ===============================
  "marketing-agency": {
    label: "Marketing Agency",
    themeColor: "indigo",
    icon: LayoutDashboard,
    moduleName: "Marketing Pro",
    aiType: "SERVICE",
    formFields: [
      { name: "client_name", label: "Cliente", type: "text" },
      { name: "goal", label: "Objetivo", type: "text" },
      { name: "budget", label: "Presupuesto", type: "number" },
    ],
  },
  "social-media": {
    label: "Social Media Management",
    themeColor: "blue",
    icon: Smartphone,
    moduleName: "Social Media Pro",
    aiType: "SERVICE",
    formFields: [
      {
        name: "platform",
        label: "Plataforma",
        type: "select",
        options: ["Instagram", "Facebook", "TikTok", "YouTube"],
      },
      { name: "goal", label: "Objetivo", type: "text" },
    ],
  },
  "drone-services": {
    label: "Drone Services",
    themeColor: "sky",
    icon: Cpu,
    moduleName: "Drone Pro",
    aiType: "SERVICE",
    formFields: [
      { name: "project", label: "Proyecto", type: "text" },
      { name: "location", label: "Ubicación", type: "text" },
    ],
  },
  "web-dev": {
    label: "Web Design & Development",
    themeColor: "gray",
    icon: Globe,
    moduleName: "Web Studio",
    aiType: "SERVICE",
    formFields: [
      {
        name: "project_type",
        label: "Tipo de Proyecto",
        type: "select",
        options: ["Landing Page", "E-commerce", "Portfolio", "Web App"],
      },
      { name: "features", label: "Características", type: "text" },
    ],
  },
};

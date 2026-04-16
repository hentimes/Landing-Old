// ===================================
// Datos para el Slider de Planes
// ===================================
// Para actualizar, simplemente edita o añade nuevos objetos a esta lista.

export const planesData = [
  {
    isapreLogo: "assets/logos_isapre/colmena.png",
    price: "140.601",
    type: "Libre Elección",
    // CORRECCIÓN: Se reemplaza 'score' por 'clinics'
    clinics: ["Clínica Alemana", "Clínica Las Condes", "Clínica Santa María"],
    benefits: [
      { icon: "fa-hospital", name: "Hospitalaria", coverage: "100% Libre elección" },
      { icon: "fa-stethoscope", name: "Ambulatoria", coverage: "90% Libre elección" },
      { icon: "fa-truck-medical", name: "Urgencia", coverage: "90% Libre elección" },
      { icon: "fa-clinic-medical", name: "Prestadores", coverage: "Cl. Bupa + otros" },
    ],
    featured: true
  },
  {
    isapreLogo: "assets/logos_isapre/cruzblanca.png",
    price: "134.196",
    type: "Libre Elección",
    clinics: ["RedSalud", "Clínica Dávila", "Clínica Vespucio"],
    benefits: [
        { icon: "fa-hospital", name: "Hospitalaria", coverage: "100% Libre elección" },
        { icon: "fa-stethoscope", name: "Ambulatoria", coverage: "90% Libre elección" },
        { icon: "fa-truck-medical", name: "Urgencia", coverage: "90% Libre elección" }
    ],
    featured: false
  },
  {
    isapreLogo: "assets/logos_isapre/consalud.png",
    price: "141.821",
    type: "Preferente",
    clinics: ["Clínica Indisa", "Clínica Meds", "Clínica U. de los Andes"],
    benefits: [
      { icon: "fa-clinic-medical", name: "Prestadores", coverage: "Cl. Bupa + otros" },
      { icon: "fa-hospital", name: "Hospitalaria", coverage: "90% Libre elección" },
      { icon: "fa-stethoscope", name: "Ambulatoria", coverage: "70% Libre elección" }
    ],
    featured: false
  },
  {
    isapreLogo: "assets/logos_isapre/nuevamasvida.png",
    price: "132.779",
    type: "Preferente",
    clinics: ["Clínica Indisa", "Clínica Meds", "Clínica Bupa"],
    benefits: [
      { icon: "fa-clinic-medical", name: "Prestadores", coverage: "Cl. Bupa + otros" },
      { icon: "fa-hospital", name: "Hospitalaria", coverage: "80% Libre elección" },
      { icon: "fa-truck-medical", name: "Urgencia", coverage: "90% Libre elección" },
      { icon: "fa-stethoscope", name: "Ambulatoria", coverage: "70% Libre elección" }
    ],
    featured: false
  }
];
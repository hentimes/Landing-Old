// ===================================
// Datos para el slider de planes
// ===================================

export const planesData = [
  {
    profileName: "Plan Joven",
    colorTheme: "var(--color-perfil-joven)",
    headerIcon: "fa-rocket",
    price: "85.000",
    description: "Ideal para iniciar tu vida laboral con cobertura indispensable y bajo costo.",
    clinics: ["Clínica Dávila", "RedSalud", "Clínica Vespucio"],
    benefits: [
      { icon: "fa-hospital", name: "Hospitalaria", coverage: "100%" },
      { icon: "fa-stethoscope", name: "Ambulatoria", coverage: "80%" },
      { icon: "fa-pills", name: "Farmacia", coverage: "Descuentos" }
    ],
    featured: false
  },
  {
    profileName: "Plan Maternidad",
    colorTheme: "var(--color-perfil-maternidad)",
    headerIcon: "fa-baby-carriage",
    price: "140.000",
    description: "Enfocado en embarazo sin carencias, parto y cobertura pediátrica preferente.",
    clinics: ["Clínica Alemana", "Clínica Las Condes", "Clínica Indisa"],
    benefits: [
      { icon: "fa-baby", name: "Parto", coverage: "Preferente" },
      { icon: "fa-bed", name: "Habitación", coverage: "Individual" },
      { icon: "fa-user-nurse", name: "Pediatría", coverage: "Copago Reducido" }
    ],
    featured: false
  },
  {
    profileName: "Plan Familiar",
    colorTheme: "var(--color-perfil-familia)",
    headerIcon: "fa-users",
    price: "155.000",
    description: "Cobertura integral para ti y tus cargas con libre elección y excelentes prestadores.",
    clinics: ["Clínica Indisa", "Clínica Alemana", "Santa María"],
    benefits: [
      { icon: "fa-users", name: "Cargas", coverage: "Incluidas" },
      { icon: "fa-hospital", name: "Hospitalaria", coverage: "100%" },
      { icon: "fa-tooth", name: "Dental", coverage: "Plan Básico" }
    ],
    featured: false
  },
  {
    profileName: "Plan Compensado",
    colorTheme: "var(--color-perfil-compensado)",
    headerIcon: "fa-heart",
    price: "110.000",
    description: "Optimiza tu 7% obligatorio balanceándolo con el de tu pareja para financiar un plan de salud juntos.",
    clinics: ["Clínica Meds", "Clínica Bupa", "RedSalud"],
    benefits: [
      { icon: "fa-balance-scale", name: "Cotización", coverage: "Solo tu 7%" },
      { icon: "fa-hospital", name: "Hospitalaria", coverage: "90%" },
      { icon: "fa-truck-medical", name: "Urgencias", coverage: "Cobertura Total" }
    ],
    featured: false
  },
  {
    profileName: "Plan Freelance",
    colorTheme: "var(--color-perfil-freelance)",
    headerIcon: "fa-briefcase",
    price: "95.000",
    description: "Libertad y flexibilidad con coberturas que se adaptan a tus ingresos variables.",
    clinics: ["RedSalud", "Integramédica", "Clínica Santa María"],
    benefits: [
      { icon: "fa-laptop-house", name: "Ingresos", coverage: "Independiente" },
      { icon: "fa-notes-medical", name: "Licencias", coverage: "Incluidas" },
      { icon: "fa-user-md", name: "Telemedicina", coverage: "Copago $0" }
    ],
    featured: false
  },
  {
    profileName: "Plan Voluntario",
    colorTheme: "var(--color-perfil-voluntario)",
    headerIcon: "fa-hand-holding-heart",
    price: "75.000",
    description: "Accede al sistema privado protegiendo tu salud como afiliado voluntario sin contrato.",
    clinics: ["Clínica Bupa", "Clínica Vespucio", "RedSalud"],
    benefits: [
      { icon: "fa-hand-holding-heart", name: "Afiliación", coverage: "Voluntaria" },
      { icon: "fa-hospital", name: "Hospitalaria", coverage: "80%" },
      { icon: "fa-heartbeat", name: "Preventivo", coverage: "Exámenes costo $0" }
    ],
    featured: false
  }
];

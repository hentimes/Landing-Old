// planespro/data/asesores.js

export const asesoresData = [
  {
    id: 'betzabet-pereira',
    nombre: 'Betzabeth Pereira',
    cargo: 'Especialista en Planes Individuales',
    foto: 'assets/avatares/asesores/betzabeth-pereira.jpg',
    fortaleza: { 
        icon: 'fa-heart-pulse', 
        text: 'Experta en mejorar coberturas de salud.' 
    },
    certificacion: true,
    premium: true, // <-- Atributo premium añadido
    biografia: 'Me especializo en guiar a profesionales jóvenes y futuros padres a través del complejo mundo de las Isapres. Mi objetivo es que tomes decisiones informadas que te den tranquilidad hoy y en el futuro.',
    especialidades: [
      'Planes con cobertura de maternidad',
      'Primera afiliación a Isapre',
      'Cobertura de enfermedades preexistentes',
      'Planes para jóvenes profesionales'
    ],
    testimonio: {
      cita: 'Nos ayudó a entender las diferencias y elegimos un plan perfecto para nuestra familia.',
      autor: 'Sofía Pérez'
    },
    socials: { // <-- Redes sociales añadidas
      linkedin: '#',
      instagram: '#',
      tiktok: '', // Vacío significa que no se mostrará
      facebook: '#'
    }
  },
  {
    id: 'henry-farias',
    nombre: 'Henry Farías',
    cargo: 'Asesor Senior de Salud y Previsión',
    foto: 'assets/avatares/asesores/henry-farias.jpg',
    fortaleza: { 
      icon: 'fa-hand-holding-usd', 
      text: 'Especialista en optimizar tu 7% al máximo.',
    },
    certificacion: true,
    premium: true, // <-- Atributo premium añadido
    biografia: 'Con más de 10 años de experiencia en el sector, mi misión es encontrar el equilibrio perfecto entre cobertura y costo para mis clientes. Creo en la asesoría honesta: si Fonasa es tu mejor opción, seré el primero en decírtelo.',
    especialidades: [
      'Optimización de planes para familias',
      'Análisis de cobertura hospitalaria',
      'Asesoría para trabajadores independientes',
      'Asesoría previsional de AFP'
    ],
    testimonio: {
      cita: 'Gracias a Henry optimicé mi plan y ahora pago mucho menos. Su honestidad es única.',
      autor: 'Patricio González'
    },
    socials: { // <-- Redes sociales añadidas
      linkedin: '#',
      x: '#',
      instagram: '', // Vacío significa que no se mostrará
      facebook: '#',  
      twitter: '#' // Vacío significa que no se mostrará  
    }
  },

  /*{
    id: 'sofia-marquez',
    nombre: 'Sofía Márquez',
    cargo: 'Especialista en Planificación Previsional',
    foto: 'assets/avatares/asesores/sofia-marquez.jpg',
    certificacion: true,
    premium: true, // <-- Atributo premium añadido
    biografia: 'Con una sólida trayectoria en el sistema de pensiones, mi misión es guiar a mis clientes para que tomen el control de su futuro financiero, optimizando sus fondos de AFP y asegurando una jubilación tranquila.',
    especialidades: [
      'Optimización de multifondos',
      'Planificación de jubilación',
      'Análisis de Ahorro Previsional Voluntario (APV)',
      'Asesoría en trámites de pensión'
    ],
    testimonio: {
      cita: 'Sofía me ayudó a entender por primera vez mi AFP. Su asesoría fue clave para mi tranquilidad a futuro.',
      autor: 'Javier Torres'
    },
    socials: { // <-- Redes sociales añadidas
      linkedin: '#',
      x: '#'
    }
  },
  { // <-- NUEVO ASESOR AÑADIDO
    id: 'daniela-rojas',
    nombre: 'Daniela Rojas',
    cargo: 'Especialista en Salud Joven y Deportistas',
    foto: 'assets/avatares/asesores/daniela-rojas.webp', // <-- IMPORTANTE: Necesitarás añadir una imagen con este nombre.
    certificacion: true,
    premium: true,
    biografia: 'Mi enfoque es ayudar a jóvenes y deportistas a maximizar su cobertura en Isapre, aprovechando su bajo factor de riesgo para obtener los mejores beneficios en kinesiología, terapias y consultas preventivas.',
    especialidades: [
      'Planes para primera afiliación',
      'Cobertura optimizada para deportistas',
      'Maximización de excedentes',
      'Planes con cobertura en psicología y nutrición'
    ],
    testimonio: {
      cita: 'Daniela encontró un plan que cubre todas mis terapias deportivas por un precio que no creía posible.',
      autor: 'Martín Cáceres'
    },
    socials: {
      instagram: '#',
      tiktok: '#',
      linkedin: '#'
    }
  }*/
];
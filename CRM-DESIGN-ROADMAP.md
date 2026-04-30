# CRM Design Roadmap

## Objetivo

Definir una dirección de diseño limpia, compacta y escalable para el CRM de asesores de PlanesPro tomando como referencia ciertos patrones de Asana, sin copiar su estilo de forma literal ni mezclar lenguajes visuales incompatibles con el producto actual.

El criterio rector es este:

- conservar la identidad de PlanesPro;
- aumentar claridad operativa;
- reducir ruido visual;
- mejorar densidad de información sin perder legibilidad;
- dejar una base modular para futuras vistas de leads, agenda, objetivos, métricas y colaboración.

---

## Qué vamos a tomar de las referencias

### 1. Estructura de navegación en capas

**Qué tomamos**

- una barra lateral clara y persistente;
- una jerarquía de navegación por áreas;
- una barra superior muy limpia;
- un área principal blanca y amplia para trabajo operativo.

**Por qué**

Asana separa bien:

- navegación global;
- navegación del módulo actual;
- contenido operativo.

Eso reduce carga cognitiva. En nuestro CRM hace sentido porque ya estamos creciendo desde un simple panel de leads hacia un sistema con agenda, métricas, configuraciones, notas y futuras capacidades multi-asesor.

**Cómo lo implementaremos**

- Manteneremos un `sidebar` izquierdo fijo.
- Reduciremos su ruido visual y mejoraremos separación entre:
  - identidad del asesor,
  - navegación principal,
  - utilidades secundarias.
- La barra superior quedará más sobria, con pocas acciones y mejor alineadas.
- El contenido central tendrá más ancho útil, menos bloques “inflados” y una retícula más consistente.

---

### 2. Superficies blancas, bordes suaves y líneas sutiles

**Qué tomamos**

- uso de fondo neutro claro;
- tarjetas blancas con bordes finos;
- separación por líneas discretas en vez de sombras pesadas;
- sensación de interfaz ligera.

**Por qué**

Hoy el CRM tiene varias piezas funcionales, pero visualmente todavía mezcla:

- tarjetas demasiado redondeadas,
- espacios amplios sin función,
- bloques que compiten entre sí,
- énfasis visual excesivo en componentes secundarios.

La referencia muestra un sistema más controlado y serio.

**Cómo lo implementaremos**

- Bajar radio de bordes en cards, inputs y modales.
- Reemplazar parte de las sombras por bordes y contrastes suaves.
- Unificar altura de tarjetas métricas, tablas, paneles laterales y módulos de agenda.
- Normalizar paddings verticales y horizontales.

---

### 3. Densidad de información más compacta

**Qué tomamos**

- listas y tablas más densas;
- filas con acciones visibles pero no invasivas;
- menor altura por item;
- mejor uso del espacio horizontal.

**Por qué**

El CRM trata con volumen operativo:

- leads,
- estados,
- citas,
- notas,
- adjuntos,
- métricas.

No conviene una interfaz “hero-like” o demasiado aireada. Necesitamos una densidad intermedia: ejecutiva, no abrumadora.

**Cómo lo implementaremos**

- Compactar cards de lead y filas de agenda.
- Reducir alturas de badges, tags e inputs.
- Priorizar alineación horizontal frente a apilado innecesario.
- Usar tablas/listas híbridas donde la lectura rápida sea más importante que el “card stacking”.

---

### 4. Panel lateral de detalle

**Qué tomamos**

- patrón de panel de detalle a la derecha;
- contexto completo del item seleccionado sin abandonar la vista principal;
- inspección rápida de información secundaria.

**Por qué**

Este patrón ya se acerca a lo que necesitamos en leads, objetivos y agenda:

- lista al centro/izquierda;
- detalle editable a la derecha;
- flujo continuo sin navegación extra.

**Cómo lo implementaremos**

- Mantener el paradigma de “seleccionar lead / abrir detalle”.
- Limpiar la composición de la ficha:
  - datos esenciales arriba,
  - acciones principales juntas,
  - agenda y adjuntos en bloques compactos,
  - notas y campos secundarios más abajo.
- Evitar duplicar accesos al mismo archivo o a la misma acción.

---

### 5. Vistas por módulo y pestañas internas

**Qué tomamos**

- tabs simples debajo del encabezado del módulo;
- cambio entre vista lista, tablero, agenda o panel sin perder contexto;
- navegación secundaria muy visible pero discreta.

**Por qué**

Esto sirve especialmente para el futuro del CRM:

- Leads
  - lista
  - tablero
  - pipeline
- Agenda
  - día
  - semana
  - bloques
- Dashboard
  - overview
  - métricas comerciales
  - citas

**Cómo lo implementaremos**

- Diseñar una barra de tabs reutilizable para módulos.
- No implementaremos todas las vistas de inmediato.
- Primero se usará el mismo lenguaje visual para preparar extensibilidad.

---

### 6. Modales sobrios y enfocados

**Qué tomamos**

- modales centrados, sobrios y con jerarquía clara;
- fondos oscurecidos con protagonismo del formulario;
- campos alineados en una retícula simple.

**Por qué**

Vamos a necesitar modales para:

- crear lead;
- crear objetivo;
- bloquear día;
- configurar disponibilidad;
- confirmar eliminación;
- futuras acciones comerciales.

**Cómo lo implementaremos**

- Crear un patrón único de modal.
- Unificar:
  - header,
  - cierre,
  - acciones primarias/secundarias,
  - espacios internos,
  - labels y ayudas.

---

### 7. Dashboard con widgets ejecutivos

**Qué tomamos**

- tarjetas KPI limpias;
- gráficos contenidos dentro de módulos definidos;
- tablero con lectura ejecutiva antes que decorativa.

**Por qué**

La referencia de panel en Asana muestra un lenguaje claro:

- primero KPIs;
- luego visualizaciones;
- luego desglose.

Eso encaja muy bien con el CRM de asesor.

**Cómo lo implementaremos**

- Mantener KPIs arriba.
- Reorganizar dashboard para que cada módulo responda a una pregunta concreta:
  - cuántos leads entraron,
  - cuántos avanzaron,
  - cuántos cerraron,
  - cuántas citas vienen,
  - cómo se distribuyen por sistema o estado.
- Evitar widgets decorativos sin valor operativo.

---

## Qué no vamos a tomar

### 1. La estética oscura completa de Asana

No vamos a convertir el CRM en una interfaz oscura tipo workspace.  
Solo tomaremos:

- contraste,
- orden,
- estructura,
- limpieza.

PlanesPro debe seguir sintiéndose propio y profesional, no como clon de una herramienta genérica.

### 2. Exceso de módulos irrelevantes

No vamos a replicar:

- portafolios,
- objetivos complejos,
- feeds sociales,
- múltiples capas de administración que hoy no aportan al asesor.

Solo adoptaremos patrones que sirvan al flujo comercial y operativo.

### 3. Demasiadas acciones visibles al mismo tiempo

La referencia tiene muchas acciones de producto porque Asana es una suite más amplia.  
En nuestro caso eso generaría ruido.

Tomaremos solo:

- acciones primarias claras,
- accesos secundarios discretos,
- menús contextuales donde corresponda.

### 4. Terminología de tareas/proyectos

No vamos a mezclar el lenguaje del CRM con “tareas”, “proyectos”, “portafolios” o “objetivos” salvo cuando exista una función real.

Nuestro lenguaje debe seguir centrado en:

- leads,
- citas,
- estados,
- adjuntos,
- notas,
- métricas,
- configuraciones.

---

## Dirección visual propuesta para PlanesPro CRM

### Sistema visual

- Base blanca y gris muy claro.
- Azul PlanesPro como color primario.
- Colores semánticos reservados para estados:
  - éxito,
  - alerta,
  - pendiente,
  - bloqueado.
- Menos saturación general.
- Menos sombras pesadas.
- Bordes y separadores más visibles pero más finos.

### Tipografía

- Mantener familia actual.
- Reducir tamaños inflados en títulos intermedios.
- Mejorar escala:
  - título módulo,
  - subtítulo,
  - label,
  - metadata,
  - helper text.

### Espaciado

- Usar una retícula consistente.
- Reducir huecos vacíos entre módulos.
- Compactar cards sin sacrificar respiración.

### Componentes

- Tags más bajos.
- Badges más limpios.
- Inputs más uniformes.
- Botones con jerarquía más evidente:
  - primario,
  - secundario,
  - ghost,
  - peligro.

---

## Cómo lo vamos a implementar en el proyecto

## Área técnica afectada

### Archivos principales

- `crm/index.html`
- `crm/styles.css`
- `crm/app.js`

### Posibles extensiones posteriores

- dividir `crm/styles.css` por secciones cuando el lenguaje visual quede estable;
- crear parciales o componentes JS reutilizables para:
  - tabs,
  - modales,
  - cards métricas,
  - panel lateral de detalle,
  - toolbar de módulo.

---

## Roadmap de diseño

### Etapa 1 — Fundaciones visuales

**Objetivo**

Limpiar la base visual del CRM antes de rediseñar vistas específicas.

**Incluye**

- retícula general;
- sidebar;
- topbar;
- paddings globales;
- escala tipográfica;
- radios, bordes y sombras;
- estados base de botones, inputs, tags y cards.

**Resultado esperado**

Un CRM visualmente más sobrio y cohesivo, incluso antes de rediseñar módulos internos.

---

### Etapa 2 — Vista de Leads

**Objetivo**

Convertir el módulo de leads en una vista operativa compacta y elegante.

**Incluye**

- toolbar más limpia;
- lista de leads más densa;
- tags y metadata mejor alineadas;
- acciones rápidas más discretas;
- ficha lateral más ordenada;
- reducción de duplicidades visuales.

**Patrones tomados**

- listas/tablas compactas;
- panel derecho de inspección;
- jerarquía clara de acciones.

**Resultado esperado**

Menos ruido y más velocidad de lectura/gestión.

---

### Etapa 3 — Vista de Agenda

**Objetivo**

Llevar la agenda a una interfaz de bloques legible, entendible y visualmente controlada.

**Incluye**

- bloque horario diario/semanal consistente;
- slots visibles aunque estén ocupados;
- estados en gris para horas tomadas;
- bloques manuales claramente diferenciados;
- acciones compactas para bloquear, liberar, reprogramar y cancelar.

**Patrones tomados**

- grillas organizadas;
- listas de detalle a la derecha o debajo;
- uso más disciplinado del color semántico.

**Resultado esperado**

Una agenda utilizable de verdad, sin comportamientos ambiguos.

---

### Etapa 4 — Dashboard del asesor

**Objetivo**

Hacer que el dashboard se vea ejecutivo y no improvisado.

**Incluye**

- KPI cards homogéneas;
- módulos analíticos mejor proporcionados;
- gráficos en tarjetas con títulos claros;
- agenda inmediata y pipeline más compactos;
- prioridades visuales mejor definidas.

**Patrones tomados**

- paneles KPI;
- widgets sobrios;
- composición modular.

**Resultado esperado**

Un panel que se vea premium, enfocado y útil.

---

### Etapa 5 — Settings, Profile y modales

**Objetivo**

Unificar pantallas secundarias para que no parezcan “otro producto”.

**Incluye**

- modales de creación/confirmación;
- formularios internos;
- settings de disponibilidad y bloqueos;
- profile del asesor;
- futuros formularios de objetivos o notas.

**Patrones tomados**

- overlays limpios;
- formularios centrados;
- composición sobria y alineada.

**Resultado esperado**

Consistencia transversal en todo el CRM.

---

## Orden de ejecución recomendado

1. Fundaciones visuales  
2. Leads  
3. Agenda  
4. Dashboard  
5. Settings / Profile / Modales

Ese orden es importante porque:

- Leads y Agenda son el núcleo operativo;
- el dashboard depende del lenguaje visual ya estabilizado;
- settings y modales deben heredar un sistema ya definido, no inventarlo.

---

## Criterios de éxito

El rediseño se considera bien encaminado si logra esto:

- el CRM se ve más limpio y menos inflado;
- el asesor entiende más rápido dónde actuar;
- hay menos duplicación visual;
- la agenda y los leads se sienten parte del mismo sistema;
- la interfaz soporta crecimiento sin volverse caótica.

---

## Decisiones de implementación

- No clonaremos Asana.
- Sí adoptaremos su disciplina de layout, densidad y jerarquía.
- Mantendremos la identidad de PlanesPro.
- Priorizaremos utilidad operativa antes que ornamentación.
- Cada cambio visual debe dejar la base lista para módulos futuros.

---

## Próximo paso

Con este roadmap aprobado, el siguiente trabajo debe ser:

1. ejecutar la **Etapa 1 — Fundaciones visuales**;
2. luego rediseñar **Leads**;
3. después rediseñar **Agenda** sobre la lógica ya cerrada del backend.

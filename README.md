# NextGen Coders - Plataforma de Energía Renovable

Plataforma web desarrollada por el equipo **NextGen Coders** para ofrecer herramientas de visualización y cálculo relacionadas con el consumo energético y soluciones sostenibles. Este proyecto es una aplicación **Frontend-only** (lado del cliente) moderna, responsiva y altamente interactiva.

## 📋 Resumen Técnico

El proyecto está construido sobre una arquitectura estática, lo que significa que no requiere un backend complejo para renderizar la interfaz. Se basa en **HTML5 semántico**, **CSS moderno** (utilizando Tailwind CSS) y **JavaScript (ES6+)** para la lógica del lado del cliente.

La aplicación destaca por su capacidad de procesar datos localmente en el navegador (parsing de CSV) y generar visualizaciones dinámicas en tiempo real sin necesidad de llamadas a servidores externos para el procesamiento de datos.

## 🛠️ Tecnologías y Frameworks

### Core

- **HTML5**: Estructura semántica y accesible.
- **JavaScript (ES6+)**: Lógica de componentes, manipulación del DOM y procesamiento de datos.
- **CSS3**: Estilizado personalizado junto con frameworks.

### Librerías y Herramientas

- **[Tailwind CSS](https://tailwindcss.com/)**: Framework de utilidad para el diseño responsivo y estilizado rápido. Configurado con modo oscuro y paleta de colores personalizada (Primary Yellow `#f2cc0d`).
- **[Chart.js](https://www.chartjs.org/)**: Motor de visualización de datos utilizado para renderizar gráficos interactivos (líneas, barras, donas) en el Dashboard.
- **[Papa Parse](https://www.papaparse.com/)**: Librería robusta para el análisis (parsing) de archivos CSV directamente en el navegador. Permite la carga de datos de consumo/generación por parte del usuario.
- **[Simple-DataTables](https://github.com/fiduswriter/Simple-DataTables)**: Librería ligera para agregar interactividad (búsqueda, ordenamiento) a las tablas de datos HTML.
- **Google Fonts**: Tipografía **Inter** para una apariencia limpia y moderna.
- **Google Material Symbols**: Iconografía escalable y consistente.

## 🚀 Características Principales

- **Dashboard Interactivo**: Visualización de datos de energía con gráficos dinámicos que se actualizan según los filtros aplicados.
- **Procesamiento de Archivos CSV**:
  - Carga de archivos mediante Drag & Drop.
  - Detección automática de columnas (Fecha, Valor, Categoría).
  - Soporte para diferentes delimitadores (coma y punto y coma).
- **Exportación de Datos**:
  - Descarga de gráficos como imágenes PNG.
  - Exportación de datos filtrados a nuevos archivos CSV.
- **Diseño Responsivo y Dark Mode**: Interfaz adaptable a móviles y escritorio, con soporte nativo para temas claro y oscuro.
- **Arquitectura Modular**: Uso de componentes reutilizables para Header y Footer cargados dinámicamente.

## 📂 Estructura del Proyecto

```text
NextGenCoders/
├── components/      # Fragmentos HTML reutilizables (Header, Footer)
├── public/
│   ├── css/         # Estilos globales y específicos
│   ├── js/          # Lógica de la aplicación (app.js, componentes)
│   ├── img/         # Recursos gráficos
│   └── csv/         # Archivos de datos de ejemplo
├── views/           # Páginas HTML secundarias (Dashboard, Equipo, etc.)
├── index.html       # Punto de entrada principal (Landing Page)
└── README.md        # Documentación del proyecto
```

## 👥 Equipo de Desarrollo

- Daniela Guzman Avila
- Daniel Rudas Rivera
- Gustavo Eduardo Gualtero Delgado
- John Ever Salcedo Martinez
- Samuel Martinez Marin

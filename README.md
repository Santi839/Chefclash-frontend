# TorneoCocina Frontend

TorneoCocina es una aplicación web diseñada para gestionar torneos culinarios. Este frontend está construido utilizando React y Vite, proporcionando una experiencia de desarrollo rápida y moderna.

## Características

- **Autenticación de Usuarios**: Inicio de sesión y persistencia de sesión utilizando JWT.
- **Acceso Basado en Roles**: Funcionalidades específicas para administradores y usuarios.
- **Gestión de Torneos**: Crear, actualizar y ver torneos.
- **Gestión de Chefs**: Agregar, actualizar y eliminar chefs.
- **Actualizaciones en Tiempo Real**: Temporizador de cuenta regresiva para torneos próximos.
- **Diseño Responsivo**: Optimizado para dispositivos de escritorio y móviles.
- **Componentes Interactivos**: Incluye deslizadores, acordeones y modales.

## Estructura del Proyecto

```
frontend-app/
├── public/                # Activos estáticos
├── src/
│   ├── assets/           # Imágenes y otros activos
│   ├── components/       # Componentes reutilizables
│   ├── pages/            # Componentes a nivel de página
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── TournamentListPage.jsx
│   │   └── ...
│   ├── services/         # Funciones de servicio de API
│   ├── App.jsx           # Componente principal de la aplicación
│   ├── main.jsx          # Punto de entrada
│   └── ...
├── vite.config.js        # Configuración de Vite
├── package.json          # Dependencias del proyecto
└── README.md             # Documentación del proyecto
```

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/your-repo/torneocina-frontend.git
   ```

2. Navega al directorio del proyecto:
   ```bash
   cd torneocina-frontend
   ```

3. Instala las dependencias:
   ```bash
   npm install
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Construye para producción:
   ```bash
   npm run build
   ```

## Variables de Entorno

Crea un archivo `.env` en el directorio raíz y configura las siguientes variables:

```
VITE_API_BASE_URL=http://localhost:3000
```

## Dependencias

- **React**: Biblioteca frontend para construir interfaces de usuario.
- **Vite**: Herramienta de construcción para desarrollo rápido.
- **React Router**: Para enrutamiento y navegación.
- **Axios**: Para solicitudes de API.
- **SweetAlert2**: Para alertas y modales hermosos.
- **Leaflet**: Para mapas interactivos.

## Contribuyendo

1. Haz un fork del repositorio.
2. Crea una nueva rama:
   ```bash
   git checkout -b feature/tu-nombre-de-caracteristica
   ```
3. Confirma tus cambios:
   ```bash
   git commit -m "Agrega tu mensaje aquí"
   ```
4. Sube a la rama:
   ```bash
   git push origin feature/tu-nombre-de-caracteristica
   ```
5. Abre una solicitud de extracción.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

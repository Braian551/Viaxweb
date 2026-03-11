# Viaxweb

## Regla obligatoria de reutilizacion

Para mantener arquitectura limpia y evitar errores de integracion, en este proyecto es obligatorio reutilizar utilidades y componentes existentes.

### Politica

1. No crear componentes nuevos si ya existe uno que cubre el caso.
2. No duplicar logica de transformacion de datos en paginas.
3. Para recursos R2 (imagenes, comprobantes, fotos), usar siempre `getR2ImageUrl` desde `src/utils/r2Images.js`.
4. Si un modulo necesita ajuste, primero se corrige la utilidad compartida y luego se reutiliza en todas las pantallas.

### Ejemplo obligatorio (R2)

- Correcto: `getR2ImageUrl(comprobante_url)`
- Incorrecto: construir manualmente `.../r2_proxy.php?key=...` dentro de cada pagina.

### Objetivo

- Reducir bugs por URLs mal formadas.
- Evitar comportamientos distintos entre vistas.
- Mantener codigo limpio, consistente y facil de mantener.

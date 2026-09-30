# ✅ Checklist de Entrega - Hackathon INE 2026

## 📋 Entregables Obligatorios (§11 del README)

**⚠️ Omitir UNO = descalificación automática**

### 1. Registro Oficial
- [ ] Registro en ine.mx/hackathon-2026 **antes del 15-oct**
- [ ] Carta de cesión de derechos anexa (firmada)
- [ ] Confirmación recibida de grecia.castro@ine.mx

### 2. Presentación Ejecutiva
- [ ] Formato: PDF o PPTX
- [ ] Máximo 10 diapositivas
- [ ] Contenido: problema, solución, demo, impacto
- [ ] Responsable: Diseño + Narrativa

### 3. Código / Repositorio
- [ ] GitHub o GitLab **privado**
- [ ] Acceso para evaluadores del INE
- [ ] README.md completo
- [ ] LICENCIAS.md con inventario
- [ ] .gitignore configurado
- [ ] Fecha límite: **31-oct**

### 4. Carta de Cesión de Derechos
- [ ] Firmada por **las 2 personas del equipo**
- [ ] PDF escaneado
- [ ] Fecha límite: **31-oct**

### 5. Carta Declaratoria de Decir Verdad
- [ ] Firmada por **las 2 personas del equipo**
- [ ] PDF escaneado
- [ ] Fecha límite: **31-oct**

### 6. Prototipo Visual
- [ ] Enlace web interactivo (Netlify/Cloudflare/GitHub Pages)
- [ ] Respaldo: PDF o PNG de capturas
- [ ] Probado en Chrome, Firefox, Safari
- [ ] Responsive: mobile, tablet, desktop
- [ ] Fecha límite: **31-oct**

### 7. Guion Narrativo
- [ ] Formato: PDF
- [ ] Extensión: 3-5 cuartillas
- [ ] Fuente: Arial o Calibri 11pt
- [ ] Interlineado: 1.5
- [ ] Contenido: storyline + estrategia de difusión
- [ ] Responsable: Narrativa

### 8. Video/Pitch
- [ ] Duración: ≤ 3:00 minutos
- [ ] Formato: MP4 1080p
- [ ] Enlace: Vimeo, YouTube o Google Drive
- [ ] **Probado desde otra cuenta** (sin permisos denegados)
- [ ] Subtítulos en español
- [ ] Fecha límite: **31-oct**

### 9. Archivo .zip Final
- [ ] Nombre: `NombreEquipo_StorytellingConDatos.zip`
- [ ] Tamaño: < 15 MB
- [ ] Contenido: todos los entregables
- [ ] Enviado a: grecia.castro@ine.mx y cirse.rodriguez@ine.mx
- [ ] **Antes de 23:59 del 31-oct**

---

## 🔧 Checklist Técnico (Desarrollo)

### Datos
- [ ] 6 archivos .zip del INE en `data/raw/`
- [ ] Pipeline ejecutado: `python pipeline/pipeline.py`
- [ ] `data/cohorts.json` generado con datos reales
- [ ] Validación: totales nacionales coinciden con INE
- [ ] Reporte de validación: `data/reporte_validacion.md`

### Build
- [ ] `npm run build` ejecutado sin errores
- [ ] `dist/` generado correctamente
- [ ] Tamaño total < 1 MB
- [ ] Archivos minificados
- [ ] `dist/data/cohorts.json` copiado

### Funcionalidad
- [ ] F1 (Selector): año + entidad funcionales
- [ ] F2 (Línea de Vida): gráfico con dos trazos
- [ ] F3 (Comparación): texto dinámico correcto
- [ ] F4 (Silla Vacía): 100 asientos, % exacto en texto
- [ ] F6 (Tarjeta): PNG 1080×1350 se descarga
- [ ] F7 (Metodología): página completa con enlaces

### Accesibilidad (WCAG 2.1 AA)
- [ ] Contraste ≥ 4.5:1 (verificado con herramienta)
- [ ] Navegación por teclado completa (sin ratón)
- [ ] ARIA labels en todos los elementos interactivos
- [ ] Tablas equivalentes para gráficos
- [ ] `prefers-reduced-motion` respetado
- [ ] Lectores de pantalla: probado con NVDA o VoiceOver
- [ ] Skip link funcional

### Rendimiento
- [ ] Lighthouse Rendimiento ≥ 90
- [ ] Lighthouse Accesibilidad ≥ 90
- [ ] Tiempo a Interactivo < 300 ms
- [ ] Funciona en Android 5+, iOS 12+
- [ ] Funciona con 3G simulado

### Privacidad
- [ ] Cero cookies (verificado en DevTools)
- [ ] Cero localStorage (verificado en DevTools)
- [ ] Cero analítica de terceros
- [ ] Tipografías autoalojadas (system fonts)
- [ ] Datos procesados localmente

### Neutralidad
- [ ] Lenguaje descriptivo (no "deberías votar")
- [ ] Sin resultados por partido político
- [ ] Sin llamados implícitos a votar
- [ ] Checklist de neutralidad revisado por 2 personas

### Pruebas Cross-browser
- [ ] Chrome (última versión)
- [ ] Firefox (última versión)
- [ ] Safari iOS (versión 12+)
- [ ] Chrome Mobile Android (versión 5+)

### Documentación
- [ ] README.md completo (según plantilla)
- [ ] LICENCIAS.md con todas las dependencias
- [ ] METODOLOGIA.md o sección en README
- [ ] INSTALACION.md con instrucciones claras
- [ ] Comentarios en código crítico

---

## 📝 Checklist de Contenido del .zip

### Estructura del .zip
```
NombreEquipo_StorytellingConDatos.zip
├── codigo/
│   ├── src/
│   ├── public/
│   ├── dist/                    ← Build de producción
│   ├── package.json
│   ├── vite.config.js
│   ├── README.md
│   ├── LICENCIAS.md
│   └── METODOLOGIA.md
├── documentos/
│   ├── presentacion.pdf         ← Entregable 2
│   ├── guion_narrativo.pdf      ← Entregable 7
│   ├── carta_cesion.pdf         ← Entregable 4
│   └── carta_declaratoria.pdf   ← Entregable 5
├── video/
│   └── enlace_video.txt         ← URL de Vimeo/YouTube
└── prototipo/
    └── enlace_sitio.txt         ← URL de Netlify/Cloudflare
```

### Archivos en el .zip
- [ ] Carpeta `codigo/` con proyecto completo
- [ ] Carpeta `documentos/` con PDFs firmados
- [ ] Carpeta `video/` con enlace verificado
- [ ] Carpeta `prototipo/` con enlace del sitio
- [ ] README.txt en raíz con índice de contenidos

---

## 🚀 Checklist de Publicación

### Hosting del Prototipo
- [ ] Dominio o URL elegida
- [ ] Build subido correctamente
- [ ] HTTPS habilitado
- [ ] Probado en incógnito (sin cache)
- [ ] Probado en móvil real
- [ ] Enlaces internos funcionan
- [ ] Datos cargan correctamente

### Video en Línea
- [ ] Subido a Vimeo/YouTube/Drive
- [ ] Configuración de privacidad: "No listado" o "Público"
- [ ] **Probado desde cuenta sin acceso** (importante)
- [ ] Subtítulos activados
- [ ] Calidad 1080p confirmada

### Repositorio
- [ ] Privado (no publicar antes de resultados)
- [ ] Acceso compartido con evaluadores INE
- [ ] Última versión pusheada
- [ ] Tags de versión: `v1.0-entrega-final`

---

## ⏰ Timeline de Entrega

### Semana del 21-27 oct
- [ ] Completar todos los componentes funcionales
- [ ] Integrar datos reales del INE
- [ ] Ejecutar pruebas de accesibilidad
- [ ] Crear presentación ejecutiva
- [ ] Escribir guion narrativo

### Semana del 28-29 oct
- [ ] Grabar y editar video
- [ ] Subir prototipo a hosting
- [ ] Firmar cartas (cesión + declaratoria)
- [ ] Escanear documentos firmados
- [ ] Preparar .zip final

### 30 oct (Día -1)
- [ ] **Prueba de envío:** correo de prueba con .zip
- [ ] Verificar enlace del video desde otra cuenta
- [ ] Checklist final al 100%
- [ ] Screenshot de confirmación guardado

### 31 oct (Día Final)
- [ ] **ENVÍO FINAL antes de 23:59**
- [ ] Confirmar recepción
- [ ] Guardar comprobante de envío
- [ ] Backup del .zip en otro lugar

---

## 🎯 Criterios de Evaluación (Referencia)

Según bases del hackathon:

1. **Storytelling (30%)**
   - Narrativa clara y atractiva
   - Conexión emocional con el público
   - Uso efectivo de datos para contar historia

2. **Diseño Visual (25%)**
   - Estética profesional
   - Usabilidad e intuición
   - Accesibilidad y responsive

3. **Innovación (20%)**
   - Originalidad del enfoque
   - Creatividad en visualizaciones
   - Valor agregado al INE

4. **Viabilidad Técnica (15%)**
   - Código limpio y documentado
   - Reproducibilidad
   - Escalabilidad

5. **Impacto Social (10%)**
   - Potencial de adopción
   - Relevancia para el público objetivo
   - Estrategia de difusión

---

## ❌ Causas de Descalificación (Evitar)

1. ❌ Registro después del 15-oct
2. ❌ Omitir cualquiera de los 9 entregables
3. ❌ Envío después de 23:59 del 31-oct
4. ❌ Cartas sin firmas de ambos integrantes
5. ❌ Video sin acceso público/no listado
6. ❌ Código con datos falsos sin disclaimer
7. ❌ Plagio o uso de código sin licencia
8. ❌ Contenido partidista o no neutral

---

## 📧 Contactos de Soporte

- **Vinculación DECEyEC:** vinculacion.deceyec@ine.mx
- **Envío de entregables:** grecia.castro@ine.mx y cirse.rodriguez@ine.mx
- **Registro:** ine.mx/hackathon-2026

---

**Última revisión:** 29-sep-2026  
**Días restantes:** 32 días hasta el 31-oct  
**Estado:** Checklist listo para seguimiento

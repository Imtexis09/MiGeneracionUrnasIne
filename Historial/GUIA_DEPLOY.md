# 🚀 Guía Rápida de Deploy

## ✅ Estado Actual

- ✅ Build exitoso (sin errores)
- ✅ Archivos generados en `dist/`
- ✅ Tamaño: ~139 KB (cumple < 1 MB)
- ✅ Listo para deploy

---

## 📋 Pasos para Deploy en Vercel

### Método 1: GitHub + Vercel (Recomendado)

#### 1. Subir a GitHub

```bash
# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Crear commit
git commit -m "Frontend completo - Mi Generación en las Urnas"

# Crear repositorio en GitHub
# Ve a: https://github.com/new
# Nombre sugerido: mi-generacion-urnas
# Visibilidad: PRIVADO (según requisitos del hackathon)

# Conectar repositorio remoto (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/mi-generacion-urnas.git

# Subir código
git branch -M main
git push -u origin main
```

#### 2. Deploy en Vercel

1. **Ir a Vercel:**
   - https://vercel.com/login
   - Login con GitHub

2. **Importar proyecto:**
   - Click "Add New Project"
   - Selecciona tu repositorio `mi-generacion-urnas`
   - Click "Import"

3. **Configuración automática:**
   - Vercel detectará Vite automáticamente
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy:**
   - Click "Deploy"
   - Esperar ~2 minutos
   - ¡Listo! 🎉

5. **URL del sitio:**
   - Vercel te dará una URL como:
   - `https://mi-generacion-urnas.vercel.app`

---

### Método 2: Deploy Directo (CLI)

#### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login

```bash
vercel login
```

Sigue las instrucciones en el navegador.

#### 3. Deploy

```bash
# Deploy de producción
vercel --prod
```

Vercel hará:
- ✅ Detectar proyecto
- ✅ Instalar dependencias
- ✅ Ejecutar `npm run build`
- ✅ Subir archivos de `dist/`
- ✅ Darte una URL

---

## 🧪 Probar Localmente Antes de Deploy

### 1. Build

```bash
npm run build
```

**Salida esperada:**
```
✓ 613 modules transformed.
dist/index.html                   1.00 kB │ gzip:  0.49 kB
dist/assets/index-BQFLymex.css   31.29 kB │ gzip:  5.68 kB
dist/assets/index-CPeG_ZjT.js   105.45 kB │ gzip: 36.48 kB
✓ built in 14.68s
```

### 2. Preview Local

```bash
npm run preview
```

**Abre:** http://localhost:4173

### 3. Probar Funcionalidad

- [ ] Selector de año funciona
- [ ] Selector de entidad funciona
- [ ] Gráfico de línea de vida se muestra
- [ ] Comparación generacional muestra texto
- [ ] Silla vacía anima correctamente
- [ ] Tarjeta se descarga como PNG
- [ ] Botón "Ver Metodología" funciona

---

## 📱 Verificación Post-Deploy

### 1. Probar en Diferentes Dispositivos

- [ ] Desktop (Chrome, Firefox, Edge)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet

### 2. Lighthouse Audit

1. Abrir sitio en Chrome
2. F12 → Tab "Lighthouse"
3. Seleccionar todas las categorías
4. Click "Analyze page load"

**Objetivos:**
- Rendimiento: ≥ 90 ✓
- Accesibilidad: ≥ 90 ✓
- Best Practices: ≥ 90 ✓
- SEO: ≥ 90 ✓

### 3. Accesibilidad

**Navegación por teclado:**
- Tab para navegar entre elementos
- Enter para activar botones
- Escape para cerrar modales

**Lector de pantalla:**
- Probar con NVDA (Windows) o VoiceOver (Mac)

---

## 🔧 Solución de Problemas

### Error: "Build failed"

```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "Module not found"

Verifica que todas las dependencias estén instaladas:
```bash
npm install d3 --save
```

### Sitio no carga datos

Verifica que `public/data/cohorts.json` existe y es válido:
```bash
cat public/data/cohorts.json
```

---

## 📊 Métricas Actuales

### Tamaño del Build

```
Archivos principales:
- index.html:        0.98 KB
- CSS (gzip):        5.68 KB
- JS (gzip):        36.48 KB
- cohorts.json:      4.13 KB

Total (gzip):       ~47 KB ✓
```

### Performance

- Módulos transformados: 613
- Tiempo de build: ~15s
- Framework: Svelte (ligero)
- Bundler: Vite (rápido)

---

## 🎯 URLs Importantes

### Desarrollo
- Local dev: http://localhost:5173
- Local preview: http://localhost:4173

### Producción (después de deploy)
- Vercel: `https://[tu-proyecto].vercel.app`
- Custom domain (opcional): `migenera cionenlasurnas.mx`

### Repositorio
- GitHub: `https://github.com/[tu-usuario]/mi-generacion-urnas`

---

## 📞 Soporte

### Si algo falla:

1. **Revisar logs de build:**
   ```bash
   npm run build
   ```

2. **Consultar documentación:**
   - Vite: https://vitejs.dev/
   - Vercel: https://vercel.com/docs
   - Svelte: https://svelte.dev/docs

3. **Archivos de referencia:**
   - `CORRECCIONES_BUILD.md` - Problemas resueltos
   - `DESARROLLO.md` - Guía completa
   - `CHECKLIST_ENTREGA.md` - Requisitos del hackathon

---

## ✅ Checklist Final

### Pre-Deploy
- [x] `npm run build` exitoso
- [x] `npm run preview` funciona
- [x] Todos los componentes probados
- [x] Archivos en `dist/` verificados
- [ ] Repositorio de GitHub creado
- [ ] Código subido a GitHub

### Post-Deploy
- [ ] URL de Vercel funcional
- [ ] Sitio probado en mobile
- [ ] Lighthouse audit ejecutado
- [ ] Accesibilidad verificada
- [ ] URL guardada para entregable

---

**¡Todo listo para deploy! 🚀**

**Fecha:** 29-sep-2026  
**Build status:** ✅ Exitoso  
**Siguiente paso:** Subir a GitHub y deploy en Vercel

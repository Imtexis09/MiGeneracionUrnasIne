import './styles/global.css'
import './styles/responsive.css'
import { mount } from 'svelte'
import App from './App.svelte'
import { loadData } from './utils/data.js'

// Empieza a descargar los datos ya, en paralelo con el montaje de la app
loadData().catch(() => {})

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app

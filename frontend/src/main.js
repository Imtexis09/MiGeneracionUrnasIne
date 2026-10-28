import './styles/global.css'
import './styles/responsive.css'
import { mount } from 'svelte'
import App from './App.svelte'
import { loadData } from './utils/data.js'

loadData().catch(() => {})

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Polyfill window.storage for local dev (uses localStorage)
if (!window.storage) {
  window.storage = {
    async get(key) {
      const val = localStorage.getItem(`boxing_${key}`)
      if (val === null) throw new Error('Key not found')
      return { key, value: val, shared: false }
    },
    async set(key, value) {
      localStorage.setItem(`boxing_${key}`, value)
      return { key, value, shared: false }
    },
    async delete(key) {
      localStorage.removeItem(`boxing_${key}`)
      return { key, deleted: true, shared: false }
    },
    async list(prefix = '') {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k.startsWith(`boxing_${prefix}`)) {
          keys.push(k.replace('boxing_', ''))
        }
      }
      return { keys, prefix, shared: false }
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

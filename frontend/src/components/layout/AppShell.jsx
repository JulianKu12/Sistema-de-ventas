import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function IconoVenta() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-11.25 0V21" />
    </svg>
  )
}

function IconoIngrediente() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v6.03a1.125 1.125 0 0 1-2.25 0V4.575m3.15 0a1.125 1.125 0 0 0-3.15 0M9 14.25a1.5 1.5 0 0 1 1.5 1.5v1.5a1.5 1.5 0 0 1-3 0v-1.5A1.5 1.5 0 0 1 9 14.25Zm6.75-10.5a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-3 0V5.25a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  )
}

function IconoProducto() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  )
}

function IconoCombo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M21 8a2.99 2.99 0 0 1-2.25 2.89l-2.87 2.88a3 3 0 1 1-4.25-4.24l2.88-2.87A3 3 0 1 1 21 8Zm-13.5 6 1.5 1.5m-3 3 1.5 1.5m0-9L9 9" />
    </svg>
  )
}

function IconoGasto() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M2.25 18.75a60 60 0 0 1 15.38-.2m-15.38.2a60 60 0 0 0 12.47 3.25c2.68.36 5.35-.66 6.88-2.05 1.69-1.55 2.02-3.98 1.06-5.45-.55-.84-1.56-1.34-2.42-1.25a3.75 3.75 0 0 0-3.1 1.82c-.44.78-.78 1.61-1.02 2.47m-.39 6.76V17.82m-3 .75c0-1.24-.28-2.45-.82-3.55l-1.5-3.7m3.9 7.25c.45 1.2.9 2.1 1.02 3.55M7.3 8.25l1.6-4.05c.3-.75 1.4-.75 1.7 0l1.6 4.05m-4.9 0 2 5.13a2.25 2.25 0 0 0 4.9-1.32l-2-5.07h2.4V2.51L7.5 4.74" />
    </svg>
  )
}

function IconoCaja() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function IconoInventario() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="m7.5 4.27 9 5.15M3 9.42l9 5.15 9-5.15M12 21.72v-7.15M7.5 4.27 3 9.42v8.66a2 2 0 0 0 1 1.73l3.5 2M16.5 4.27 21 9.42v8.66a2 2 0 0 1-1 1.73l-3.5 2" />
    </svg>
  )
}

function IconoDevolucion() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
  )
}

function IconoPedido() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  )
}

function IconoCliente() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  )
}

function IconoRepartidor() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632ZM3 7.5h1.5l.75.75A1.5 1.5 0 0 0 6 8.694h.75m-1.5 0V6.75h11.25" />
    </svg>
  )
}

function IconoConfig() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.02a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.02a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.02a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  )
}

function IconoReporte() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}

const items = [
  { to: '/', end: true, etiqueta: 'Pedidos', icono: <IconoPedido /> },
  { to: '/punto-venta', etiqueta: 'Venta rápida', icono: <IconoVenta /> },
  { to: '/ingredientes', etiqueta: 'Ingredientes', icono: <IconoIngrediente /> },
  { to: '/inventario', etiqueta: 'Inventario', icono: <IconoInventario /> },
  { to: '/productos', etiqueta: 'Productos', icono: <IconoProducto /> },
  { to: '/combos', etiqueta: 'Combos', icono: <IconoCombo /> },
  { to: '/devoluciones', etiqueta: 'Devoluciones', icono: <IconoDevolucion /> },
  { to: '/gastos', etiqueta: 'Gastos', icono: <IconoGasto /> },
  { to: '/caja', etiqueta: 'Caja', icono: <IconoCaja /> },
  { to: '/clientes', etiqueta: 'Clientes', icono: <IconoCliente /> },
  { to: '/reportes', etiqueta: 'Reportes', icono: <IconoReporte /> },
  { to: '/repartidores', etiqueta: 'Repartidores', icono: <IconoRepartidor /> },
  { to: '/configuracion', etiqueta: 'Configuración', icono: <IconoConfig /> },
]

function AppShell() {
  const { usuario, logout } = useAuth()
  const [abierto, setAbierto] = useState(true)
  const [arrastre, setArrastre] = useState(null)

  useEffect(() => {
    if (!arrastre) return
    const mover = (e) => {
      const delta = arrastre.x - e.clientX
      if (Math.abs(delta) > 28) {
        setAbierto(delta > 0 ? false : true)
        setArrastre(null)
      }
    }
    const soltar = () => setArrastre(null)
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
    window.addEventListener('pointercancel', soltar)
    return () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
      window.removeEventListener('pointercancel', soltar)
    }
  }, [arrastre])

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`relative flex shrink-0 flex-col border-r border-black/5 bg-card transition-[width] duration-200 ${abierto ? 'w-[260px]' : 'w-[80px]'}`}>
        <div className={`flex items-center gap-3 px-5 py-5 ${abierto ? '' : 'justify-center px-2'}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-white">
            <IconoVenta />
          </div>
          {abierto && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold leading-tight text-ink">Sistema POS</p>
              <p className="truncate text-xs text-muted">Lonchería</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map((item) => {
            const contenido = (
              <>
                <span className="shrink-0">{item.icono}</span>
                {abierto && <span className="truncate">{item.etiqueta}</span>}
              </>
            )
            return item.deshabilitado ? (
              <span
                key={item.to}
                title={item.etiqueta}
                className={`flex cursor-not-allowed items-center rounded-2xl text-sm font-medium text-muted/50 ${
                  abierto ? 'gap-3 px-4 py-3' : 'justify-center px-0 py-3'
                }`}
              >
                {contenido}
              </span>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.etiqueta}
                className={({ isActive }) =>
                  `flex items-center rounded-xl text-sm font-medium transition ${
                    abierto ? 'gap-3 px-4 py-3' : 'justify-center px-0 py-3'
                  } ${isActive ? 'bg-accent/10 text-accent' : 'text-ink active:bg-muted/10'}`
                }
              >
                {contenido}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-black/5 p-3">
          <div className={abierto ? 'px-1' : ''}>
            <p className={`mb-2 truncate text-sm font-medium text-ink ${abierto ? '' : 'text-center'}`} title={usuario?.nombre}>
              {usuario?.nombre}
            </p>
            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              className={`flex w-full items-center rounded-xl bg-input font-semibold text-ink transition active:scale-[0.97] active:bg-muted/20 ${
                abierto ? 'gap-3 px-4 py-2.5 text-sm' : 'justify-center px-0 py-2.5'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
                <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-7.5A2.25 2.25 0 0 0 3.75 5.25v13.5A2.25 2.25 0 0 0 6 21h7.5a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3-3 3M9 12h12" />
              </svg>
              {abierto && <span>Cerrar sesión</span>}
            </button>
          </div>
        </div>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault()
            setArrastre({ x: e.clientX })
          }}
          onDoubleClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? 'Contraer menú' : 'Expandir menú'}
          className="group absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-1/2"
        >
          <span
            className={`flex h-24 w-[9px] items-center justify-center rounded-full shadow-card transition ${
              abierto ? 'bg-warning/60 group-hover:bg-warning' : 'bg-accent/60 group-hover:bg-accent'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3.5 w-3.5 text-white transition-transform duration-200 ${abierto ? 'rotate-0' : 'rotate-180'}`}
              aria-hidden="true"
            >
              <path d="M14.25 5.25 7.5 12l6.75 6.75" />
            </svg>
          </span>
        </button>
      </aside>

      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}

export default AppShell

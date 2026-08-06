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
      <path d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.512.966.231 1.44l-.4.61c-.225.43-.111.95.227 1.3.34.351.849.383 1.136.084l.384-.399a1.125 1.125 0 0 1 1.422-.109l1.018.686c.42.282.611.8.41 1.313l-.287.755c-.188.47-.611.86-1.11.86h-1.07c-.56 0-1.03.398-1.12.94-.09.542.06 1.085.02 1.29-.4 2.398-1.21 4.917-2.92 6.66" />
      <path d="M11 6a5.25 5.25 0 1 0 5.25 5.25H14A3 3 0 0 1 11 8.25V6Z" />
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
  { to: '/repartidores', etiqueta: 'Repartidores', icono: <IconoRepartidor /> },
  { to: '/configuracion', etiqueta: 'Configuración', icono: <IconoConfig /> },
]

function AppShell() {
  const { usuario, logout } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-black/5 bg-card">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white">
            <IconoVenta />
          </div>
          <div>
            <p className="font-bold leading-tight text-ink">Sistema POS</p>
            <p className="text-xs text-muted">Lonchería</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map((item) =>
            item.deshabilitado ? (
              <span
                key={item.to}
                className="flex cursor-not-allowed items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted/50"
              >
                {item.icono}
                {item.etiqueta}
              </span>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-accent/10 text-accent' : 'text-ink active:bg-muted/10'
                  }`
                }
              >
                {item.icono}
                {item.etiqueta}
              </NavLink>
            ),
          )}
        </nav>

        <div className="border-t border-black/5 px-5 py-4">
          <p className="mb-2 truncate text-sm font-medium text-ink">{usuario?.nombre}</p>
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-2xl bg-input px-4 py-2.5 text-sm font-semibold text-ink transition active:scale-[0.97] active:bg-muted/20"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}

export default AppShell

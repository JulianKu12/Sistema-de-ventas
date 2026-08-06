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

function IconoInventario() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="m7.5 4.27 9 5.15M3 9.42l9 5.15 9-5.15M12 21.72v-7.15M7.5 4.27 3 9.42v8.66a2 2 0 0 0 1 1.73l3.5 2M16.5 4.27 21 9.42v8.66a2 2 0 0 1-1 1.73l-3.5 2" />
    </svg>
  )
}

const items = [
  { to: '/', end: true, etiqueta: 'Punto de Venta', icono: <IconoVenta /> },
  { to: '/ingredientes', etiqueta: 'Ingredientes', icono: <IconoIngrediente /> },
  { to: '/inventario', etiqueta: 'Inventario', icono: <IconoInventario /> },
  { to: '/productos', etiqueta: 'Productos', icono: <IconoProducto /> },
  { to: '/combos', etiqueta: 'Combos', icono: <IconoCombo /> },
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

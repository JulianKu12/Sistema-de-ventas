import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function IconoVenta() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-11.25 0V21" />
    </svg>
  )
}

export default function RepartidorShell() {
  const { usuario, logout } = useAuth()
  return (
    <div className="flex h-screen flex-col bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white">
            <IconoVenta />
          </div>
          <div>
            <p className="font-bold leading-tight text-ink">Lonchería · Repartidor</p>
            <p className="text-xs text-muted">{usuario?.nombre}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-2xl bg-input px-4 py-2.5 text-sm font-semibold text-ink transition active:scale-[0.97] active:bg-muted/20"
        >
          Cerrar sesión
        </button>
      </header>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
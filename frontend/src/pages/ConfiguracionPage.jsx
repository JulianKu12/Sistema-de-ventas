import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { estadoConfig, actualizarConfig } from '../services/config'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Switch from '../components/ui/Switch'
import { formatearPrecio } from '../utils/formato'

function ConfiguracionPage() {
  const { logout } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [costoEnvio, setCostoEnvio] = useState('0')
  const [repartidorUnico, setRepartidorUnico] = useState(false)
  const [opcionesCambio, setOpcionesCambio] = useState([])
  const [nuevoMonto, setNuevoMonto] = useState('')

  const manejarError = useCallback((err) => {
    if (err.status === 401) return logout()
    setError(err.message)
  }, [logout])

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const cfg = await estadoConfig()
      setCostoEnvio(String(cfg.costoEnvio ?? 0))
      setRepartidorUnico(cfg.repartidorUnico ?? false)
      setOpcionesCambio(cfg.opcionesCambio ?? [])
    } catch (err) {
      manejarError(err)
    } finally {
      setCargando(false)
    }
  }, [manejarError])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (!toast) return
    const temporizador = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(temporizador)
  }, [toast])

  const agregarMonto = () => {
    const m = Number(nuevoMonto)
    if (!Number.isFinite(m) || m <= 0) {
      setError('Escribe un monto válido (mayor a 0)')
      return
    }
    setError('')
    setOpcionesCambio((prev) => (prev.includes(m) ? prev : [...prev, m].sort((a, b) => a - b)))
    setNuevoMonto('')
  }

  const quitarMonto = (m) => setOpcionesCambio((prev) => prev.filter((x) => x !== m))

  const guardar = async () => {
    setGuardando(true)
    setError('')
    try {
      await actualizarConfig({
        costoEnvio: Number(costoEnvio) || 0,
        repartidorUnico,
        opcionesCambio,
      })
      setToast('Configuración guardada')
      cargar()
    } catch (err) {
      manejarError(err)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Configuración</h1>
          <p className="text-sm text-muted">Envíos, reparto y opciones de cambio</p>
        </div>
        <Button size="md" onClick={guardar} disabled={guardando || cargando}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-sm font-medium text-danger">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Cerrar aviso">✕</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {cargando ? (
          <p className="text-muted">Cargando configuración…</p>
        ) : (
          <div className="mx-auto max-w-xl space-y-4">
            <section className="rounded-3xl bg-card p-6 shadow-card">
              <h2 className="mb-4 text-lg font-bold text-ink">Pedidos a domicilio</h2>
              <Input
                id="costo-envio"
                label="Costo de envío fijo"
                type="number"
                min="0"
                value={costoEnvio}
                onChange={(e) => setCostoEnvio(e.target.value)}
                hint={`Se suma a cada pedido A domicilio: ${formatearPrecio(Number(costoEnvio) || 0)}`}
              />
            </section>

            <section className="rounded-3xl bg-card p-6 shadow-card">
              <h2 className="mb-4 text-lg font-bold text-ink">Reparto</h2>
              <Switch
                checked={repartidorUnico}
                onChange={setRepartidorUnico}
                label="Repartidor único"
                description="Si solo hay un repartidor, se asigna automáticamente al enviar pedidos a domicilio."
              />
            </section>

            <section className="rounded-3xl bg-card p-6 shadow-card">
              <h2 className="mb-4 text-lg font-bold text-ink">Opciones de cambio a llevar</h2>
              <p className="mb-4 text-sm text-muted">
                Montos que verá el cajero al cobrar en efectivo para calcular el cambio.
              </p>
              <div className="flex flex-wrap gap-2">
                {opcionesCambio.map((m) => (
                  <span key={m} className="flex items-center gap-2 rounded-full bg-accent/10 py-1.5 pl-3 pr-1.5 text-sm font-semibold text-accent">
                    ${m}
                    <button type="button" onClick={() => quitarMonto(m)} aria-label={`Quitar $${m}`} className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent transition active:scale-90">
                      ✕
                    </button>
                  </span>
                ))}
                {opcionesCambio.length === 0 && <p className="text-sm text-muted">Sin opciones configuradas.</p>}
              </div>
              <div className="mt-3 flex gap-2">
                <Input id="nuevo-monto" type="number" min="1" placeholder="Agregar monto $" value={nuevoMonto} onChange={(e) => setNuevoMonto(e.target.value)} />
                <Button variant="secondary" size="md" onClick={agregarMonto} className="shrink-0">Agregar</Button>
              </div>
            </section>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card">{toast}</div>
      )}
    </div>
  )
}

export default ConfiguracionPage
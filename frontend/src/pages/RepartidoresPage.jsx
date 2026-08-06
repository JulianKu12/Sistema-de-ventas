import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { listarEmpleados, crearEmpleado, actualizarEmpleado } from '../services/empleados'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'

const ESTADOS = ['Disponible', 'No_disponible_hoy', 'Inactivo']
const COLOR_ESTADO = {
  Disponible: 'bg-emerald-500/15 text-emerald-600',
  No_disponible_hoy: 'bg-warning/15 text-warning',
  Inactivo: 'bg-muted/15 text-muted',
}

function RepartidorModal({ abierto, guardando, repartidor, onClose, onGuardar }) {
  const editando = repartidor !== null
  const [nombre, setNombre] = useState('')
  const [usuario, setUsuario] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [estado, setEstado] = useState('Disponible')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!abierto) return
    setError('')
    setNombre(repartidor?.nombre ?? '')
    setUsuario(repartidor?.usuario?.usuario ?? '')
    setContraseña('')
    setEstado(repartidor?.estadoDisponibilidad ?? 'Disponible')
  }, [abierto, repartidor])

  const enviar = (e) => {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) return setError('El nombre es obligatorio')
    if (!usuario.trim()) return setError('El usuario (login) es obligatorio')
    if (!editando && contraseña.length < 3) return setError('Contraseña de al menos 3 caracteres')
    if (editando && contraseña && contraseña.length < 3) return setError('Contraseña de al menos 3 caracteres')
    onGuardar({ nombre, usuario, contraseña, estadoDisponibilidad: estado })
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title={editando ? `Editar repartidor` : 'Nuevo repartidor'}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>Cancelar</Button>
          <Button type="submit" size="md" onClick={enviar} disabled={guardando}>
            {guardando ? 'Guardando…' : editando ? 'Guardar' : 'Crear repartidor'}
          </Button>
        </>
      }
    >
      <form onSubmit={enviar} className="space-y-4">
        {error && <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{error}</p>}
        <Input id="rep-nombre" label="Nombre" type="text" placeholder="Nombre del repartidor" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <Input id="rep-usuario" label="Usuario (login)" type="text" placeholder="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <Input id="rep-password" label="Contraseña" type="password" placeholder={editando ? 'Déjala vacía para no cambiarla' : 'Mínimo 3 caracteres'} value={contraseña} onChange={(e) => setContraseña(e.target.value)} hint={editando ? 'Solo se cambia si escribes una nueva.' : ''} />
        <div>
          <p className="mb-2 text-sm font-medium text-muted">Disponibilidad</p>
          <div className="flex flex-wrap gap-2">
            {ESTADOS.map((s) => (
              <button key={s} type="button" onClick={() => setEstado(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${estado === s ? 'bg-accent text-white' : 'bg-input text-muted'}`}>
                {s.replaceAll('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}

function RepartidoresPage() {
  const { logout } = useAuth()
  const [repartidores, setRepartidores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const manejarError = useCallback((err) => {
    if (err.status === 401) return logout()
    setError(err.message)
  }, [logout])

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setRepartidores(await listarEmpleados())
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

  const guardar = async (datos) => {
    setGuardando(true)
    setError('')
    try {
      if (editando) {
        await actualizarEmpleado(editando.id, {
          nombre: datos.nombre,
          usuario: datos.usuario,
          estadoDisponibilidad: datos.estadoDisponibilidad,
          ...(datos.contraseña ? { contraseña: datos.contraseña } : {}),
        })
      } else {
        await crearEmpleado(datos)
      }
      setModal(false)
      setEditando(null)
      setToast('Repartidor guardado')
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
          <h1 className="text-2xl font-bold text-ink">Repartidores</h1>
          <p className="text-sm text-muted">Personal de reparto con login individual</p>
        </div>
        <Button size="md" onClick={() => { setEditando(null); setModal(true) }}>Nuevo repartidor</Button>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-sm font-medium text-danger">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Cerrar aviso">✕</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {cargando ? (
          <p className="text-muted">Cargando repartidores…</p>
        ) : repartidores.length === 0 ? (
          <p className="mt-12 text-center text-muted">Aún no hay repartidores registrados.</p>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {repartidores.map((r) => (
              <li key={r.id}>
                <div className="flex items-center justify-between gap-4 rounded-3xl bg-card p-4 shadow-card">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-ink">{r.nombre}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${COLOR_ESTADO[r.estadoDisponibilidad]}`}>
                        {r.estadoDisponibilidad.replaceAll('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      Login: {r.usuario?.usuario ?? '—'} · {r._count?.pedidos ?? 0} pedidos entregados
                    </p>
                  </div>
                  <Button variant="secondary" size="md" onClick={() => { setEditando(r); setModal(true) }}>Editar</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <RepartidorModal
          abierto
          guardando={guardando}
          repartidor={editando}
          onClose={() => { setModal(false); setEditando(null) }}
          onGuardar={guardar}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card">{toast}</div>
      )}
    </div>
  )
}

export default RepartidoresPage
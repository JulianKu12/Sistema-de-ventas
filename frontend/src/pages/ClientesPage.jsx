import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import {
  listarClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  listarReferencias,
  crearReferencia,
  actualizarReferencia,
  eliminarReferencia,
} from '../services/clientes'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

function BadgeEstado({ estado }) {
  const activo = estado === 'Activo'
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${activo ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted/15 text-muted'}`}>
      {estado}
    </span>
  )
}

function ClienteFormModal({ abierto, cliente, guardando, onClose, onGuardar }) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!abierto) return
    setNombre(cliente?.nombre ?? '')
    setTelefono(cliente?.telefono ?? '')
    setError('')
  }, [abierto, cliente])

  if (!abierto) return null

  const enviar = async () => {
    setError('')
    if (!nombre.trim()) return setError('Escribe el nombre del cliente')
    await onGuardar({ nombre: nombre.trim(), telefono: telefono.trim() || null })
  }

  return (
    <Modal open={abierto} onClose={onClose} title={cliente ? 'Editar cliente' : 'Nuevo cliente'}>
      {error && <p className="mb-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="space-y-4">
        <Input id="cl-nombre" label="Nombre" placeholder="Nombre del cliente" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <Input id="cl-telefono" label="Teléfono (opcional)" placeholder="55 1234 5678" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>
      <footer className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button size="md" onClick={enviar} disabled={guardando}>{guardando ? 'Guardando…' : cliente ? 'Guardar' : 'Crear'}</Button>
      </footer>
    </Modal>
  )
}

function Referencias({ clienteId }) {
  const [referencias, setReferencias] = useState([])
  const [nueva, setNueva] = useState('')
  const [editarTexto, setEditarTexto] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const carga = useCallback(async () => {
    setError('')
    try {
      setReferencias(await listarReferencias(clienteId))
    } catch (err) {
      setError(err.message)
    }
  }, [clienteId])

  useEffect(() => {
    carga()
  }, [carga])

  const agregar = async () => {
    setError('')
    if (!nueva.trim()) return
    setGuardando(true)
    try {
      await crearReferencia(clienteId, { descripcion: nueva.trim() })
      setNueva('')
      await carga()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const guardarTexto = async (ref) => {
    setError('')
    setGuardando(true)
    try {
      await actualizarReferencia(ref.id, { descripcion: editarTexto.trim() })
      setEditarTexto(null)
      await carga()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const desactivar = async (ref) => {
    setError('')
    try {
      await actualizarReferencia(ref.id, { estado: ref.estado === 'Activo' ? 'Inactivo' : 'Activo' })
      await carga()
    } catch (err) {
      setError(err.message)
    }
  }

  const eliminar = async (ref) => {
    setError('')
    try {
      await eliminarReferencia(ref.id)
      await carga()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mt-4 rounded-2xl bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-ink">Referencias de entrega</p>
      {error && <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {referencias.length === 0 ? (
        <p className="text-sm text-muted">Sin referencias. Agrega por ejemplo "casa azul, frente a la tienda".</p>
      ) : (
        <ul className="space-y-2">
          {referencias.map((ref) => (
            <li key={ref.id} className="rounded-xl bg-card p-3">
              {editarTexto === ref.id ? (
                <div className="flex items-center gap-2">
                  <Input id={`ref-edit-${ref.id}`} value={editarTexto} onChange={(e) => setEditarTexto(e.target.value)} className="flex-1" />
                  <Button size="md" onClick={() => guardarTexto(ref)} disabled={guardando}>OK</Button>
                  <Button size="md" variant="secondary" onClick={() => setEditarTexto(null)}>x</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{ref.descripcion}</p>
                    <BadgeEstado estado={ref.estado} />
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button type="button" onClick={() => setEditarTexto(ref.descripcion)} className="rounded-lg bg-input px-2.5 py-1 text-xs font-semibold text-ink">Editar</button>
                    <button type="button" onClick={() => desactivar(ref)} className="rounded-lg bg-input px-2.5 py-1 text-xs font-semibold text-ink">
                      {ref.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button type="button" onClick={() => eliminar(ref)} className="rounded-lg bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">Eliminar</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex items-center gap-2">
        <Input id="ref-nueva" placeholder="Nueva referencia de entrega…" value={nueva} onChange={(e) => setNueva(e.target.value)} className="flex-1" />
        <Button size="md" onClick={agregar} disabled={guardando}>Agregar</Button>
      </div>
    </div>
  )
}

function ClientesPage() {
  const { logout } = useAuth()
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [modal, setModal] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [exp, setExp] = useState(null)

  const manejarError = useCallback(
    (err) => {
      if (err.status === 401) return logout()
      setError(err.message)
    },
    [logout]
  )

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setClientes(await listarClientes())
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
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const guardarCliente = async (datos) => {
    setGuardando(true)
    setError('')
    try {
      if (modal?.id) await actualizarCliente(modal.id, datos)
      else await crearCliente(datos)
      setModal(null)
      setToast(modal?.id ? 'Cliente actualizado' : 'Cliente creado')
      cargar()
    } catch (err) {
      manejarError(err)
    } finally {
      setGuardando(false)
    }
  }

  const desactivar = async (cliente) => {
    setError('')
    try {
      await actualizarCliente(cliente.id, { estado: cliente.estado === 'Activo' ? 'Inactivo' : 'Activo' })
      setToast(`${cliente.nombre} ${cliente.estado === 'Activo' ? 'desactivado' : 'activado'}`)
      cargar()
    } catch (err) {
      manejarError(err)
    }
  }

  const eliminar = async (cliente) => {
    setError('')
    try {
      await eliminarCliente(cliente.id)
      setToast(`${cliente.nombre} eliminado`)
      cargar()
    } catch (err) {
      manejarError(err)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Clientes</h1>
          <p className="text-sm text-muted">Clientes registrados y sus referencias de entrega</p>
        </div>
        <Button size="md" onClick={() => setModal({})}>Nuevo cliente</Button>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-sm font-medium text-danger">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Cerrar aviso">✕</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {cargando ? (
          <p className="text-muted">Cargando clientes…</p>
        ) : clientes.length === 0 ? (
          <p className="mt-12 text-center text-muted">Aún no hay clientes registrados.</p>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {clientes.map((cliente) => (
              <li key={cliente.id}>
                <div className="rounded-3xl bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-ink">{cliente.nombre}</p>
                        <BadgeEstado estado={cliente.estado} />
                      </div>
                      {cliente.telefono && <p className="mt-0.5 text-sm text-muted">{cliente.telefono}</p>}
                      <p className="mt-1 text-xs text-muted">
                        {cliente._count?.pedidos ?? 0} pedidos · {cliente.referencias?.length ?? 0} referencia(s)
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => setExp(exp === cliente.id ? null : cliente.id)}>
                        {exp === cliente.id ? 'Ocultar refs' : 'Referencias'}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setModal(cliente)}>Editar</Button>
                      <Button size="sm" variant="secondary" onClick={() => desactivar(cliente)}>
                        {cliente.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button size="sm" variant="dangerSoft" onClick={() => eliminar(cliente)}>Eliminar</Button>
                    </div>
                  </div>
                  {exp === cliente.id && <Referencias clienteId={cliente.id} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ClienteFormModal
        abierto={modal !== null}
        cliente={modal?.id ? modal : null}
        guardando={guardando}
        onClose={() => setModal(null)}
        onGuardar={guardarCliente}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card">
          {toast}
        </div>
      )}
    </div>
  )
}

export default ClientesPage
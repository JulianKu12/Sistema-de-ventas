import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { consultarStock, registrarAjuste, registrarEntrada } from '../services/inventario'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import EntradaModal from '../components/inventario/EntradaModal'
import AjusteModal from '../components/inventario/AjusteModal'

const ETIQUETAS_UNIDAD = {
  kg: 'kg',
  g: 'g',
  l: 'l',
  ml: 'ml',
  pieza: 'pz',
}

function InventarioPage() {
  const { logout } = useAuth()
  const [estado, setEstado] = useState({ ingredientes: [], productos: [] })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState('')

  const [modal, setModal] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setEstado(await consultarStock())
    } catch (err) {
      if (err.status === 401) return logout()
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [logout])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (!toast) return
    const temporizador = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(temporizador)
  }, [toast])

  const filtrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase()
    const filtrar = (lista) => (!termino ? lista : lista.filter((x) => x.nombre.toLowerCase().includes(termino)))
    return {
      ingredientes: filtrar(estado.ingredientes),
      productos: filtrar(estado.productos),
    }
  }, [estado, buscar])

  const ejecutar = async (accion) => {
    setGuardando(true)
    setError('')
    try {
      const resultado = await accion()
      setToast(resultado.mensaje ?? 'Registro guardado')
      setModal(null)
      cargar()
    } catch (err) {
      if (err.status === 401) return logout()
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const totalItems = estado.ingredientes.length + estado.productos.length

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Inventario</h1>
          <p className="text-sm text-muted">{totalItems} artículos con seguimiento de stock</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={() => setModal('entrada')}>
            Entrada
          </Button>
          <Button size="md" onClick={() => setModal('ajuste')}>
            Ajuste
          </Button>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-sm font-medium text-danger">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Cerrar aviso">
            ✕
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <Input
            id="buscar-inventario"
            type="search"
            placeholder="Buscar artículo…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>

        {cargando ? (
          <p className="text-muted">Cargando stock…</p>
        ) : filtrados.ingredientes.length === 0 && filtrados.productos.length === 0 ? (
          <p className="mt-12 text-center text-muted">Sin resultados.</p>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {filtrados.ingredientes.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Ingredientes</h2>
                <ul className="space-y-2">
                  {filtrados.ingredientes.map((ing) => (
                    <FilaStock
                      key={ing.id}
                      nombre={ing.nombre}
                      stock={ing.stockActual}
                      unidad={ETIQUETAS_UNIDAD[ing.unidadMedida] ?? ing.unidadMedida}
                      inactivo={ing.estado === 'Inactivo'}
                    />
                  ))}
                </ul>
              </section>
            )}

            {filtrados.productos.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Productos de reventa</h2>
                <ul className="space-y-2">
                  {filtrados.productos.map((p) => (
                    <FilaStock
                      key={p.id}
                      nombre={p.nombre}
                      stock={p.stockActual}
                      unidad=""
                      inactivo={p.estado === 'Inactivo'}
                    />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>

      {modal === 'entrada' && (
        <EntradaModal
          abierto
          ingredientes={estado.ingredientes}
          productos={estado.productos}
          guardando={guardando}
          onClose={() => setModal(null)}
          onGuardar={(datos) => ejecutar(() => registrarEntrada(datos))}
        />
      )}

      {modal === 'ajuste' && (
        <AjusteModal
          abierto
          ingredientes={estado.ingredientes}
          productos={estado.productos}
          guardando={guardando}
          onClose={() => setModal(null)}
          onGuardar={(datos) => ejecutar(() => registrarAjuste(datos))}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card">
          {toast}
        </div>
      )}
    </div>
  )
}

function FilaStock({ nombre, stock, unidad, inactivo }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-card">
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">
          {nombre}
          {inactivo && <span className="ml-2 rounded-full bg-muted/20 px-2 py-0.5 text-xs font-semibold text-muted">Inactivo</span>}
        </p>
        {unidad && <p className="text-sm text-muted">{unidad}</p>}
      </div>
      <p className={`shrink-0 text-xl font-bold ${stock < 0 ? 'text-danger' : 'text-ink'}`}>
        {stock}
        {unidad ? ` ${unidad}` : ''}
      </p>
    </li>
  )
}

export default InventarioPage
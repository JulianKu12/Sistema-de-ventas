import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import ModificadorModal from './ModificadorModal'
import { formatearPrecio } from '../../utils/formato'

// Modal para configurar un combo ANTES de agregarlo al carrito: cada producto
// del combo conserva sus propios modificadores (docs/03), pero el precio del
// combo es cerrado (los modificadores no alteran el total).
function ComboModal({ open, combo, onClose, onConfirm }) {
  const [modsPorProducto, setModsPorProducto] = useState(() => new Map())
  const [configurando, setConfigurando] = useState(null)

  const productos = combo.productos ?? []

  const abrirOpciones = (producto) => setConfigurando(producto)

  const confirmarModificadores = (modificadores) => {
    setModsPorProducto((previo) => {
      const nuevo = new Map(previo)
      nuevo.set(configurando.id, modificadores)
      return nuevo
    })
    setConfigurando(null)
  }

  const confirmar = () => {
    onConfirm({
      key: `c${combo.id}-${[...modsPorProducto.values()]
        .flatMap((m) => m.map((x) => x.modificadorId))
        .join('-')}`,
      tipo: 'combo',
      id: combo.id,
      nombre: combo.nombre,
      precioUnitario: combo.precioEspecial,
      cantidad: 1,
      esCombo: true,
      productos: productos.map((cp) => ({
        productoId: cp.producto.id,
        nombre: cp.producto.nombre,
        modificadores: modsPorProducto.get(cp.producto.id) ?? [],
      })),
    })
    onClose()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={combo.nombre}
        footer={
          <>
            <Button variant="secondary" size="md" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="md" onClick={confirmar}>
              Agregar combo · {formatearPrecio(combo.precioEspecial)}
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-muted">
          El precio del combo es fijo; las opciones no cambian el total.
        </p>
        <ul className="space-y-2">
          {productos.map((cp) => {
            const p = cp.producto
            const elegidos = modsPorProducto.get(p.id) ?? []
            return (
              <li key={p.id} className="rounded-2xl bg-input px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">
                      {cp.cantidad}× {p.nombre}
                    </p>
                    {elegidos.length > 0 && (
                      <p className="mt-0.5 text-xs text-muted">{elegidos.map((m) => m.nombre).join(' · ')}</p>
                    )}
                  </div>
                  {p.productoModificadores?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => abrirOpciones(p)}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        elegidos.length > 0 ? 'bg-accent text-white' : 'bg-surface text-muted'
                      }`}
                    >
                      {elegidos.length > 0 ? 'Cambiar opciones' : 'Opciones'}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </Modal>

      {configurando && (
        <ModificadorModal
          open
          producto={configurando}
          ocultarPrecio
          onClose={() => setConfigurando(null)}
          onConfirm={confirmarModificadores}
        />
      )}
    </>
  )
}

export default ComboModal
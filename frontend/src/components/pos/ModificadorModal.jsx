import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { formatearPrecio } from '../../utils/formato'

const etiquetasTipo = {
  Agregar: 'Agregar',
  Quitar: 'Quitar',
  Sustituir: 'Sustituir',
}

function ModificadorModal({ open, producto, onClose, onConfirm, ocultarPrecio = false }) {
  const [seleccionados, setSeleccionados] = useState(() => new Set())

  const modificadores = producto.productoModificadores ?? []

  const alternar = (id) => {
    setSeleccionados((previo) => {
      const nuevo = new Set(previo)
      if (nuevo.has(id)) nuevo.delete(id)
      else nuevo.add(id)
      return nuevo
    })
  }

  const costoExtra = modificadores.reduce(
    (acc, pm) =>
      acc + (seleccionados.has(pm.modificador.id) ? pm.modificador.costoAdicional ?? 0 : 0),
    0,
  )

  const confirmar = () => {
    onConfirm(
      modificadores
        .filter((pm) => seleccionados.has(pm.modificador.id))
        .map((pm) => ({
          modificadorId: pm.modificador.id,
          nombre: pm.modificador.nombre,
          costoAplicado: pm.modificador.costoAdicional ?? 0,
        })),
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={producto.nombre}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="md" onClick={confirmar} disabled={modificadores.length === 0}>
            {ocultarPrecio ? 'Aplicar' : `Agregar · ${formatearPrecio(producto.precio + costoExtra)}`}
          </Button>
        </>
      }
    >
      {modificadores.length === 0 ? (
        <p className="text-muted">Este producto no tiene modificadores disponibles.</p>
      ) : (
        <div className="space-y-2">
          {modificadores.map((pm) => {
            const m = pm.modificador
            const activo = seleccionados.has(m.id)
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => alternar(m.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  activo ? 'bg-accent/10 ring-2 ring-accent/40' : 'bg-input'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      m.tipo === 'Agregar'
                        ? 'bg-accent text-white'
                        : m.tipo === 'Quitar'
                          ? 'bg-danger/10 text-danger'
                          : 'bg-muted/20 text-muted'
                    }`}
                  >
                    {etiquetasTipo[m.tipo] ?? m.tipo}
                  </span>
                  <span className="font-medium text-ink">{m.nombre}</span>
                </span>
                {(m.costoAdicional ?? 0) > 0 && (
                  <span className="text-sm font-semibold text-accent">
                    +{formatearPrecio(m.costoAdicional)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

export default ModificadorModal

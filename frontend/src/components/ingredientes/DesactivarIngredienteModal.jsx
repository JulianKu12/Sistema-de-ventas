import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

const OPCIONES = [
  {
    valor: 'vender_sin_el',
    titulo: 'Vender sin este ingrediente',
    descripcion: 'Se quita de la receta de esos productos, pero siguen vendiéndose.',
  },
  {
    valor: 'suspender_productos',
    titulo: 'Suspender esos productos',
    descripcion: 'Quedan marcados como no disponibles hoy.',
  },
  {
    valor: 'cancelar',
    titulo: 'Cancelar',
    descripcion: 'No desactivar el ingrediente.',
  },
]

function DesactivarIngredienteModal({ ingrediente, productos, cargando, onClose, onConfirmar }) {
  const [seleccion, setSeleccion] = useState('vender_sin_el')

  const confirmar = () => onConfirmar(seleccion)

  return (
    <Modal
      open
      onClose={onClose}
      title="Desactivar ingrediente"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={cargando}>
            Cancelar
          </Button>
          <Button size="md" onClick={confirmar} disabled={cargando}>
            {cargando ? 'Procesando…' : 'Continuar'}
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-muted">
        <span className="font-semibold text-ink">{ingrediente.nombre}</span> se usa en{' '}
        {productos.length} producto{productos.length === 1 ? '' : 's'} activo
        {productos.length === 1 ? '' : 's'}:
      </p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {productos.map((p) => (
          <span key={p.id} className="rounded-full bg-input px-3 py-1 text-xs font-medium text-ink">
            {p.nombre}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {OPCIONES.map((op) => (
          <button
            key={op.valor}
            type="button"
            onClick={() => setSeleccion(op.valor)}
            className={`w-full rounded-2xl px-4 py-3 text-left transition ${
              seleccion === op.valor ? 'bg-accent/10 ring-2 ring-accent/40' : 'bg-input'
            }`}
          >
            <span className="block font-medium text-ink">{op.titulo}</span>
            <span className="block text-sm text-muted">{op.descripcion}</span>
          </button>
        ))}
      </div>
    </Modal>
  )
}

export default DesactivarIngredienteModal

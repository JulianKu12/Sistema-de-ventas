import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { formatearPrecio } from '../../utils/formato'

function SelectorSabor({ id, etiqueta, valor, opciones, onCambio }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-muted">
        {etiqueta}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className={`w-full rounded-2xl bg-input px-4 py-3.5 text-base text-ink outline-none transition focus:ring-2 focus:ring-accent/40 ${
          valor === '' ? 'text-muted' : ''
        }`}
      >
        <option value="">Selecciona…</option>
        {opciones.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}

function MitadYMitadModal({ open, producto, sabores, onClose, onConfirm }) {
  const [sabor1, setSabor1] = useState('')
  const [sabor2, setSabor2] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setSabor1('')
    setSabor2('')
    setError('')
  }, [open])

  const confirmar = () => {
    setError('')
    if (!sabor1 || !sabor2) return setError('Selecciona los dos sabores')
    if (sabor1 === sabor2) return setError('Elige dos sabores distintos')
    const s1 = sabores.find((s) => s.id === Number(sabor1))
    const s2 = sabores.find((s) => s.id === Number(sabor2))
    onConfirm({ sabor1ProductoId: s1.id, sabor2ProductoId: s2.id, subnombre: `${s1.nombre} + ${s2.nombre}` })
  }

  return (
    <Modal
      open={Boolean(producto)}
      onClose={onClose}
      title={`Mitad y mitad: ${producto?.nombre ?? ''}`}
    >
      <p className="mb-4 text-sm text-muted">
        La mitad del tamaño se llena con cada sabor. No consume el inventario propio del producto base.
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-2xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <SelectorSabor id="mitad-sabor1" etiqueta="Primer sabor" valor={sabor1} opciones={sabores} onCambio={setSabor1} />
        <SelectorSabor id="mitad-sabor2" etiqueta="Segundo sabor" valor={sabor2} opciones={sabores} onCambio={setSabor2} />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" size="md" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          size="md"
          className={sabores.length === 0 ? 'disabled:pointer-events-none disabled:opacity-50' : ''}
          disabled={!producto || sabores.length === 0}
          onClick={confirmar}
        >
          Agregar · {producto ? formatearPrecio(producto.precio) : ''}
        </Button>
      </div>
    </Modal>
  )
}

export default MitadYMitadModal
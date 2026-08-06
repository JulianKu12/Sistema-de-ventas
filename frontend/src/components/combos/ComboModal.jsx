import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import { formatearPrecio } from '../../utils/formato'

let contadorUid = 0

function FilaProductoCombo({ fila, productos, onChange, onQuitar }) {
  const productoSeleccionado = productos.find((p) => p.id === Number(fila.productoId))
  return (
    <div className="rounded-2xl bg-input p-3">
      <div className="flex items-center gap-2">
        <select
          value={fila.productoId}
          onChange={(e) => onChange(fila.uid, { ...fila, productoId: e.target.value })}
          className={`w-full rounded-xl bg-card px-3 py-2.5 text-sm text-ink outline-none transition focus:ring-2 focus:ring-accent/40 ${
            fila.productoId === '' ? 'text-muted' : ''
          }`}
        >
          <option value="">Selecciona producto…</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onQuitar(fila.uid)}
          aria-label="Quitar producto del combo"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger transition active:scale-90"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
            <path d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Input
          id={`combo-cant-${fila.uid}`}
          label="Cantidad"
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          className="!px-3 !py-2 text-sm"
          value={fila.cantidad}
          onChange={(e) => onChange(fila.uid, { ...fila, cantidad: e.target.value })}
        />
        {productoSeleccionado && (
          <p className="ml-auto shrink-0 text-sm text-muted">{formatearPrecio(productoSeleccionado.precio)} c/u</p>
        )}
      </div>
    </div>
  )
}

function ComboModal({ abierto, combo, productos, guardando, onClose, onGuardar }) {
  const esEdicion = combo !== null
  const [nombre, setNombre] = useState(combo?.nombre ?? '')
  const [precioEspecial, setPrecioEspecial] = useState(combo?.precioEspecial?.toString() ?? '')
  const [items, setItems] = useState(() =>
    (combo?.productos ?? []).map((cp) => ({
      uid: ++contadorUid,
      productoId: cp.productoId.toString(),
      cantidad: cp.cantidad.toString(),
    })),
  )
  const [error, setError] = useState('')

  const actualizarFila = (uid, cambios) => setItems((previo) => previo.map((f) => (f.uid === uid ? cambios : f)))
  const quitarFila = (uid) => setItems((previo) => previo.filter((f) => f.uid !== uid))
  const agregarFila = () => setItems((previo) => [...previo, { uid: ++contadorUid, productoId: '', cantidad: '1' }])

  const sumaRegular = items.reduce((acc, fila) => {
    const p = productos.find((prod) => prod.id === Number(fila.productoId))
    if (!p) return acc
    const cantidad = Number(fila.cantidad)
    if (!Number.isFinite(cantidad)) return acc
    return acc + p.precio * cantidad
  }, 0)

  const enviar = (e) => {
    e.preventDefault()
    setError('')

    const datos = { nombre: nombre.trim(), precioEspecial: Number(precioEspecial) }
    if (!datos.nombre) return setError('El nombre es obligatorio')
    if (!Number.isFinite(datos.precioEspecial) || datos.precioEspecial < 0) {
      return setError('El precio especial no es válido')
    }

    const productosValidos = items
      .filter((f) => f.productoId !== '')
      .map((f) => ({ productoId: Number(f.productoId), cantidad: Number(f.cantidad) }))
    if (productosValidos.length === 0) return setError('Un combo requiere al menos un producto')
    if (productosValidos.some((f) => !Number.isInteger(f.cantidad) || f.cantidad < 1)) {
      return setError('Las cantidades deben ser enteras mayores o iguales a 1')
    }
    const ids = productosValidos.map((f) => f.productoId)
    if (new Set(ids).size !== ids.length) return setError('Un producto no puede repetirse en el combo')

    datos.productos = productosValidos
    onGuardar(datos)
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title={esEdicion ? `Editar: ${combo.nombre}` : 'Nuevo combo'}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" size="md" onClick={enviar} disabled={guardando}>
            {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear combo'}
          </Button>
        </>
      }
    >
      <form onSubmit={enviar} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Input
          id="combo-nombre"
          label="Nombre"
          type="text"
          placeholder="Ej. Combo desayuno"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
        />

        <Input
          id="combo-precio"
          label="Precio especial ($)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          hint={sumaRegular > 0 ? `La suma de sus productos es ${formatearPrecio(sumaRegular)}.` : undefined}
          value={precioEspecial}
          onChange={(e) => setPrecioEspecial(e.target.value)}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Productos del combo</p>
          <div className="space-y-2">
            {items.map((fila) => (
              <FilaProductoCombo
                key={fila.uid}
                fila={fila}
                productos={productos}
                onChange={actualizarFila}
                onQuitar={quitarFila}
              />
            ))}
          </div>
          <Button variant="secondary" size="md" className="mt-2" onClick={agregarFila} type="button">
            + Agregar producto
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ComboModal

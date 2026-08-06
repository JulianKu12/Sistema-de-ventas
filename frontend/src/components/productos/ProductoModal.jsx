import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import Switch from '../ui/Switch'

let contadorUid = 0

function SelectorTipo({ valor, onChange, deshabilitado }) {
  const opciones = [
    { valor: 'Con_receta', etiqueta: 'Con receta' },
    { valor: 'Reventa_directa', etiqueta: 'Reventa directa' },
  ]
  return (
    <div className="flex rounded-2xl bg-input p-1">
      {opciones.map((op) => (
        <button
          key={op.valor}
          type="button"
          disabled={deshabilitado}
          onClick={() => onChange(op.valor)}
          className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            valor === op.valor ? 'bg-card text-ink shadow-card' : 'text-muted'
          }`}
        >
          {op.etiqueta}
        </button>
      ))}
    </div>
  )
}

function FilaReceta({ fila, ingredientes, onChange, onQuitar }) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={fila.ingredienteId}
        onChange={(e) => onChange(fila.uid, { ...fila, ingredienteId: e.target.value })}
        className={`w-full rounded-2xl bg-input px-4 py-3 text-base text-ink outline-none transition focus:ring-2 focus:ring-accent/40 ${
          fila.ingredienteId === '' ? 'text-muted' : ''
        }`}
      >
        <option value="">Selecciona ingrediente…</option>
        {ingredientes.map((ing) => (
          <option key={ing.id} value={ing.id}>
            {ing.nombre}
          </option>
        ))}
      </select>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="Cant."
        className="w-24 shrink-0 !px-3"
        value={fila.cantidad}
        onChange={(e) => onChange(fila.uid, { ...fila, cantidad: e.target.value })}
        aria-label="Cantidad del ingrediente"
      />
      <button
        type="button"
        onClick={() => onQuitar(fila.uid)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/10 text-muted transition active:scale-90"
        aria-label="Quitar ingrediente de la receta"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
          <path d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function ProductoModal({ abierto, producto, ingredientes, guardando, onClose, onGuardar }) {
  const esEdicion = producto !== null
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [precio, setPrecio] = useState(producto?.precio?.toString() ?? '')
  const [tipo, setTipo] = useState(producto?.tipo ?? 'Con_receta')
  const [permiteMitad, setPermiteMitad] = useState(producto?.permiteMitadYMitad ?? false)
  const [disponibleHoy, setDisponibleHoy] = useState(producto?.disponibleHoy ?? true)
  const [receta, setReceta] = useState(() =>
    (producto?.productoIngredientes ?? []).map((pi) => ({
      uid: ++contadorUid,
      ingredienteId: pi.ingredienteId.toString(),
      cantidad: pi.cantidad.toString(),
    })),
  )
  const [error, setError] = useState('')

  const actualizarFila = (uid, cambios) =>
    setReceta((previo) => previo.map((f) => (f.uid === uid ? cambios : f)))
  const quitarFila = (uid) => setReceta((previo) => previo.filter((f) => f.uid !== uid))
  const agregarFila = () => setReceta((previo) => [...previo, { uid: ++contadorUid, ingredienteId: '', cantidad: '' }])

  const enviar = (e) => {
    e.preventDefault()
    setError('')

    const datos = { nombre: nombre.trim(), precio: Number(precio) }
    if (!datos.nombre) return setError('El nombre es obligatorio')
    if (!Number.isFinite(datos.precio) || datos.precio < 0) return setError('El precio no es válido')

    if (tipo === 'Con_receta') {
      const filasValidas = receta
        .filter((f) => f.ingredienteId !== '' && f.cantidad !== '')
        .map((f) => ({ ingredienteId: Number(f.ingredienteId), cantidad: Number(f.cantidad) }))
      if (filasValidas.length === 0) return setError('Un producto con receta requiere al menos un ingrediente')
      if (filasValidas.some((f) => !Number.isFinite(f.cantidad) || f.cantidad <= 0)) {
        return setError('Las cantidades de la receta deben ser mayores a 0')
      }
      datos.ingredientes = filasValidas
    }

    if (esEdicion) {
      if (tipo === 'Con_receta') {
        datos.permiteMitadYMitad = permiteMitad
      }
    } else {
      datos.tipo = tipo
      datos.disponibleHoy = disponibleHoy
      datos.permiteMitadYMitad = tipo === 'Con_receta' && permiteMitad
    }

    onGuardar(datos)
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title={esEdicion ? `Editar: ${producto.nombre}` : 'Nuevo producto'}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" size="md" onClick={enviar} disabled={guardando}>
            {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
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
          id="prod-nombre"
          label="Nombre"
          type="text"
          placeholder="Ej. Torta de jamón"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
        />

        <Input
          id="prod-precio"
          label="Precio"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Tipo de producto</p>
          <SelectorTipo valor={tipo} onChange={setTipo} deshabilitado={esEdicion} />
          {esEdicion && (
            <p className="mt-1 text-xs text-muted">
              El tipo no se puede cambiar al editar.
            </p>
          )}
        </div>

        {!esEdicion && (
          <Switch
            checked={disponibleHoy}
            onChange={setDisponibleHoy}
            label="Disponible hoy"
            description="Si lo apagas, no aparecerá en el punto de venta."
          />
        )}

        {tipo === 'Con_receta' ? (
          <>
            <div>
              <p className="mb-2 text-sm font-medium text-muted">Receta</p>
              <div className="space-y-2">
                {receta.map((fila) => (
                  <FilaReceta
                    key={fila.uid}
                    fila={fila}
                    ingredientes={ingredientes}
                    onChange={actualizarFila}
                    onQuitar={quitarFila}
                  />
                ))}
              </div>
              <Button variant="secondary" size="md" className="mt-2" onClick={agregarFila} type="button">
                + Agregar ingrediente
              </Button>
            </div>

            <Switch
              checked={permiteMitad}
              onChange={setPermiteMitad}
              label="Permite mitad y mitad"
              description="El cliente podrá pedirlo con dos sabores."
            />
          </>
        ) : (
          <p className="rounded-2xl bg-input px-4 py-3 text-sm text-muted">
            Los productos de reventa directa no llevan receta: consumen su propio stock.
          </p>
        )}
      </form>
    </Modal>
  )
}

export default ProductoModal

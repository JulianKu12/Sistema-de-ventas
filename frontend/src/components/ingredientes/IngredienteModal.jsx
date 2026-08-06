import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

const UNIDADES = [
  { valor: 'kg', etiqueta: 'kg' },
  { valor: 'g', etiqueta: 'g' },
  { valor: 'l', etiqueta: 'l' },
  { valor: 'ml', etiqueta: 'ml' },
  { valor: 'pieza', etiqueta: 'pz' },
]

function SelectorUnidad({ valor, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {UNIDADES.map((u) => (
        <button
          key={u.valor}
          type="button"
          onClick={() => onChange(u.valor)}
          className={`min-w-16 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
            valor === u.valor ? 'bg-accent text-white' : 'bg-input text-ink active:bg-muted/20'
          }`}
        >
          {u.etiqueta}
        </button>
      ))}
    </div>
  )
}

function IngredienteModal({ abierto, ingrediente, guardando, onClose, onGuardar }) {
  const esEdicion = ingrediente !== null
  const [nombre, setNombre] = useState(ingrediente?.nombre ?? '')
  const [unidad, setUnidad] = useState(ingrediente?.unidadMedida ?? 'kg')
  const [stock, setStock] = useState('')
  const [minimo, setMinimo] = useState(ingrediente?.stockMinimoAlerta?.toString() ?? '')
  const [costo, setCosto] = useState(ingrediente?.costoUltimaCompra?.toString() ?? '')
  const [error, setError] = useState('')

  const enviar = (e) => {
    e.preventDefault()
    setError('')
    const datos = { nombre: nombre.trim(), unidadMedida: unidad }

    if (!datos.nombre) return setError('El nombre es obligatorio')
    if (esEdicion) {
      if (minimo === '' || Number.isNaN(Number(minimo))) return setError('Indica el stock mínimo de alerta')
      datos.stockMinimoAlerta = Number(minimo)
      if (costo !== '') {
        const c = Number(costo)
        if (Number.isNaN(c) || c < 0) return setError('El costo de la última compra no es válido')
        datos.costoUltimaCompra = c
      }
    } else {
      if (stock === '' || Number.isNaN(Number(stock))) return setError('El stock inicial es obligatorio')
      if (minimo === '' || Number.isNaN(Number(minimo))) return setError('Indica el stock mínimo de alerta')
      datos.stockActual = Number(stock)
      datos.stockMinimoAlerta = Number(minimo)
      if (costo !== '') {
        const c = Number(costo)
        if (Number.isNaN(c) || c < 0) return setError('El costo de la última compra no es válido')
        datos.costoUltimaCompra = c
      }
    }

    onGuardar(datos)
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title={esEdicion ? `Editar: ${ingrediente.nombre}` : 'Nuevo ingrediente'}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" size="md" onClick={enviar} disabled={guardando}>
            {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear ingrediente'}
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
          id="ing-nombre"
          label="Nombre"
          type="text"
          placeholder="Ej. Tortilla"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
        />

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Unidad de medida</p>
          <SelectorUnidad valor={unidad} onChange={setUnidad} />
        </div>

        {esEdicion ? (
          <div className="rounded-2xl bg-input px-4 py-3 text-sm text-muted">
            Stock actual: <span className="font-semibold text-ink">{ingrediente.stockActual} {unidad}</span>
            <br />
            El stock solo cambia mediante entradas y ajustes de inventario.
          </div>
        ) : (
          <Input
            id="ing-stock"
            label="Stock inicial"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        )}

        <Input
          id="ing-minimo"
          label="Stock mínimo de alerta"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0"
          value={minimo}
          onChange={(e) => setMinimo(e.target.value)}
        />

        <Input
          id="ing-costo"
          label="Costo de última compra (opcional, genera gasto)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
        />
      </form>
    </Modal>
  )
}

export default IngredienteModal

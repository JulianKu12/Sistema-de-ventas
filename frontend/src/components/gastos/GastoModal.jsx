import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

const CATEGORIAS = ['Insumos', 'Servicios', 'Sueldos', 'Otro']
const METODOS = ['Efectivo', 'Tarjeta', 'Transferencia']

function GastoModal({ abierto, guardando, onClose, onGuardar }) {
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('Insumos')
  const [metodoPago, setMetodoPago] = useState('Efectivo')
  const [error, setError] = useState('')

  const enviar = (e) => {
    e.preventDefault()
    setError('')
    const datos = { concepto: concepto.trim() }
    if (!datos.concepto) return setError('El concepto es obligatorio')
    const montoNum = Number(monto)
    if (!Number.isFinite(montoNum) || montoNum < 0) return setError('El monto no es válido')
    datos.monto = montoNum
    datos.categoria = categoria
    datos.metodoPago = metodoPago
    onGuardar(datos)
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title="Registrar gasto"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" size="md" onClick={enviar} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Registrar gasto'}
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
          id="gasto-concepto"
          label="Concepto"
          type="text"
          placeholder="Ej. Recarga de gas, luz, sueldo…"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          autoFocus
        />

        <Input
          id="gasto-monto"
          label="Monto ($)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Categoría</p>
          <div className="flex rounded-2xl bg-input p-1">
            {CATEGORIAS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${
                  categoria === c ? 'bg-card text-ink shadow-card' : 'text-muted'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Método de pago</p>
          <div className="flex rounded-2xl bg-input p-1">
            {METODOS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodoPago(m)}
                className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${
                  metodoPago === m ? 'bg-card text-ink shadow-card' : 'text-muted'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default GastoModal
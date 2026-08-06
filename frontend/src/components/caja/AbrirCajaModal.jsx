import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

function AbrirCajaModal({ abierto, guardando, onClose, onAbrir }) {
  const [fondoInicial, setFondoInicial] = useState('')
  const [error, setError] = useState('')

  const enviar = (e) => {
    e.preventDefault()
    setError('')
    const numero = Number(fondoInicial)
    if (!Number.isFinite(numero) || numero < 0) return setError('El fondo inicial no es válido')
    onAbrir({ fondoInicial: numero })
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title="Abrir caja"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" size="md" onClick={enviar} disabled={guardando}>
            {guardando ? 'Abriendo…' : 'Abrir caja'}
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
          id="fondo-inicial"
          label="Fondo inicial ($)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={fondoInicial}
          onChange={(e) => setFondoInicial(e.target.value)}
          hint="Se toma como base para calcular el efectivo esperado al cierre."
          autoFocus
        />

        <p className="rounded-2xl bg-muted/10 px-4 py-3 text-sm text-muted">
          Al abrir, los gastos y devoluciones registrados sin caja se asociarán a este día operativo.
        </p>
      </form>
    </Modal>
  )
}

export default AbrirCajaModal
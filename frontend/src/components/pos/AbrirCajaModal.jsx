import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

function AbrirCajaModal({ open, cargando, onClose, onConfirm }) {
  const [fondoInicial, setFondoInicial] = useState('')

  const enviar = (e) => {
    e.preventDefault()
    const valor = Number(fondoInicial)
    if (Number.isNaN(valor) || valor < 0) return
    onConfirm(valor)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Abrir caja"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={cargando}>
            Cancelar
          </Button>
          <Button type="submit" size="md" onClick={enviar} disabled={cargando}>
            {cargando ? 'Abriendo…' : 'Abrir caja'}
          </Button>
        </>
      }
    >
      <form onSubmit={enviar} className="space-y-4">
        <p className="text-sm text-muted">
          Registra el fondo inicial con el que abre la caja (puede ser 0).
        </p>
        <Input
          id="fondo-inicial"
          label="Fondo inicial"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={fondoInicial}
          onChange={(e) => setFondoInicial(e.target.value)}
          autoFocus
        />
      </form>
    </Modal>
  )
}

export default AbrirCajaModal

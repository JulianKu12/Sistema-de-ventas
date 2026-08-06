import { useState } from 'react'
import { formatearPrecio } from '../../utils/formato'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

function CerrarCajaModal({ abierto, guardando, efectivoEsperado, onClose, onCerrar }) {
  const [efectivoContado, setEfectivoContado] = useState('')
  const [error, setError] = useState('')

  const contado = Number(efectivoContado)
  const diferencia = Number.isFinite(contado) ? contado - efectivoEsperado : null

  const enviar = (e) => {
    e.preventDefault()
    setError('')
    if (!Number.isFinite(contado) || contado < 0) return setError('El efectivo contado no es válido')
    onCerrar({ efectivoContado: contado })
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title="Cerrar caja"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button variant="danger" type="submit" size="md" onClick={enviar} disabled={guardando}>
            {guardando ? 'Cerrando…' : 'Confirmar cierre'}
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

        <div className="rounded-2xl bg-accent/10 p-4 text-center">
          <p className="text-sm font-semibold text-accent">Efectivo esperado en caja</p>
          <p className="mt-1 text-2xl font-extrabold text-accent">{formatearPrecio(efectivoEsperado)}</p>
        </div>

        <Input
          id="efectivo-contado"
          label="Efectivo contado ($)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={efectivoContado}
          onChange={(e) => setEfectivoContado(e.target.value)}
          autoFocus
        />

        {diferencia !== null && (
          <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${diferencia >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-danger/10 text-danger'}`}>
            Diferencia: {diferencia >= 0 ? '+' : ''}
            {formatearPrecio(diferencia)}
          </p>
        )}
      </form>
    </Modal>
  )
}

export default CerrarCajaModal
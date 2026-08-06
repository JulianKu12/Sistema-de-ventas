import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import SelectorCuenta from './SelectorCuenta'

const MOTIVOS = [
  { valor: 'Conteo_fisico', etiqueta: 'Conteo físico' },
  { valor: 'Merma', etiqueta: 'Merma' },
  { valor: 'Otro', etiqueta: 'Otro' },
]

function AjusteModal({ abierto, ingredientes, productos, guardando, onClose, onGuardar }) {
  const [tipo, setTipo] = useState('ingrediente')
  const [cuentaId, setCuentaId] = useState('')
  const [stockReal, setStockReal] = useState('')
  const [motivo, setMotivo] = useState('Conteo_fisico')
  const [error, setError] = useState('')

  const seleccionado = (tipo === 'ingrediente' ? ingredientes : productos).find((x) => x.id === Number(cuentaId)) ?? null

  const diferencia =
    seleccionado && stockReal !== '' && Number.isFinite(Number(stockReal))
      ? Number(stockReal) - seleccionado.stockActual
      : null

  const enviar = (e) => {
    e.preventDefault()
    setError('')
    if (!cuentaId) return setError('Selecciona un artículo')
    const contado = Number(stockReal)
    if (!Number.isFinite(contado)) return setError('El stock contado no es válido')

    onGuardar({
      [tipo === 'ingrediente' ? 'ingredienteId' : 'productoId']: Number(cuentaId),
      stockRealContado: contado,
      motivo,
    })
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title="Ajuste de inventario"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" size="md" onClick={enviar} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Registrar ajuste'}
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

        <SelectorCuenta
          tipo={tipo}
          onTipo={setTipo}
          cuentaId={cuentaId}
          onCuenta={setCuentaId}
          ingredientes={ingredientes}
          productos={productos}
        />

        {seleccionado && (
          <Input
            id="inv-ajuste-stock"
            label="Stock real contado"
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder={seleccionado.stockActual.toString()}
            value={stockReal}
            onChange={(e) => setStockReal(e.target.value)}
            hint={
              diferencia !== null
                ? diferencia === 0
                  ? 'No hay diferencia con el stock actual.'
                  : `Diferencia: ${diferencia > 0 ? '+' : ''}${diferencia} (${diferencia > 0 ? 'sobra' : 'falta'})`
                : undefined
            }
          />
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Motivo</p>
          <div>
            {MOTIVOS.map((m) => (
              <button
                key={m.valor}
                type="button"
                onClick={() => setMotivo(m.valor)}
                className={`mb-2 mr-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  motivo === m.valor ? 'bg-accent text-white' : 'bg-input text-ink'
                }`}
              >
                {m.etiqueta}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default AjusteModal
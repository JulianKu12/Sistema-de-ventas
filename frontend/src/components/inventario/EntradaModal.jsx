import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import SelectorCuenta from './SelectorCuenta'

function EntradaModal({ abierto, ingredientes, productos, guardando, onClose, onGuardar }) {
  const [tipo, setTipo] = useState('ingrediente')
  const [cuentaId, setCuentaId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [costo, setCosto] = useState('')
  const [error, setError] = useState('')

  const seleccionado =
    (tipo === 'ingrediente' ? ingredientes : productos).find((x) => x.id === Number(cuentaId)) ?? null

  const enviar = (e) => {
    e.preventDefault()
    setError('')
    if (!cuentaId) return setError('Selecciona un artículo')
    const cant = Number(cantidad)
    if (!Number.isFinite(cant) || cant <= 0) return setError('La cantidad debe ser mayor a 0')

    const datos = { [tipo === 'ingrediente' ? 'ingredienteId' : 'productoId']: Number(cuentaId), cantidad: cant }
    if (costo.trim() !== '') {
      const c = Number(costo)
      if (!Number.isFinite(c) || c < 0) return setError('El costo debe ser mayor o igual a 0')
      datos.costo = c
    }
    onGuardar(datos)
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title="Registrar entrada de inventario"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" size="md" onClick={enviar} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Registrar entrada'}
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
            id="inv-entrada-cant"
            label={`Cantidad entrante${tipo === 'ingrediente' ? ` (${seleccionado.unidadMedida ?? ''})` : ''}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        )}

        <Input
          id="inv-entrada-costo"
          label="Costo opcional ($)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          hint="Si capturas costo, se registra un gasto automático de la categoría Insumos."
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
        />
      </form>
    </Modal>
  )
}

export default EntradaModal
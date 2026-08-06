import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { formatearPrecio } from '../../utils/formato'

function StockAlertaModal({
  open,
  faltantes,
  nombreDe,
  cargando,
  onConfirmar,
  onCancelar,
  opcionesPrecio = [],
  onVenderSeparado,
}) {
  const [mostrarOtro, setMostrarOtro] = useState(false)
  const [otroPrecio, setOtroPrecio] = useState('')

  const totalAway =
    opcionesPrecio.length > 0
      ? opcionesPrecio.reduce((acc, o) => acc + o.productos.reduce((a, p) => a + p.precioUnitario * p.cantidad, 0), 0)
      : 0

  const aplicarOtro = () => {
    const n = Number(otroPrecio)
    if (n > 0) onVenderSeparado(n)
  }

  return (
    <Modal
      open={open}
      onClose={onCancelar}
      title="Stock insuficiente"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </Button>
          <Button size="md" onClick={onConfirmar} disabled={cargando}>
            {cargando ? 'Procesando…' : 'Usar lo disponible y continuar'}
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-muted">
        Algunos ingredientes no alcanzan para la venta completa. Puedes continuar usando solo lo
        disponible (el stock quedará en cero).
      </p>
      <ul className="space-y-2">
        {faltantes.map((f) => (
          <li key={`${f.tipo}:${f.id}`} className="flex items-center justify-between rounded-2xl bg-danger/5 px-4 py-3">
            <span className="font-medium text-ink">{nombreDe(f) ?? `ID ${f.id}`}</span>
            <span className="text-sm text-danger">
              disponible {f.disponible} / requerido {f.requerido}
            </span>
          </li>
        ))}
      </ul>

      {opcionesPrecio.length > 0 && (
        <div className="mt-4 space-y-3 rounded-2xl bg-accent/10 p-4">
          <p className="text-sm font-semibold text-ink">Tu combo tiene stock parcial.</p>
          <p className="text-sm text-muted">
            Véndelo por separado con el precio de los productos disponibles (sin descuento de combo) o
            captura otro precio.
          </p>
          <Button size="md" className="w-full" onClick={() => onVenderSeparado('real')} disabled={cargando}>
            Vender por separado · {formatearPrecio(totalAway)}
          </Button>
          {!mostrarOtro ? (
            <button type="button" onClick={() => setMostrarOtro(true)} className="w-full text-xs font-semibold text-accent">
              Otro precio…
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={otroPrecio}
                onChange={(e) => setOtroPrecio(e.target.value)}
                placeholder="Monto"
                className="w-full rounded-xl bg-surface px-3 py-2 text-sm text-ink outline-none"
              />
              <Button size="md" onClick={aplicarOtro} disabled={cargando || Number(otroPrecio) <= 0}>
                Aplicar
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

export default StockAlertaModal
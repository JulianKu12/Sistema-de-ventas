import Button from '../ui/Button'
import Switch from '../ui/Switch'
import { formatearPrecio } from '../../utils/formato'

const METODOS = ['Efectivo', 'Tarjeta', 'Transferencia']

function ControlesCantidad({ cantidad, onIncrement, onDecrement }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onDecrement}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-input text-lg font-bold text-ink transition active:scale-90"
        aria-label="Quitar uno"
      >
        −
      </button>
      <span className="w-8 text-center text-lg font-semibold text-ink">{cantidad}</span>
      <button
        type="button"
        onClick={onIncrement}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-lg font-bold text-white transition active:scale-90"
        aria-label="Agregar uno"
      >
        +
      </button>
    </div>
  )
}

function ItemCarrito({ item, onIncrement, onDecrement, onRemove }) {
  const costoMods = (item.modificadores ?? []).reduce((acc, m) => acc + m.costoAplicado, 0)
  const precioUnidad = item.precioUnitario + costoMods
  return (
    <li className="flex flex-col gap-2 rounded-2xl bg-surface px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-ink">
            {item.nombre}
            {item.esCombo && (
              <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                Combo
              </span>
            )}
            {item.esMitadYMitad && (
              <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                ½
              </span>
            )}
          </p>
          {item.subnombre && (
            <p className="mt-0.5 text-xs font-medium text-ink">{item.subnombre}</p>
          )}
          {(item.modificadores ?? []).length > 0 && (
            <p className="mt-0.5 text-xs text-muted">
              {item.modificadores.map((m) => m.nombre).join(' · ')}
            </p>
          )}
          {item.esCombo && item.productos?.some((p) => p.modificadores?.length > 0) && (
            <p className="mt-0.5 text-xs text-muted">
              {item.productos
                .filter((p) => p.modificadores?.length > 0)
                .map((p) => `${p.nombre}: ${p.modificadores.map((m) => m.nombre).join(', ')}`)
                .join(' · ')}
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted">{formatearPrecio(item.precioUnitario)} c/u</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-1.5 text-muted transition hover:text-danger active:text-danger"
          aria-label={`Quitar ${item.nombre}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14ZM10 11v6m4-6v6" />
          </svg>
        </button>
      </div>
      <div className="flex items-center justify-between">
        <ControlesCantidad cantidad={item.cantidad} onIncrement={onIncrement} onDecrement={onDecrement} />
        <span className="text-lg font-bold text-ink">{formatearPrecio(precioUnidad * item.cantidad)}</span>
      </div>
    </li>
  )
}

function Carrito({
  items,
  total,
  noCobrar,
  onToggleNoCobrar,
  nota = '',
  onNota,
  metodoPago,
  onMetodoPago,
  onIncrement,
  onDecrement,
  onRemove,
  onCobrar,
  cobrando,
  cajaAbierta,
  opcionesCambio = [],
  montoReferencia = null,
  onMontoReferencia,
}) {
  const requiereCambio = metodoPago === 'Efectivo' && !noCobrar && items.length > 0
  const cambioValido = montoReferencia != null && montoReferencia >= total
  const cambioALlevar = requiereCambio && cambioValido ? montoReferencia - total : null

  return (
    <aside className="flex h-full min-h-0 w-full max-w-[400px] flex-col overflow-hidden bg-card">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-3">
        <div>
          <h2 className="text-lg font-bold leading-tight text-ink">Venta rápida</h2>
          <p className="text-xs text-muted">
            {items.length === 0 ? 'Sin artículos' : `${items.length} artículo${items.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <span className="text-lg font-bold text-ink">{formatearPrecio(total)}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
        {items.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted">
            Toca un producto del menú para agregarlo a la venta.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <ItemCarrito
                key={item.key}
                item={item}
                onIncrement={() => onIncrement(item.key)}
                onDecrement={() => onDecrement(item.key)}
                onRemove={() => onRemove(item.key)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-black/5 px-5 py-4">
        <div className="space-y-3">
          <div className="rounded-2xl bg-input px-3 py-2">
            <label htmlFor="carrito-nota" className="text-xs font-medium text-muted">
              Nota (para quien prepara)
            </label>
            <textarea
              id="carrito-nota"
              value={nota}
              onChange={(e) => onNota?.(e.target.value)}
              rows={1}
              placeholder="Ej: Poco cocido, sin cebolla…"
              className="mt-1 w-full resize-none bg-transparent px-0 py-0 text-sm text-ink outline-none placeholder:text-muted/60"
            />
          </div>

          <Switch
            checked={noCobrar}
            onChange={onToggleNoCobrar}
            label="No cobrar"
            description="Consumo interno: no suma a la caja"
          />

          {!noCobrar && (
            <div className="flex rounded-2xl bg-input p-1" role="tablist" aria-label="Método de pago">
              {METODOS.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={metodoPago === m}
                  onClick={() => onMetodoPago(m)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    metodoPago === m ? 'bg-card text-ink shadow-card' : 'text-muted'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {requiereCambio && (
            <div className="rounded-2xl bg-input p-3">
              <p className="mb-2 text-xs font-medium text-muted">¿Con cuánto paga el cliente?</p>
              {opcionesCambio.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {opcionesCambio.map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => onMontoReferencia(op)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                        montoReferencia === op
                          ? 'bg-accent text-white'
                          : op < total
                            ? 'bg-card text-muted'
                            : 'bg-card text-ink'
                      }`}
                    >
                      ${op}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center gap-2">
                <label htmlFor="monto-pago" className="shrink-0 text-xs font-medium text-muted">
                  Otro
                </label>
                <input
                  id="monto-pago"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={montoReferencia ?? ''}
                  onChange={(e) => onMontoReferencia(e.target.value === '' ? null : Number(e.target.value))}
                  placeholder="Escribe la cantidad…"
                  className="w-full rounded-lg bg-card px-3 py-1.5 text-sm text-ink outline-none placeholder:text-muted/60"
                />
              </div>
              {montoReferencia != null && montoReferencia < total && (
                <p className="mt-1.5 text-xs font-medium text-danger">El cliente paga menos que el total</p>
              )}
              {cambioALlevar != null && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-card px-3 py-1.5">
                  <span className="text-sm font-medium text-ink">Cambio</span>
                  <span className="text-base font-bold text-ink">{formatearPrecio(cambioALlevar)}</span>
                </div>
              )}
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            onClick={onCobrar}
            disabled={items.length === 0 || cobrando || !cajaAbierta || (requiereCambio && !cambioValido)}
          >
            {cobrando ? 'Cobrando…' : items.length === 0 ? 'Cobrar' : `Cobrar · ${formatearPrecio(total)}`}
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default Carrito

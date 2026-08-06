import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { formatearPrecio, formatearFecha } from '../../utils/formato'

const COLOR_ESTADO = {
  Pendiente: 'bg-warning/15 text-warning',
  En_preparacion: 'bg-accent/10 text-accent',
  Enviado: 'bg-muted/15 text-muted',
  Entregado: 'bg-emerald-500/15 text-emerald-600',
  Cancelado: 'bg-danger/10 text-danger',
}

function nombreProducto(p) {
  if (p.producto) return p.producto.nombre
  if (p.esMitadYMitad && p.mitadYMitad) {
    const m = p.mitadYMitad
    return `Mitad: ${m.sabor1Producto?.nombre ?? '?'} + ${m.sabor2Producto?.nombre ?? '?'}`
  }
  return 'Producto'
}

function textoModificadores(p) {
  return (p.modificadores ?? []).map((m) => m.modificador?.nombre ?? '?').join(', ')
}

// Los productos de un combo se guardan como filas con el mismo comboId: se
// agrupan bajo el nombre del combo con el precio cerrado del combo.
function agruparProductos(productos) {
  const combos = new Map()
  const sueltos = []
  for (const p of productos ?? []) {
    if (p.combo) {
      const lista = combos.get(p.combo.id) ?? []
      lista.push(p)
      combos.set(p.combo.id, lista)
    } else {
      sueltos.push(p)
    }
  }
  return { combos: [...combos.values()], sueltos }
}

function Fila({ p, esHijo }) {
  const mods = textoModificadores(p)
  return (
    <li
      className={`flex items-start justify-between gap-3 rounded-xl bg-input px-3 py-2 text-sm ${
        esHijo ? 'ml-4' : ''
      }`}
    >
      <span className="min-w-0 text-ink">
        <span className="font-semibold">{p.cantidad}×</span> {nombreProducto(p)}
        {mods && <span className="block text-xs text-muted">+ {mods}</span>}
      </span>
      {!esHijo && (
        <span className="shrink-0 font-semibold text-muted">{formatearPrecio(p.precioCongelado * p.cantidad)}</span>
      )}
    </li>
  )
}

function DetallePedidoModal({ pedido, guardando, onCerrar, onAvanzar, onEnviar, onEditar, onCancelar, onPagar }) {
  const puede =
    pedido.estadoPreparacion === 'Pendiente'
      ? ['En_preparacion', 'Entregado']
      : pedido.estadoPreparacion === 'En_preparacion'
        ? ['Entregado']
        : pedido.estadoPreparacion === 'Enviado'
          ? ['Entregado']
          : []
  const puedeEnviar =
    (pedido.estadoPreparacion === 'Pendiente' || pedido.estadoPreparacion === 'En_preparacion') &&
    pedido.tipo === 'A_domicilio'

  const cliente = pedido.cliente ? pedido.cliente.nombre : pedido.nombreClienteLibre ?? 'Cliente no identificado'
  const { combos, sueltos } = agruparProductos(pedido.productos)

  return (
    <Modal
      open
      onClose={onCerrar}
      title={`Pedido #${pedido.id}`}
      className="max-w-2xl"
      footer={
        <>
          {pedido.estadoPago === 'Pendiente_pago' && pedido.estadoPreparacion !== 'Cancelado' && (
            <Button size="md" variant="dangerSoft" onClick={() => onPagar(pedido)}>
              Marcar pagado
            </Button>
          )}
          {puedeEnviar && (
            <Button size="md" onClick={() => onEnviar(pedido)}>
              Enviar
            </Button>
          )}
          {(pedido.estadoPreparacion === 'Pendiente' || pedido.estadoPreparacion === 'En_preparacion') && (
            <Button size="md" variant="secondary" onClick={() => onEditar(pedido)}>
              Editar
            </Button>
          )}
          {puede.includes('En_preparacion') && (
            <Button size="md" variant="secondary" onClick={() => onAvanzar(pedido, 'En_preparacion')}>
              En preparación
            </Button>
          )}
          {puede.includes('Entregado') && (
            <Button size="md" onClick={() => onAvanzar(pedido, 'Entregado')}>
              Entregado
            </Button>
          )}
          {pedido.estadoPreparacion !== 'Cancelado' && pedido.estadoPreparacion !== 'Entregado' && (
            <Button size="md" variant="dangerSoft" onClick={() => onCancelar(pedido)}>
              Cancelar
            </Button>
          )}
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${COLOR_ESTADO[pedido.estadoPreparacion]}`}>
          {pedido.estadoPreparacion.replaceAll('_', ' ')}
        </span>
        <span className="rounded-full bg-muted/10 px-2 py-0.5 text-xs font-semibold text-muted">
          {pedido.tipo.replaceAll('_', ' ')}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            pedido.estadoPago === 'Pagado' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-warning/15 text-warning'
          }`}
        >
          {pedido.estadoPago === 'Pagado' ? 'Pagado' : 'Pendiente de pago'}
        </span>
        {pedido.noCobrar && (
          <span className="rounded-full bg-muted/10 px-2 py-0.5 text-xs font-semibold text-muted">
            Consumo interno
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-surface p-4 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cliente</p>
          <p className="font-medium text-ink">{cliente}</p>
          {pedido.cliente?.telefono && <p className="text-xs text-muted">{pedido.cliente.telefono}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Fecha</p>
          <p className="font-medium text-ink">{formatearFecha(pedido.fechaHoraCreacion)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Origen</p>
          <p className="font-medium text-ink">{pedido.origen}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Repartidor</p>
          <p className="font-medium text-ink">{pedido.repartidor?.nombre ?? '—'}</p>
        </div>
        {pedido.referencia && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Referencia</p>
            <p className="font-medium text-ink">{pedido.referencia.detalle}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Método de pago</p>
          <p className="font-medium text-ink">{pedido.metodoPago ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total</p>
          <p className="text-lg font-bold text-ink">{formatearPrecio(pedido.total)}</p>
        </div>
        {pedido.tipo === 'A_domicilio' && pedido.costoEnvio > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Costo de envío</p>
            <p className="font-medium text-ink">{formatearPrecio(pedido.costoEnvio)}</p>
          </div>
        )}
      </div>

      {pedido.nota && (
        <p className="mt-3 rounded-xl bg-warning/10 px-3 py-2 text-sm font-medium text-ink">
          <span className="font-bold text-accent">Nota:</span> {pedido.nota}
        </p>
      )}

      {(sueltos.length > 0 || combos.length > 0) && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Productos</p>
          <ul className="space-y-1.5">
            {sueltos.map((p, i) => (
              <Fila key={i} p={p} />
            ))}
            {combos.map((filas, i) => {
              const combo = filas[0].combo
              return (
                <li key={`c${i}`} className="rounded-xl bg-accent/10 px-3 py-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-ink">{combo.nombre}</span>
                    <span className="font-semibold text-ink">
                      {formatearPrecio(filas[0].comboPrecioCongelado * filas[0].cantidad)}
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {filas.map((p, j) => (
                      <Fila key={j} p={p} esHijo />
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </Modal>
  )
}

export default DetallePedidoModal
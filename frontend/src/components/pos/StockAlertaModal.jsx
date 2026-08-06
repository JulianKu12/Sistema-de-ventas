import Button from '../ui/Button'
import Modal from '../ui/Modal'

function StockAlertaModal({ open, faltantes, nombreDe, cargando, onConfirmar, onCancelar }) {
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
          <li
            key={`${f.tipo}:${f.id}`}
            className="flex items-center justify-between rounded-2xl bg-danger/5 px-4 py-3"
          >
            <span className="font-medium text-ink">{nombreDe(f) ?? `ID ${f.id}`}</span>
            <span className="text-sm text-danger">
              disponible {f.disponible} / requerido {f.requerido}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export default StockAlertaModal

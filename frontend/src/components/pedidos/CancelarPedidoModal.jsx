import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

function CancelarPedidoModal({ abierto, pedido, guardando, onClose, onCancelar }) {
  const [regresa, setRegresa] = useState(true)
  const [error, setError] = useState('')

  const confirmar = () => {
    setError('')
    onCancelar(regresa)
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title="Cancelar pedido"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>Volver</Button>
          <Button variant="danger" size="md" onClick={confirmar} disabled={guardando}>
            {guardando ? 'Cancelando…' : 'Cancelar pedido'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{error}</p>
        )}

        <p className="text-sm text-muted">
          Confirma la cancelación del pedido #{pedido?.id} ({pedido?.venta ? 'ya fue cobrado' : 'aún no cobrado'}+).
        </p>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Los ingredientes…</p>
          <div className="flex rounded-2xl bg-input p-1">
            {[
              { valor: true, etiqueta: 'Regresan al inventario' },
              { valor: false, etiqueta: 'Ya se usaron / se pierden' },
            ].map((o) => (
              <button
                key={o.valor}
                type="button"
                onClick={() => setRegresa(o.valor)}
                className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${
                  regresa === o.valor ? 'bg-card text-ink shadow-card' : 'text-muted'
                }`}
              >
                {o.etiqueta}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CancelarPedidoModal
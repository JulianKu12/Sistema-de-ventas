import { useEffect, useState } from 'react'
import { listarEmpleados } from '../../services/empleados'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

function EnviarPedidoModal({ abierto, guardando, repartidorUnico, pedido, onClose, onEnviar }) {
  const [repartidores, setRepartidores] = useState([])
  const [seleccion, setSeleccion] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!abierto) return
    let activo = true
    setError('')
    listarEmpleados()
      .then((data) => {
        if (activo) {
          const disponibles = (data || []).filter((e) => e.estadoDisponibilidad === 'Disponible')
          setRepartidores(disponibles)
          if (disponibles.length === 1) setSeleccion(disponibles[0].id)
        }
      })
      .catch((err) => {
        if (activo) setError(err.message)
      })
    return () => {
      activo = false
    }
  }, [abierto])

  const confirmar = () => {
    setError('')
    if (repartidorUnico) return onEnviar()
    if (!seleccion) return setError('Selecciona un repartidor disponible')
    onEnviar(seleccion)
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title="Enviar pedido"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="md" onClick={confirmar} disabled={guardando}>
            {guardando ? 'Enviando…' : 'Confirmar envío'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{error}</p>
        )}

        {repartidorUnico ? (
          <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
            Repartidor único activo: se asignará automáticamente. Confirmar envía el pedido.
          </p>
        ) : repartidores.length === 0 ? (
          <p className="rounded-2xl bg-warning/15 px-4 py-3 text-sm text-warning">
            No hay repartidores disponibles. Da de alta uno con estado "Disponible" para poder enviar el pedido.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted">Asignar repartidor ({repartidores.length})</p>
            {repartidores.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSeleccion(e.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                  seleccion === e.id ? 'bg-accent/10 ring-2 ring-accent/40' : 'bg-input'
                }`}
              >
                <span className="font-semibold text-ink">{e.nombre}</span>
                {seleccion === e.id && <span className="text-accent">✓</span>}
              </button>
            ))}
          </div>
        )}

        <p className="rounded-2xl bg-muted/10 px-4 py-3 text-xs text-muted">
          Pedido #{pedido?.id} · {pedido?.tipo === 'A_domicilio' ? 'A domicilio' : 'Para recoger'}
        </p>
      </div>
    </Modal>
  )
}

export default EnviarPedidoModal
import Button from './Button'
import Modal from './Modal'

function ConfirmarModal({
  open,
  title,
  mensaje,
  textoConfirmar = 'Confirmar',
  variante = 'danger',
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  const clasesConfirmar =
    variante === 'danger' ? 'bg-danger text-white active:bg-danger/85' : 'bg-accent text-white active:bg-accent/85'

  return (
    <Modal
      open={open}
      onClose={onCancelar}
      title={title}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </Button>
          <Button
            size="md"
            className={clasesConfirmar}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? 'Procesando…' : textoConfirmar}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">{mensaje}</p>
    </Modal>
  )
}

export default ConfirmarModal

const ETIQUETAS_UNIDAD = {
  kg: 'kg',
  g: 'g',
  l: 'l',
  ml: 'ml',
  pieza: 'pz',
}

function SelectorCuenta({ tipo, onTipo, cuentaId, onCuenta, ingredientes, productos }) {
  const lista = tipo === 'ingrediente' ? ingredientes : productos
  const seleccionado = lista.find((x) => x.id === Number(cuentaId))

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-sm font-medium text-muted">Tipo de artículo</p>
        <div className="flex rounded-2xl bg-input p-1">
          {[
            { valor: 'ingrediente', etiqueta: 'Ingrediente' },
            { valor: 'producto', etiqueta: 'Producto (reventa)' },
          ].map((op) => (
            <button
              key={op.valor}
              type="button"
              onClick={() => {
                onTipo(op.valor)
                onCuenta('')
              }}
              className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${
                tipo === op.valor ? 'bg-card text-ink shadow-card' : 'text-muted'
              }`}
            >
              {op.etiqueta}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="cuenta-inv" className="mb-2 block text-sm font-medium text-muted">
          Artículo
        </label>
        <select
          id="cuenta-inv"
          value={cuentaId}
          onChange={(e) => onCuenta(e.target.value)}
          className={`w-full rounded-2xl bg-input px-4 py-3.5 text-base text-ink outline-none transition focus:ring-2 focus:ring-accent/40 ${
            cuentaId === '' ? 'text-muted' : ''
          }`}
        >
          <option value="">Selecciona…</option>
          {lista.map((x) => (
            <option key={x.id} value={x.id}>
              {x.nombre}
            </option>
          ))}
        </select>
      </div>

      {seleccionado && (
        <p className="rounded-2xl bg-input px-4 py-3 text-sm text-muted">
          Stock actual:{' '}
          <span className="font-semibold text-ink">
            {seleccionado.stockActual}
            {tipo === 'ingrediente' ? ` ${ETIQUETAS_UNIDAD[seleccionado.unidadMedida] ?? seleccionado.unidadMedida}` : ''}
          </span>
        </p>
      )}
    </div>
  )
}

export default SelectorCuenta
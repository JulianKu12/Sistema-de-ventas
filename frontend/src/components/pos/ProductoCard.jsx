import { formatearPrecio } from '../../utils/formato'

function ProductoCard({ nombre, precio, sub, esCombo, onClick, onMitad }) {
  return (
    <div className="flex min-h-[120px] flex-col rounded-2xl bg-card shadow-card">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-1 flex-col justify-between gap-2 rounded-2xl p-4 text-left transition active:scale-[0.97] disabled:opacity-50"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 font-semibold text-ink">{nombre}</span>
          {esCombo && (
            <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              Combo
            </span>
          )}
        </div>
        <span className="text-lg font-bold text-accent">{formatearPrecio(precio)}</span>
        {sub && <span className="text-xs text-muted">{sub}</span>}
      </button>
      {onMitad && (
        <button
          type="button"
          onClick={onMitad}
          className="mx-2 mb-2 flex items-center justify-center gap-1 rounded-xl bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition active:scale-[0.97] active:bg-accent/20"
        >
          <span className="text-sm font-bold">½</span> Mitad y mitad
        </button>
      )}
    </div>
  )
}

export default ProductoCard
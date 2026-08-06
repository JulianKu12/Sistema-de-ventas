import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'

const TIPOS = ['Agregar', 'Quitar', 'Sustituir']

const ETIQUETAS_UNIDAD = {
  kg: 'kg',
  g: 'g',
  l: 'l',
  ml: 'ml',
  pieza: 'pz',
}

const RESUMEN_TIPO = {
  Agregar: 'consume más cantidad del ingrediente',
  Quitar: 'devuelve la cantidad del ingrediente en la receta',
  Sustituir: 'remplaza el ingrediente por otro',
}

let contadorUid = 0

function FilaModificadorEditor({ fila, ingredientes, actualizar, quitar }) {
  const [abierto, setAbierto] = useState(true)
  const unidad = ingredientes.find((i) => i.id === Number(fila.afectadoId))?.unidadMedida
  const etiquetaUnidad = unidad ? ETIQUETAS_UNIDAD[unidad] ?? unidad : ''

  const resumen =
    fila.tipo === 'Sustituir'
      ? `${fila.afectadoId ? ingredientes.find((i) => i.id === Number(fila.afectadoId))?.nombre ?? '?' : '…'} → ${
          fila.sustitutoId ? ingredientes.find((i) => i.id === Number(fila.sustitutoId))?.nombre ?? '?' : '…'
        }`
      : fila.tipo === 'Agregar'
        ? `+${fila.cantidad} ${etiquetaUnidad} de ${
            fila.afectadoId ? ingredientes.find((i) => i.id === Number(fila.afectadoId))?.nombre ?? '?' : '…'
          }`
        : `Quita ${
            fila.afectadoId ? ingredientes.find((i) => i.id === Number(fila.afectadoId))?.nombre ?? '?' : '…'
          }`

  return (
    <div className="space-y-3 rounded-2xl bg-input p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Nombre del modificador"
          value={fila.nombre}
          onChange={(e) => actualizar(fila.uid, { ...fila, nombre: e.target.value })}
          className="w-full rounded-xl bg-card px-3 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-muted/70 focus:ring-2 focus:ring-accent/40"
        />
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? 'Contraer modificador' : 'Expandir modificador'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition active:scale-90"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-5 w-5 transition-transform ${abierto ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => quitar(fila.uid)}
          aria-label="Eliminar modificador"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger transition active:scale-90"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
            <path d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!abierto && <p className="text-sm text-muted">{resumen}</p>}

      {abierto && (
        <>
          <div className="flex rounded-2xl bg-card p-1">
            {TIPOS.map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => actualizar(fila.uid, { ...fila, tipo })}
                className={`flex-1 rounded-xl px-2 py-2 text-sm font-semibold transition ${
                  fila.tipo === tipo ? 'bg-accent text-white' : 'text-muted'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Ingrediente afectado</label>
              <select
                value={fila.afectadoId}
                onChange={(e) => actualizar(fila.uid, { ...fila, afectadoId: e.target.value })}
                className={`w-full rounded-xl bg-card px-3 py-2.5 text-sm text-ink outline-none transition focus:ring-2 focus:ring-accent/40 ${
                  fila.afectadoId === '' ? 'text-muted' : ''
                }`}
              >
                <option value="">Selecciona…</option>
                {ingredientes.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.nombre}
                  </option>
                ))}
              </select>
            </div>

            {fila.tipo === 'Sustituir' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Ingrediente sustituto</label>
                <select
                  value={fila.sustitutoId}
                  onChange={(e) => actualizar(fila.uid, { ...fila, sustitutoId: e.target.value })}
                  className={`w-full rounded-xl bg-card px-3 py-2.5 text-sm text-ink outline-none transition focus:ring-2 focus:ring-accent/40 ${
                    fila.sustitutoId === '' ? 'text-muted' : ''
                  }`}
                >
                  <option value="">Selecciona…</option>
                  {ingredientes
                    .filter((ing) => ing.id !== Number(fila.afectadoId))
                    .map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.nombre}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {fila.tipo !== 'Quitar' && (
              <Input
                id={`mod-cant-${fila.uid}`}
                label={`Cantidad ${fila.tipo === 'Sustituir' ? 'del sustituto' : 'extra'}${etiquetaUnidad ? ` (${etiquetaUnidad})` : ''}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0"
                className="!px-3 !py-2.5 text-sm"
                value={fila.cantidad}
                onChange={(e) => actualizar(fila.uid, { ...fila, cantidad: e.target.value })}
              />
            )}

            <Input
              id={`mod-costo-${fila.uid}`}
              label="Costo opcional ($)"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              className="!px-3 !py-2.5 text-sm"
              value={fila.costo}
              onChange={(e) => actualizar(fila.uid, { ...fila, costo: e.target.value })}
            />
          </div>

          <p className="text-xs text-muted">{RESUMEN_TIPO[fila.tipo]}</p>
        </>
      )}
    </div>
  )
}

function ModificadorEditor({ modificadores, setModificadores, ingredientes }) {
  const actualizar = (uid, cambios) =>
    setModificadores((previo) => previo.map((m) => (m.uid === uid ? cambios : m)))
  const quitar = (uid) => setModificadores((previo) => previo.filter((m) => m.uid !== uid))
  const agregar = () =>
    setModificadores((previo) => [
      ...previo,
      { uid: ++contadorUid, id: undefined, nombre: '', tipo: 'Agregar', afectadoId: '', sustitutoId: '', cantidad: '', costo: '' },
    ])

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted">Modificadores del producto</p>
      <div className="space-y-2">
        {modificadores.map((fila) => (
          <FilaModificadorEditor
            key={fila.uid}
            fila={fila}
            ingredientes={ingredientes}
            actualizar={actualizar}
            quitar={quitar}
          />
        ))}
      </div>
      <Button variant="secondary" size="md" className="mt-2" onClick={agregar} type="button">
        + Agregar modificador
      </Button>
    </div>
  )
}

export default ModificadorEditor

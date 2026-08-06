function Switch({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl px-2 py-2 text-left transition active:bg-muted/10"
    >
      <span>
        <span className="block font-medium text-ink">{label}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
      <span
        className={`relative inline-flex h-8 w-14 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-accent' : 'bg-muted/40'
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  )
}

export default Switch

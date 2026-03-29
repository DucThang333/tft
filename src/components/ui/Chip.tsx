interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

export function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-lg font-label font-bold text-xs uppercase transition-all ${
        active
          ? 'bg-tertiary text-on-tertiary shadow-[0_0_15px_rgba(233,196,0,0.3)]'
          : 'bg-surface-container-high hover:bg-surface-bright text-on-surface-variant'
      }`}
    >
      {label}
    </button>
  )
}

/** Icon thông số (tab Số liệu) — assets MetaTFT. */
export const metatftStatIconUrls = {
  mana: 'https://www.metatft.com/icons/Mana.svg',
  ad: 'https://www.metatft.com/icons/AD.svg',
  ap: 'https://www.metatft.com/icons/AP.svg',
  armor: 'https://www.metatft.com/icons/Armor.svg',
  magicResist: 'https://www.metatft.com/icons/MagicResist.svg',
  attackSpeed: 'https://www.metatft.com/icons/AS.svg',
  critChance: 'https://www.metatft.com/icons/CritChance.svg',
  critDamage: 'https://www.metatft.com/icons/CritDamage.svg',
  range: 'https://www.metatft.com/icons/Range.svg',
} as const

export function MetatftStatIcon({
  stat,
  className = '',
}: {
  stat: keyof typeof metatftStatIconUrls
  className?: string
}) {
  return (
    <img
      src={metatftStatIconUrls[stat]}
      alt=""
      className={`object-contain shrink-0 ${className}`}
      aria-hidden
      loading="lazy"
    />
  )
}

/** Icon nhỏ inline — màu qua `className` (text-*) hoặc style. */

export function MagicDamageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={13}
      height={13}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path fill="currentColor" d="M11 21h4l-1.5-9.5L20 8.5 11 2v6.5L4 14h7l-1 7z" />
    </svg>
  )
}

export function PhysicalDamageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        d="M4 19L15 8M8 8h7v7M14 20l6-6"
      />
    </svg>
  )
}

export function ShieldStatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={13}
      height={13}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 2L4 5v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V5l-8-3zm0 2.18l6 2.25v5.32c0 4.24-2.87 7.92-6 8.87-3.13-.95-6-4.63-6-8.87V6.43l6-2.25z"
      />
    </svg>
  )
}

export function SparkleCountIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={13}
      height={13}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 2l1.2 4.2L17 7l-3.8 1.8L12 13l-1.2-4.2L7 7l3.8-1.8L12 2zm6 10l.8 2.8L21 15l-2.5 1.2L18 19l-1.2-2.8L14 15l2.5-1.2L18 12zM6 14l.6 2.1L9 17l-2.4 1.1L6 20l-1.1-2.9L2 17l2.5-1.1L6 14z"
      />
    </svg>
  )
}

export function ManaDropIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69zM12 6.1L8.34 9.76a5.5 5.5 0 1 0 7.32 0L12 6.1z"
      />
    </svg>
  )
}

/** Tab số liệu — màu qua className. */
export function StatHeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  )
}

export function StatArmorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.52c0 4.52-3.13 8.78-7 9.81-3.87-1.03-7-5.29-7-9.81V6.3l7-3.12z"
      />
    </svg>
  )
}

export function StatMagicResistIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity={0.35} />
    </svg>
  )
}

export function StatAttackSpeedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 15l4-6 4 4 4-8M16 5h4v4"
      />
    </svg>
  )
}

export function StatCritChanceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2l1.8 5.5L19 9l-4.5 3.2L16 18l-4-2.8-4 2.8 1.5-5.8L3 9l5.2-1.5L12 2z"
      />
    </svg>
  )
}

export function StatCritDamageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" d="M12 5v14M8 9h8M9 17l3-4 3 4" />
    </svg>
  )
}

export function StatRangeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 19L19 5M14 5h5v5"
      />
    </svg>
  )
}

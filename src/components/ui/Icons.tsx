type IconProps = { className?: string }

export function IconSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M20 20L16.2 16.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

export function IconUserPlus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="10" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 20C4.4 15.5 6.7 13.2 10 13.2C13.3 13.2 15.6 15.5 16.5 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M19 8V14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 11H22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function IconPencil({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M16.5 4.5L19.5 7.5L8 19H5V16L16.5 4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M5 7H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 7V5C9 4.4 9.4 4 10 4H14C14.6 4 15 4.4 15 5V7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 7L7.7 19C7.75 19.6 8.25 20 8.8 20H15.2C15.75 20 16.25 19.6 16.3 19L17 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 11V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconEye({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M2.5 12C4.5 7.5 8 5 12 5C16 5 19.5 7.5 21.5 12C19.5 16.5 16 19 12 19C8 19 4.5 16.5 2.5 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function IconX({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconChevronLeft({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 20C4.3 15.9 6.3 13.8 9 13.8C11.7 13.8 13.7 15.9 14.5 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.3 13.5C17.7 13.6 19.2 15 19.9 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconCheckCircle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 12.3L10.8 14.5L15.5 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12L15 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconAlertTriangle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 4L22 20H2L12 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10V14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" />
    </svg>
  )
}

export function IconArrowLeft({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconMail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 7L12 12.5L19.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10H20.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.5V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 3.5V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconSpinner({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" d="M21 12A9 9 0 0012 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function IconTrendingUp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M3 16L9.5 9.5L13.5 13.5L21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 6H21V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconBook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 6.5C10.5 5.2 8.3 4.5 5.5 4.5V17.5C8.3 17.5 10.5 18.2 12 19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6.5C13.5 5.2 15.7 4.5 18.5 4.5V17.5C15.7 17.5 13.5 18.2 12 19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6.5V19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconLightbulb({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M9 18.5H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.7 21H14.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 3.5C8.7 3.5 6.5 5.9 6.5 8.9C6.5 11 7.7 12.2 8.7 13.2C9.4 13.9 10 14.5 10.2 15.5H13.8C14 14.5 14.6 13.9 15.3 13.2C16.3 12.2 17.5 11 17.5 8.9C17.5 5.9 15.3 3.5 12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function IconDocument({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7 3.5H14.5L18.5 7.5V20.5H7V3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.5 3.5V7.5H18.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.5 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.5 15.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** Ikon kalkulator — dipakai untuk mata pelajaran eksak seperti Matematika. */
export function IconCalculator({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="5" y="3.5" width="14" height="17" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="7.5" y="6" width="9" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.4" cy="13.4" r="0.95" fill="currentColor" />
      <circle cx="12" cy="13.4" r="0.95" fill="currentColor" />
      <circle cx="15.6" cy="13.4" r="0.95" fill="currentColor" />
      <circle cx="8.4" cy="16.8" r="0.95" fill="currentColor" />
      <circle cx="12" cy="16.8" r="0.95" fill="currentColor" />
      <circle cx="15.6" cy="16.8" r="0.95" fill="currentColor" />
    </svg>
  )
}

/** Ikon labu erlenmeyer — dipakai untuk mata pelajaran sains seperti Kimia/Fisika/Biologi. */
export function IconFlask({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M10 3.5H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.7 3.5V8.6L5.3 18C4.7 19.1 5.5 20.5 6.8 20.5H17.2C18.5 20.5 19.3 19.1 18.7 18L13.3 8.6V3.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 15H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10.3" cy="17.6" r="0.8" fill="currentColor" />
      <circle cx="13.5" cy="18.2" r="0.6" fill="currentColor" />
    </svg>
  )
}

/** Ikon tanda kurung kode "</>" — dipakai untuk mata pelajaran Informatika/TIK. */
export function IconCode({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M9 8L4.5 12L9 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8L19.5 12L15 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.3 5.5L10.7 18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Ikon Al-Qur'an / kitab — dipakai untuk mata pelajaran keagamaan. */
export function IconQuran({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 6.2C10.5 5 8.4 4.4 5.5 4.4V17.6C8.4 17.6 10.5 18.3 12 19.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6.2C13.5 5 15.6 4.4 18.5 4.4V17.6C15.6 17.6 13.5 18.3 12 19.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6.2V19.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 8.6H9.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8 11H9.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/** Ikon dunia/bumi — dipakai untuk mata pelajaran bahasa/sosial (mis. IPS, Bahasa Inggris/Arab). */
export function IconGlobe({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 12H20.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 3.5C14.2 6 15.3 9 15.3 12C15.3 15 14.2 18 12 20.5C9.8 18 8.7 15 8.7 12C8.7 9 9.8 6 12 3.5Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconFilter({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 5.5H20L14 12.5V18.5L10 20.5V12.5L4 5.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function IconShield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 3.5L19 6V11.5C19 16 16.2 19.2 12 20.5C7.8 19.2 5 16 5 11.5V6L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12L11 14L15.5 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconTab({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9H16M8 13H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 16L18 13M18 13L15 10M18 13H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconCopy({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="8" y="7" width="11" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 7V5.5C16 4.7 15.3 4 14.5 4H6C4.9 4 4 4.9 4 6V15C4 16.1 4.9 17 6 17H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconFocus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M8 4H5C4.4 4 4 4.4 4 5V8M16 4H19C19.6 4 20 4.4 20 5V8M8 20H5C4.4 20 4 19.6 4 19V16M16 20H19C19.6 20 20 19.6 20 19V16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function IconFullscreen({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M8 4H5C4.4 4 4 4.4 4 5V8M16 4H19C19.6 4 20 4.4 20 5V8M8 20H5C4.4 20 4 19.6 4 19V16M16 20H19C19.6 20 20 19.6 20 19V16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10 8L8 10M14 8L16 10M10 16L8 14M14 16L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconSave({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M5 4H16L19 7V20H5V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 4V9H15V4M8.5 20V14H15.5V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
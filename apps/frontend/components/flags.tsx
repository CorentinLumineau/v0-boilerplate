export function FlagGB({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className} width="24" height="16">
      <clipPath id="gb-flag">
        <path d="M0 0v30h60V0z" />
      </clipPath>
      <g clipPath="url(#gb-flag)">
        <path d="M0 0v30h60V0z" fill="#012169" />
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#gb-flag)" />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

export function FlagFR({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={className} width="24" height="16">
      <path fill="#ED2939" d="M0 0h900v600H0z" />
      <path fill="#fff" d="M0 0h600v600H0z" />
      <path fill="#002395" d="M0 0h300v600H0z" />
    </svg>
  )
}

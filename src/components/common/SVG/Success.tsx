export const Success = ({ color = '#15BFA9' }: SVGProps) => {
  return (
    <svg version='1.1' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'>
      <circle
        cx='40'
        cy='40'
        fill='none'
        r='38.5'
        stroke={color}
        strokeWidth='3'
        transform='rotate(180 40 40)'
      />
      <path
        d='M22 43.5L34.507 54L59 27'
        fill='none'
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='3'
      />
    </svg>
  )
}

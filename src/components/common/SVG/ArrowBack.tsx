export const ArrowBack = ({ color }: SVGProps) => {
  return (
    <svg
      height='48'
      version='1.1'
      viewBox='0 0 48 48'
      width='48'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle
        cx='24'
        cy='24'
        fill='none'
        r='23.5'
        stroke={color || 'currentColor'}
        transform='rotate(180 24 24)'
      />
      <path
        d='M32 25C32.5523 25 33 24.5523 33 24C33 23.4477 32.5523 23 32 23L32 25ZM15.2929 23.2929C14.9024 23.6834 14.9024 24.3166 15.2929 24.7071L21.6569 31.0711C22.0474 31.4616 22.6805 31.4616 23.0711 31.0711C23.4616 30.6805 23.4616 30.0474 23.0711 29.6569L17.4142 24L23.0711 18.3431C23.4616 17.9526 23.4616 17.3195 23.0711 16.9289C22.6805 16.5384 22.0474 16.5384 21.6569 16.9289L15.2929 23.2929ZM32 23L16 23L16 25L32 25L32 23Z'
        fill={color || 'currentColor'}
      />
    </svg>
  )
}

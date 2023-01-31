export const BurgerMenu = ({ color = '#FFFFFF' }: SVGProps) => {
  return (
    <svg version='1.1' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <line stroke={color} x1='3' x2='21' y1='12' y2='12' />
      <line stroke={color} x1='3' x2='21' y1='6' y2='6' />
      <line stroke={color} x1='3' x2='21' y1='18' y2='18' />
    </svg>
  )
}

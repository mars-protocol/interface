export const SortDesc = ({ color = '#FFFFFF' }: SVGProps) => {
  return (
    <svg fill='none' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12.3123 7.24988L15.887 10.1096C16.256 10.4048 16.0472 11 15.5746 11L8.42539 11C7.95275 11 7.74397 10.4048 8.11304 10.1096L11.6877 7.24988C11.8703 7.10379 12.1297 7.10379 12.3123 7.24988Z'
        fill='white'
        fillOpacity='0.2'
      />
      <path
        d='M12 16.3597L8.42539 13.5L15.5746 13.5L12 16.3597Z'
        fill={color}
        stroke={color}
        strokeLinejoin='round'
      />
    </svg>
  )
}

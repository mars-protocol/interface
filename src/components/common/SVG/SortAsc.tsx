export const SortAsc = ({ color = '#FFFFFF' }: SVGProps) => {
  return (
    <svg fill='none' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 7.64031L15.5746 10.5L8.42539 10.5L12 7.64031Z'
        fill={color}
        stroke={color}
        strokeLinejoin='round'
      />
      <path
        d='M11.6877 16.7501L8.11304 13.8904C7.74397 13.5952 7.95275 13 8.42539 13H15.5746C16.0472 13 16.256 13.5952 15.887 13.8904L12.3123 16.7501C12.1297 16.8962 11.8703 16.8962 11.6877 16.7501Z'
        fill={color}
        fillOpacity='0.2'
      />
    </svg>
  )
}

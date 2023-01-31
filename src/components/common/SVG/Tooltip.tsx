import React from 'react'

export const Tooltip = (props: SVGProps) => {
  return (
    <svg
      className={props.className}
      width='24'
      height='24'
      viewBox='0 0 25 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clipPath='url(#clip0_20215_37778)'>
        <circle cx='12.5' cy='12' r='11.5' stroke={'currentColor'} strokeOpacity='1' />
        <path
          d='M12.5 17H12.51'
          stroke='currentColor'
          strokeOpacity='1'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M9.59009 9.00008C9.82519 8.33175 10.2892 7.76819 10.9 7.40921C11.5108 7.05024 12.229 6.91902 12.9273 7.03879C13.6255 7.15857 14.2589 7.52161 14.7152 8.06361C15.1714 8.60561 15.4211 9.2916 15.4201 10.0001C15.4201 12.0001 12.4201 13.0001 12.4201 13.0001'
          stroke='currentColor'
          strokeOpacity='1'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_20215_37778'>
          <rect width='24' height='24' fill='currentColor' transform='translate(0.5)' />
        </clipPath>
      </defs>
    </svg>
  )
}

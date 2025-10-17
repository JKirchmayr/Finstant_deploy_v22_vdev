import * as React from 'react'

interface TwoRowTableIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string
    color?: string
    strokeWidth?: number
}

export const TwoRowTableIcon: React.FC<TwoRowTableIconProps> = ({
    size = 24,
    color = 'currentColor',
    strokeWidth = 1.5,
    ...props
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Outer rectangle */}
        <rect x="8" y="6" width="8" height="12" fill="none" />

        {/* Middle horizontal divider */}
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
)

import * as React from 'react'

interface TableRowsIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string
    color?: string
    strokeWidth?: number
    rows?: 2 | 3 // Number of rows (default: 2)
}

export const TableRowsIcon: React.FC<TableRowsIconProps> = ({
    size = 24,
    color = 'currentColor',
    strokeWidth = 1.5,
    rows = 2,
    ...props
}) => {
    // calculate divider positions dynamically based on row count
    const rectTop = 6
    const rectHeight = 12
    const rowHeight = rectHeight / rows

    // divider lines (only for rows - 1)
    const dividers = Array.from({ length: rows - 1 }).map((_, i) => {
        const y = rectTop + (i + 1) * rowHeight
        return <line key={i} x1="8" y1={y} x2="16" y2={y} />
    })

    return (
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
            <rect x="8" y={rectTop} width="8" height={rectHeight} fill="none" />
            {/* Dynamic row dividers */}
            {dividers}
        </svg>
    )
}

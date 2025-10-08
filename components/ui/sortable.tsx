'use client'

import * as React from 'react'
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type UniqueId = string | number

type SortableProps<T> = {
  value: T[]
  onValueChange: (items: T[]) => void
  getItemValue: (item: T) => UniqueId
  children: React.ReactNode
}

type SortableInternalContextValue = {
  // provided by SortableItem to its handle(s)
  attributes?: React.HTMLAttributes<HTMLElement>
  listeners?: any
  setNodeRef?: (node: HTMLElement | null) => void
}

const SortableItemCtx = React.createContext<SortableInternalContextValue | null>(null)

export function Sortable<T>({ value, onValueChange, getItemValue, children }: SortableProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const ids = React.useMemo(() => value.map(getItemValue), [value, getItemValue])

  function handleDragStart(_event: DragStartEvent) {
    // no-op; could add state if we want an overlay
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = ids.indexOf(active.id as UniqueId)
    const newIndex = ids.indexOf(over.id as UniqueId)
    if (oldIndex === -1 || newIndex === -1) return

    const next = arrayMove(value, oldIndex, newIndex)
    onValueChange(next)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  )
}

type AsChildProps = {
  asChild?: boolean
  children: React.ReactElement
}

export function SortableContent({
  asChild,
  children,
  items,
}: AsChildProps & { items?: UniqueId[] }) {
  // items will be provided via parent mapping; if not provided, infer by reading children keys not reliable
  if (!items) {
    // best effort: let child render, but without SortableContext drag won't function properly
    return asChild ? React.cloneElement(children, {}) : <>{children}</>
  }
  const node = asChild ? React.cloneElement(children, {}) : <div>{children}</div>
  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      {node}
    </SortableContext>
  )
}

// Convenience wrapper to compute items from children when used as in table example
// In our usage we pass asChild and wrap <TableBody>, so we need a separate component that
// receives ids from the nearest Sortable above. We'll rebuild ids via React context pattern:
const IdsContext = React.createContext<UniqueId[] | null>(null)

export function SortableIdsProvider<T>({
  children,
  items,
}: {
  items: UniqueId[]
  children: React.ReactNode
}) {
  return <IdsContext.Provider value={items}>{children}</IdsContext.Provider>
}

export function useSortableIds() {
  const ids = React.useContext(IdsContext)
  return ids ?? []
}

export function SortableItem({
  value,
  asChild,
  children,
}: {
  value: UniqueId
} & AsChildProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: value,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const ctxValue: SortableInternalContextValue = {
    attributes,
    listeners,
    setNodeRef,
  }

  if (asChild) {
    return (
      <SortableItemCtx.Provider value={ctxValue}>
        {React.cloneElement(children, {
          ref: setNodeRef,
          style: { ...(children.props.style || {}), ...style },
          'data-dragging': isDragging ? 'true' : undefined,
        })}
      </SortableItemCtx.Provider>
    )
  }

  return (
    <SortableItemCtx.Provider value={ctxValue}>
      <div ref={setNodeRef} style={style} data-dragging={isDragging ? 'true' : undefined}>
        {children}
      </div>
    </SortableItemCtx.Provider>
  )
}

export function SortableItemHandle({ asChild, children }: AsChildProps) {
  const ctx = React.useContext(SortableItemCtx)
  if (!ctx) {
    return asChild ? children : <div>{children}</div>
  }
  const handleProps = { ...(ctx.attributes || {}), ...(ctx.listeners || {}) }
  if (asChild) {
    return React.cloneElement(children, {
      ...handleProps,
    })
  }
  return <div {...handleProps}>{children}</div>
}

// Optional overlay export for API compatibility; not used in current example
export function SortableOverlay({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

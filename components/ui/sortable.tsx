// src/components/ui/sortable.tsx

"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,  
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils"; // Make sure this path is correct for your project

/* -----------------------------------------------------------------------------
 * Sortable
 * -------------------------------------------------------------------------- */

type SortableContextProps = {
  items: { id: string; [key: string]: any }[];
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
};

const Sortable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof sortableVariants> & {
      value: any[];
      onValueChange: React.Dispatch<React.SetStateAction<any[]>>;
      getItemValue: (item: any) => string;
      children: React.ReactNode;
    }
>(
  (
    {
      className,
      value,
      onValueChange,
      getItemValue,
      orientation = "vertical",
      children,
      ...props
    },
    ref
  ) => {
    const [active, setActive] = React.useState<any | null>(null);
    const activeItem = React.useMemo(
      () => value.find((item) => getItemValue(item) === active?.id),
      [active, value, getItemValue]
    );

    const sensors = useSensors(
      useSensor(MouseSensor),
      useSensor(TouchSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragStart = React.useCallback(
      (event: DragStartEvent) => {
        setActive(event.active);
      },
      [setActive]
    );

    const handleDragEnd = React.useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
          const oldIndex = value.findIndex(
            (item) => getItemValue(item) === active.id
          );
          const newIndex = value.findIndex(
            (item) => getItemValue(item) === over.id
          );
          const newValue = [...value];
          newValue.splice(newIndex, 0, ...newValue.splice(oldIndex, 1));
          onValueChange(newValue);
        }

        setActive(null);
      },
      [value, onValueChange, getItemValue]
    );

    const handleDragCancel = React.useCallback(() => {
      setActive(null);
    }, [setActive]);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={value.map((item) => getItemValue(item))}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={ref}
            className={cn(sortableVariants({ orientation }), className)}
            {...props}
          >
            {children}
          </div>
        </SortableContext>
        <DragOverlay>{active ? children : null}</DragOverlay>
      </DndContext>
    );
  }
);
Sortable.displayName = "Sortable";

/* -----------------------------------------------------------------------------
 * Sortable Item
 * -------------------------------------------------------------------------- */

const sortableItemVariants = cva("", {
  variants: {
    isDragging: {
      true: "opacity-50",
    },
  },
});

const SortableItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof sortableItemVariants> & {
      value: string;
      asChild?: boolean;
    }
>(({ className, asChild = false, value, ...props }, ref) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: value });

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={(node) => {
        setNodeRef(node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cn(sortableItemVariants({ isDragging }), className)}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
      }}
      {...attributes}
      {...props}
    >
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          // Check if the child is a SortableItemHandle to apply listeners
          // @ts-ignore
          if (child.type.displayName === "SortableItemHandle") {
            return React.cloneElement(child, {
              listeners: listeners,
            });
          }
        }
        return child;
      })}
    </Comp>
  );
});
SortableItem.displayName = "SortableItem";

/* -----------------------------------------------------------------------------
 * Sortable Item Handle
 * -------------------------------------------------------------------------- */

const SortableItemHandle = React.forwardRef<
  any,
  React.HTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    listeners?: ReturnType<typeof useSortable>["listeners"];
  }
>(({ className, asChild = false, listeners, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      className={cn("cursor-grab", className)}
      {...listeners}
      {...props}
    />
  );
});
SortableItemHandle.displayName = "SortableItemHandle";

/* -----------------------------------------------------------------------------
 * Sortable Content
 * -------------------------------------------------------------------------- */

const SortableContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return <Comp ref={ref} className={cn(className)} {...props} />;
});
SortableContent.displayName = "SortableContent";

/* -----------------------------------------------------------------------------
 * Sortable Overlay
 * -------------------------------------------------------------------------- */

const SortableOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => {
  return (
    <DragOverlay>
      <div
        ref={ref}
        className={cn("rounded-md border bg-accent shadow-lg", className)}
        {...props}
      >
        {children}
      </div>
    </DragOverlay>
  );
});
SortableOverlay.displayName = "SortableOverlay";

/* -----------------------------------------------------------------------------
 * Variants
 * -------------------------------------------------------------------------- */

const sortableVariants = cva("flex", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

export {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
};
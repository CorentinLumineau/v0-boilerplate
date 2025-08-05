"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { cn } from '@/lib/utils'

interface ResponsiveModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  contentClassName?: string
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  contentClassName
}: ResponsiveModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile: Use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={description}
        className={className}
      >
        <div className={cn("space-y-4", contentClassName)}>
          {children}
          {footer && (
            <div className="flex justify-between gap-2 pt-4 border-t">
              {footer}
            </div>
          )}
        </div>
      </BottomSheet>
    )
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={isOpen} onOpenChange={value => !value && onClose()}>
      <DialogContent className={cn("sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col", className)}>
        {(title || description) && (
          <DialogHeader className="flex-shrink-0">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        
        <div className={cn("overflow-y-auto flex-1", contentClassName)}>
          {children}
        </div>
        
        {footer && (
          <DialogFooter className="flex-shrink-0">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
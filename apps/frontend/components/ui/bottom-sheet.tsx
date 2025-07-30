import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const isTransitioning = useRef(false);
  
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    console.log('🎯 BottomSheet: Backdrop click detected', {
      target: e.target,
      currentTarget: e.currentTarget,
      isBackdrop: e.target === e.currentTarget,
      targetTagName: (e.target as Element)?.tagName,
      targetClassName: (e.target as Element)?.className,
      isTransitioning: isTransitioning.current
    });
    
    // Don't close if we're in the middle of a transition (tab switching)
    if (isTransitioning.current) {
      console.log('🚫 BottomSheet: Backdrop click ignored - transition in progress');
      return;
    }
    
    if (e.target === e.currentTarget) {
      console.log('❌ BottomSheet: Closing via backdrop click');
      onClose();
    }
  };

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('👆 BottomSheet: Click outside detected', {
        target: event.target,
        targetTagName: (event.target as Element)?.tagName,
        targetClassName: (event.target as Element)?.className,
        targetId: (event.target as Element)?.id,
        sheetRefExists: !!sheetRef.current,
        isOpen,
        targetInDocument: document.contains(event.target as Node),
        targetInSheet: sheetRef.current?.contains(event.target as Node)
      });

      // Prevent closing if a popover is open (global flag)
      if (typeof window !== 'undefined' && (window as unknown as { __popoverOpen?: boolean }).__popoverOpen) {
        console.log('🚫 BottomSheet: Popover is open, ignoring click outside');
        return;
      }
      
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node) && isOpen) {
        console.log('❌ BottomSheet: Closing via click outside - target not in sheet');
        onClose();
      } else {
        console.log('✅ BottomSheet: Click inside sheet, not closing');
      }
    };

    if (isOpen) {
      console.log('🎯 BottomSheet: Adding click outside listener');
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      console.log('🎯 BottomSheet: Removing click outside listener (not open)');
    }

    return () => {
      console.log('🧹 BottomSheet: Cleanup - removing click outside listener');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle keyboard escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        console.log('❌ BottomSheet: Closing via Escape key');
        onClose();
      }
    };

    console.log('⌨️ BottomSheet: Adding escape key listener');
    window.addEventListener('keydown', handleEscape);
    return () => {
      console.log('🧹 BottomSheet: Cleanup - removing escape key listener');
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Detect content changes (tab transitions) and mark as transitioning
  useEffect(() => {
    if (isOpen) {
      isTransitioning.current = true;
      console.log('🔄 BottomSheet: Content changed, marking as transitioning');
      
      const timeoutId = setTimeout(() => {
        isTransitioning.current = false;
        console.log('✅ BottomSheet: Transition period ended');
      }, 300); // Allow 300ms for transitions to complete
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [children, isOpen]);

  // Prevent scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;
    
    if (deltaY < 0) return; // Prevent dragging up
    
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Calculate if we should close the sheet
    const deltaY = currentY.current - startY.current;
    
    console.log('👋 BottomSheet: Touch end', { deltaY, shouldClose: deltaY > 100 });
    
    if (deltaY > 100) {
      // Close the sheet if dragged down sufficiently
      console.log('❌ BottomSheet: Closing via swipe down gesture');
      onClose();
    } else if (sheetRef.current) {
      // Reset position with animation
      sheetRef.current.style.transition = 'transform 0.3s ease';
      sheetRef.current.style.transform = 'translateY(0)';
      
      // Remove the transition after it completes
      setTimeout(() => {
        if (sheetRef.current) {
          sheetRef.current.style.transition = '';
        }
      }, 300);
    }
  };

  if (!isOpen) return null;

  // Render overlay and sheet in a portal to <body>
  return ReactDOM.createPortal(
    <div 
      className={`fixed inset-0 flex items-end justify-center sm:hidden`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "relative w-full max-h-[90vh] bg-background rounded-t-xl flex flex-col overflow-hidden shadow-lg transition-transform duration-300",
          isOpen ? "translate-y-0" : "translate-y-full",
          isDragging ? "transition-none" : "",
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full dark:bg-gray-600" />
        </div>

        {/* Header with title and optional subtitle */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center flex-wrap gap-1">
            {typeof title === 'string' ? <h2 className="text-lg font-semibold">{title}</h2> : title}
            {subtitle && <div>{subtitle}</div>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log('❌ BottomSheet: Closing via close button click');
              onClose();
            }}
            className="h-8 w-8 rounded-full flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 overscroll-contain">
          {children}
        </div>
      </div>
    </div>,
    typeof window !== 'undefined' ? document.body : (null as unknown as Element)
  );
} 
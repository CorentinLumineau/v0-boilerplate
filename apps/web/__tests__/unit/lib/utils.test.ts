import { describe, it, expect } from '@jest/globals';
import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toBe('base-class additional-class');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class active-class');
    });

    it('should handle falsy conditional classes', () => {
      const isActive = false;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle objects with boolean values', () => {
      const result = cn({
        'active': true,
        'disabled': false,
        'visible': true,
      });
      expect(result).toBe('active visible');
    });

    it('should merge tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-3'); // px-3 should override px-2
      expect(result).toBe('py-1 px-3');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'other-class');
      expect(result).toBe('base-class other-class');
    });

    it('should handle empty strings', () => {
      const result = cn('base-class', '', 'other-class');
      expect(result).toBe('base-class other-class');
    });

    it('should deduplicate identical classes', () => {
      const result = cn('duplicate', 'unique', 'duplicate');
      expect(result).toBe('duplicate unique');
    });

    it('should handle complex scenarios', () => {
      const variant = 'primary';
      const size = 'lg';
      const isDisabled = false;
      
      const result = cn(
        'base-button',
        {
          'btn-primary': variant === 'primary',
          'btn-secondary': variant === 'secondary',
          'btn-lg': size === 'lg',
          'btn-sm': size === 'sm',
          'disabled': isDisabled,
        },
        'additional-class'
      );
      
      expect(result).toBe('base-button btn-primary btn-lg additional-class');
    });
  });
});
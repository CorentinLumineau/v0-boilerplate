/**
 * Tests for UI utilities
 */

import { cn } from '@/lib/utils'

describe('UI Utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
    })

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class', false && 'hidden-class')).toBe('base-class conditional-class')
    })

    it('should handle undefined and null values', () => {
      expect(cn('base-class', undefined, null, 'other-class')).toBe('base-class other-class')
    })

    it('should merge tailwind classes and resolve conflicts', () => {
      expect(cn('bg-red-500 bg-blue-500')).toBe('bg-blue-500')
      expect(cn('p-4 p-2')).toBe('p-2')
    })

    it('should handle empty input', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
    })

    it('should handle array inputs', () => {
      expect(cn(['bg-red-500', 'text-white'])).toBe('bg-red-500 text-white')
    })

    it('should handle object inputs', () => {
      expect(cn({
        'bg-red-500': true,
        'text-white': true,
        'hidden': false
      })).toBe('bg-red-500 text-white')
    })

    it('should handle complex combinations', () => {
      expect(cn(
        'base-class',
        ['array-class-1', 'array-class-2'],
        {
          'object-class-1': true,
          'object-class-2': false
        },
        'final-class'
      )).toBe('base-class array-class-1 array-class-2 object-class-1 final-class')
    })

    it('should resolve Tailwind conflicts correctly', () => {
      expect(cn('px-4 py-2 px-6')).toBe('py-2 px-6')
      expect(cn('text-sm text-lg')).toBe('text-lg')
      expect(cn('bg-red-500 hover:bg-blue-500 bg-green-500')).toBe('hover:bg-blue-500 bg-green-500')
    })
  })
})
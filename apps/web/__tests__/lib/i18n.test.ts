/**
 * @jest-environment node
 */

import { getTranslation, translations } from '@/lib/i18n'
import type { Language } from '@/lib/i18n'

describe('i18n', () => {
  describe('translations object', () => {
    it('should contain English translations', () => {
      expect(translations.en).toBeDefined()
      expect(typeof translations.en).toBe('object')
      expect(translations.en.home).toBe('Home')
      expect(translations.en.theme).toBe('Theme')
    })

    it('should contain French translations', () => {
      expect(translations.fr).toBeDefined()
      expect(typeof translations.fr).toBe('object')
      expect(translations.fr.home).toBe('Accueil')
      expect(translations.fr.theme).toBe('Thème')
    })

    it('should have matching keys between languages', () => {
      const enKeys = Object.keys(translations.en)
      const frKeys = Object.keys(translations.fr)
      
      expect(enKeys.sort()).toEqual(frKeys.sort())
    })

    it('should contain expected common keys', () => {
      const expectedKeys = [
        'home', 'theme', 'light', 'dark', 'system', 'logout',
        'language', 'english', 'french', 'settings', 'notifications'
      ]
      
      expectedKeys.forEach(key => {
        expect(translations.en[key]).toBeDefined()
        expect(translations.fr[key]).toBeDefined()
        expect(translations.en[key]).not.toBe('')
        expect(translations.fr[key]).not.toBe('')
      })
    })
  })

  describe('getTranslation function', () => {
    it('should return correct English translation', () => {
      const result = getTranslation('en', 'home')
      expect(result).toBe('Home')
    })

    it('should return correct French translation', () => {
      const result = getTranslation('fr', 'home')
      expect(result).toBe('Accueil')
    })

    it('should return key when translation not found', () => {
      const result = getTranslation('en', 'nonexistent_key')
      expect(result).toBe('nonexistent_key')
    })

    it('should return key when language not found', () => {
      const result = getTranslation('es' as Language, 'home')
      expect(result).toBe('home')
    })

    it('should handle empty key', () => {
      const result = getTranslation('en', '')
      expect(result).toBe('')
    })

    it('should return specific translations correctly', () => {
      expect(getTranslation('en', 'light')).toBe('Light')
      expect(getTranslation('en', 'dark')).toBe('Dark')
      expect(getTranslation('en', 'system')).toBe('System')
      expect(getTranslation('fr', 'light')).toBe('Clair')
      expect(getTranslation('fr', 'dark')).toBe('Sombre')
      expect(getTranslation('fr', 'system')).toBe('Système')
    })

    it('should handle notification-related translations', () => {
      expect(getTranslation('en', 'notifications')).toBe('Notifications')
      expect(getTranslation('en', 'markAllAsRead')).toBe('Mark all as read')
      expect(getTranslation('en', 'noNotifications')).toBe('No notifications yet')
      expect(getTranslation('fr', 'notifications')).toBe('Notifications')
      expect(getTranslation('fr', 'markAllAsRead')).toBe('Tout marquer comme lu')
      expect(getTranslation('fr', 'noNotifications')).toBe('Aucune notification pour le moment')
    })

    it('should handle complex translations with special characters', () => {
      expect(getTranslation('en', 'wip')).toBe('This boilerplate is currently in WIP')
      expect(getTranslation('fr', 'wip')).toBe('Ce modèle est actuellement en cours de développement')
    })
  })
})
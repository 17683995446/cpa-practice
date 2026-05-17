import { describe, it, expect } from 'vitest'
import { formatNumber, calculateAccuracy, getDifficultyText, getDifficultyColor } from './utils'

describe('utils', () => {
  describe('formatNumber', () => {
    it('should format numbers with thousands separator', () => {
      expect(formatNumber(1234)).toBe('1,234')
      expect(formatNumber(1000000)).toBe('1,000,000')
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('calculateAccuracy', () => {
    it('should calculate accuracy correctly', () => {
      expect(calculateAccuracy(8, 10)).toBe(80)
      expect(calculateAccuracy(5, 10)).toBe(50)
      expect(calculateAccuracy(0, 0)).toBe(0)
      expect(calculateAccuracy(100, 100)).toBe(100)
    })
  })

  describe('getDifficultyText', () => {
    it('should return correct difficulty text', () => {
      expect(getDifficultyText('easy')).toBe('简单')
      expect(getDifficultyText('medium')).toBe('中等')
      expect(getDifficultyText('hard')).toBe('困难')
    })
  })

  describe('getDifficultyColor', () => {
    it('should return correct color classes', () => {
      expect(getDifficultyColor('easy')).toContain('green')
      expect(getDifficultyColor('medium')).toContain('amber')
      expect(getDifficultyColor('hard')).toContain('red')
    })
  })
})

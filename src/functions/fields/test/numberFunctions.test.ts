import {
  getLeverageFromSlider,
  getLeverageFromValues,
  getLeverageRatio,
  getMaxBorrowValue,
} from 'functions/fields'
import { position } from 'mocks/position'
import { vault } from 'mocks/vault'

describe('getMaxBorrowValue', () => {
  test('should return 0 when netValue = 0', () => {
    vault.ltv.contract = 0.5
    position.values.net = 0

    const maxBorrowValue = getMaxBorrowValue(vault, position)
    expect(maxBorrowValue).toBe(0)
  })

  test('should return 0 when maxLTV = 0', () => {
    vault.ltv.contract = 0
    position.values.net = 100

    const maxBorrowValue = getMaxBorrowValue(vault, position)
    expect(maxBorrowValue).toBe(0)
  })

  test('should return 1x netValue when maxLTV = 0.5', () => {
    vault.ltv.contract = 0.5
    position.values.net = 100

    const maxBorrowValue = getMaxBorrowValue(vault, position)
    expect(maxBorrowValue).toBe(100)
  })

  test('should return 4.5x netValue when maxLTV = ', () => {
    vault.ltv.contract = 0.75
    position.values.net = 100

    const maxBorrowValue = getMaxBorrowValue(vault, position)
    expect(maxBorrowValue).toBe(300)
  })
})

describe('getLeverageFromSlider', () => {
  test('should return 1 when percentage = 0 and maxLeverage = 2', () => {
    const leverage = getLeverageFromSlider(0, 2)
    expect(leverage).toBe(1)
  })

  test('should return 2 when percentage = 100 and maxLeverage = 2', () => {
    const leverage = getLeverageFromSlider(100, 2)
    expect(leverage).toBe(2)
  })

  test('should return 1.8 when percentage = 40 and maxLeverage = 3', () => {
    const leverage = getLeverageFromSlider(40, 3)
    expect(leverage).toBe(1.8)
  })
})

describe('getLeverageFromValues', () => {
  const values = {
    primary: 0,
    secondary: 0,
    borrowedPrimary: 0,
    borrowedSecondary: 0,
    net: 0,
    total: 0,
  }

  test('should return 1 when borrowed = 0', () => {
    const leverage = getLeverageFromValues(values)
    expect(leverage).toBe(1)
  })

  test('should return 1.5 when borrowed = 50 and net = 100', () => {
    values.borrowedPrimary = 50
    values.net = 100
    const leverage = getLeverageFromValues(values)
    expect(leverage).toBe(1.5)
  })

  test('should return 2.25 when borrowed = 125 and net = 100', () => {
    values.borrowedPrimary = 125
    values.net = 100
    const leverage = getLeverageFromValues(values)
    expect(leverage).toBe(2.25)
  })
})

describe('getLeverageRatio', () => {
  test('should return 100 when leverageLimit = maxLeverage', () => {
    const ratio = getLeverageRatio(0, 0)
    expect(ratio).toBe(100)
  })

  test('should return 66.7 when leverageLimit = 2 and maxLeverage = 2.5', () => {
    const ratio = getLeverageRatio(2, 2.5)
    expect(ratio).toBeCloseTo(66.666)
  })

  test('should return 0 when leverageLimit = 1 and maxLeverage = 2', () => {
    const ratio = getLeverageRatio(1, 2)
    expect(ratio).toBe(0)
  })
})

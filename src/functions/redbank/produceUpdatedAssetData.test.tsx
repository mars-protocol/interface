import { redBankAssets } from 'mocks'
import { ViewType } from 'types/enums'

import { produceUpdatedAssetData } from './produceUpdatedAssetData'

describe('produceUpdatedAssetData', () => {
  test('should return only the target asset when assetData is empty', () => {
    const assets = produceUpdatedAssetData(
      redBankAssets,
      [],
      'ATOM',
      100,
      ViewType.Deposit,
      'borrowBalanceBaseCurrency',
    )
    expect(assets.length).toBe(1)
    expect(assets[0]).toEqual({
      ...redBankAssets[0],
      borrowBalanceBaseCurrency: 100,
    })
  })
  test('should return ATOM and OSMO when ATOM is in assetData, and OSMO is added', () => {
    const assets = produceUpdatedAssetData(
      redBankAssets,
      [redBankAssets[0]],
      'OSMO',
      100,
      ViewType.Deposit,
      'borrowBalanceBaseCurrency',
    )
    expect(assets.length).toBe(2)
    expect(assets[1]).toEqual({
      ...redBankAssets[1],
      borrowBalanceBaseCurrency: 100,
    })
  })
  test('should return ATOM and OSMO when ATOM and OSMO is in assetData, and OSMO is added', () => {
    const assets = produceUpdatedAssetData(
      redBankAssets,
      redBankAssets,
      'OSMO',
      100,
      ViewType.Deposit,
      'borrowBalanceBaseCurrency',
    )
    expect(assets.length).toBe(2)
    expect(assets[1]).toEqual({
      ...redBankAssets[1],
      borrowBalanceBaseCurrency: 200,
    })
  })

  describe('when depositing', () => {
    test('should increase ATOM depositBalance to 150 when depositing 50 and already has 100 balance', () => {
      const assets = produceUpdatedAssetData(
        redBankAssets,
        [redBankAssets[0]],
        'ATOM',
        50,
        ViewType.Deposit,
        'depositBalanceBaseCurrency',
      )
      expect(assets.length).toBe(1)
      expect(assets[0]).toEqual({
        ...redBankAssets[0],
        depositBalanceBaseCurrency: redBankAssets[0].depositBalanceBaseCurrency + 50,
      })
    })
    test('should increase OSMO depositBalance to 100 from 0 when no OSMO present', () => {
      const assets = produceUpdatedAssetData(
        redBankAssets,
        [],
        'OSMO',
        100,
        ViewType.Deposit,
        'depositBalanceBaseCurrency',
      )
      expect(assets.length).toBe(1)
      expect(assets[0]).toEqual({
        ...redBankAssets[1],
        depositBalanceBaseCurrency: 100,
      })
    })
  })

  describe('when borrowing', () => {
    test('should increase ATOM depositBalance to 150 when borrowing 50 and already has 100 balance', () => {
      const assets = produceUpdatedAssetData(
        redBankAssets,
        [redBankAssets[0]],
        'ATOM',
        50,
        ViewType.Borrow,
        'borrowBalanceBaseCurrency',
      )
      expect(assets.length).toBe(1)
      expect(assets[0]).toEqual({
        ...redBankAssets[0],
        borrowBalanceBaseCurrency: redBankAssets[0].borrowBalanceBaseCurrency + 50,
      })
    })
    test('should increase OSMO depositBalance to 100 from 0 when no OSMO present', () => {
      const assets = produceUpdatedAssetData(
        redBankAssets,
        [],
        'OSMO',
        100,
        ViewType.Borrow,
        'borrowBalanceBaseCurrency',
      )
      expect(assets.length).toBe(1)
      expect(assets[0]).toEqual({
        ...redBankAssets[1],
        borrowBalanceBaseCurrency: 100,
      })
    })
  })

  describe('when repaying', () => {
    test('should return 0 ATOM when repaying with 100 ATOM', () => {
      const assets = produceUpdatedAssetData(
        redBankAssets,
        [redBankAssets[0]],
        'ATOM',
        100,
        ViewType.Repay,
        'borrowBalanceBaseCurrency',
      )
      expect(assets.length).toBe(1)
      expect(assets[0]).toEqual({
        ...redBankAssets[0],
        borrowBalanceBaseCurrency: 0,
      })
    })
  })
})

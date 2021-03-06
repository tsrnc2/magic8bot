import { SMA } from './sma'
import { candles } from './spec.helper'

describe('SMA', () => {
  it('should calculate the correct sma', () => {
    const sma = SMA.calculate(candles.slice(1, 15), 14)
    expect(sma).toEqual(17.404285714285717)
  })
})

import { dbDriver, wsServer, StrategyConfig } from '@lib'
import { SessionStore } from './session.store'
import { StoreOpts } from '@m8bTypes'

const singleton = Symbol()

type StrategyOpts = Record<string, string | number | boolean>

export class StrategyStore {
  public static get instance(): StrategyStore {
    /* istanbul ignore next */
    if (!this[singleton]) this[singleton] = new StrategyStore()
    return this[singleton]
  }

  private readonly sessionId = SessionStore.instance.sessionId

  private get store() {
    return dbDriver.strategy
  }

  private constructor() {
    wsServer.registerAction('strategy-save', (strategyConfig: StrategyConfig) => {
      this.save(strategyConfig)
    })

    wsServer.registerAction('strategy-load', (storeOpts: StoreOpts) => {
      const strategyOpts = this.load(storeOpts)
      wsServer.broadcast('strategy-load', strategyOpts)
    })
  }

  public async save(strategyConfig: StrategyConfig) {
    const { exchange, symbol, strategy, ...stratConf } = strategyConfig
    await this.store.update({ sessionId: this.sessionId, exchange, symbol, strategy }, { $set: { ...stratConf } }, { upsert: true })
  }

  public async load(storeOpts: StoreOpts) {
    return this.store.findOne({ sessionId: this.sessionId, ...storeOpts }, { projection: { _id: 0, sessionId: 0 } })
  }

  public async loadAll() {
    return this.store.find({ sessionId: this.sessionId }, { projection: { _id: 0, sessionId: 0 } }).toArray()
  }

  public async loadAllForExchange(exchange: string) {
    return this.store.find({ sessionId: this.sessionId, exchange }, { projection: { _id: 0, sessionId: 0 } }).toArray()
  }

  public delete(exchange: string, symbol: string, strategy: string) {
    return this.store.deleteOne({ sessionId: this.sessionId, exchange, symbol, strategy })
  }

  public deleteAllForExchange(exchange: string) {
    return this.store.deleteMany({ sessionId: this.sessionId, exchange })
  }
}

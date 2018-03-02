/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import { getStore as defaultGetStore } from '../store'
import { normalizeMap } from '../helpers'

export default function connect(states, actions, getStore = defaultGetStore) {
  return function connectComponent(Component) {
    const onLoad = Component.prototype.onLoad
    const onUnload = Component.prototype.onUnload

    let store, unSubscribe

    return class extends Component {
      constructor() {
        super()

        function mapState(states) {
          const res = {}

          normalizeMap(states).forEach(({ key, val }) => {
            res[key] = function mappedState() {
              if (store) {
                const state = store.getState()
                return typeof val === 'function' ? val.call(this, state) : state[val]
              }
            }
          })

          return res
        }

        function mapActions(actions) {
          const res = {}
          normalizeMap(actions).forEach(({ key, val }) => {
            res[key] = function mappedAction(...args) {
              let dispatchParam
              if (typeof val === 'string') {
                // 如果是字符串代表是直接同步模式 一个 action 的名字而已
                dispatchParam = {
                  type: val,
                  // 修正一般情况下的参数 一般支持只传一个参数
                  // 如果真的是多个参数的话 那么 payload 就是参数组成的数组
                  payload: args.length > 1 ? args : args[0]
                }
              } else {
                // 如果说是函数 则先调用执行
                // 否则直接 dispatch 该值 例如说是个 promise
                dispatchParam = typeof val === 'function' ? val.apply(store, args) : val
              }
              return store.dispatch(dispatchParam)
            }
          })
          return res
        }

        states = mapState(states || {})
        this.computed = Object.assign(this.computed || {}, states)

        actions = mapActions(actions || {})
        this.methods = Object.assign(this.methods || {}, actions)
      }

      onLoad() {
        store = getStore.call(this)

        const onStateChange = () => {
          let hasChanged = false
          Object.keys(states).forEach(k => {
            const newV = states[k].call(this)
            if (this[k] !== newV) {
              this[k] = newV
              hasChanged = true
            }
          })
          hasChanged && this.$apply()
        }
        unSubscribe = store.subscribe(onStateChange)
        onStateChange()
        onLoad && onLoad.apply(this, arguments)
      }

      onUnload() {
        unSubscribe && unSubscribe()
        onUnload && onUnload.apply(this, arguments)
      }
    }
  }
}

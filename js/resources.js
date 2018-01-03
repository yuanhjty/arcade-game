/** @file resource.js
 *
 * TODO: 描述文件
 */

/**
 * 理资源对象
 */
let resources = {
  cache: {},
  readyCallbacks: [],

  /**
   * 加载并缓存url指定的资源，若url已注册，则不执行任何操作。
   * @param url {String}
   */
  load (url) {
    if (!this.cache[url]) {
      // 在cache层为所需资源注册位置，等资源加载完毕后完成资源绑定
      this.cache[url] = null

      let img = new Image()
      img.src = url
      img.onload = () => {
        // 资源加载完毕，绑定到之前注册的位置
        this.cache[url] = img

        // 每当加载完一个新的资源，就检查所需资源是否全部加载完毕，
        // 一旦所需资源全部加载完毕，就执行所有已注册的回调函数。
        if (this.isReady()) {
          this.readyCallbacks.forEach((callback) => {
            callback()
          })
        }
      }
    }
  },

  /**
   * 判断需要加载的资源是否全部完成加载和缓存
   * @returns {Boolean}
   */
  isReady () {
    let ready = true
    let cacheKeys = Object.keys(this.cache)
    for (let k of cacheKeys) {
      if (!this.cache[k]) {
        ready = false
      }
    }
    return ready
  },

  /**
   * 若调用get(url)时资源还未加载完成，则返回值(null)无效。
   * @param url
   * @returns {Object} 返回绑定到url资源的DOM元素
   */
  get (url) {
    return this.cache[url]
  },

  /**
   * 注册资源加载完成时需要执行的回调函数
   * @param callback
   */
  onReady (callback) {
    if (!this.readyCallbacks.find(callback)) {
      this.readyCallbacks.push(callback)
    }
  }
}

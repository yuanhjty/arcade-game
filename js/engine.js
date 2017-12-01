/* Engine.js
 * 这个文件提供了游戏循环玩耍的功能（更新敌人和渲染）
 * 在屏幕上画出游戏面板，然后调用玩家和敌人对象的 update / render 函数（在 app.js 中定义的）
 *
 * 一个游戏引擎的工作过程就是不停的绘制整个游戏屏幕。
 * 当玩家在屏幕上移动的时候，看上去就是图片在移动或者被重绘。
 */

/**
 * @description 单例对象，控制游戏主循环、页面更新和重绘
 * @type {{lastTime: undefined, run: (function()), main: (function()), init: (function()), update: (function(*=)), render: (function())}}
 */
let engine = {
    lastTime: undefined,

    /**
     * @description 游戏启动方法
     */
    run() {
        let canvas = document.createElement('canvas');
        canvas.width = BlOCK_WIDTH * COLS_NUM;
        canvas.height = BlOCK_HEIGHT * ROWS_NUM + IMG_OFFSET_V;
        document.body.appendChild(canvas);
        window.ctx = canvas.getContext('2d');

        // 执行初始化例程
        this.init();

        // 启动主循环
        this.main();
    },

    /**
     * @description 游戏主循环例程
     */
    main() {
       let now = Date.now(),
           dt = (now - this.lastTime) / 1000.0;     // 用于Enemy对象的自动更新
       this.update(dt);
       this.render();
       this.lastTime = now;
       window.requestAnimationFrame(() => {this.main()});
    },

    /**
     * @description 游戏初始化例程
     */
    init() {
        this.loadResources(IMG_DIR, groundImages);
        resources.onReady(() => {
            ground.bindImages();
            ground.render();
        });

        this.loadResources(IMG_DIR, propImages);
        resources.onReady(() => {
            prop.bindImages();
            prop.render();
        });

        this.loadResources(IMG_DIR, spriteImages);
        resources.onReady(() => {
            Enemy.bindImage();
        });

        // 初始化engine
        this.lastTime = Date.now();
    },

    /**
     * @description 加载游戏资源
     * @param resourceDir {String} 资源目录
     * @param resourceNames {Object} 资源集合
     */
    loadResources(resourceDir, resourceNames) {
        let names = Object.values(resourceNames);
        for (let name of names) {
            resources.load(resourceDir + name);
        }
    },

    /**
     * @description 更新页面状态
     * @param dt {number} 本次与上次页面状态更新的时间间隔
     */
    update(dt) {
        prop.update();
        allEnemies.forEach((enemy) => {enemy.update(dt);});
        player.update();
    },

    /**
     * @description 页面渲染
     */
    render() {
        // render ground
        // 重绘静态对象的原因：覆盖动态对象之前的位置
        ground.render();

        // render prop
        prop.render();

        // render enemies
        allEnemies.forEach((enemy) => {enemy.render();});

        // render player
        player.render();
    }
};

// 启动游戏
engine.run();

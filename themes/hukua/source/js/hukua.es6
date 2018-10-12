const get = selector => document.querySelector(selector);

// 节流函数
const throttleFn = function (fn, interval, _this, args) {
    let timeId = null;
    return function () {
        if (timeId !== null)
            return;

        timeId = setTimeout(function () {
            fn.apply(this, args);
            timeId = null;
        }, interval);
    }
};

const ajaxGet = function (url) {
    return new Promise((resolve, reject) => {
        const DONE = 4;
        const OK = 200;

        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send(null);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject('ERROR:' + xhr.status);
                }
            }
        }
    });
};

const getShuffleIndexArr = function (n) {
    let count = 0;

    let arr = Array.from({ length: n }).map(() => {
        return count++;
    });

    for (let i = arr.length - 1; i >= 0; i--) {
        let randomIndex = Math.floor(Math.random() * (i + 1));

        let t = arr[randomIndex];
        arr[randomIndex] = arr[i];
        arr[i] = t;
    }

    return arr;
}

// 移动端菜单切换
{
    const header = get('#js-header');
    const menuTopbar = get('#js-mobile-topbar');
    const menuBtn = get('#js-menu-btn');
    const mobileMenuContainer = get('#js-mobile-menu-container');
    const mobileMenuWrapper = get('#js-mobile-menu-wrapper');

    const disableScroll = function (e) {
        e.preventDefault();
    };

    const enableMenu = function () {
        // fix移动端chrome地址栏栏造成的高度不准确
        mobileMenuWrapper.style.height = window.innerHeight + 'px';

        // 禁止滚动
        mobileMenuWrapper.addEventListener('touchmove', disableScroll);

        // 展开动画第一阶段开始时的高度
        let fromHeight = header.clientHeight - window.scrollY > menuTopbar.clientHeight ?
            header.clientHeight - window.scrollY :
            menuTopbar.clientHeight;

        // 展开动画
        mobileMenuContainer.style.height = fromHeight + 'px';
        let activeTl = new TimelineLite();
        activeTl.to(mobileMenuContainer, 0.2, {
            width: '100%',
            ease: Power1.easeOut
        }).to(mobileMenuContainer, 0.2, {
            height: '100%',
            ease: Power1.easeOut
        });
    };

    const disableMenu = function (e) {
        // 移除滚动锁定
        mobileMenuWrapper.removeEventListener('touchmove', disableScroll);

        // 如果点击链接，不处理
        if (e.target.nodeName === 'A')
            return;
        // 关闭动画第一阶段开始时的高度
        let toHeight = header.clientHeight - window.scrollY > menuTopbar.clientHeight ?
            header.clientHeight - window.scrollY :
            menuTopbar.clientHeight;

        // 关闭动画
        let activeTl = new TimelineLite();
        TweenLite.defaultEase = Power1.easeOut;
        activeTl.to(mobileMenuContainer, 0.2, {
            height: toHeight + 'px'
        }).to(mobileMenuContainer, 0.2, {
            width: 0
        });
    };

    menuBtn.addEventListener('click', enableMenu);
    mobileMenuWrapper.addEventListener('click', disableMenu);
}

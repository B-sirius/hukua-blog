'use strict';

let get = selector => document.querySelector(selector);

// 节流函数
let throttleFn = function(fn, interval, _this, args) {
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

// 移动端菜单切换
(function () {
    const mainContent = get('#js-main');
    const header = get('#js-header');
    const menuTopbar = get('#js-mobile-topbar');
    const menuBtn = get('#js-menu-btn');
    const mobileMenuContainer = get('#js-mobile-menu-container');
    const mobileMenuWrapper = get('#js-mobile-menu-wrapper');

    let disableScroll = function (e) {
        e.preventDefault();
    };

    let enableMenu = function () {
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
        activeTl.to(mobileMenuContainer, 0.4, {
            width: '100%',
            ease: Power1.easeOut
        }).to(mobileMenuContainer, 0.4, {
            height: '100%',
            ease: Power1.easeOut
        });
    };

    let disableMenu = function (e) {
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
        activeTl.to(mobileMenuContainer, 0.4, {
            height: toHeight + 'px'
        }).to(mobileMenuContainer, 0.4, {
            width: 0
        });
    };

    menuBtn.addEventListener('click', enableMenu);
    mobileMenuWrapper.addEventListener('click', disableMenu);
})();

// bgm播放
(function () {
    const audio = get('#js-audio');
    const musicBtn = get('#js-music-btn');
    const musicIcon = get('#js-music-icon')
    // bgm列表
    let bgmList = [
        'http://ws.stream.qqmusic.qq.com/200351087.m4a?fromtag=46',
        'http://ws.stream.qqmusic.qq.com/102879425.m4a?fromtag=46',
        'http://ws.stream.qqmusic.qq.com/5008974.m4a?fromtag=46',
        'http://ws.stream.qqmusic.qq.com/101100242.m4a?fromtag=46',
        'http://ws.stream.qqmusic.qq.com/102879431.m4a?fromtag=46',
        'http://ws.stream.qqmusic.qq.com/101100247.m4a?fromtag=46'
    ];
    // 状态
    let pause = true;
    let currIndex = Math.floor(Math.random() * bgmList.length);
    let playId = null;

    musicBtn.addEventListener('click', function () {
        if (!audio.src) {
            audio.src = bgmList[currIndex];
        }
        if (pause === true) {
            // 播放
            pause = false;
            audio.play();
            musicIcon.classList.add('active');

            // 监听播放进度
            playId = setInterval(function () {
                if (audio.currentTime >= audio.duration) {
                    currIndex = currIndex + 1 < bgmList.length ? currIndex + 1 : 0;
                    audio.src = bgmList[currIndex];
                    audio.play();
                }
            }, 1000);
        } else {
            // 暂停
            pause = true;
            audio.pause();
            musicIcon.classList.remove('active');

            // 移除监听
            clearInterval(playId);
            playId = null;
        }
    });
})();
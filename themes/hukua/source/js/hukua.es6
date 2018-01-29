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
        activeTl.to(mobileMenuContainer, 0.2, {
            width: '100%',
            ease: Power1.easeOut
        }).to(mobileMenuContainer, 0.2, {
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
        activeTl.to(mobileMenuContainer, 0.2, {
            height: toHeight + 'px'
        }).to(mobileMenuContainer, 0.2, {
            width: 0
        });
    };

    menuBtn.addEventListener('click', enableMenu);
    mobileMenuWrapper.addEventListener('click', disableMenu);
})();

// bgm播放
// (function () {
//     const audio = get('#js-audio');
//     const musicBtn = get('#js-music-btn');
//     const musicIcon = get('#js-music-icon')
//     // bgm列表
//     let bgmList = [
//         'http://m10.music.126.net/20180129185833/89d144ad084bd0029ec3003a3469f3b4/ymusic/8030/1713/95f8/146a2591a407fcb3dbdbb1b1938ba560.mp3',
//         'http://m10.music.126.net/20180129184209/8851f7b0784cf85d2a6be3d9f0b8c369/ymusic/4cc8/91ef/3c2c/025db66e0d92675da7c2ae540b90a32e.mp3',
//         'http://m10.music.126.net/20180129184124/a09c23c56a1aeeacef397ae1629ee9d5/ymusic/4906/91a6/675e/59aa99940f30f02675bff5fa5ff5ff3e.mp3',
//         'http://m10.music.126.net/20180129185740/0093ad3e7f5e0b90b736ff5013a9e9a0/ymusic/c770/b887/8747/6b0a81aa3396e838ef34e9212e4cea50.mp3',
//         'http://m10.music.126.net/20180129184536/06577f02f2778e0ed0550af9e8ec96ad/ymusic/9de7/d890/17f4/38ae61e09e626a971b0b7c9adacc5937.mp3',
//         'http://m10.music.126.net/20180129184614/9448041920828e1628d595bbbd917115/ymusic/5fef/7888/14f4/3c6899d2f2259c415ab514fa3fc9812a.mp3',
//         'http://m10.music.126.net/20180129184720/18a731558665b1661273381cf74b14d0/ymusic/1e7f/209f/0668/ac3ca003eeee128c7692a0c5d8a7de30.mp3',
//         'http://m10.music.126.net/20180129184945/0ce91691a38a7fb74b2b4b7275e9b183/ymusic/1336/c29a/89bb/27c145fecc0abffc627b9e57f73d0d7d.mp3',
//         'http://m10.music.126.net/20180129184635/38cd57b67b8bc4209c3480927bc39cf5/ymusic/7d4c/20bc/18e5/e4c30d6f47e8917633273ea5e0a345d2.mp3',
//         'http://m10.music.126.net/20180129184659/ed5a501ee4fc86afe29e7cd476a87621/ymusic/1570/209e/1c5a/98c1c35e70f8ba531c15fe4b2d708978.mp3',
//         'http://m10.music.126.net/20180129185351/2a7e5d6c323b9e43d8d14335fd181460/ymusic/91ce/9f03/1811/2846b1d7d6a335357c133cdc380ecb2b.mp3',
//         'http://m10.music.126.net/20180129184817/762d16dbcb567813171c4c2ec3459096/ymusic/2bed/c286/6785/456d379e6e7d8859323b71d45e63d9fa.mp3',
//         'http://m10.music.126.net/20180129185146/f9d6e76c27fb25e9068efd76e87ebce5/ymusic/d57d/2c95/041b/031c407f229e0376cbf96237bad53e78.mp3',
//         'http://m10.music.126.net/20180129184851/b93449ce51e0205aaa2d16fd7936061b/ymusic/aae2/f2ab/2602/57a54dc6ebe48175247f32a15a8bf167.mp3',
//         'http://m10.music.126.net/20180129185053/3cb671afb26934493b2a4cb100db111a/ymusic/88fc/87aa/fef1/be2222f63a85839a100802732e0e94bd.mp3',
//         'http://m10.music.126.net/20180129185110/58321714fadca89af27034fbe09b7ced/ymusic/2234/52a3/6e58/f665ca9dfd690c9446a85b7f0124e5a0.mp3',
//     ];
//     // 状态
//     let pause = true;
//     let currIndex = Math.floor(Math.random() * bgmList.length);
//     let playId = null;

//     musicBtn.addEventListener('click', function () {
//         if (!audio.src) {
//             audio.src = bgmList[currIndex];
//         }
//         if (pause === true) {
//             // 播放
//             pause = false;
//             audio.play();
//             musicIcon.classList.add('active');

//             // 监听播放进度
//             playId = setInterval(function () {
//                 if (audio.currentTime >= audio.duration) {
//                     currIndex = currIndex + 1 < bgmList.length ? currIndex + 1 : 0;
//                     audio.src = bgmList[currIndex];
//                     audio.play();
//                 }
//             }, 1000);
//         } else {
//             // 暂停
//             pause = true;
//             audio.pause();
//             musicIcon.classList.remove('active');

//             // 移除监听
//             clearInterval(playId);
//             playId = null;
//         }
//     });
// })();
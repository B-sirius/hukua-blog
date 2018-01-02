let get = selector => document.querySelector(selector);

// 移动端菜单切换
(function () {
    let mainContent = get('#js-main');
    let header = get('#js-header');
    let menuTopbar = get('#js-mobile-topbar');
    let menuBtn = get('#js-menu-btn');
    let mobileMenuContainer = get('#js-mobile-menu-container');
    let mobileMenuWrapper = get('#js-mobile-menu-wrapper');

    let disableScroll = function(e) {
        e.preventDefault();
    }

    let enableMenu = function () {
        // 禁止滚动
        mobileMenuWrapper.addEventListener('touchmove', disableScroll);

        console.log(mainContent.onscroll);

        // 展开动画第一阶段开始时的高度
        let fromHeight = header.clientHeight - window.scrollY > menuTopbar.clientHeight ?
            header.clientHeight - window.scrollY :
            menuTopbar.clientHeight;

        // 展开动画
        mobileMenuContainer.style.height = fromHeight + 'px';
        let activeTl = new TimelineLite();
        TweenLite.defaultEase = Power1.easeOut;
        activeTl.to(mobileMenuContainer, 0.4, {
            width: '100%',
        }).to(mobileMenuContainer, 0.4, {
            height: '100%'
        });
    }

    let disableMenu = function(e) {
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
    }

    menuBtn.addEventListener('click', enableMenu);
    mobileMenuWrapper.addEventListener('click', disableMenu);
})();
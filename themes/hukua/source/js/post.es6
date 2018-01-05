'use strict';

// 初始化边栏目录
(function() {
    const stickyTop = 50;
    const tocWrapper = get('#js-toc-wrapper');
    const header = get('#js-header');
    const article = get('.markdown-body');
    const tocLevel2List = document.getElementsByClassName('toc-level-2');
    const tocLinkList = document.getElementsByClassName('toc-link');

    // 按序获得所有标题节点
    const titleList = [];
    {
        let targetNodeName = ['H2','H3','H4','H5','H6'];
        for (let item of article.children) {
            for (let nodeName of targetNodeName) {
                if (item.nodeName === nodeName) {
                    titleList.push(item);
                    break;
                }
            }
        }
    }
    
    // 将tocChild中所有的tocLink与其建立引用
    {
        let markTocLink = function(tocChild) {
            let links = tocChild.getElementsByClassName('toc-link');
            for (let item of links) {
                item.dataTocChild = tocChild;
            }
        }
        for (let item of tocLevel2List) {
            for (let child of item.children) {
                if (child.classList.contains('toc-child')) {
                    markTocLink(child);
                }
            }
        }
    }
    
    // 更新正在阅读的目录标题的方法
    let currTitle = null;
    let updateCurrTitle = function() {
        for (let i = 0, len = titleList.length - 1; i < len; i++) {
            let itemRect = titleList[i].getBoundingClientRect(),
            nextItemRect = titleList[i+1].getBoundingClientRect();
            if (itemRect.top - 15 > 0) {
                if (i === 0) {
                    currTitle = titleList[i];
                    return;
                }
            }
            else if (itemRect.top - 15 < 0) {
                if (nextItemRect.top - 15 > 0) {
                    currTitle = titleList[i];
                    return;
                }
                else if (i === len - 2) {
                    currTitle = titleList[i];
                    return;
                }
            }
        }
        console.warn('目录更新失败');
    }

    // 同步目录阅读位置的方法
    let syncToc = function() {
        let titleId = currTitle.id;
        for (let tocLink of tocLinkList) {
            if (tocLink.getAttribute('href') === '#' + titleId) {
                tocLink.classList.add('active');
                if (lastTocLink && lastTocLink !== tocLink) {
                    lastTocLink.classList.remove('active');
                }
                lastTocLink = tocLink;
                if (lastTocChild && lastTocChild !== tocLink.dataTocChild) {
                    lastTocChild.classList.remove('active');
                }
                if (tocLink.dataTocChild) {
                    tocLink.dataTocChild.classList.add('active');
                    lastTocChild = tocLink.dataTocChild;
                }
                break;
            }
        }
    }

    // 记录目录状态
    let lastTocChild = null;
    let lastTocLink = null;
    // 边栏目录sticky效果的方法
    let setTocPos = function() {
        let HeaderRect = header.getBoundingClientRect();
        if (HeaderRect.bottom >= 0) {
            TweenMax.to(tocWrapper, 0.6, {
                top: stickyTop + 'px',
                ease: Back.easeOut.config(1)
            });
        } else {
            TweenMax.to(tocWrapper, 0.6, {
                top: stickyTop - HeaderRect.bottom + 'px',
                ease: Back.easeOut.config(1)
            });
        }
    };
    
    // 初始化
    updateCurrTitle();
    syncToc();
    setTocPos();

    // 滚动停止500ms后才更新边栏
    let timeId = null;    
    window.addEventListener('scroll', function() {
        clearTimeout(timeId);
        timeId = setTimeout(function() {
            updateCurrTitle();
            syncToc();
            setTocPos();
        }, 500);
    });
})();
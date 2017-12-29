---
title: 键盘Tab与鼠标Click————可访问性与美观的平衡点
date: 2017-07-18 19:15:36
tags: [css]
categories: 前端
---

# 键盘Tab与鼠标Click——可访问性与美观的平衡点

## 问题

作为重视可访问性与还原度的开发者，如何处理被focus的元素的outline可以说是逼死强迫症：`outline: none`显然太不优雅，对于使用tab键来定位的用户直接就是抓瞎。但是不作处理，在Click时就会产生蓝色outline边框，容易打破页面整体风格。在折腾了很久后，俺并未能完全解决问题，不过找到了一个可以参考的平衡点：

## 场景

回顾一下这种两难问题在何时会出现？我觉得有：

1. 功能型按钮，即按下后不会立即跳转页面，而是进行某种操作
2. 各种输入框，包括文本输入框，单选框，复选框

虽然很常见，但种类好像无非就是这两种(•ㅂ•)/

## 解决方案

### 按钮

在尝试使用`<button>`,`<input type="button">`,`<a href="javascript:">`这三种标签来还原按钮时，俺发现`<a>`标签居然在默认情况下，click后不会出现outline，同时tab的outline高亮一样有效！这并不是说`<a>`标签点击后不会被focus，从我的三者对比小实验上就能看出focus效果对于他们是一视同仁的：

<p data-height="262" data-theme-id="dark" data-slug-hash="RgmBPK" data-default-tab="html,result" data-user="padfoot_07" data-embed-version="2" data-pen-title="三种按钮实现" class="codepen">See the Pen <a href="https://codepen.io/padfoot_07/pen/RgmBPK/">三种按钮实现</a> by Zhouyi (<a href="https://codepen.io/padfoot_07">@padfoot_07</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

这也就说明，通过tab聚焦元素，的确会使元素被focus，但是outline高亮却不是由这个focus产生的！可惜的是我搜寻了许久，也未能发现这个outline效果与任何开发者可控制的html, css, js直接关联.......也正是如此我才说未能完全解决问题。不过至少，考虑到`<a>`标签的良好兼容性，用其来实现按钮是完全可以接受的，在默认情况下就可以做到只有tab才触发outline。事实上，许多访问性良好的站点，如[阅文集团](http://www.yuewen.com/)的官网就是这么做的。

### 输入框

可惜输入框并不像按钮这么方便，不过从另一个角度想，一般只有较为定制化的输入框才会遇到这里讨论的问题，而定制化的输入框往往都会有focus的特殊状态，方便用户去填写，真的要担心的其实是使用label导致的无法聚焦问题，可以参考张鑫旭老师的 [CSS :focus伪类JS focus事件提高网站键盘可访问性](http://www.zhangxinxu.com/wordpress/2017/04/css-focus-js-improve-accessibility-keyboard/) ，这是另话了。

---

这篇短小的水文与其说是提出一个折中的解决方法，更是希望能有一天能搞清上文提出的问题。现在有一些框架还是在使用js来彻底解决这个问题，感觉实在不是很舒服啊 (´c_`)
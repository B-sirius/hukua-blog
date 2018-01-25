---
title: 数学没学好，动画没头脑——transform篇
date: 2017-12-19 20:08:05
tags: [transform,三角函数,rotate,matrix矩阵]
categories: 前端
description: 在俺的《当我们讨论动画时，我们在讨论什么——transform篇》水文中，对于transform属性的matrix值，我曾写下了这样的话：“我们可以方便的从`rotate`值计算出`matrix`值，但是想要反过来（主要是获得rotate值，涉及到三角函数）却很不精确，暂时不考虑这种方法”。我之所以能如此大言不惭的得出这个结论，大概是因为 velocity.js 没有对 rotate 做足够的优化，我也就想着“连如此知名的动画库都没有做，大概是没有好的解决方法吧”，心安理得的将这个问题搁置一边了...
---
在俺的[《当我们讨论动画时，我们在讨论什么——transform篇》](http://b-sirius.me/2017/04/19/%E5%8A%A8%E7%94%BBtransform%E7%AF%87/)水文中，对于transform属性的matrix值，我曾写下了这样的话：“我们可以方便的从`rotate`值计算出`matrix`值，但是想要反过来（主要是获得rotate值，涉及到三角函数）却很不精确，暂时不考虑这种方法”。我之所以能如此大言不惭的得出这个结论，大概是因为 velocity.js 没有对 rotate 做足够的优化，我也就想着“连如此知名的动画库都没有做，大概是没有好的解决方法吧”，心安理得的将这个问题搁置一边了......直到最近发现强大的GreenSock动画库，早就解决了这个问题。于是就看了一下相关的源码——靠，原来有种叫反三角函数的东西就是为这量身打造的啊！初高中不在考点里老师根本没讲啊喂！（哇，自己没姿势还怪别人，关注了）

## 源码分析

关于transform相关值计算的代码在该库的CSSPlugin.js插件中，方法名为`getTransform`，这里截取要讨论的部分（只涉及二维变换部分）：

```Javascript
var k = (m.length >= 6),
    a = k ? m[0] : 1,
    b = m[1] || 0,
    c = m[2] || 0,
    d = k ? m[3] : 1;
tm.x = m[4] || 0;
tm.y = m[5] || 0;
scaleX = Math.sqrt(a * a + b * b);
scaleY = Math.sqrt(d * d + c * c);
rotation = (a || b) ? Math.atan2(b, a) * _RAD2DEG : tm.rotation || 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).
skewX = (c || d) ? Math.atan2(c, d) * _RAD2DEG + rotation : tm.skewX || 0;
```

这段代码中的 m 就是matrix矩阵数组，在继续之前请仔细阅读张鑫旭的[理解CSS3 transform中的Matrix(矩阵)](http://www.zhangxinxu.com/wordpress/2012/06/css3-transform-matrix-%E7%9F%A9%E9%98%B5/)，这个m便是所谓的[a, b, c, d, e, f]，这里总结下各个transform属性对他们的影响：

- translate

  `translate3d(X, Y, 0)`，则 e = X, f = Y

- scale

  `scale(S1, S2)`，则 a = S1, d = S2

- rotate

  `rotate(θdeg)`，则 a = cosθ，b = sinθ，c = -sinθ，d = cosθ

- skew

  `skew(α1, α2)`, b = tanα2，c = tanα1

而多个属性混合，其实就是这些玩意儿相乘怼到一起

而如果一个点是(x, y)，应用矩阵变换，得到的点就是(ax+cy+e, bx+dy+f)，带入上面的值，便是：

`(S1*cosθ*x - tanα1*sinθ*y + X, tanα2*sinθ*x + S2*cosθ*y + Y)`

虽然上面那串很恶心，但是…...其实这个点我们其实不需要直接使用，因为我们知道上面四个属性是不相互影响的，因此在我们从矩阵中寻找某属性值的过程中，可以将另外三者设为方便计算的值。

比如我心心念念的rotate值，求法在代码中已经写出，其实就是`Math.atan2(b, a) * _RAD2DEG` ，**atan2是一个利用反正切函数的方法**，而**反正切函数是利用已知直角[三角形](https://zh.wikipedia.org/wiki/%E4%B8%89%E8%A7%92%E5%BD%A2)的对边和邻边这两条直角边的[比值](https://zh.wikipedia.org/wiki/%E6%AF%94%E4%BE%8B)求出其夹角大小的函数**，而**`Math.atan2(b, a)`返回的便是点(a, b)相对于原点的角度（-pi 到 pi），是一个逆时针角度，以弧度为单位**，那为什么在这里传递的参数是`b, a`呢？因为旋转对于所有点的效果是一致的，所以我取x正轴上一点(x, 0)，其他的变换假设为初始值（因为他们不影响），则其旋转θ度后，坐标为`(cosθ*x，sinθ*x)`，这个θ是旋转的角度，是我们想要求的值，而我把这个坐标的y, x值放入`Math.atan2`，得到的是该点到与原点间的弧度值，由于我的初始点是在x正轴上，所以该弧度值就是我们要求的角度θ（当然要进行一个角度和弧度之间的转换）！也就是说，只要将`sinθ，cosθ`扔进`Math.atan2`，就能得到θ——等等，上文不就有了，`a = cosθ，b = sinθ`！所以这里的角度就是`Math.atan2(b, a) * _RAD2DEG`。当然在有其他属性的情况下`a = cosθ，b = sinθ`并不成立，但既然这些属性不影响θ，`Math.atan2(b, a) * _RAD2DEG`仍然是我们需要的角度。

其他的值其实也是可以类似推导，其实说这么多不如心中画个图来的靠谱，总觉得上面的强行推理怪怪的，经过了一万次心理博弈【摊】

------

回过头一看，这玩意儿其实都是初高中内容，作为一个大三学生纠结了半天，真是太鸡儿丢人了。说起来GreenSock也是见了很多酷炫的网站在用，不过这玩意儿的logo长个像个威猛先生一样，官网也是有一点企业的拟物风，完全没有一个框架的感觉。结果仔细一看，简直太靠谱了，不愧是Flash时代就久负盛名的团队，有种“Flash死了？那我今天就要教你做H5动画”的感觉。看看同样的效果，人家丝滑60帧，我只有20-30帧，还是要多学习一个啊。
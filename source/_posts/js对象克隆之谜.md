---
title: js对象克隆之谜
date: 2017-08-26 11:33:30
tags: [JavaScript]
categories: 前端
---

# js对象克隆之迷

## 先谈谈深拷贝

如何在js中获得一个克隆对象，可以说是喜闻乐见的话题了。相信大家都了解引用类型与基本类型，也都知道有种叫做深拷贝的东西，传说深拷贝可以获得一个克隆对象！那么像我这样的萌新自然就去学习了一波，我们能找到的代码基本都是这样的：

### 低配版深拷贝

```javascript
var deepClone = function(currobj){
    if(typeof currobj !== 'object'){
        return currobj;
    }
    if(currobj instanceof Array){
        var newobj = [];
    }else{
        var newobj = {}
    }
    for(var key in currobj){
        if(typeof currobj[key] !== 'object'){
            newobj[key] = currobj[key];
        }else{
            newobj[key] = deepClone(currobj[key])    
        }
    }
    return newobj
}
```

啧啧真是很精巧啊！对于Array和普通Object都做了区分。但是显然，借助递归实现的深拷贝如果要克隆层级很多的复杂对象，容易造成内存溢出，咱可以做出一个小小改进：

### 看起来酷一点的深拷贝

```javascript
var deepClone = function(currobj){
    if(typeof currobj !== 'object'){
        return currobj;
    }
    if(currobj instanceof Array){
        var newobj = [];
    }else{
        var newobj = {}
    }
    var currQue = [currobj], newQue = [newobj]; //关键在这里
    while(currQue.length){
        var obj1 = currQue.shift(),obj2 = newQue.shift();
        for(var key in obj1){
            if(typeof obj1[key] !== 'object'){
                obj2[key] = obj1[key];
            }else{
                if(obj1[key] instanceof Array ){
                    obj2[key] = [];
                }else{
                    obj2[key] = {}
                };
                // 妙啊
                currQue.push(obj1[key]);
                newQue.push(obj2[key]);
            }
        }
    }
    return newobj;
};
```

这里利用了两个队列，还算优雅的避免了递归的弊端。

### JSON序列化

还有一种方法是利用JSON的内置方法，即所谓的JSON序列化：

```javascript
var deepClone = function(obj){
    var str, newobj = obj.constructor === Array ? [] : {};
    if(typeof obj !== 'object'){
        return;
    } else if(window.JSON){
        str = JSON.stringify(obj), //系列化对象
        newobj = JSON.parse(str); //还原
    } else {
        for(var i in obj){
            newobj[i] = typeof obj[i] === 'object' ? 
            deepClone(obj[i]) : obj[i]; 
        }
    }
    return newobj;
};
```

不过不打紧，它与上面方法的效果基本相同。

### 上面几种深拷贝的局限

拜托，大家都很懂对象，上面的方法有几个很大的问题：

- 遇到对象内部的**循环引用**直接gg
- 无法拷贝**函数**（typeof 函数 得到的是 'function'），函数仍是引用类型
- 无法正确保留**实例对象的原型**

于是，我们就要开始改造上面的深拷贝方法来进行完美的克隆了！.............么？

## 等下，你到底要啥

克隆克隆，我们平常把它挂在嘴上，但面对一个对象，我们真正想克隆的是什么？我想在99%的情况下，我们想克隆的是对象的**数据**，而保留它的**原型引用**和**方法引用**，因此上面提到的局限中的第二点，基本可以不考虑。现在咱再来看看怎么解决剩下两点。

## 解决循环引用

首先搞清什么是循环引用，常见的循环引用有两种：

### 自身循环引用

```javascript
var a = {};
a._self = a;
```

这种循环引用可以说很是常见。

### 多个对象互相引用

```javascript
var a = {};
var b = {};
a.brother = b;
b.brother = a;
```

也不是没见过，不过这是典型导致对象内存无法被回收的写法，本身就不推荐。

### 解决之道

目前只找到了针对第一种引用的解决方法，来自于Jquery源码：

```javascript
jQuery.extend = jQuery.fn.extend = function() {
  // options是一个缓存变量，用来缓存arguments[i]
  // name是用来接收将要被扩展对象的key
  // src改变之前target对象上每个key对应的value
  // copy传入对象上每个key对应的valu
  // copyIsArray判定copy是否为一个数组
  // clone深拷贝中用来临时存对象或数组的src
  var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
  i = 1,
  length = arguments.length,
  deep = false;

  // 处理深拷贝的情况
  if (typeof target === "boolean") {
    deep = target;
    target = arguments[1] || {};
    //跳过布尔值和目标 
    i++;
  }

  // 控制当target不是object或者function的情况
  if (typeof target !== "object" && !jQuery.isFunction(target)) {
    target = {};
  }

  // 当参数列表长度等于i的时候，扩展jQuery对象自身
  if (length === i) {
    target = this; --i;
  }
  for (; i < length; i++) {
    if ((options = arguments[i]) != null) {
      // 扩展基础对象
      for (name in options) {
        src = target[name];	
        copy = options[name];

        // 防止永无止境的循环，这里举个例子，如var i = {};i.a = i;$.extend(true,{},i);如果没有这个判断变成死循环了
        if (target === copy) {
          continue;
        }
        if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && jQuery.isArray(src) ? src: []; // 如果src存在且是数组的话就让clone副本等于src否则等于空数组。
          } else {
            clone = src && jQuery.isPlainObject(src) ? src: {}; // 如果src存在且是对象的话就让clone副本等于src否则等于空数组。
          }
          // 递归拷贝
          target[name] = jQuery.extend(deep, clone, copy);
        } else if (copy !== undefined) {
          target[name] = copy; // 若原对象存在name属性，则直接覆盖掉；若不存在，则创建新的属性。
        }
      }
    }
  }
  // 返回修改的对象
  return target;
};
```

## 解决原型的引用

在我们想办法魔改深拷贝时，先看下以上这么多深拷贝的基本原理：

**利用for-in循环遍历对象属性，如果属性值是对象则深拷贝，不是则直接赋值**

于是俺眉头一皱发现事情并不简单，俺上一篇博客已经说明：**for-in遍历的是对象以及其原型链上可枚举属性**，因此想在遍历时对源对象的`__proto__`做手脚是根本不存在的，**`__proto__`以及它的不可枚举属性根本不会被遍历到**。可以通过下面的例子看出：

```javascript
var deepClone = function() {...} // 随便从上面拿一个
var A = function() {
  this.val = 1;
}
A.prototype.log = function() {
  console.log(this.val);
}

var obj1 = new A();
var obj2 = deepClone(obj1);

console.log(obj1); // A {val: 1}
console.log(obj2); // {val: 1, log: function(){...}}
```

因此，一个解决方法很单纯，就是像上面的jQuery.extend方法一样，**自己传入拷贝的目标对象**，extend方法本质上只是**拓展目标对象的属性，使其获得源对象上的数据**，这样一来只要我们先创建好符合需求的目标对象即可。

另一种方法则是不采用深拷贝，**直接取出需要进行拷贝的对象的数据，然后再利用这份数据来实例化和设置一个新的对象出来**：

```javascript
var Foo = function( obj ){
    this.name = obj.name;
    this.sex = obj.sex
};

Foo.prototype.toJSON = funciton(){
    return { name: this.name, sex: this.sex };
};

var foo = new Foo({ name: "bandit", sex: "male" });
var fooCopy = new Foo( foo.toJSON() );
```

问题同样得到解决【鼓掌】

------

回顾一下，没有哪种方法是万用的魔法 —— 在我们想要获得一个克隆对象之前，或许最好先搞清楚我们到底是在克隆什么，再采用最适合的方法。而非是拘泥于“深拷贝浅拷贝”的说法，去复制一段代码祈祷他能生效。我相信以上的示例代码还没有考虑到克隆对象的所有问题，但它们在合适的场景下能够处理合适的问题。嗯，其实很多事情都是这样蛤【带！】
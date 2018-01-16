---
title: 循环，还有这种操作——es6补充！？
date: 2017-10-22 10:27:42
tags: [es6,循环]
categories: 前端
---

缘，妙不可言——开始系统梳理es6后，发现关于循环的知识点又有了不少补充，正好填一下上次的坑嘛【抖】，本文有大量部分直接摘于[es6标准入门](http://es6.ruanyifeng.com/)

ps: [上集回顾](http://b-sirius.me/2017/08/15/%E5%BE%AA%E7%8E%AF%EF%BC%8C%E8%BF%98%E6%9C%89%E8%BF%99%E7%A7%8D%E6%93%8D%E4%BD%9C/)

---

## Object对象的拓展

### Object.keys()

其实是es5引入的方法，返回一个数组，常用于与for-of搭配遍历，成员是**参数对象自身（不含继承）**的所有**可枚举（enumerable）**属性的键名：

```javascript
let obj = { foo: 'bar', baz: 42 }
Object.keys(obj)
// ["foo", "baz"]
```

相比之下，我们更熟悉的for-in遍历虽然同样是遍历**可枚举属性**的键名，但是它遍历的范围不只是对象自身，还有它的**原型链**，相比之下object.keys()在大多情况下更加适用。

另外，es2017中有一个提案，引入**Object.values**和**Object.entires**与其配套使用：

```Javascript
let {keys, values, entries} = Object;
let obj = { a: 1, b: 2, c: 3 };

for (let key of keys(obj)) {
  console.log(key); // 'a', 'b', 'c'
}

for (let value of values(obj)) {
  console.log(value); // 1, 2, 3
}

for (let [key, value] of entries(obj)) {
  console.log([key, value]); // ['a', 1], ['b', 2], ['c', 3]
}
```

## Iterator遍历器

其实这才是重头戏啊，由于涉及到的点太多，只提及一点概念以及相关关键词。

### 概念

Iterator 的作用有三个：

* 各种数据结构，提供一个统一的、简便的访问接口
* 使得数据结构的成员能够按某种次序排
* ES6创造了一种新的遍历命令`for...of`循环，Iterator接口主要供`for...of`消费

Iterator的遍历过程如下：

1. 创建一个指针对象，指向当前数据结构的起始位置。也就是说，**遍历器对象本质上，就是一个指针对象**
2. 第一次调用指针对象的`next`方法，可以将指针指向数据结构的第一个成员
3. 第二次调用指针对象的`next`方法，指针就指向数据结构的第二个成员
4. 不断调用指针对象的`next`方法，直到它指向数据结构的结束位置

每一次调用`next`方法，都会返回数据结构的当前成员的信息。具体来说，就是**返回一个包含`value`和`done`两个属性的对象**。其中，`value`属性是当前成员的值，`done`属性是一个布尔值，表示遍历是否结束。

模拟 next 方法返回值：

``` Javascript
var it = makeIterator(['a', 'b']);

it.next() // { value: "a", done: false }
it.next() // { value: "b", done: false }
it.next() // { value: undefined, done: true }

function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++], done: false} :
        {value: undefined, done: true};
    }
  };
}
```

### 默认Iterator接口

ES6 规定，默认的 Iterator 接口部署在数据结构的`Symbol.iterator`属性，或者说，**一个数据结构只要具有`Symbol.iterator`属性，就可以认为是“可遍历的”（iterable）**。`Symbol.iterator`属性本身是一个函数，就是当前数据结构默认的遍历器生成函数。执行这个函数，就会返回一个遍历。

而原生具有该借口的数据结构如下：

- Array
- Map
- Set
- String
- TypedArray
- 函数的 arguments 对象
- NodeList 对象

以数组为例：

```Javascript
let arr = ['a', 'b', 'c'];
let iter = arr[Symbol.iterator]();

iter.next() // { value: 'a', done: false }
iter.next() // { value: 'b', done: false }
iter.next() // { value: 'c', done: false }
iter.next() // { value: undefined, done: true }
```

一个对象如果要具备可被`for...of`循环调用的 Iterator 接口，就必须在`Symbol.iterator`的属性上部署遍历器生成方法（原型链上的对象具有该方法也可），这个操作骚方法就太多了，还是详看es6吧，其中最值得注意的骚操作就是**Generator函数**。

### 调用Iterator接口的场合

* for-of循环
* 解构赋值
* 扩展运算符
* yield*

---

没了？没了。Iterator涉及到的点和用法在es6入门中整理的很好了，继续复制粘贴感觉也没有太大意义嗯——


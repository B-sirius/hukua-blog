---
title: 循环，还有这种操作！？
date: 2017-08-15 19:58:38
tags: [循环]
categories: 前端
description: 虽说已经看了n遍相关博文，但在实际操作中各种循环的操作实在是令人摸不着头脑，系统整理一回【拍桌】，简单 for 循环一般只适用于数组，最为常见的一种写法...
---

虽说已经看了n遍相关博文，但在实际操作中各种循环的操作实在是令人摸不着头脑，系统整理一回【拍桌】

## 简单 for 循环

简单 for 循环一般只适用于数组，最为常见的一种写法：

```javascript
var arr = [1, 2, 3];
for (var i = 0, len = arr.length; i < len; i++) {...}
```

在数组长度不变时，用`len`保存数组长度进行循环效率更佳。

另外，如需在遍历中进行改变长度的删除操作，一般采用倒序遍历：

```javascript
var arr = [1, 2, 3];
for (var i = arr.length - 1; i >= 0; i--) {
  if (arr[i] === 1)
    arr.splice(i, 1);
}
console.log(arr); // [2, 3]
```

## for-in 循环

### 语法

```javascript
for (key in object) {...}
```

### 参数

`key`：每次迭代时，将不同的属性名分配给变量

`object`：被迭代枚举其属性的对象

### 适用情况

首先咱的确可以用 for-in 来遍历数组

```javascript
var arr = [1, 2, 3];
for (index in arr) {
  console.log(`arr[${index}]: ${arr[index]}`);
} 
// chrome中的输出结果
// arr[0]: 1
// arr[1]: 2
// arr[2]: 3
```

但是注意，**for-in** 遍历的是 **对象以及其原型链上可枚举属性(`String`)，而不是数组的索引(`Number`)，且迭代顺序依赖于执行环境，并不一定按某种顺序访问元素**，数组在js中也是一个对象，属性**并非是`Number`类型而是`String`类型**。`length`属性值未被遍历也只是因为它不是可枚举属性。

因此我们做出一点魔改：

```javascript
var arr = [1, 2, 3];
arr.arrFeeling = 'fucked up';
Array.prototype.arrayFeeling = 'thats good';
Object.prototype.objFeeling = 'emmmmm';
for (key in arr) {
  console.log(`${key + 1}: ${arr[key]}`);
} 
// chrome中的输出结果
// 01: 1
// 11: 2
// 21: 3
// arrFeeling1: fucked up
// arrayFeeling1: thats good
// objFeeling1: emmmmm
```

可以看出，这里的结果已经他喵的和我们预想的数组遍历差了很多很多【震惊】，因此从某种意义上讲， for-in 遍历的初衷是遍历对象中的属性，传统的数组遍历并不适合用for-in。

但是也正得益于这个特性，for-in遍历可用于遍历**稀疏数组**：

```javascript
var arr = [];
arr[999] = 1;
for (key in arr) {
  console.log(`${key}: ${arr[key]}`);
} 
// chrome中的输出
// 999: 1
```

此处的 `arr.length` 为1000，如果用简单for循环来输出，会遍历1000次（输出999个`undefined`），而使用for-in只会遍历一次。如果担心输出原型链上的属性，可以利用`hasOwnProperty`方法。

## forEach

简单的例子：

```javascript
var arr = [null, 2, 3];
arr[5] = 5;
arr['die'] = 'die!' // 不会被遍历到
arr.forEach(function(data) {
    console.log(data);
});
// null
// 2
// 3
// 5
```

forEach 是Array的方法，会为数组中含**有效值（也就是说，会跳过数组空位)**(**包括值为null**)的每一**索引项**执行一次传入的回调函数。回调函数会被依次传入三个参数：

- 数组当前项的值
- 数组当前项的索引（**Number类型！**）
- 数组对象本身

需要注意的是，forEach 不会在迭代前创建数组的副本，因此**可以改变原数组**，若迭代时数组长度改变：

```javascript
var words = ["one", "two", "three", "four"];
words.forEach(function(word) {
  console.log(word);
  if (word === "two") {
    words.shift();
  }
});
// one
// two
// four
```

forEach 的一大缺点：**一旦开始就无法跳出**，因此ES5中提供了一些其他类似的方法：

- every:测试数组的所有元素是否都通过了指定函数的测试， 循环在第一次 return false 后返回，**不会改变原数组**
- some: 测试数组中的某些元素是否通过由提供的函数实现的测试，循环在第一次 return true 后返回，**不会改变原数组**
- filter: 返回一个新的数组，其包含通过所提供函数实现的测试的所有元素，**不会改变原数组**
- map: 创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果，**不会改变原数组**
- reduce: 对数组中的元素依次处理，将上次处理结果作为下次处理的输入，最后得到最终结果，**啊——不会改变原数组**

## for-of

简单的例子：

```javascript
var arr = [1, 2, 3];
for (let val of arr) {
	console.log(val);
}
// 1
// 2
// 3
```

for-of 乍看之下和forEach的功能好像重叠了，但是作为ES6新支持的语法，自然有一些优点：

- 作为正经的 for 循环语法，可以正常的 break，continue，return
- for-of 循环并非数组专用，它支持**可迭代对象**，包括 [`Array`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Array), [`Map`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Map), [`Set`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set), [`String`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/String), [`TypedArray`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)，[arguments](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/arguments) 对象等等，注意不包括**Object**对象，如果你想迭代Object对象，for-in循环更加适合
- 搭配ES6新增的用户自定义迭代器（说的那么模糊，因为我还不是很懂）

此外，for-of与上面一大串forEach, map等有一个很大的区别：**不会跳过数组空位**:

```javascript
let arr = ['holy', 'shit'];
arr.forEach(x => console.log(x));
// holy
// shit
for (let x of arr) {
	console.log(x);
}
// holy
// undefined
// shit
```



------

最后回头看一下，循环遍历这个操作其实需要考虑很多：

- 遍历方法所适用的对象
- 是否会创建原对象副本（改变原对象）
- 遍历时会传入的参数（`undefined`，原型链）以及参数类型（`Number`, `String`）
- 如何处理空值
- ...

因此弄清楚他们之间的分别还是有必要的吧科科。ES6还添加了个叫**iterable**的玩意儿，也与迭代密切相关，不是很懂先坑了【逃】
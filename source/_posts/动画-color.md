---
title: 当我们讨论动画时，我们在讨论什么———color篇
date: 2017-04-30 14:19:29
tags: [JavaScript]
categories: 前端
---

## 设计模式的运用

除了上篇的transform动画需要特殊处理，还有一个大头就是属性值为颜色的处理。不同于transform，属性值为颜色的属性可以有很多种，而颜色属性值又有rgb、hsl、rgba甚至十六进制等多种表示方式，意味着两者对属性名、属性值分离的逻辑也是不同的，再加上对普通属性处理的逻辑，至少有三种不同的分离逻辑。因此在加入颜色的处理方法之前，我先用策略模式重构了这部分逻辑，最后结果如下：

```javascript
/**
 * 对porps属性值处理，获得渲染时所需的数据
 */
Rush.prototype._handleProps = (function() {
    // transform 的属性需要特别处理
    const transformProperties = ["translateX", "translateY", "translateZ", "scale", "scaleX", "scaleY", "scaleZ", "skewX", "skewY", "rotateX", "rotateY", "rotateZ"];

    // color 的属性需要特别处理
    const colorProperties = ["color", "background-color", "border-color", "outline-color"];

    var propertyHandler = {};

    // 普通属性的处理方法
    propertyHandler['default'] = function(task, key) {
        var el = this.el;

        var begin; // 初始属性值和单位
        var end = propertyValueHandler(key, task.props[key]); // 末属性数值和单位

        var realPropertyName = key; // 真正的属性名
        var styleLogic = 'default';

        var beginValue = getComputedStyle(el, null).getPropertyValue(realPropertyName); // 获得初始属性值(带单位)

        begin = propertyValueHandler(key, beginValue); // 获得属性数值和单位

        realPropertyName = transferStyleName(realPropertyName); // 将连字符格式转换为驼峰式

        // 为task新增属性
        task.newProps[key] = {
            begin,
            end,
            realPropertyName,
            styleLogic
        }
    }

    // transform属性的处理方法
    for (var propertyName of transformProperties) {
        propertyHandler[propertyName] = function(task, key) {
            var el = this.el;

            var begin; // 初始属性值和单位
            var end = propertyValueHandler(key, task.props[key]); // 末属性数值和单位

            var realPropertyName = 'transform';
            var styleLogic = 'transform';

            var beginValue; // 初始属性值（带单位）

            // 如果已经缓存了transform属性
            if (el.transformCache) {
                if (el.transformCache[key]) {
                    beginValue = el.transformCache[key].value;
                } else {
                    beginValue = 0;
                    el.transformCache[key] = {
                        value: beginValue,
                        unitType: end.unitType
                    };
                }
            } else {
                // 只有在元素没有在style中定义任何transform属性时才会调用
                beginValue = 0;

                // 给这个元素添加transfromCache属性，用于保存transfrom的各个属性
                // 因为如果style中的transform被设置了多个值，读取到的将是"rotate(30deg) translateX(10px)"这样的值，将无法处理
                el.transformCache = {};
                el.transformCache[key] = {
                    value: beginValue,
                    unitType: end.unitType
                };
            }

            begin = propertyValueHandler(key, beginValue); // 获得属性数值和单位

            // 为task新增属性
            task.newProps[key] = {
                begin,
                end,
                realPropertyName,
                styleLogic
            }
        }
    }

    // color属性的处理方法，统一转换为rgba来处理
    for (var propertyName of colorProperties) {
        propertyHandler[propertyName] = function(task, key) {
            var el = this.el;

            var begin;
            var end = normalize2rgba(task.props[key]);

            var realPropertyName = key;

            var beginValue = getComputedStyle(el, null).getPropertyValue(realPropertyName); // e.g. rgba(255, 255, 255, 1);
            begin = normalize2rgba(beginValue); // 返回的是转换后的rgba对象

            var styleLogic = 'rgba';

            realPropertyName = transferStyleName(realPropertyName); // 将连字符格式转换为驼峰式


            task.newProps[key] = {
                begin,
                end,
                realPropertyName,
                styleLogic
            }
        }
    }

    return function(task) {
        var el = this.el;

        task.newProps = {}; // 保存渲染动画时所需的数据

        for (var key in task.props) {
            if (propertyHandler[key]) { // 特殊属性
                propertyHandler[key].call(this, task, key);
            } else { // 普通属性
                propertyHandler['default'].call(this, task, key);
            }
        }
    }
})();
```

## color的痛点

- color的多种属性值

  属性值可能是rgb色，hsl色，rgba色甚至16进制色，为他们各做一种处理逻辑显然太过复杂且没有必要，将其全部转换成同一单位再进行处理更加明智。考虑到透明度，我觉得全部转换为rgba最为合适。颜色转换的逻辑到处都能找到就不细说了。

- rgba属性值的分离

  不同于之前所有的属性值，rgba值有4个数值，考虑到我们的缓动函数每次只处理一个数值，需要用数组保存再进行分别处理

  ```javascript
  for (var key in task.newProps) {
              if (typeof task.newProps[key].begin.num !== 'number') {
                  var beginArr = task.newProps[key].begin.num;
                  var endArr = task.newProps[key].end.num;

                  var newArr = [];
                  for (var i = 0; i < beginArr.length; i++) {
                      var beginValue = beginArr[i],
                          changeValue = endArr[i] - beginValue,
                          newValue = easing(currTime, beginValue, changeValue, duration); // 根据缓动函数计算新的位置
                          newArr.push(newValue);
                  };

                  self.styleHandler(task, key, newArr);
              } else {
                  var beginValue = task.newProps[key].begin.num, // 初始位置
                      changeValue = task.newProps[key].end.num - beginValue; // 位置改变量

                  var newValue = easing(currTime, beginValue, changeValue, duration); // 根据缓动函数计算新的位置

                  // 更新style
                  self.styleHandler(task, key, newValue);
              }
          }
  ```

- 将处理后得到的新属性重新拼接为style样式

  同样是采取策略模式，为不同的拼接逻辑定义了对应的拼接方法

  ```javascript
  Rush.prototype.styleHandler = (function() {
      var t = {
          'transform': function(task, key, newValue) {
              this.el.transformCache[key].value = newValue; // 更新缓存值

              var propertyValue = '',
                  propertyName = task.newProps[key].realPropertyName;

              // e.g transform: rotateZ(100deg) translateX(50px)
              for (var key in this.el.transformCache) {
                  var name = key, // e.g rotateZ
                      val = this.el.transformCache[key].value, // e.g 100
                      unitType = this.el.transformCache[key].unitType; // e.g deg

                  propertyValue += `${name}(${val}${unitType})`; // e.g rotate(100deg)
              }

              this.el.style[propertyName] = propertyValue;
          },

          'rgba': function(task, key, newArr) {
              var text = 'rgba(';

              for (var i = 0; i < newArr.length - 1; i++) {
                  text += (newArr[i]).toFixed() + ', ';
              }
              text += newArr[newArr.length - 1].toFixed(2) + ')';

              this.el.style[task.newProps[key].realPropertyName] = text;
          },

          'default': function(task, key, newValue) {
              this.el.style[task.newProps[key].realPropertyName] = `${newValue}${task.newProps[key].end.unitType}`;
          }
      };

      return function(task, key, newValue) {
          var styleLogic = task.newProps[key].styleLogic;

          t[styleLogic].call(this, task, key, newValue);
      };
  })();
  ```

------

至此，通用js动画库的两大难点基本得到解决，虽说是针对transform和color的处理方法，但在编码过程中，如何运用设计模式优化代码结构可能花费了更多的时间。
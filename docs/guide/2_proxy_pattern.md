

## 代理模式

#### 基本释义
通过**替身**，拦截并控制**目标对象**和其他对象的**互动**。
<p align=center><img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/96e97df4754b4f28b7fc77141a99f6eb~tplv-k3u1fbpfcp-watermark.image?" alt="image.png" width="80%" /></p>

> 没错，咱们JavaScript里专业替身**代理模式**，就是通过Proxy关键字实现的。
 
```js
const person = {
  name: "John Doe",
  age: 42,
  nationality: "American"
};

const personProxy = new Proxy(person, {});
```
**交互实现**：通过第二个控制器参数**handler**实现与被代理对象进行交互
```js

const personProxy2 = new Proxy(person, {
  get: (obj, prop) => {
    console.log(`The value of ${prop} is ${obj[prop]}`);
  },
  set: (obj, prop, value) => {
    console.log(`Changed ${prop} from ${obj[prop]} to ${value}`);
    obj[prop] = value;
  }
});
```
通过**new**一个Proxy对象，这个对象构造函数接收两个参数，第一个就是**被代理的目标对象**，第二个就是控制器handler，通常是获取或修改目标对象属性get和set方法。

#### 替身的使用

替身的使用和被代理的对象的使用一样，**直接调用**就可以了。

```js
personProxy.name;
personProxy.age = 43;
person.age = 45; // 被代理的对象依然可以直接使用
```

当然new Proxy构造函数的第二个控制器参数是必传的，如果是和替身的属性一一对应，没有其他操作，可以传个空对象{}，否则的话可以重写get或set方法，处理特殊逻辑。

其中**get**方法有两个参数，第一个参数是被代理的Object本身，第二个参数是当前被使用的属性的名称，return**返回值**会直接生效，不return会默认拿取被代理对象的该**属性值**；

而**set**方法有三个参数，第一个参数是被代理的Object本身，第二个参数是当前被修改的属性名称，第三个参数是将要设置的值；重写set方法必须要重写修改逻辑obj[prop] = value，不重新修改逻辑，set的属性值无效，而且set必须**return true**,否则会报错;


### 最佳实践

代理模式通常用来**校验属性值**，比如类型、是否为空，是否非法等等，从而最大限度的保证数据的有效性；

```js
const personProxy = new Proxy(person, {
  get: (obj, prop) => {
    if (!obj[prop]) {
      console.log(
        `Hmm.. this property doesn't seem to exist on the target object`
      );
    } else {
      console.log(`The value of ${prop} is ${obj[prop]}`);
    }
  },
  set: (obj, prop, value) => {
    if (prop === "age" && typeof value !== "number") {
      console.log(`Sorry, you can only pass numeric values for age.`);
    } else if (prop === "name" && value.length < 2) {
      console.log(`You need to provide a valid name.`);
    } else {
      console.log(`Changed ${prop} from ${obj[prop]} to ${value}.`);
      obj[prop] = value;
    }
  }
});
```

### Reflect映射

Reflect对象和Proxy构造函数的第二个参数handler**控制器**一样，通过**get**和**set**获取或者修改目标对象的属性；所以personProxy就可以改造为下面这种写法：

```js
const personProxy = new Proxy(person, {
  get: (obj, prop) => {
    console.log(`The value of ${prop} is ${Reflect.get(obj, prop)}`);
  },
  set: (obj, prop, value) => {
    console.log(`Changed ${prop} from ${obj[prop]} to ${value}`);
    Reflect.set(obj, prop, value);
  }
});
```
handler的get方法中，通过**Reflect.get**方法获取目标对象obj的prop属性的值；通过R**eflect.set**方法设置目标对象obj的prop属性的值为value。

### 总结

**代理模式**对于**控制**目标对象的行为是非常有用的。代理有很多使用场景，比如说**验证**，**格式化**，**警告**以及**调试**。

但是**过度使用代理对象**，或者是在handler控制器中做很**耗性能的操**作，就会很容易**影响到你整个应用的性能表现**。所以最好**不要**在高性能要求的代码中使用代理模式。



 



---
原文翻译

## 代理模式

> 目标对象的拦截和控制交互

通过代理对象，我们可以更好地控制与某些对象的交互。代理对象可以在我们与对象交互时确定行为，例如当我们获取值或设置值时。

------

一般来说，代理意味着某人的替补。你将与你试图联系的人的代理人交谈，而不是直接与该人交谈。JavaScript 中也存在类似的情况：我们将与代理对象交互，而不是直接与目标对象交互。

------

让我们创建一个 `person` 对象，它代表 John Doe。

```javascript
const person = {
  name: "John Doe",
  age: 42,
  nationality: "American"
};
```

我们希望与代理对象交互，而不是直接与该对象交互。在 JavaScript 中，我们可以通过创建 `Proxy` 的一个新实例来轻松创建新代理。

```javascript
const person = {
  name: "John Doe",
  age: 42,
  nationality: "American"
};

const personProxy = new Proxy(person, {});
```

`Proxy` 的第二个参数表示处理程序的对象（handler）。在 `handler` 对象中，我们可以根据交互的类型来定义特定的行为。尽管有许多方法可以添加到代理处理程序中，但最常见的两种方法是 `get` 和 `set`：

- `get`: 在尝试访问属性时调用
- `set`: 在尝试修改属性时调用

实际上，最终会发生以下情况：

<!-- ![](../pic_bed/1_3_pic_1.gif) -->

我们将与 `personProxy` 交互，而不是直接与 `person` 对象交互。

让我们向 `personProxy` 代理添加处理程序。当试图修改属性，从而调用代理上的 `set` 方法时，我们希望代理记录属性的先前值和新值。当试图访问属性，从而调用代理上的 `get` 方法时，我们希望代理记录一个更可读的包含属性的键和值的句子。

```javascript
const personProxy = new Proxy(person, {
  get: (obj, prop) => {
    console.log(`The value of ${prop} is ${obj[prop]}`);
  },
  set: (obj, prop, value) => {
    console.log(`Changed ${prop} from ${obj[prop]} to ${value}`);
    obj[prop] = value;
  }
});
```

太棒了！让我们看看当我们试图修改或获取属性时会发生什么。

> ------
>
> > 打开 https://codesandbox.io/embed/cocky-bird-rkgyo 查看示例代码
>
> ------

当访问 `name` 属性时，`Proxy` 返回了一个听起来更好的句子：“The value of name is John Doe.”。

当修改 `age` 属性时，`Proxy` 返回了这个属性的上一个值和新值：“Changed age from 42 to 43.”。

------

代理可以用于添加验证。用户不应该将人的年龄更赋值为字符串，或者给他们一个空名字。或者，如果用户试图访问对象上不存在的属性时，我们应该让用户知道。

```javascript
const personProxy = new Proxy(person, {
  get: (obj, prop) => {
    if (!obj[prop]) {
      console.log(
        `Hmm.. this property doesn't seem to exist on the target object`
      );
    } else {
      console.log(`The value of ${prop} is ${obj[prop]}`);
    }
  },
  set: (obj, prop, value) => {
    if (prop === "age" && typeof value !== "number") {
      console.log(`Sorry, you can only pass numeric values for age.`);
    } else if (prop === "name" && value.length < 2) {
      console.log(`You need to provide a valid name.`);
    } else {
      console.log(`Changed ${prop} from ${obj[prop]} to ${value}.`);
      obj[prop] = value;
    }
  }
});
```

让我们看看当我们试图传递错误值时会发生什么！

> ------
>
> > 打开 https://codesandbox.io/embed/focused-rubin-dgk2v 查看示例代码
>
> ------

代理确保我们没有用错误的值来修改 `person` 对象，这有助于我们保持数据的干净！

------

#### 反射（Reflect）

JavaScript 提供了一个名为 `Reflect` 的内置对象，这使我们在使用代理时更容易操作目标对象。

以前，我们直接通过中括号的方式来修改和访问被代理对象上的属性。相反的，我们可以使用反射对象（Reflect）。反射对象（Reflect）上的方法与 `handler` 对象上的方法具有相同的名称。

我们可以通过 `Reflect.get()` 和 `Reflect.set()` 分别访问和修改目标对象的属性，而不用通过 `obj[prop]`  来访问属性或通过 `obj[prop] = value` 来设置属性。这些方法接收的参数与 `handler` 对象上的方法相同。

```javascript
const personProxy = new Proxy(person, {
  get: (obj, prop) => {
    console.log(`The value of ${prop} is ${Reflect.get(obj, prop)}`);
  },
  set: (obj, prop, value) => {
    console.log(`Changed ${prop} from ${obj[prop]} to ${value}`);
    Reflect.set(obj, prop, value);
  }
});
```

太棒了！我们可以使用反射对象（Reflect）轻松的访问和修改目标对象上的属性了。

> ------
>
> > 打开 https://codesandbox.io/embed/gallant-violet-o1hjx 查看示例代码
>
> ------

------

代理是添加对对象行为控制的有效方式。代理可以有各种用例：它可以帮助验证、格式化、通知或调试。

过度使用代理对象或对每个 `handler` 方法执行繁重的操作很容易对应用程序的性能产生负面影响。对于注重性能的代码，最好不要使用代理。

------

#### 参考文档

- [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) - MDN
- [JavaScript Proxy](https://davidwalsh.name/javascript-proxy) - David Walsh
- [Awesome ES2015 Proxy](https://github.com/mikaelbr/awesome-es2015-proxy) - GitHub @mikaelbr
- [Thoughts on ES6 Proxies Performance](http://thecodebarbarian.com/thoughts-on-es6-proxies-performance) - Valeri Karpov
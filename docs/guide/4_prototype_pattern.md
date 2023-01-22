## 原型模式

### 写在前面

前端同学都知道**原型**是 JavaScript 原生就支持的，可以通过**prototype**或**proto** 访问原型。在项目中，通常要创建包含**继承**关系的对象，现在通常大家都是通过 es6 的**class**关键词来创建。大家也或许听过**JavaScript 的继承是通过原型链的方式实现**的，那今天就来深入探究下这种**原型模式**。

```js
function Dog() {}
//or
class Dog{}
// 访问原型
Dog.prototype

const dog = new Dog();
// 访问原型
dog.__proto__
```

> 第一种方式是构造函数访问原型的方式；第二种方式是实例对象访问原型的方式。

### 极简释义

在某一类对象中**共享属性或方法**。

### class 关键词

下面我们来看一下 class 的常见用法：

```js
class Dog {
  constructor(name) {
    this.name = name;
  }

  bark() {
    return `Woof!`;
  }
}

const dog1 = new Dog('Daisy');
const dog2 = new Dog('Max');
const dog3 = new Dog('Spot');
```

请注意，Dog 类的 constructor 里为啥会有一个**name 属性**（this.name）呢？这个类本身还有一个 bark 属性。其实当使用 es6 的 class，所有的**属性**都定义在这个类的**原型上**，比如上面的 bark 方法自动被添加到原型上。

我们可以在某个类的**构造方法**和它的**实例对象**里直接发现**prototype**的存在：

```js
console.log(Dog.prototype);
// constructor: ƒ Dog(name, breed) bark: ƒ bark()

console.log(dog1.__proto__);
// constructor: ƒ Dog(name, breed) bark: ƒ bark()
```

> 其中，某个**实例的 prototype**直接**指向**对应的**构造方法的 prototype**！

当我们访问一个对象**不存在的属性**时，JS 会接着在**原型链上检索**看是否存在该属性。

**原型模式**对于使用**公共属性**是非常有用的。我们可以直接把公共属性添加在原型对象上，这样所有的实例都能访问到，而不需要每次都复制相同的属性；并且即便是在**实例对象被创建之后**，在**原型上添加属性**会直接生效。

```js
class Dog {
  constructor(name) {
    this.name = name;
  }

  bark() {
    return `Woof!`;
  }
}

const dog1 = new Dog('Daisy');
const dog2 = new Dog('Max');
const dog3 = new Dog('Spot');

Dog.prototype.play = () => console.log('Playing now!');

dog1.play();
```

> 在 dog1/2/3 实例被初始化之后，给 Dog 原型上添加 play 方法，依然可以被 dog1/2/3 直接调用。

给 Dog 类的**prototype 直接添加属性**的效果，有点类似 JS 中的继承的效果。下面我们来新建个 SuperDog 类，它**继承**自 Dog 类，当然它继承了 Dog 类的所有属性和方法（name/bark）,同时给它**新加**个 fly 方法，代码如下：

```js
class SuperDog extends Dog {
  constructor(name) {
    super(name);
  }

  fly() {
    return 'Flying!';
  }
}

const dog1 = new SuperDog('Daisy');
dog1.bark();
dog1.fly();
```

大家或许都听说过，**JS 的继承是通过 prototype 原型链来实现**的。具体怎么实现的呢？其实 SuperDog 类的**原型**prototype**指向**父类 Dog 的**原型 p**rototype，并且 dog1**实例对象**的原型 prototype**指向**SuperDog 类的**原型**prototype，这样就形成了**原型链**。

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a7dc6267f85e46c89c01974d7e6e0d87~tplv-k3u1fbpfcp-watermark.image?" alt="image.png" width="100%" />

> 这就是为什么取名叫原型链的原因 ——— 会依次递归查找某个属性，直到找到为止。

### Object.create 指定原型

Object.create 方法用来给某个对象**指定原型**prototype 对象：

```js
const dog = {
  bark() {
    return `Woof!`;
  },
};

const pet1 = Object.create(dog);

pet1.bark(); // Woof!

console.log(Object.keys(pet1)); // []
console.log(Object.keys(pet1.__proto__)); // ["bark"]
```

从上述代码中我们不难看出：给 pet1**指定原型**对象时，pet1 本身是**没有**任何属性，但是 pet1 的原型被**指定**成 dog 对象；同时**Object.create**方法可以快速实现从其他对象**继承**属性和方法 ———— 通过**原型链**的方式**添加**新属性和方法。

### 总结

**原型模式**可以很方便的让某个对象**拥有**或者**继承**其他对象的**属性**或方法；同时原型链的存在允许**调用**自己本身**没有**的属性或方法，这样可以**避免重复定义**属性和方法，也可以**减少内存使用**，从而可以优化性能。

---

## 原文翻译

## 原型模式

> 在同类型的多个对象之间共享属性

原型模式是一种在同类型的对象之间共享属性的有效方法。原型是 JavaScript 的原生对象，可以通过原型链被对象访问。

在我们的应用程序中，我们经常需要创建许多同类型的对象。一种有效的方法是通过 ES6 的 class 语法来创建类的多个实例。

假设我们想要创造许多狗！在我们的例子中，狗可以做的事情有：它们只是有一个名字，并且可以吠叫！

```javascript
class Dog {
  constructor(name) {
    this.name = name;
  }

  bark() {
    return `Woof!`;
  }
}

const dog1 = new Dog('Daisy');
const dog2 = new Dog('Max');
const dog3 = new Dog('Spot');
```

在这里构造函数 `constructor` 包含一个 `name` 属性，并且类本身包含一个 `bark` 属性。当使用 ES6 的类时，在类本身上定义的所有属性（在本例中为 `bark`）都会被自动添加到原型 `prototype` 中。

我们可以通过访问构造函数上的 `prototype` 属性直接访问原型，或者通过任何实例上的 `__proto__` 属性访问原型。

```javascript
console.log(Dog.prototype);
// constructor: ƒ Dog(name, breed) bark: ƒ bark()

console.log(dog1.__proto__);
// constructor: ƒ Dog(name, breed) bark: ƒ bark()
```

在构造函数的任何实例上，`__proto__` 的值都是对构造函数原型的直接引用！每当我们试图直接访问一个在对象上不存在的属性时，JavaScript 就会沿着原型链查找，检查该属性在原型链中是否存在。

<!-- ![](../pic_bed/1_5_pic_1.png) -->

当处理应该具有相同属性的对象时，原型模式非常强大。我们可以简单地将属性添加到原型中，而不是每次都创建属性的副本，因为所有实例都可以访问原型对象。

由于所有实例都可以访问原型，因此即使在创建实例之后，也可以很容易地向原型中添加属性。

假如我们的狗不仅应该会吠叫，还应该会玩！我们可以通过向原型中添加 `play` 属性来实现这一点。

> ---
>
> > 打开 https://codesandbox.io/embed/eloquent-turing-v42kr 查看示例代码
>
> ---

“原型链”一词表示可以有多个步骤。的确到目前为止，我们只看到了如何直接访问被 `__proto__` 所引用的第一个对象上的属性。然而，原型本身也有一个 `__proto` 对象！

让我们创造另一种类型的狗，超级狗！这只狗应该继承正常狗的所有属性，但它也应该能飞。我们可以通过扩展 `Dog` 类和添加 `fly` 方法来创建超级狗。

```javascript
class SuperDog extends Dog {
  constructor(name) {
    super(name);
  }

  fly() {
    return 'Flying!';
  }
}
```

让我们创造一只名叫 Daisy 的飞狗，让她吠叫着飞吧！

> ---
>
> > 打开 https://codesandbox.io/embed/hopeful-poitras-vuch6 查看示例代码
>
> ---

由于扩展了 `Dog` 类，我们可以使用 `bark` 方法。`SuperDog` 原型上的 `__proto` 值指向 `Dog.prototype` 对象！

<!-- ![](../pic_bed/1_5_pic_2.png) -->

这就清楚为什么它被称为原型链：当我们试图访问对象上不存在的属性时，JavaScript 会递归地遍历所有 `__proto` 指向的对象，直到找到该属性为止！

---

#### Object.create

`Object.create` 方法允许我们创建一个新的对象，并且可以显式地将其原型上的值传递给该对象。

```javascript
const dog = {
  bark() {
    return `Woof!`;
  },
};

const pet1 = Object.create(dog);
```

虽然 `pet1` 本身没有任何属性，但它确实可以访问其原型链上的属性！由于我们将 `dog` 对象作为 `pet1` 的原型传递，因此我们可以访问 `bark` 属性。

> ---
>
> > 打开 https://codesandbox.io/embed/funny-wing-w38zk 查看示例代码
>
> ---

太棒了！`Object.create` 是一种通过指定新创建对象原型的简单方式，让对象直接从其他对象继承属性。新对象可以通过遍历原型链来访问新的属性。

---

原型模式允许我们轻松地让对象访问和继承其他对象的属性。由于原型链允许我们访问对象本身未直接定义的属性，因此我们可以避免方法和属性的重复，从而减少内存的使用。

---

#### 参考文档

- [Object.create](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create) - MDN
- [Prototype](https://www.ecma-international.org/ecma-262/5.1/#sec-4.3.5) - ECMA

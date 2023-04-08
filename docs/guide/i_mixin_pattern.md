# 原型模式

## 写在前面
前面我们在学**原型模式**时，学习了一些关于**原型**的知识，我们知道通过原型是可以给对象添加属性和方法。而通过**Object.assign**方法或者**__proto__**属性添加属性，也就是今天我们要讲的**混合模式**。

### 极简释义
在**不使用继承**的情况下给Object对象或者class类**添加**函数。
> 基本实现方式就是使用**Object.assign**方法给目标类的原型(**prototype**)上添加属性, 然后**新创建**的对象都可以访问**新加**的函数。

```js
class Dog {
  constructor(name) {
    this.name = name;
  }
}

const dogFunctionality = {
  bark: () => console.log("Woof!"),
  wagTail: () => console.log("Wagging my tail!"),
  play: () => console.log("Playing!")
};

Object.assign(Dog.prototype, dogFunctionality);
```
通过直接给**Dog这个类的原型**添加方法,现在我们可以直接**调用新增**的方法了:
```js
const pet1 = new Dog("Daisy");

pet1.name; // Daisy
pet1.bark(); // Woof!
pet1.play(); // Playing!
```


### 被混合的Object之间可以使用继承

混合模式允许给Class和Object不使用继承添加属性和方法，同时**被混合**的Object之间是**可以**使用**继承**的。

看下面的例子：

```js
const animalFunctionality = {
  walk: () => console.log("Walking!"),
  sleep: () => console.log("Sleeping!")
};

const dogFunctionality = {
  bark: () => console.log("Woof!"),
  wagTail: () => console.log("Wagging my tail!"),
  play: () => console.log("Playing!"),
  walk() {
    super.walk();
  },
  sleep() {
    super.sleep();
  }
};

Object.assign(dogFunctionality, animalFunctionality);
Object.assign(Dog.prototype, dogFunctionality);
```

在上面的例子中，我们首先使用**Object.assign**给dogFunctionality添加了动物animalFunctionality的函数，然后又把dogFunctionality里的**函数**添加给了**Dog**这个类的**原型**。

这个例子可以换种原型的写法**__Proto__**来实现，一个意思：

```js
class Dog {
  constructor(name) {
    this.name = name;
  }
}


const animalFunctionality = {
  fly: ()=>console.log("fly"),
  walk: () => console.log("Walking!"),
  sleep: () => console.log("Sleeping!")
};


const dogFunctionality = {
  __proto__: animalFunctionality,
  bark: () => console.log("Woof!"),
  wagTail: () => console.log("Wagging my tail!"),
  play: () => console.log("Playing!"),
  walk() {
    super.walk();
  },
  sleep() {
    super.sleep();
  }
};

Object.assign(Dog.prototype, dogFunctionality);

const pet1 = new Dog("Daisy");

console.log(pet1.name); // Daisy
pet1.bark(); // Woof!
pet1.play(); // Playing!
pet1.walk(); // Walking!
pet1.sleep(); // Sleeping!

// 调试
pet1.fly(); // Error, pet1.fly is not a function

console.log(pet1.__proto__); //{bark...wagTail...play...walk...sleep}
console.log(Dog.prototype); //{bark...wagTail...play...walk...sleep}
console.log(dogFunctionality.__proto__); //{fly...walk...sleep}
console.log(animalFunctionality.__proto__); //{}
```
[在线示例](https://codesandbox.io/s/mixin-1-forked-9bzu18?file=/src/index.js)
> 需要注意的是，dogFunctionality 原型的方法**fly**，Dog类中**无法**调用；
> 
> 给Dog添加的原型，并没有把所添加**原型的原型**里的方法给添加上；
> 
> Dog**类**访问原型用**prototype**, Dog的实例对象或其他任意**对象**通过**\____proto____**访问原型；
> 
> **只支持函数**，不支持其他属性；
## 案例分析

### 浏览器window对象

在实际的应用中一个比较明显的混合模式是**浏览器**界面里的**window**对象。window对象的很多属性实现自[`WindowOrWorkerGlobalScope`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope) 和 [`WindowEventHandler`](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers)的混合，然后我们才能使用诸如`setTimeout` 和 `setInterval`, `indexedDB`, 和 `isSecureContext`这些属性。

因为**混合模式**下，只能实现给Object对象添加函数属性，而不能直接调用诸如WindowOrWorkerGlobalScope 这样的对象。


```
window.indexedDB.open("toDoList");


window.addEventListener("beforeunload", event => {
  event.preventDefault();
  event.returnValue = "";
});


window.onbeforeunload = function() {
  console.log("Unloading!");
};
// 可以调用混合后的属性
console.log(
  "From WindowEventHandlers mixin: onbeforeunload",
  window.onbeforeunload
);


console.log(
  "From WindowOrWorkerGlobalScope mixin: isSecureContext",
  window.isSecureContext
);

// 可以调用被混合的对象
console.log(
  "WindowEventHandlers itself is undefined",
  window.WindowEventHandlers
);


console.log(
  "WindowOrWorkerGlobalScope itself is undefined",
  window.WindowOrWorkerGlobalScope
);
```

### ES6之前的React

在React引入**ES6之前**，经常使用**混合模式**来给React组件添加函数。

React团队并**不推荐**使用混合模式，因为这会给组件带来不必要的**复杂度**，并且**难以维护和复用**；而是推荐使用**高阶函数**，当然现在大都被**hooks**方式取代了。

## 总结

混合模式允许我们在**不使用继承**的情况下，用给**对象原型注入函数**的方式，从而轻松实现地给对象添加函数。但是**修改对象原型**往往并**不是**好的做法，因为这样可能会导致**原型污染**和一定程度的**函数溯源混乱**。





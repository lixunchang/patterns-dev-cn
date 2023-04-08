# 工厂方法模式
## 写在前面
在**工厂方法模式**，我们可以使用一个**函数**来**创建对象**，而不使用**new**关键字。

比如说我们程序中会有**很多用户**，每个用户都**有姓有名**，邮箱等属性，可以用工厂模式实现：
```js
const createUser = ({ firstName, lastName, email }) => ({
  firstName,
  lastName,
  email,
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
});

const user1 = createUser({

**firstName**: "John",

lastName: "Doe",

email: "john@doe.com"

});

const user2 = createUser({

firstName: "Jane2",

lastName: "Doe2",

email: "jane@doe.com"

});

console.log(user1);//{...}
console.log(user2.fullName()); //Jane2 Doe2
```
现在我们就可以**调用**createUser来创建用户对象了，并且新对象调用**fullName**方法获取全名了。

[在线调试](https://codesandbox.io/s/factory-pattern-1-8s5cv?from-embed=&file=/src/index.js)

工厂方法模式在创建**相对复杂**些并且**可配置**的对象时是很有效的。另外当有些对象的**键**和**值**依赖**配置**得出时，也可以使用**工厂方法模式**轻松地创建：
```js
const createObjectFromArray = ([key, value]) => ({
  [key]: value,
});
 
createObjectFromArray(["name", "John"]); // { name: "John" }
```

## 总结

工厂方法模式对于创建**多个**共享属性且相对**较小对象**时是很有用的。工厂模式可以轻松地创建**依赖环境**或者**用户配置**的对象。

在JavaScript中，**工厂方法模式**仅仅是一个**不使用**new关键字，来**创建对象**的方法。ES6的**箭头函数**可以**隐式**返回一个**简易**的工厂方法。

通常情况下，使用**工厂方法模式**比使用**new**关键字更**节约内存**。

上面的案例使用**new**关键字实现如下：

```js
class User {
  constructor(firstName, lastName, email) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
 
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
 
const user1 = new User({
  firstName: "John",
  lastName: "Doe",
  email: "john@doe.com",
});
 
const user2 = new User({
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@doe.com",
});
```

通过对比, 我们不难发现, 使用`class`方式来创建对象, 代码**行数较多**, 而且细想到`class`背后的**实现原理**也是**构造函数**来实现的, 在**较小对象**时, 还不如**直接用函数**来的简洁.

当然**工厂方法**对于**属性较少**的对象时, 会比较**直观**, 而对于**属性较多**和包含**复杂逻辑**的对象, 还是`class`更能让人清晰明了.

具体的**使用场景**还是要根据**实际情**况来判断----`实事求是`.


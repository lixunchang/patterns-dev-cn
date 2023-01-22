---
highlight: atom-one-dark
theme: smartblue
---

### 写在前面

现在相信大家对于**模块化**应该会有很直观的感受，比如我们最常用的node_modules就是模块化最成功的应用了，而且这种应用是工程架构级别的，对所有前端应用都可以使用。当然我们今天说的**模块化模式**则是主要针对具体代码的**组织形式**上来说的。

### 极简释义

> 把代码**拆分**成更小的模块，降**低耦合**性，提**高复用**性。

### 正文

随着项目发展，代码库也**越来越大**，保持代码的可**维护性**和**解耦合**越来越重要。**模块化这种设计模式**就可以把代码分成若干个**复用性强**的小模块。

**模块化模式**还有很多其他好处，比如说：在module中**保护私有变量**，降低**命名冲突**和**全局污染**，在复杂场景还可以实现**动态加载**。
> 内部的声明都是默认被封闭在模块内的, 不直接export的话，在模块外是不可用的。

#### ES2015 Modules

ES2015新增了JS语言**内置**的modules。一个模块是一个**JS代码组成**的文件，和普通的脚本在使用时有一些区别。

下面我们来看一个例子：math.js中包含一些常用的数学计算：

```js
function add(x, y) {
  return x + y;
}
function multiply(x) {
  return x * 2;
}
function subtract(x, y) {
  return x - y;
}
function square(x) {
  return x * x;
}
```
当前JS文件中的方法，**只能**在当前文件math.js中使用，**不能**在其他文件中使用，如果要在其他js文件中使用，需要用到**export关键字**导出，我们可以在每个方法前添加export关键字：

```js
export function add(x, y) {
  return x + y;
}


export function multiply(x) {
  return x * 2;
}


export function subtract(x, y) {
  return x - y;
}


export function square(x) {
  return x * x;
}
```

当然仅仅export导出, 并不能在其他js文件中直接使用，还需要在要使用的js文件中**import关键字**引入即可，相信大家都很熟悉：

```js
import { add, multiply, subtract, square } from "./math.js";
```

这样我们就能在module外**使用export导出**的方法了，将代码模块化有**两个**好处：

**一是**代码分割成**独立**的小模块，降**低耦合**，提**高复用**性；

**二就**是模块内部**未export**的变量只对模块内部私有，不会污染**全局作用域**，避免**命名冲突**，也可以提高模块内私有变量的**安全性**；


### 使用技巧

1. 模块化**导出**的属性名可能和**本地**的属性名**冲突**：

```js
import { add, multiply, subtract, square } from "./math.js";


function add(...args) {
  return args.reduce((acc, cur) => cur + acc);
} /* Error: add has  already been declared */


function multiply(...args) {
  return args.reduce((acc, cur) => cur * acc);
}
/* Error: multiply has already been declared */
```
可以通过**as关键字**重命名导出的变量；

```js
import {
  add as addValues,
  multiply as multiplyValues,
  subtract,
  square
} from "./math.js";
```
2. 模块化导出时，export 和 export default的区别：
- **export 导出**时，**import**引入属性要在**大括号**{}内:

```
// math.js
export function add(x, y) {
  return x + y;
}
// index.js
import { add } from "./math.js";
```
- **export default** 导出，**只能导出**一个属性，意思是**默认导出**，import引入时**直接引入**，并且可以**直接**重新命名：

```
// math.js
export default function add(x, y) {
  return x + y;
}
// index.js
import addValues from "./math.js";
```

> export 和 export default 可以同时使用；

3. import引入时，可以**使用import * 引入**所有export和export default导出的属性, 通过**as关键字**赋值并重命名：

```js
import * as math from "./math.js";

math.default(7, 8);
math.multiply(8, 9);
math.subtract(10, 3);
math.square(3);

```
> 通过*导入的export default属性，只能通过**math.default**访问，**不能**使用math.add。


### 动态引入模块——import()

随着项目变得越来越大，在一个**复杂组件**中可能需要引入**很多模块**，这可能会消耗一些**性能**，影响**加载时间**和**使用体验**。仔细分析这些模块我们发现，一些**模块**的使用**需要特定的条件**，这时可以考虑使用**动态引入**这些模块：

```js
import("module").then(module => {
  module.default();
  module.namedExport();
});

// Or with async/await
(async () => {
  const module = await import("module");
  module.default();
  module.namedExport();
})();
```

比如说上面示例中math模块，当用户**点击按钮**才需要**调用**math模块的方法，我们可以这样实现：

```js
const button = document.getElementById("btn");

button.addEventListener("click", () => {
  import("./math.js").then((module) => {
    console.log("Add: ", module.add(1, 2));
    console.log("Multiply: ", module.multiply(3, 2));

****
    const button = document.getElementById("btn");
    button.innerHTML = "Check the console";
  });
});


/*************************** */
/**** Or with async/await ****/
/*************************** */
// button.addEventListener("click", async () => {
//   const module = await import("./math.js");
//   console.log("Add: ", module.add(1, 2));
//   console.log("Multiply: ", module.multiply(3, 2));
// });
```

[在线示例](https://codesandbox.io/embed/green-sound-j60fl)

通过**动态加载**可以**直接**优化页面**加载时间**，提升**用户体验**。

同时，**import方法**可以接受**字面量**表达式：
```js
const res = await import(`../assets/dog${num}.png`);
```
比如上面的图片示例，可以**弹性**的加载**指定路径**的的图片，而**不需要**一次性把**所有图片**全部引入到组件中。

### 总结

使用**模块化**这种设计模式，可以封装**非全局**的代码块到某个模块之中，实现**低风险**地使用**多级模块依赖**和**命名空间**，能有效**避免**命名**冲突**和全局**污染**。
> 为了在所有**js运行时**使用ES2015的**module**，需要使用到类似babel的**转译器**。


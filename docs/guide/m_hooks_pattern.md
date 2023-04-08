# React Hooks

## 写在前面

React 16.8 引入了一个叫**Hooks**新特性，它允许我们在**Function组件**中**使用state**和**生命周期**，这简直是**革命性的**，**以前**我们只能在**class**组件中使用state和生命周期，**Function组件**只能是**stateless组件**。

虽然确切地说Hooks并不算是设计模式，但是它在程序设计中确实很重要的，并且很多设计模式可以被Hooks替代。所以我们还是很有必要学习Hooks的。

### Class Component
相信大家都还记得在Hooks出现之前，我们在class中使用**state和生命周期**的场景，大概就是下面这个样子：
```js
class MyComponent extends React.Component {
  /* Adding state and binding custom methods */
  constructor() {
    super()
    this.state = { ... }

    this.customMethodOne = this.customMethodOne.bind(this)
    this.customMethodTwo = this.customMethodTwo.bind(this)
  }

  /* Lifecycle Methods */
  componentDidMount() { ...}
  componentWillUnmount() { ... }

  /* Custom methods */
  customMethodOne() { ... }
  customMethodTwo() { ... }

  render() { return { ... }}
}
```
通常一个class Component 会在**构造函数**里声明state，并在诸如componentDidMount和componentWillUnmount的**生命周期**方法中处理一些**异步**副作用逻辑，也会在class中自定义一些其他方法。

当然React在引入**Hooks**之后，**使用class** Component的比例已经**大大降低**了。

下面让我们来总结下**使用class** Component面临的一些**问题**。

### 理解class Component的缺点

正因为在**Hooks之前**，要想使用state和生命周期我们只能选择**class** Component；在需求变更时，有时我们不得不把**Function** Component**重构**成**Class** component，从而实现新的需求，这往往是一个**痛苦**的过程。

比如，有这样一个**Function** Component，只是包含一个简单的div的Button组件：

```js
function Button() {
  return <div className="btn">disabled</div>;
}
```
由于**需求变更**，需要在用户点击Button时，文案变成enabled，并且需要添加一些额外的样式。

因此，我们必须要知道Button最新的**状态**，disabled还是enabled，为此我们就不得不完全**重构**这个组件，首先把这个组件**改造成class** Component，只是为了记录按钮的状态。

```js
export default class Button extends React.Component {
  constructor() {
    super();
    this.state = { enabled: false };
  }

  render() {
    const { enabled } = this.state;
    const btnText = enabled ? "enabled" : "disabled";

    return (
      <div
        className={`btn enabled-${enabled}`}
        onClick={() => this.setState({ enabled: !enabled })}
      >
        {btnText}
      </div>
    );
  }
}
```
当然，这样也实现了需求。在这简单的示例中，重构的代码也不大。但是在**实际的项目**中，组件的代码**行数可能有很多**，**逻辑可能很复杂**，这无疑会**增加的重构**的难度。

在重构过程中，我们不得不**十分**小心，生怕修改了**原有的逻辑**，同时还必须要理解es2015 **class的工作原理**：
- **为什么**我们要使用bind？
- 构造函数是**干啥的**？
- this关键词**从哪里来**，**在哪里**可以用？

并且要保证在重构过程中不会**意外地**修改数据流，这些都是十分复杂和困难的。


## 结构调整

在多个组件中**复用代码**，常用的方法是[高阶组件](https://juejin.cn/post/7202625823667961913)和[传递render函数](https://juejin.cn/post/7204373466191446072)这两个设计模式，当然这两个模式是很有效的，也是比较好的做法。如果这些**设计模式添加的比较晚**的话，就不得不**调整结构**，**重构**整个功能模块。

在重构时，代码越多，就越是要小心。当项目为了共享功能而嵌套过多，要小心**嵌套地狱**发生。
```jsx
<WrapperOne>
  <WrapperTwo>
    <WrapperThree>
      <WrapperFour>
        <WrapperFive>
          <Component>
            <h1>Finally in the component!</h1>
          </Component>
        </WrapperFive>
      </WrapperFour>
    </WrapperThree>
  </WrapperTwo>
</WrapperOne>
```
嵌套地狱会让程序的数据流变得难以理解，并且会难以查找异常。

## 复杂性

随着class Component的**功能越来越多**，组件也变得**越来越臃肿**，很多**不相关的逻辑**混合在**生命周期函数**中，这时组件就变得**杂乱**而**没有条理**，查找确切的逻辑使用范围就变得困难，**调试和优化**也变得**越来越难**。

下面我们来看一个例子：
```js
import { Count } from "./Count";
import { Width } from "./Width";


export default class Counter extends React.Component {
  constructor() {
    super();
    this.state = {
      count: 0,
      width: 0
    };
  }


  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }


  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }


  increment = () => {
    this.setState(({ count }) => ({ count: count + 1 }));
  };


  decrement = () => {
    this.setState(({ count }) => ({ count: count - 1 }));
  };


  handleResize = () => {
    this.setState({ width: window.innerWidth });
  };


  render() {
    return (
      <div className="App">
        <Count
          count={this.state.count}
          increment={this.increment}
          decrement={this.decrement}
        />
        <div id="divider" />
        <Width width={this.state.width} />
      </div>
    );
  }
}
```
上面的代码，可以可视化的分析如下：

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/543be32300f744409610d8ad6fc026d0~tplv-k3u1fbpfcp-watermark.image?" alt="image.png" width="100%" />

尽管这是个小例子，但逻辑**已经混杂**在一起了，随着业务的增长，各种逻辑代码**混杂**的更为繁琐。

除了逻辑混杂，生命周期中的逻辑也多有重复，比如说上面的例子，在componentDidMount和componentWillUnmount里都有关于window resize方法。

## Hooks

由此得出结论，在React中class Component使用已经遇到**了瓶颈**。正是为了解决class Component的瓶颈，React官方**创造性地**引入了**Hooks**，Hooks简单来说就是可以在**Function Component**中**使用state和生命周期方法**。

React Hooks具体能做什么呢？

- 在**Function Component**中**使用state**;
- 在**Function Component**中管理组件的**生命周期**，并不使用componentWillMount和componentDidMount；
- 在全局多个组件中**复用**包含相同state或**逻辑**的代码；

接下来，我们来看一下，怎么在Function中使用state吧。

### State Hooks

React Hooks为在Function component中使用state，提供了一个hook, 叫useState。

下面让我们来看看使用**useState**怎么把一个class Component改组成为一个Function Component。
这里我们假设class Component是一个**双向绑定**的输入框，代码如下：

```js
class Input extends React.Component {
  constructor() {
    super();
    this.state = { input: "" };

    this.handleInput = this.handleInput.bind(this);
  }

  handleInput(e) {
    this.setState({ input: e.target.value });
  }

  render() {
    <input onChange={handleInput} value={this.state.input} />;
  }
}
```
在着手改造之前，我们先来学习下useState基础知识：

> 首先useState接收一个**初始值**作为参数，在这里的示例中就是空字符串；同时我们可以从useState的**返回值中解构出两个属性**：
> - 代表当前值的state变量；
> - 能改变state的方法；

```js
const [value, setValue] = React.useState(initialValue);
```
> 第一个**返回值**，代表state变量的value相当于class Component里的this.state[value]；
> 而第二个**修改state的方法**可以类比class Component里的this.setState方法。

现在就可以开始改造前面提到的Input这个组件了，由于功能比较简单，改造后代码如下：

```js
function Input() {
  const [input, setInput] = React.useState("");
  return <input onChange={(e) => setInput(e.target.value)} value={input} />;
}
```

这里的内容比较简单，就不再过多解释。其中有两点要特别提一嘴：

- useState第二个返回值，setValue方法按照**命名规范**，要采用**set开头**，并且**驼峰命**名————setXxxx这种格式；
- useState第二个返回值，setValue方法除了接受具体值，还可以**接收一个方法**，这个方法的作用是手动合并state的其他属性；

> 根据官方文档提示：**useState**的第二个返回值更新方法**没有**像class Component里的setState**自动合并**state逻辑，所以可以用传递一个**方法**来**手动合并**；同时官方文档也推荐使用**useReducer**来管理多属性的state对象

```
const [state, setState] = useState({});
setState(prevState => {
  // Object.assign would also work
  return {...prevState, ...updatedValues};
});
```

### Effect Hook

现在我们已经知道可以通过useState在Function Component组件里使用state，那么怎么在Function Component里**使用生命周期**呢？

通过useEffect我们可以用钩子实现**生命周期**函数，useEffect函数可以有效地实现类似class Component的
`componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`生命周期函数。

```js
componentDidMount() { ... }
useEffect(() => { ... }, [])

componentWillUnmount() { ... }
useEffect(() => { return () => { ... } }, [])

componentDidUpdate() { ... }
useEffect(() => { ... })
```
useEffect可以多次调用，这里主要讲解useEffect二个参数：
- 第**二**个参数为**空数组**只会执行**一**次，可以实现类似**componentDidMount**生命周期；
- 第一个参数接受一个方法，这个方法可以**返回一个函数**，这个函数在组件**销毁前**调用，可以实现类似**componentWillUnmount**生命周期；
- 第二个参数**不传**，组件每次**更新执行**一次，可以实现类似**componentDidUpdate**生命周期；

使用上面input的例子：

```jsx
import React, { useState, useEffect } from "react";


export default function Input() {
  const [input, setInput] = useState("");


  useEffect(() => {
    console.log(`The user typed ${input}`);
  }, [input]);


  return (
    <input
      onChange={e => setInput(e.target.value)}
      value={input}
      placeholder="Type something..."
    />
  );
}
```
通过log我们可以知道，这个useEffect在input每次改变的时候调用；

### 自定义Hook
react官方还提供除前面讲的`useState`, `useEffect`，其他hook有, `useReducer`, `useRef`, `useContext`, `useMemo`, `useImperativeHandle`, `useLayoutEffect`, `useDebugValue`, `useCallback`，下面调重点简单介绍下。

- **useReducer**会**自动合并**state里的其他属性，等同于class Component里的**setState**；
- **useContext**用来**跨层级传递参数**，前面供应商模式中有提到；
- **useRef**用来**缓存dom**对象，操作真实dom;
- **useMemo**用来**缓存**方法返回**值**；
- **useCallback**用来**缓存方法**；

这些都是比较常用的，都可以用来优化Function Component的性能。


当然我们也可以自定义hooks，需要注意的是：
- 只有**use命名开头**的方法，才会被React识别为hook；
- 另外自定义的hook里要**使用官方提供的hook**，
满足这两个条件才是一个合格的自定义hook。

比如说我们要**监听键盘**某个按键的事件，我们可以**自定义一个hook:**

```js
function useKeyPress(targetKey) {
  const [keyPressed, setKeyPressed] = React.useState(false);

  function handleDown({ key }) {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }

  function handleUp({ key }) {
    if (key === targetKey) {
      setKeyPressed(false);
    }
  }

  React.useEffect(() => {
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  return keyPressed;
}
```
下面来看一下怎么**使用**，比如监听`q`, `l` or `w` 键：
```jsx
import React from "react";
import useKeyPress from "./useKeyPress";


export default function Input() {
  const [input, setInput] = React.useState("");
  const pressQ = useKeyPress("q");
  const pressW = useKeyPress("w");
  const pressL = useKeyPress("l");


  React.useEffect(() => {
    console.log(`The user pressed Q!`);
  }, [pressQ]);


  React.useEffect(() => {
    console.log(`The user pressed W!`);
  }, [pressW]);


  React.useEffect(() => {
    console.log(`The user pressed L!`);
  }, [pressL]);


  return (
    <input
      onChange={e => setInput(e.target.value)}
      value={input}
      placeholder="Type something..."
    />
  );
}
```

现在我们可以**监听**键盘上**任意**按键，而不用一遍又一遍地写监听事件，解绑事件了。

另一个关于Hook的好消息就是社区里已经有很多**优秀**的**自定义hook**集合，而不用我们自己实现了，下面给他家推荐一些：

-   **[React Use](https://github.com/streamich/react-use)**
-   **[useHooks](https://usehooks.com/)**
-   **[Collection of React Hooks](https://nikgraf.github.io/react-hooks/)**

当然国内也有**阿里**开源的**高质量**的hooks:
- [ahooks](https://ahooks.js.org/zh-CN/)


## 总结

使用Hook主要有以下几点**好处**：

- **代码行**能**减少**很多；
- **复用state**逻辑；
- **复用非可视化逻辑**；

当然hook也有**一些缺点**需要注意：
- hook的**规范**不好执行，不使用lint插件，难以排查；
- 需要一定的**学习成本**和**实践经验**，比如useEffect;
- 可能会**错误使用hook**，比如useMemo和useCallback;

随着hook的引入，带来一个**新**的问题，**怎么选择**是该使用hook还是该使用class呢？

总的来说hook有**更浅的dom层级嵌套**和**更清晰的逻辑**。所以除非一些需要用到**class独有**的类似继承之类的属性，其他场景都可以**使用hook来减少工作量**，从而有**更多的摸鱼时间**。


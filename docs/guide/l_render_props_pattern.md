# 传递render函数模式

## 背景介绍

这是设计模式系列的第十一节，学习的是[patterns.dev](https://link.juejin.cn?target=)里设计模式中[render函数作为props模式](https://www.patterns.dev/posts/render-props-pattern/)内容，由于是资料是英文版，所以我的学习笔记就带有**翻译**的性质，但并不是翻译，记录的是自己的**学习过程和理解**。

> 关于设计模式前九节的内容，在文末会有直达链接。

## render函数作为props模式

**极简释义**：通过props或children**传递render函数**，**动态渲染**组件。

## 正文开始

```jsx
<Title render={() => <h1>I am a render prop!</h1>} />
const Title = props => props.render();
```

在[高阶组件](https://juejin.cn/post/7202625823667961913)一章，我们知道通过高阶组件，我们可以多组件**复用数据或逻辑**，另外一种实现方法就是**传递render函数**作为Props或children。

传递**render函数**这种模式就是给组件**传递一个渲染函数**，这个**渲染函数返回JSX组件**，而组件自己可以不渲染任何东西，只**执行传递的render函数**。

正如前面给到的**示例Title组件**传递一个render函数那样。


```jsx
import React from "react";
import { render } from "react-dom";


import "./styles.css";


const Title = (props) => props.render();


render(
  <div className="App">
    <Title
      render={() => (
        <h1>
          <span role="img" aria-label="emoji">
            ✨
          </span>
          I am a render prop!{" "}
          <span role="img" aria-label="emoji">
            ✨
          </span>
        </h1>
      )}
    />
  </div>,
  document.getElementById("root")
);
```

那么我们**为什么**要这样这样**传递render函数**呢？这样做的好处就是让Title组件具有很强的**复用性**，每次都可以**传递不同**的render，从而执行**不同的渲染逻辑**。

```jsx
import React from "react";
import { render } from "react-dom";
import "./styles.css";


const Title = (props) => props.render();


render(
  <div className="App">
    <Title render={() => <h1>✨ First render prop! ✨</h1>} />
    <Title render={() => <h2>🔥 Second render prop! 🔥</h2>} />
    <Title render={() => <h3>🚀 Third render prop! 🚀</h3>} />
  </div>,
  document.getElementById("root")
);
```

当然render函数并一定需要**命名**为render，也可以同时传递**多个render函数**，同时进行渲染，像下面这样：

```jsx
import React from "react";
import { render } from "react-dom";
import "./styles.css";


const Title = (props) => (
  <>
    {props.renderFirstComponent()}
    {props.renderSecondComponent()}
    {props.renderThirdComponent()}
  </>
);


render(
  <div className="App">
    <Title
      renderFirstComponent={() => <h1>✨ First render prop! ✨</h1>}
      renderSecondComponent={() => <h2>🔥 Second render prop! 🔥</h2>}
      renderThirdComponent={() => <h3>🚀 Third render prop! 🚀</h3>}
    />
  </div>,
  document.getElementById("root")
);
```
## 进阶用法
通常情况下使用**render作为props**的组件，**不仅执行**传递过来的render渲染JSX，还会有一些**数据和逻辑处理**：

```jsx
function Component(props) {
  const data = { ... }

  return props.render(data)
}

<Component render={data => <ChildComponent data={data} />}
```
比如说上面这个例子，render函数还接受Component传递过来的data数据，然后再把数据转交给ChildComponet进行渲染。
### 案例分析
接下来，我们来看一个小小的**案例**：一个小应用，用户可以**输入**一个摄氏温度，我们将**摄氏**温度**转换**成**里氏**和**标准**温度，代码如下：
```jsx
import React, { useState } from "react";
import "./styles.css";


function Input() {
  const [value, setValue] = useState("");


  return (
    <input
      type="text"
      value={value}
      onChange={e => setValue(e.target.value)}
      placeholder="Temp in °C"
    />
  );
}


export default function App() {
  return (
    <div className="App">
      <h1>☃️ Temperature Converter 🌞</h1>
      <Input />
      <Kelvin />
      <Fahrenheit />
    </div>
  );
}


function Kelvin({ value = 0 }) {
  return <div className="temp">{value + 273.15}K</div>;
}


function Fahrenheit({ value = 0 }) {
  return <div className="temp">{(value * 9) / 5 + 32}°F</div>;
}
```
上面的代码就遇到一个**问题**，输入框组件里的**state温度值**，同级的**Kelvin**和**Fahrenheit**组件**拿不到值**？
#### 提升state层级
这时有一个常见的办法是，**提升state层级**到APP，传递state和setState方法给input输入框：

```jsx
function Input({ value, handleChange }) {
  return <input value={value} onChange={e => handleChange(e.target.value)} />;
}

export default function App() {
  const [value, setValue] = useState("");

  return (
    <div className="App">
      <h1>☃️ Temperature Converter 🌞</h1>
      <Input value={value} handleChange={setValue} />
      <Kelvin value={value} />
      <Fahrenheit value={value} />
    </div>
  );
}
```
虽然这是个**可行**的方法，但是在**复杂的大型**应用中，**提升state的层级**是一件**危险**的操作，而**高层级的state变化**会让该层级的**所有**子组件**重新渲染**，而那些**不使用**该state的组件就会**过度渲染**，从而**影响性能**。

有没有什么办法**不提升state层级**呢？这个时候就适合**render作为props**这种模式上场了

#### render函数作为props模式

由前文介绍，我们可以**render函数作为props传递**给组件。那么在这个案例中，我们是不是可以把 Kelvin和Fahrenheit这两个组件作为**render传递**给Input组件呢？

答案是当然的，这样就可以**不**用**提升state**层级，同时Input组件保持**最大复用**性：

```jsx
function Input(props) {
  const [value, setValue] = useState("");

  return (
    <>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Temp in °C"
      />
      {props.render(value)}
    </>
  );
}

export default function App() {
  return (
    <div className="App">
      <h1>☃️ Temperature Converter 🌞</h1>
      <Input
        render={value => (
          <>
            <Kelvin value={value} />
            <Fahrenheit value={value} />
          </>
        )}
      />
    </div>
  );
}
```
### 用render函数作为children

还有一种大家更常见的写法是把**render函数作为children传递**给组件，记得我在使用**ant**的组件和**react-dnd**时，就见过这种写法。

比如上面的例子，我们在Input组件的**children**里写**render函数**，在Input组件里**调用**children函数进行**渲染**：
```
export default function App() {
  return (
    <div className="App">
      <h1>☃️ Temperature Converter 🌞</h1>
      <Input>
        {value => (
          <>
            <Kelvin value={value} />
            <Fahrenheit value={value} />
          </>
        )}
      </Input>
    </div>
  );
}

function Input(props) {
  const [value, setValue] = useState("");

  return (
    <>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Temp in °C"
      />
      {props.children(value)}
    </>
  );
}
```

## 总结

通过**props或children传递render函数**这种模式，和**高阶组件**模式一样，都解决多组件**复用数据和逻辑**问题，当然也包括增强**组件复用性**。并且在一些场景下，高阶组件可以**替代**传递render函数。但是**相较于**高阶组件模式，**传递render函数模式**有自己的**优点**：

- 传递render函数渲染这种模式，**直接传递**props，没有自动合并props，所以**没有**高阶组件的**命名冲突**覆盖问题；
- **数据更容易追溯源头**，没有高阶组件的隐藏props的问题；
- **实现逻辑和视图渲染的分离**；

当然**传递render函数**这种模式，在大部分场景下，可以**被Hooks取代**。当然如果在render函数里**没有使用**生命周期函数，并且**不改变**接受到的state，那么使用**传递render函数模式**也是很好的。


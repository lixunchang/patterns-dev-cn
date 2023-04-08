## 供应商模式

### 写在前面

**供应商模式**可以说非常实用，在**组件设计拆分**过程中，很多**不同层级**的组件需要**全局**的用户信息，或者某个**局部**业务数据，有时我们**懒于设计**，采用最懒最直接的**props 层层传递**的模式实现，经常我们是迫于项目**排期**，或者没想到更好的方式，或者不熟悉供应商模式，最终都造成了我们**不愿意**看到的一个事实：写了**难以维护**的代码，俗称**shi 山**。

[过段时间再来维护自己的代码.gif](http://5b0988e595225.cdn.sohucs.com/images/20191202/1980df8962ac444fa1543bc87898655f.gif)，打死都不愿承认这些代码自己的**杰作**！

如果你也有这样的经历，来吧，跟我一起学习**供应商模式**，不要在代码里玩低端 props 接力了！！

### 释义

像供应商一样，为不同层级子组件供应全局或者局部数据；

#### shi 山代码分析

比如一个**App**页面，有侧边栏**SideBar**组件和内容**Content**组件；SideBar 组件内是个列表组件**List**，List 组件内有很多子项**ListItem**，需要用到 App 页面的**data**数据；内容 Content 组件内有**Header**和**Block**组件，都需要用到 App 里的**data**数据。

如果**层层传递**的写法，伪代码如下：

```js
function App() {
  const data = { ... }

  return (
    <div>
      <SideBar data={data} />
      <Content data={data} />
    </div>
  )
}

const SideBar = ({ data }) => <List data={data} />
const List = ({ data }) => <ListItem data={data} />
const ListItem = ({ data }) => <span>{data.listItem}</span>

const Content = ({ data }) => (
  <div>
    <Header data={data} />
    <Block data={data} />
  </div>
)
const Header = ({ data }) => <div>{data.title}</div>
const Block = ({ data }) => <Text data={data} />
const Text = ({ data }) => <h1>{data.text}</h1>
```

这样层层传递层级够深，就形成**props 黑洞**。上面的示例代码如果在真实的项目，会一个组件一个文件，复杂的情况可能要**跨好几层文件夹**，有些层级完全**不消费**data 数据，也必须要**代为子组件传递 props**；再者假如哪天**修改**一下 data 里的结构或者属性名，真的很头疼，这么多文件，哪个改了，哪个没改，还真不好确定，一点简单的改动，头上的**头发**估计又要掉**好几根**...

<p align=center><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/767eab24df1e468cbdb5f698ccff3d67~tplv-k3u1fbpfcp-watermark.image?" alt="image.png" width="50%" /></p>
<p align=center>绝顶聪明</p>

接下来，有请我们实力派**供应商模式**上场！

### 供应商模式

确实，遇到这种需要**跨层级传递 props**的情况，很适合我们供应商模式。供应商模式像是一个**商店**一样，为**不同层级的组件**提供所需要的**props 商品**。

那具体要怎么做呢？用一个**Provider**包裹所有需要使用 data 数据的组件，它是通过**Context**上下文进行传递的，这就要用到**React 为我们提供的 createContext**方法了。

```js
const DataContext = React.createContext()

function App() {

const data = { ... }

return (
    <div>
       <DataContext.Provider value={data}>
            <SideBar />
            <Content />
      </DataContext.Provider>
    </div>
  )
}

```

上面的代码，我们调用**createContext**方法创建了 DataContext 上下文对象，然后我们实用 DataContext.**Provider**包裹所有需要使用 data 数据的**组件**，并通过**value**属性把 data 传过去。

这样我们完成了供应商模式的**第一步**了，有了供应商子组件要怎么获得 data 数据呢？

```js
const SideBar = () => <List />;
const List = () => <ListItem />;
export const Content = () => (
  <div>
    <Header />
    <Block />
  </div>
);

function ListItem() {
  const { data } = React.useContext(DataContext); //跨文件 import导入DataContext
  return <span>{data.listItem}</span>;
}

function Text() {
  const { data } = React.useContext(DataContext);
  return <h1>{data.text}</h1>;
}

function Header() {
  const { data } = React.useContext(DataContext);
  return <div>{data.title}</div>;
}
```

大家可以看到，我们实用 React 为我们提供的**useContext** Hook 就可以拿到 data 数据；**_通过这种改造，就有效避免了每个层级都传 props，使用就消费，不使用就可以完全忽略 data 数据_**，后面**修改或者重构**起来也轻松多了。

所以说供应商模式是非常有用，特别是在**共享全局或局部数据**的时候。

### 经典案例

接下来我们来看一个经典案例：**动态主题** ———— 点击按钮切换主题颜色。其他**定制主题或者多主题模式**的场景实现方法大概差不多，多数是在**多种身份或者角色**的系统中，比如说一个项目中有**买家**和**卖家**两种角色，在产品设计时**买家用橙色主题色**，卖家用**蓝色主题色**，这时就可以使用供应商模式，设置全局主题供应商**Provider**，根据用户身份动态设置主题色。

主题切换 Demo 在线体验：https://codesandbox.io/embed/quirky-sun-9djpl, 下面来分析下里面的代码。

根组件 App.js 中：

```js
export const ThemeContext = React.createContext();

const themes = {
  light: {
    background: '#fff',
    color: '#000',
  },
  dark: {
    background: '#171717',
    color: '#fff',
  },
};

export default function App() {
  const [theme, setTheme] = useState('dark');

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  const providerValue = {
    theme: themes[theme],
    toggleTheme,
  };

  return (
    <div className={`App theme-${theme}`}>
      <ThemeContext.Provider value={providerValue}>
        <Toggle />
        <List />
      </ThemeContext.Provider>
    </div>
  );
}
```

我们首先调用**createContext**创建出一个 ThemeContext 并导出。然后使用 useState 生成 theme 主题变量，然后通过 ThemeContext.**Provider**包裹需要修改主题的组件。

然后在子孙组件里使用**useContext**消费主题，代码大概如下：

```
// Toggle.tsx
import React, { useContext } from "react";
import { ThemeContext } from "./App";

export default function Toggle() {
  const theme = useContext(ThemeContext);

  return (
    <label className="switch">
      <input type="checkbox" onClick={theme.toggleTheme} />
      <span className="slider round" />
    </label>
  );
}
// ListItem.tsx
import React, { useContext } from "react";
import { ThemeContext } from "./App";

export default function ListItem() {
  const theme = useContext(ThemeContext);

  return <li style={theme.theme}>...</li>;
}
```

这里由于**List**组件本身并**不消费**theme，那么就可以**完全忽略**theme，而 ListItem 组件需要消费 theme，则直接**通过 useContext**消费；更进一步还可以在 ListItem 里，通过**toggleTheme 方法**修改全局主题。

> 这如果使用 props 传递模式，那也是要通过 List 组件传递 toggleTheme 方法。

所以说供应商模式可以说非常的实用，一定要在项目中**用起来**。

### 封装供应商模式 HOOK

上面的案例中，我们通过 React.createContext 和 React.useContext 方法**创建和消费供应商 Context**，需要子组件导入 Context；这里我们可以自己封装一个 hook，就可以**简化使用 useContext 的逻辑**。

**主题的逻辑相对比较独立**，我们可以把这块内容单独提出来，其实可以直接讲**主题切换**的逻辑封装在**ContextProvider**里：

```js
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  const providerValue = {
    theme: themes[theme],
    toggleTheme,
  };

  return <ThemeContext.Provider value={providerValue}>{children}</ThemeContext.Provider>;
}

export default function App() {
  return (
    <div className={`App theme-${theme}`}>
      <ThemeProvider>
        <Toggle />
        <List />
      </ThemeProvider>
    </div>
  );
}
```

然后我们封装下**消费 ThemeContext 主题**的逻辑：

```js
function useThemeContext() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return theme;
}
```

经过这一步简单封装之后，消费 Context 时，直接调用**useThemeContext**钩子，组件就能拿到 theme 了。

### 优秀实现案例：style-components 里的 ThemeProvider

不知道大家有没有使用过**style-components**组件，里面的**ThemeProvider**就是类似的实现逻辑，有兴趣的可以找找源码阅读一下：

```js

import { ThemeProvider } from "styled-components";

export default function App() {
  const [theme, setTheme] = useState("dark");

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <div className={`App theme-${theme}`}>
      <ThemeProvider theme={themes[theme]}>
        <>
          <Toggle toggleTheme={toggleTheme} />
          <List />
        </>
      </ThemeProvider>
    </div>
  );
}

import styled from "styled-components";

export default function ListItem() {
  return (
    <Li>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat.
    </Li>
  );
}

const Li = styled.li`
  ${({ theme }) => `
     background-color: ${theme.backgroundColor};
     color: ${theme.color};
  `}
`;
```

### 总结：

供应商模式 ———— React 中**Context 相关的 API**，实现了**跨层级传递 props**。并且有效**减少重构**代码时发生 bug 的几率，**不消费**某个数据的组件可以完全忽略这个数据向下传递，同时也让整个应用的**数据流变的更清晰可控**。

在**根目录**上使用一些供应商模式，会让整个应用的数据流都变的清晰起来，因为所有组件都能**轻松获取**到**全局的变量**。

当然供应商模式也**有缺点**：**过度使用供应商模式**时，所有**useContext 关联**数据的组件，都会在数据变化时**重新渲染**，这会影响应用的**性能**。

所以要确保不消耗某数据的组件，不会因为使用了 useContext，从而产生该数据变化而重新渲染，那就可能需要**拆分不同的 Provider 供应商**来针对不同数据的更新，从而能**避免无效渲染**，最大限度**提升性能**。

---

## 原文翻译

## 提供者模式

> 使数据可用于多个子组件

在很多情况下，我们希望为应用程序中的一些（如果不是全部）组件提供可用数据。虽然我们可以使用 `props` 将数据传递给组件，但如果应用程序中几乎所有的组件都需要访问 props 的值，那么这可能很难做到。

当我们将 `props` 传递到组件树的下方时，我们经常会用到一种叫做 `prop drilling` 的东西。重构依赖于 `props` 的代码几乎是不可能的，而且很难知道某些数据来自哪里。

假设我们有一个包含特定数据的 `App` 组件。在组件树的最底层，我们有一个 `ListItem`、`Header` 和 `Text` 组件，它们都需要这些数据。为了将这些数据传输到这些组件，我们必须将其通过很多层组件。

<!-- ![](../pic_bed/1_4_pic_1.gif) -->

在我们的代码库中，这将类似于以下内容：

```javascript
function App() {
  const data = { ... }

  return (
    <div>
      <SideBar data={data} />
      <Content data={data} />
    </div>
  )
}

const SideBar = ({ data }) => <List data={data} />
const List = ({ data }) => <ListItem data={data} />
const ListItem = ({ data }) => <span>{data.listItem}</span>

const Content = ({ data }) => (
  <div>
    <Header data={data} />
    <Block data={data} />
  </div>
)
const Header = ({ data }) => <div>{data.title}</div>
const Block = ({ data }) => <Text data={data} />
const Text = ({ data }) => <h1>{data.text}</h1>
```

这种方式传递 `props` 会变的很混乱。如果我们想在将来重命名数据 `prop`，那么我们必须在所有组件中重命名它。当应用程序变得越大，`prop drilling` 就就会变的越复杂。

如果我们可以跳过不需要使用这些数据的所有组件层，那这将会是最佳选择。我们需要通过一些方式，让需要访问数据值的组件直接访问数据，而不依赖于 `prop drilling`。

这就是提供者模式可以帮助我们的地方！通过提供程序模式，我们可以将数据提供给多个组件。我们可以将所有组件包装在一个提供者中，而不是通过 `props` 将数据传递到每一层。提供者是 `Context` 对象所提供的高阶组件。我们可以使用 React 提供的 `createContext` 方法创建一个 `Context` 对象。

提供者接收一个 `prop` 参数，其中包含我们想要传递的数据。包装在此提供者中的所有组件都可以访问 `prop` 的值。

```javascript
const DataContext = React.createContext()

function App() {
  const data = { ... }

  return (
    <div>
      <DataContext.Provider value={data}>
        <SideBar />
        <Content />
      </DataContext.Provider>
    </div>
  )
}
```

我们不再需要手动将数据传递给每个组件了！那么，`ListItem`、`Header` 和 `Text` 组件如何访问数据的值呢？

每个组件都可以通过 `useContext` 钩子函数来访问数据。这个钩子函数接收数据引用的上下文（context），在本例中是 `DataContext`。`useContext` 钩子函数允许我们对 context 对象进行读写数据。

```javascript
const DataContext = React.createContext();

function App() {
  const data = { ... }

  return (
    <div>
      <SideBar />
      <Content />
    </div>
  )
}

const SideBar = () => <List />
const List = () => <ListItem />
const Content = () => <div><Header /><Block /></div>


function ListItem() {
  const { data } = React.useContext(DataContext);
  return <span>{data.listItem}</span>;
}

function Text() {
  const { data } = React.useContext(DataContext);
  return <h1>{data.text}</h1>;
}

function Header() {
  const { data } = React.useContext(DataContext);
  return <div>{data.title}</div>;
}
```

不使用数据的组件根本不需要进行数据的处理。我们也不再需要担心通过层层组件的 `props` 向下传递数据，即便这些组件并不需要这些数据，这同时使得重构更加容易。

<!-- ![](../pic_bed/1_4_pic_2.gif) -->

---

提供者模式对于共享全局数据非常有用。提供者模式的一个常见用例是在许多组件中共享主题 UI 的状态。

假设我们有一个显示列表的简单应用程序。

> ---
>
> > 打开 https://codesandbox.io/embed/busy-oskar-ifz3w 查看示例代码
>
> ---

我们希望用户能够通过切换开关在 lightmode 和 darkmode 两个主题之间互相切换。当用户从 darkmode 模式切换到 lightmode 模式时，背景颜色和文本颜色应该也随之改变，反之亦然！我们可以将组件包装在 `ThemeProvider` 中，并将当前主题颜色传递给提供者，而不是将当前主题状态传递给每个组件。

```javascript
export const ThemeContext = React.createContext();

const themes = {
  light: {
    background: '#fff',
    color: '#000',
  },
  dark: {
    background: '#171717',
    color: '#fff',
  },
};

export default function App() {
  const [theme, setTheme] = useState('dark');

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  const providerValue = {
    theme: themes[theme],
    toggleTheme,
  };

  return (
    <div className={`App theme-${theme}`}>
      <ThemeContext.Provider value={providerValue}>
        <Toggle />
        <List />
      </ThemeContext.Provider>
    </div>
  );
}
```

由于 `Toggle` 和 `List` 组件都包装在 `ThemeContext` 提供者程序中，因此我们可以访问 `theme` 的值和 `toggleTheme`，而这都是作为提供者的值传递进来的。

在 `Toggle` 组件中，我们可以使用 `toggleTheme` 函数相应地更新主题。

```javascript
import React, { useContext } from 'react';
import { ThemeContext } from './App';

export default function Toggle() {
  const theme = useContext(ThemeContext);

  return (
    <label className="switch">
      <input type="checkbox" onClick={theme.toggleTheme} />
      <span className="slider round" />
    </label>
  );
}
```

`List` 组件本身并不关心主题的当前值。但是，`ListItem` 组件关心这个值！我们可以在 `ListItem` 组件中直接使用主题上下文（theme context）。

```javascript
import React, { useContext } from 'react';
import { ThemeContext } from './App';

export default function TextBox() {
  const theme = useContext(ThemeContext);

  return <li style={theme.theme}>...</li>;
}
```

太棒了！我们不必将主题当前值传递给任何不需要关心这个值的组件了。

> ---
>
> > 打开 https://codesandbox.io/embed/quirky-sun-9djpl 查看示例代码
>
> ---

#### 钩子函数（Hooks）

我们可以创建一个钩子函数（hook）来为组件提供上下文（context）。我们可以使用一个钩子函数（hook）来返回我们需要的上下文（context），而不必在每个组件中都导入 `useContext` 和 `Context`。

```javascript
function useThemeContext() {
  const theme = useContext(ThemeContext);
  return theme;
}
```

为了确保它是一个有效的主题，如果 `useContext`(ThemeContext) 返回一个错误值，我们就抛出一个错误。

```javascript
function useThemeContext() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return theme;
}
```

我们可以创建一个用于包装组件的高阶组件（HOC）来为其提供值，而不是直接使用 `ThemeContext.Provider` 来进行包装。这样，我们可以将上下文逻辑从渲染组件中分离出来，从而提高 provider 的可重用性。

```javascript
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  const providerValue = {
    theme: themes[theme],
    toggleTheme,
  };

  return <ThemeContext.Provider value={providerValue}>{children}</ThemeContext.Provider>;
}

export default function App() {
  return (
    <div className={`App theme-${theme}`}>
      <ThemeProvider>
        <Toggle />
        <List />
      </ThemeProvider>
    </div>
  );
}
```

每个需要访问 `ThemeContext` 的组件现在都可以轻松的使用 `useThemeContext` 钩子函数了。

```javascript
export default function TextBox() {
  const theme = useThemeContext();

  return <li style={theme.theme}>...</li>;
}
```

通过为不同的上下文创建钩子函数（hook），可以很容易将 provider 的逻辑与数据渲染组件分离开来。

---

#### 实例学习

一些库提供了内置的 provider，我们可以在消费组件中使用这些值。一个很好的例子是样式化组件（styled-components）。

> 理解这个例子不需要有样式化组件（styled-components）的经验。

styled-components 库为我们提供了 `ThemeProvider`。每个样式化组件都可以访问该提供者的值！我们可以使用提供给我们的上下文 API，而不用自己创建上下文 API！

让我们使用相同的 `List` 示例，将组件包装在从 styled-component 库导入的 `ThemeProvider` 中。

```javascript
import { ThemeProvider } from 'styled-components';

export default function App() {
  const [theme, setTheme] = useState('dark');

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <div className={`App theme-${theme}`}>
      <ThemeProvider theme={themes[theme]}>
        <>
          <Toggle toggleTheme={toggleTheme} />
          <List />
        </>
      </ThemeProvider>
    </div>
  );
}
```

我们将写一个 `styled.li` 组件，而不是将内联样式通过 prop 传递给 `ListItem` 组件。由于它是一个样式化的组件，我们可以直接访问主题的值！

```javascript
import styled from 'styled-components';

export default function ListItem() {
  return (
    <Li>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </Li>
  );
}

const Li = styled.li`
  ${({ theme }) => `
     background-color: ${theme.backgroundColor};
     color: ${theme.color};
  `}
`;
```

太棒了，我们现在可以使用 `ThemeProvider` 轻松地将样式应用到我们所有的样式组件中了！

> ---
>
> > 打开 https://codesandbox.io/embed/divine-platform-gbuls 查看示例代码
>
> ---

---

#### 优点

提供者模式或 Context API 可以将数据传递给很多组件，而无需手动将其传递给每层组件。

它降低了重构代码时意外引入错误的风险。在这之前，如果我们以后想重命名一个 prop 属性，我们必须在使用该 prop 属性的整个应用程序中重新命名。

我们不再需要处理 prop-drilling，这可能被视为一种反模式。以前，应用程序的数据流可能很难理解，因为某些 prop 属性的值的来源并不总是很清楚。使用提供者模式，我们不再需要向不关心这些数据的组件传递不必要的 props 属性。

使用提供者模式可以轻松地保持某种全局状态，因为我们可以让组件直接访问这种全局状态。

#### 缺点

在某些情况下，过度使用提供者模式可能会导致性能问题。每次状态更改时，使用上下文（context）的所有组件都会重新渲染。

让我们来看一个例子。我们有一个简单的计数器，每次单击按钮组件中的“增量”按钮时，该计数器的值都会增加。我们在重置组件中还有一个重置按钮，可以将计数重置回 0。

但是，当单击“增量”按钮时，可以看到重新渲染的不仅仅是计数。重置组件中的日期也会重新渲染！

> ---
>
> > 打开 https://codesandbox.io/embed/provider-pattern-2-4ke0w 查看示例代码
>
> ---

由于 `Reset` 组件使用了 `useCountContext`，因此也会重新渲染。在较小的应用程序中，这并没有什么影响。在大型应用程序中，将频繁更新的值传递给许多组件可能会对性能产生负面影响。

为了确保组件不会使用包含可能不相关值的提供者，您可以为每个单独的用例创建几个提供者。

---

#### 参考文档

- [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) - MDN
- [JavaScript Proxy](https://davidwalsh.name/javascript-proxy) - David Walsh
- [Awesome ES2015 Proxy](https://github.com/mikaelbr/awesome-es2015-proxy) - GitHub @mikaelbr
- [Thoughts on ES6 Proxies Performance](http://thecodebarbarian.com/thoughts-on-es6-proxies-performance) - Valeri Karpov

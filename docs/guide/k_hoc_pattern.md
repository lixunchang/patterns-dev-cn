# 高阶组件模式

## 背景介绍

这是设计模式系列的第十节，学习的是[patterns.dev]("https://link.juejin.cn/?target=patterns.dev")里设计模式中[高阶组件模式]("https://www.patterns.dev/posts/hoc-pattern/")内容，由于是资料是英文版，所以我的学习笔记就带有**翻译**的性质，但并不是翻译，记录的是自己的**学习过程和理解**。

> 关于设计模式前九节的内容，在文末会有直达链接。

## 写在前面

在项目开发中，我们经常会遇到几个组件**共用一些逻辑**，比如说多个组件**共用样式**，**授权认证**和**全局**状态，这个时候把逻辑封装成**高阶组件**将是一种不错的实现方法。即便现在是**Hooks**时代了，高阶组件的**使用场景会缩小**，但是部分场景还是**适合用高阶组件**。

## 极简释义

一个**组件**接收另一个**组件作为参数**并**返回**一个**组件**，同时将可复用的逻辑作为**props**传递给返回的**组件**。

## 正文

高阶组件也常用英文首字母缩写**HOC**（Higher Order Component），这是一种**设计模式**，允许**全局复用**某些逻辑。

高阶组件是一个组件**接受**另一个组件作为**参数**，高阶组件会向被传入的组件中**添加特定的逻辑**参数 props，然后**返回**附加特定逻辑的组件。

比如说我们要给一些基础组件**添加通用的样式**，就可以使用高阶组件：

```js
function withStyles(Component) {
  return props => {
    const style = { padding: '0.2rem', margin: '1rem' }
    return <Component style={style} {...props} />
  }
}

const Button = () = <button>Click me!</button>
const Text = () => <p>Hello World!</p>

const StyledButton = withStyles(Button)
const StyledText = withStyles(Text)
```

上面的**withStyle**是一种简单的**高阶组件**用法，相信大家一看就懂。

为了加深大家的理解，再举一个异步请求添加 loading 状态的例子，比如前面在[视图和逻辑分离模式](https://juejin.cn/post/7183979095691100218)中使用到一个从 API 中请求并展示一系列 Dog 图片的**DogImages**示例，在那个示例中我们先使用**容器组件异步请求数**据，传递参数给视图组件进行展示，最后又推荐了一种**Hooks**的写法，代码如下：

```js
import React from "react";
import useDogImages from "./useDogImages";

export default function DogImages() {

    const dogs = useDogImages();
    return dogs.map((dog, i) => <img src={dog} key={i} alt="Dog" />);

}

// ./useDogImages
import { useState, useEffect } from "react";

export default function useDogImages() {

    const [dogs, setDogs] = useState([]);

    useEffect(() => {
        async function fetchDogs() {
            const res = await fetch(
            "https://dog.ceo/api/breed/labrador/images/random/6"
            );
            const { message } = await res.json();
            setDogs(message);
        }
        fetchDogs();
    }, []);

    return dogs;
}
```

[在线示例](https://codesandbox.io/s/hoc-pattern-1-tzp7i)

在网络环境不好时，**异步请求**可能需要等待好几秒，这几秒的空白内容，可能会导致用户的流失。接下来让我们稍微提升一下**用户体验**，在 fetchDogs 接口请求的过程中，在屏幕上**加一个 loading**。

通常我们会直接在 DogImages 这个组件里添加 loading 逻辑，而在项目中会有很多异步请求，给每次异步请求**单独添加**loading 难免**麻烦**，接下来来看下怎么使用**高级组件**封装 loading 逻辑，然后可以用在其他异步组件中：

先来个实现一个**简单的高阶组件**withLoader：

```
function withLoader(Element) {
  return props => <Element />;
}
```

当然这个高阶组件直接返回了接收到的组件，还**不能**满足需求，我们需要得到异步请求的状态，还需要添加异步接口是否在请求中的**loading**状态。

为了让**withLoader**这个高阶组件具有更强的**复用性**，我们把接口 API 作为参数传入，从而让其他接口也能**复用**这个高阶组件。

```js
import React, { useEffect, useState } from 'react';

export default function withLoader(Element, url) {
  return (props) => {
    const [data, setData] = useState(null);

    useEffect(() => {
      async function getData() {
        const res = await fetch(url);
        const data = await res.json();
        setData(data);
      }
      getData();
    }, []);

    if (!data) {
      return <div>Loading...</div>;
    }

    return <Element {...props} data={data} />;
  };
}
```

通过判断 data 是否为空，我们可以知道**异步请求**是否完成，并把请求到的数据传递给接收到的组件，这样就完成了**高阶组件**最核心的功能。接下来我们来看看怎么**使用**这个高阶组件？

```js
import React from 'react';
import withLoader from './withLoader';

function DogImages(props) {
  return props.data.message.map((dog, index) => <img src={dog} alt="Dog" key={index} />);
}

export default withLoader(DogImages, 'https://dog.ceo/api/breed/labrador/images/random/6');
```

相信大家一看就懂了，这里还要细细去体会，原来**hook**的写法是在 DogImages 里调用 hook 异步请求拿到数据，然后展示，现在把**hook 的异步请求**封装进**withLoader 高阶组件**中，

> 那么如果在高阶组件中不封装异步请求，而是直接调用已有的 useDogImages 异步 hooks 是否可行呢？

快来在线试试吧：[在线示例](https://codesandbox.io/s/hoc-pattern-2-rslq4)

这样我们创建了一个扩展性的可以接收任何组件和接口的**高阶组件**：

1. 当调用**withLoader**高阶函数，当 useEffect 发起请求时还没完成并调用 setState 时，data 为空，我们返回了 loading；
2. 当请求完成并调用 setState**给 data 赋值**时，我们返回了传入的组件，并把请求到的数据 data 传递给传入的组件，从而**完成组件渲染**；
3. 在 DogImages 导出时，通过导出**withLoader**包裹后的组件，从而实现相关内容区域请求时展示**loading**,有数据时展示数据；

## 组合使用

我们可以**组合多个高阶组件**使用。比如说上面 DogImages 示例，再添加一个**鼠标 hover**整个 list 时，toast 提示一下。

这时我们就可以创建一个高阶组件，把**hover 状态**作为 props 传给 DogImages。有个这个 props，我们就可以在**鼠标移入**DogImages 时 Toast 提示了，代码如下：

```js
import withLoader from "./withLoader";
import withHover from "./withHover";


function DogImages(props) {
  return (
    <div {...props}>
      {props.hovering && <div id="hover">Hovering!</div>}
      <div id="list">
        {props.data.message.map((dog, index) => (
          <img src={dog} alt="Dog" key={index} />
        ))}
      </div>
    </div>
  );
}


export default withHover(
  withLoader(DogImages, "https://dog.ceo/api/breed/labrador/images/random/6")
);

// ./withHover.js
import React, { useState } from "react";


export default function withHover(Element) {
  return props => {
    const [hovering, setHover] = useState(false);


    return (
      <Element
        {...props}
        hovering={hovering}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      />
    );
  };
}
```

[在线示例](https://codesandbox.io/s/hoc-pattern-3-whhh0)

通过**组合**withHover**和**withLoader，我们同时给 DogImages**添加**了异步请求 loding 和监听 hover 操作。

> 一个众所周知的高阶组件库[recompose](https://github.com/acdlite/recompose)，因为 hooks 的冲击，现在已经停止维护了。因为大部分的高阶组件都可以被 Hook 取代。

## Hooks

在高阶组件模式**日渐式微**的今天，我们也有必要来**对比**一下，**高阶组件**模式为什么会**走下坡路**，**Hooks 到底强**在哪里？

在许多场景下，**Hook 是可以代替高阶组件**的。接下来让我们用 hook**代替**withHover 这个高阶函数，来写一个**useHover** Hook 吧！

```
import { useState, useRef, useEffect } from "react";

export default function useHover() {
  const [hovering, setHover] = useState(false);
  const ref = useRef(null);


  const handleMouseOver = () => setHover(true);
  const handleMouseOut = () => setHover(false);


  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("mouseover", handleMouseOver);
      node.addEventListener("mouseout", handleMouseOut);


      return () => {
        node.removeEventListener("mouseover", handleMouseOver);
        node.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, [ref.current]);


  return [ref, hovering];
}
```

通过导出**ref**，再在使用时给**ref 赋值**，从而实现给 ref 绑定组件**添加鼠标 hover**事件，在 useEffect 中**绑定事**件，在 useEffect 的返回方法中**移除事件**。

**这种添加之后需要移除的事件，特别使用用 hook 来实现**。

接下来就是使用这个 hook 了：

```
import React from "react";
import withLoader from "./withLoader";
import useHover from "./useHover";


function DogImages(props) {
  const [hoverRef, hovering] = useHover();


  return (
    <div ref={hoverRef} {...props}>
      {hovering && <div id="hover">Hovering!</div>}
      <div id="list">
        {props.data.message.map((dog, index) => (
          <img src={dog} alt="Dog" key={index} />
        ))}
      </div>
    </div>
  );
}


export default withLoader(
  DogImages,
  "https://dog.ceo/api/breed/labrador/images/random/6"
);
```

[在线示例](https://codesandbox.io/s/hoc-pattern-4-npo50)

不过通常来说，React Hooks**不会完全取代**高阶组件。

> React Hooks 是有效的，可以减少 Dom 树嵌套的层数。———— [React 文档](https://reactjs.org/docs/hooks-faq.html#do-hooks-replace-render-props-and-higher-order-components)

正如官方文档中所说，**Hooks**可以**减少**组件**嵌套**的层数，而高阶组件（**HOC**）则容易导致 Dom 树**嵌套很深**。

```jsx
<withAuth>
  <withLayout>
    <withLogging>
      <Component />
    </withLogging>
  </withLayout>
</withAuth>
```

**高阶组件**模式可以为很多组件**添加相同的逻辑**，同时把**逻辑集中**在一个地方。Hooks 则让我们在组件内部复用相同逻辑，但在很多组件**复用**同一逻辑的情况下，相较于高阶组件，**Hooks**可能会有更高**导致 Bug**的风险。

所以高阶组件和 Hook 在很多场景下可以**相互替代**，但他们**各自**也有自己的**最佳使用场景**。

**高阶组件最佳使用场景：**

1. 整个应用程序中很多组件复用相同的**非定制**功能时；
2. 该组件本身在不添加自定义行为时也可以**独立使用**；

**React Hooks 最佳使用场景：**

1. 每个组件需要单独**定制**相关逻辑；
2. 目标行为只在**局部**有限的几个组件使用，而不是全局很多组件在使用；
3. 目标行为为组件添加**很多属性**；

## 案例分析

高阶函数一个比较好的用例库是[Apollo Client](https://www.apollographql.com/docs/react)，下面是他提供的**高阶函数**和**Hooks**的两种用法:

**高阶组件用法**

```js
import React from 'react';
import './styles.css';

import { graphql } from 'react-apollo';
import { ADD_MESSAGE } from './resolvers';

class Input extends React.Component {
  constructor() {
    super();
    this.state = { message: '' };
  }

  handleChange = (e) => {
    this.setState({ message: e.target.value });
  };

  handleClick = () => {
    this.props.mutate({ variables: { message: this.state.message } });
  };

  render() {
    return (
      <div className="input-row">
        <input onChange={this.handleChange} type="text" placeholder="Type something..." />
        <button onClick={this.handleClick}>Add</button>
      </div>
    );
  }
}

export default graphql(ADD_MESSAGE)(Input);
```

**Hook 的用法**

```jsx
import React, { useState } from 'react';
import './styles.css';

import { useMutation } from '@apollo/react-hooks';
import { ADD_MESSAGE } from './resolvers';

export default function Input() {
  const [message, setMessage] = useState('');
  const [addMessage] = useMutation(ADD_MESSAGE, {
    variables: { message },
  });

  return (
    <div className="input-row">
      <input
        onChange={(e) => setMessage(e.target.value)}
        type="text"
        placeholder="Type something..."
      />
      <button onClick={addMessage}>Add</button>
    </div>
  );
}
```

[在线示例](https://codesandbox.io/s/apollo-hoc-hooks-n3td8?from-embed)

如上面的例子，使用**Hooks**会有更**清晰**的**数据流**传递路径，使**重构**或者**拆解成微应用**时有更好的**开发体验**，提高**可维护性**。

## 总结

**高阶组件**可以让很多组件**复用**同一套逻辑，会**减少**复制代码和维护的**风险**，同时可能会增加其他风险。通过将相同的代码写在同一个地方，实现了**关注点分离**和代码的**DRY**.

**高阶组件**传递的**props**属性可能会和组件原本的 props**命名冲突**，从而**发生属性值覆盖**；当多个**高阶组件嵌套**时，并**不容易**识别**逻辑源头**，可能会让程序**难于调试和扩展**。

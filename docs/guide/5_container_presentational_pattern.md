## 视图和逻辑分离模式

### 写在前面

无论是前端，还是移动端在开发交互逻辑时都会比较注意**视图与逻辑分离**，比较著名的有**MVC 模式/MVP 模式/MVVM 模式**，这些模式都在更合理的让视图和逻辑进行分离。今天让我们一起来学习一下**React 中视图与逻辑的分离**模式。

这是一张 MVP 模式的示意图。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d7e28000eec04fb9a8b03326bc3b19d5~tplv-k3u1fbpfcp-watermark.image?)

下面我们通过一个常用页面来分析下视图与逻辑分离模式。

### 示例分析

比如说有这样一个页面，**展示**6 张可爱狗狗的照片，这些照片都是从**网络请求**下来的。

理想情况下，我们可以这功能拆分成两部分：

1. **视图组件**：向用户展示照片；
2. **容器逻辑组件**：请求照片数据，以及控制展示逻辑；

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9787e75565fc4187a1b31097417bbc72~tplv-k3u1fbpfcp-watermark.image?" alt="image.png" width="100%" />

> 分离关注点（separation of concerns）设计原则：一部分处理网络请求逻辑；而另一部分只展示图片；

#### 视图组件是无状态组件

视图组件通过**props 接收**数据，视图组件的基础功能是**展示数据**，这些数据是通过我们预期的方式接收到的，可能包含**styles**，并且**无需修改数据**。

```js
import React from 'react';

export default function DogImages({ dogs }) {
  return dogs.map((dog, i) => <img src={dog} key={i} alt="Dog" />);
}
```

我们可以看下上面的这个视图组件，通过**prop**接收所有的图片数组，然后通过 map 渲染每张图片。视图组件通常都是**无状态组件**（stateless）。

那什么是无状态组件呢？当然这里准确来说应该叫**趋向于无状态组件**，也就是说可以有少量自己的 state 的：

- **除非**为了更新 UI，自己**一般不需要**使用 state；
- 所**接收**到的数据(props)，自己**不能修改**；

无状态组件的数据(**props**)，通常由**包含逻辑的容器组件**传递过来。

#### 容器逻辑组件

容器逻辑组件的**基本职能**是向内部视图组件**传递**所需要的数据(**props**)；容器逻辑组件通常**不渲染**除视图组件之外的其他组件，甚至**自己不渲染任何东西**，也往往**不需要任何样式**；

在前面的示例分析中，我们可以看到：**DogImages**视图组件接收数据**dogs**, 然后渲染所有图片，那么就需要容器逻辑组件**DogImagesContainer**异步**请求**dogs 数据，然后**传递**给 DogImages 视图组件，具体代码如下：

```jsx
import React from 'react';
import DogImages from './DogImages';

export default class DogImagesContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      dogs: [],
    };
  }

  componentDidMount() {
    fetch('https://dog.ceo/api/breed/labrador/images/random/6')
      .then((res) => res.json())
      .then(({ message }) => this.setState({ dogs: message }));
  }

  render() {
    return <DogImages dogs={this.state.dogs} />;
  }
}
```

[在线示例](https://codesandbox.io/embed/sleepy-murdock-if0ec)

通过**视图组件**和**容器逻辑组件**，我们就可以实现应用程序的**逻辑和视图分离**。

### 应用 Hooks 实现

在很多场景中，**视图逻辑分离模式**可以使用**hooks 代替**。采用 hooks 方法，开发者可以更简单地为视图组件添加状态，并**不需要**提供一个容器逻辑组件。

比如上面示例中的的 DogImagesContainer 可以使用**Hook 替代**：

```js
export default function useDogImages() {
  const [dogs, setDogs] = useState([]);

  useEffect(() => {
    fetch('https://dog.ceo/api/breed/labrador/images/random/6')
      .then((res) => res.json())
      .then(({ message }) => setDogs(message));
  }, []);

  return dogs;
}
```

然后我们可以**直接**在视图组件 DogImages 中**使用这个 Hook**:

```
import React from "react";
import useDogImages from "./useDogImages";


export default function DogImages() {
  const dogs = useDogImages();

  return dogs.map((dog, i) => <img src={dog} key={i} alt="Dog" />);
}
```

通过直接调用**useDogImages**这个 Hook，拿取返回值的方式，我们也**实现了视图和逻辑分离**，并且在视图组件 DogImages 之中也**不需要修改**数据。

使用 Hook 可以很方便的实现**视图和逻辑分离**，同时也**减少**了应用的层级**嵌套**，**简化**了**数据流**。

### 优缺点分析

先来看看视图与逻辑分离模式的**优点**：

- 符合**分离关注点**（separation of concerns）设计原则；
- 使用**Hook 方式**能减少组件层级嵌套和**简化数据流**；
- 视图组件**复用性**更强；
- 视图组件不包含逻辑，从而**降低**了开发或使用难度，并且风格全局保持**统一**；
- 视图组件便于**测试**；

视图与逻辑分离模式**缺点**：

- 在较**小**的应用程序中会**过度设计**；

这就是所有关于**视图与逻辑分离模式**的全部内容，你学废了吗？欢迎大家在评论区友好讨论！

---

原文翻译

# 容器/呈现模式

> 通过将视图与程序逻辑分离来强制分离关注点

在 React 中，强制分离关注点的一种方法是使用容器/呈现模式。使用此模式，我们可以将视图与程序逻辑分离。

---

假设我们想创建一个获取 6 个狗的图像的应用程序，并在屏幕上呈现这些图像。

理想情况下，我们希望通过将此过程分为两部分来强制分离关注点：

1. 呈现组件：关心数据如何显示给用户的组件。在本例中，用于渲染狗图像的列表。
2. 容器组件：关心向用户显示哪些数据的组件。在本例中，用于获取狗的图像。

---

<!-- ![](../pic_bed/1_6_pic_1.gif) -->

获取狗图像需要处理应用程序逻辑，而显示图像仅需要处理视图。

---

## 呈现组件

呈现组件通过 `props` 接收其数据。它的主要功能是以我们希望的方式简单地显示接收到的数据，包括样式，而不修改该数据。

让我们看一下显示狗图像的示例。在渲染狗图像时，我们只想映射从 API 获取的每个狗的图像，并渲染这些图像。为了做到这一点，我们可以创建一个功能组件，该组件通过 `props` 接收数据，并呈现它接收到的数据。

> ---
>
> > 打开 https://codesandbox.io/embed/sleepy-murdock-if0ec 查看示例代码
>
> ---

`DogImages` 组件是一个呈现组件。呈现组件通常是无状态的：它们不包含自己的 React 状态，除非出于 UI 的目的需要状态。他们收到的数据也不会被呈现组件本身改变。

呈现组件从容器组件中接收数据。

---

## 容器组件

容器组件的主要功能是将数据传递给它们所包含的呈现组件。除了关心其数据的呈现组件之外，容器组件本身通常不会渲染任何其他组件。由于它们本身不渲染任何内容，因此通常也不包含任何样式。

在我们的示例中，我们希望将狗图像传递给 `DogsImages` 表示组件。在能够这样做之前，我们需要从外部 API 获取图像。我们需要创建一个容器组件来获取这些数据，并将这些数据传递给表示组件 `DogImages`，以便将其显示在屏幕上。

> ---
>
> > 打开 https://codesandbox.io/embed/sleepy-murdock-if0ec 查看示例代码
>
> ---

将这两个组件结合在一起，可以将处理应用程序逻辑与视图分离。

<!-- ![](../pic_bed/1_6_pic_2.gif) -->

---

## 钩子函数

在许多情况下，容器/呈现模式可以用 React Hooks 代替。钩子的引入使得开发人员很容易添加状态，而不需要容器组件来提供状态。

我们可以创建一个自定义的钩子函数来获取图像，并返回存有狗数据的数组，而不是在 `DogImagesContainer` 组件中定义数据获取逻辑。

```javascript
export default function useDogImages() {
  const [dogs, setDogs] = useState([]);

  useEffect(() => {
    fetch('https://dog.ceo/api/breed/labrador/images/random/6')
      .then((res) => res.json())
      .then(({ message }) => setDogs(message));
  }, []);

  return dogs;
}
```

通过使用钩子函数，我们不再需要包装 `DogImagesContainer` 容器组件来获取数据，并将其发送到 `DogImages` 渲染组件中。相反，我们可以直接在 `DogImages` 渲染组件中使用这个钩子函数！

> ---
>
> > 打开 https://codesandbox.io/embed/rough-brook-tzp7i 查看示例代码
>
> ---

通过使用 `useDogImages` 钩子函数，我们仍然将应用程序逻辑与视图分离。我们只是使用了 `useDogImages` 钩子函数返回的数据，而没有修改 `DogImages` 组件中的数据。

<!-- ![](../pic_bed/1_6_pic_3.gif) -->

钩子函数可以很容易地在组件中分离逻辑和视图，就像容器/呈现模式一样。它为我们节省了在容器组件中为包装表示组件所需的额外组件层。

---

#### 优势

使用容器/表示模式有许多好处。

容器/呈现模式鼓励分离关注点。呈现组件可以是负责 UI 的纯函数，而容器组件负责应用程序的状态和数据。这使得实施关注点分离变得容易。

呈现组件易于重用，因为它们只显示数据而不更改数据。我们可以在整个应用程序中为不同的目的而重用呈现组件。

由于呈现组件不会改变应用程序逻辑，所以呈现组件的外观可以很容易地被不了解代码库的人更改，例如设计者。如果在应用程序的许多部分中重用了呈现组件，则这些更改可以是一致的。

测试呈现组件很容易，因为它们通常是纯函数。我们知道组件将根据我们传递的数据呈现什么，而不必模拟数据存储。

---

#### 劣势

容器/呈现模式使得将应用程序逻辑与呈现逻辑分离变得容易。然而，钩子函数可以实现相同的结果，而不必使用容器/呈现模式，同时也不必将无状态函数组件重写为类组件。注意，今天，我们不再需要创建类组件来使用状态。

尽管我们仍然可以使用容器/呈现模式，即使使用 React 钩子函数，但在较小规模的应用程序中，这种模式很容易成为一种过度使用的模式。

---

#### 参考文档

- [Presentational and Container Components - Dan Abramov](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)

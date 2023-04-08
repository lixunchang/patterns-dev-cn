## 观察者模式

### 写在前面

观察者模式，顾名思义就像**监视者**一直在观察某个人的一举一动，在编程里就是**观察者**通过**订阅**获得事件通知权限，**事件发生时**发**消息通知**所有**已注册的观察者**。观察者模式是一个很经典，应用很广泛的模式，常见的有**新手消息**、**邮件订阅**、**RSS** Feeds 等都是经典实用场景。

> 人通过观察可以主动发现目标对象的变化，但是观察者模式则是需要被动接受通知！

#### 极简释义

**观察者**通过**订阅**获得事件通知权限，**事件发生时**发消息**通知**所有**已注册的观察者**

### 正文开始

在程序中观察者模式具体由哪几部分**构成**呢？

- 观察者：
- 订阅事件：
- 取消订阅事件：
- 消息通知：

通过 es6 的**class**关键字可以很轻松的创建被**观察者模式**：

```js
class Observable {
  constructor() {
    this.observers = [];
  }
  // 订阅
  subscribe(func) {
    this.observers.push(func);
  }
  // 取消订阅
  unsubscribe(func) {
    this.observers = this.observers.filter((observer) => observer !== func);
  }
  // 通知
  notify(data) {
    this.observers.forEach((observer) => observer(data));
  }
}
```

那么，现在我们可以通过**subscribe**方法，**添加**观察者，通过**unsubscribe**方法**移除**观察者，通过**notify**方法**通知**全部的观察者。

然后我们可以在需要的地方使用观察者模式：

```js
import React from 'react';
import { Button, Switch, FormControlLabel } from '@material-ui/core';
import { ToastContainer, toast } from 'react-toastify';
import observable from './Observable';

function handleClick() {
  observable.notify('User clicked button!');
}

function handleToggle() {
  observable.notify('User toggled switch!');
}

function logger(data) {
  console.log(`${Date.now()} ${data}`);
}

function toastify(data) {
  toast(data, {
    position: toast.POSITION.BOTTOM_RIGHT,
    closeButton: false,
    autoClose: 2000,
  });
}

observable.subscribe(logger);
observable.subscribe(toastify);

export default function App() {
  return (
    <div className="App">
      <Button variant="contained" onClick={handleClick}>
        Click me!
      </Button>
      <FormControlLabel control={<Switch name="" onChange={handleToggle} />} label="Toggle me!" />
      <ToastContainer />
    </div>
  );
}
```

> 通过点击 Button 和 Switch 分别发布不同的消息，通过 subscribe 方法订阅所有事件对象会被执行；

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12d81ea0813046ae85a674d61da76202~tplv-k3u1fbpfcp-watermark.image?" alt="image.png" width="100%" />

[在线示例](https://codesandbox.io/embed/quizzical-sinoussi-md8k5)

观察者模式十分有用，特别是**异步**的，**基于事件**的数据处理：

- **下载完成时**通知某些组件；
- **留言通知**所有成员。

### 经典案例学习 ——— RxJs

[RxJs](https://rxjs-dev.firebaseapp.com/)是一个非常流行的 js 库:

> ReactiveX 将**Observer 模式**与**Iterator 模式**以及**函数式编程**结合起来，从而高效地管理事件序列。

在 RxJs 中，我们创建**观察者模式**，并**订阅**某个事件；下面我们来看一个检测用户是否拖拽 Dom 的小例子：

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { fromEvent, merge } from 'rxjs';
import { sample, mapTo } from 'rxjs/operators';

import './styles.css';

merge(
  fromEvent(document, 'mousedown').pipe(mapTo(false)),
  fromEvent(document, 'mousemove').pipe(mapTo(true)),
)
  .pipe(sample(fromEvent(document, 'mouseup')))
  .subscribe((isDragging) => {
    console.log('Were you dragging?', isDragging);
  });

ReactDOM.render(
  <div className="App">Click or drag anywhere and check the console!</div>,
  document.getElementById('root'),
);
```

[在线示例](https://codesandbox.io/embed/stoic-turing-kqq9z) RxJs 里有很多内置的**特性**和**案例**使用到了观察者模式，有兴趣的可以看看源码！

### 优缺点分析

#### 优点：

观察者模式有很多**优点**，大概总结下：

- 分离关注点**SOC** (separation of concerns);
- 满足**单一指责**原则；
- **解耦合**，观察者和事件对象解耦合；

被观察的对象通常是一些**交互**事件或**异步**事件，观察者通常**处理接收到**的数据。

#### 缺点：

观察者模式如果变得**太复杂**臃肿，在通知所有订阅者时可能会导致**性能**问题。

### 同义辨析————观察者模式和订阅发布模式

**观察者模式**应用于**Observable 对象**，观察者和事件消息**直接交互**；

> 观察者模式就像你要跳槽，心中有了目标公司，你就会关注目标公司的招聘信息，当发现有新招聘时就会行动；

**订阅发布模式**应用于**事件消息**，**发布者**和**订阅者**完全解耦，通过**调度中心**交互；

> 订阅发布模式则是你要跳槽，你在招聘网站修改在职状态，然后很多公司在招聘网站上发布招聘信息，然后招聘网站把这些招聘信息推送到你面前。

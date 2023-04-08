# 中间件模式

## 写在前面
对于**中间件**的概念相信大家都不会太陌生，就类似生活中的**中介**一样。具体做法就是在两个组件中间通过中间件，完成两个**组件之间的通信**，而**不直接**通信。

## 极简释义———中间件模式

使用**中间件**在**多个组件**之间的**通信**；

## 开始学习
**中间件模式**允许不同组件之间通过一个**控制中心**进行交互，这个控制中心通常称为**中间件**。中间件接受请求，然后**转发**出去。在JavaScript中，中间件通常以一个**Object**或者**function**的形式展现出来。

可以把这种模式比作飞机场里**空中交通管控中心**和**飞行员**的关系；不同飞行员之间也不直接交流，而是飞行员联系控制中心，再由控制中心通知其他相关飞行员，以免飞机之间发生碰撞事故；

在Javascript中，通常我们要处理**多对多**模型的数据，当**组件很多**的时候，组件之间的**通信**就会变得**复杂而混乱**。


<p align=center><img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae7e6808a3334996b0acf4d07b16b385~tplv-k3u1fbpfcp-watermark.image?" alt="image.png" width="45%" /><img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ea3f912a4ad49358e55b185d2a71f43~tplv-k3u1fbpfcp-watermark.image?" alt="image.png" width="45%"/></p>

正如上图显示，当组件很多时，并且互相之间有**复杂通信需求**时，使用一个统一的中间件来简化这种复杂**多对多**通信场景。

## 经典案例
### Chartroom

一个中间件**经典**的使用案例分析是**聊天室**，聊天室里的用户并**不是直接**通话，而是通过聊天室**服务器**进行通话：

```js
class ChatRoom {
  logMessage(user, message) {
    const sender = user.getName();
    console.log(`${new Date().toLocaleString()} [${sender}]: ${message}`);
  }
}


class User {
  constructor(name, chatroom) {
    this.name = name;
    this.chatroom = chatroom;
  }


  getName() {
    return this.name;
  }


  send(message) {
    this.chatroom.logMessage(this, message);
  }
}


const chatroom = new ChatRoom();


const user1 = new User("John Doe", chatroom);
const user2 = new User("Jane Doe", chatroom);


user1.send("Hi there!");
user2.send("Hey!");
```

我们通过new一个User对象来**连接**用户和聊天室，通过用户发送聊天信息，交由**ChartRoom**然后统一处理。

[在线体验](https://codesandbox.io/s/middleware-1-7gjmr?from-embed)


## Express.js

Express是一个流行的**服务器框架**，相信大家都有所接触。我们可以给**特定的路径**添加**回调函数**。

比如说有这样一个场景，我们要给一个**根路径**添加一个回调函数，在回调函数中设置请求头。

```js
const app = require("express")();

app.use("/", (req, res, next) => {
  req.headers["test-header"] = 1234;
  next();
});
```
我们通过**中间件回调函数**修改请求头，**next**方法调用请求响应**周期的下一次**回调函数；我们可以在请求和响应之间建立一个有效的**中间件函数链**；

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2c6eb206dbf44d69b8b2e66cae8967f1~tplv-k3u1fbpfcp-watermark.image?" alt="image.png" width="100%" />

此时我们可以通过**添加另一个中间件函数**来确认一下新加的header字段是否成功；前一次中间件函数的修改会沿着**函数链**传递。

```js
const app = require("express")();

app.use("/", (req, res, next) => {
  req.headers["test-header"] = 1234;
  next();
}, (req, res, next) => {
    console.log(`Request has test header: ${!!req.headers["test-header"]}`);
    next();
  });
```

因此我们可以通过一个或多个**中间件函数**修改请求Object，直到响应。

```js
const app = require("express")();
  const html = require("./data");


  app.use(
    "/",
    (req, res, next) => {
      req.headers["test-header"] = 1234;
      next();
    },
    (req, res, next) => {
      console.log(`Request has test header: ${!!req.headers["test-header"]}`);
      next();
    }
  );


  app.get("/", (req, res) => {
    res.set("Content-Type", "text/html");
    res.send(Buffer.from(html));
  });


  app.listen(8080, function() {
    console.log("Server is running on 8080");
  });
```
每当用户访问**根路径**'/'时，两个回调函数都会被调用；

[在线体验](https://codesandbox.io/s/middleware-2-0e4yr?from-embed)

**中间件模式**让所有通信都通过一个**控制中心**，从而简化组件之间的**多对多**场景交互。


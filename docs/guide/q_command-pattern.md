# 命令模式

## 极简释义

**命令模式**：解耦方法，通过发送命令执行任务。

## 正文开始

使用**命令模式**，我们可以将**执行任务的对象**与**调用方法**解耦。

比如说，一个**外卖送餐**平台，用户可以下**订单**、**跟踪**订单和**取消**订单，这时我们可以建一个`OrderManager`来管理订单：

### 常规实现

```js
class OrderManager() {
  constructor() {
    this.orders = []
  }
 // 下单
  placeOrder(order, id) {
    this.orders.push(id)
    return `You have successfully ordered ${order} (${id})`;
  }
 // 跟踪订单
  trackOrder(id) {
    return `Your order ${id} will arrive in 20 minutes.`
  }
 // 取消订单
  cancelOrder(id) {
    this.orders = this.orders.filter(order => order.id !== id)
    return `You have canceled your order ${id}`
  }
}
```

在`OrderManager`这个类中，我们可以直接调用**placeOrder**，**trackOrder**，**cancelOrder**来执行任务。

```js
const manager = new OrderManager();

manager.placeOrder('Pad Thai', '1234');
manager.trackOrder('1234');
manager.cancelOrder('1234');
```

但是直接通过`OrderManager`实例对象来调用这些方法是有一些`弊端`的。比如说我们要在这些方法里**扩展新功能**，或者**重命名**这些方法，都会影响**已有**的调用逻辑。

### 命令模式

此时，我们可以**用命令模式来改造**，我们可以将这些**方法**与`OrderManager`分离，并为**每个功能**创建单独的**命令函数**！下面我们来重构**OrderManager**类，**不**要**placeOrder**，**trackOrder**，**cancelOrder**函数，而只有一个函数**execute**，这个方法可以**执行**他接受到的**任何命令**：

```js
class OrderManager {
  constructor() {
    this.orders = [];
  }

  execute(command, ...args) {
    return command.execute(this.orders, ...args);
  }
}
```

然后要实现用户**下单**，**跟踪**和**取消订单**的功能，我们来创建三个**命令**：

- `PlaceOrderCommand`
- `CancelOrderCommand`
- `TrackOrderCommand`

```js
class Command {
  constructor(execute) {
    this.execute = execute;
  }
}

function PlaceOrderCommand(order, id) {
  return new Command((orders) => {
    orders.push(id);
    return `You have successfully ordered ${order} (${id})`;
  });
}

function CancelOrderCommand(id) {
  return new Command((orders) => {
    orders = orders.filter((order) => order.id !== id);
    return `You have canceled your order ${id}`;
  });
}

function TrackOrderCommand(id) {
  return new Command(() => `Your order ${id} will arrive in 20 minutes.`);
}
```

现在我们就把**功能函数**和**OrderManager**对象进行分离，接下来我们来看**怎么使用**：

```js
class OrderManager {
  constructor() {
    this.orders = [];
  }

  execute(command, ...args) {
    return command.execute(this.orders, ...args);
  }
}

class Command {
  constructor(execute) {
    this.execute = execute;
  }
}

function PlaceOrderCommand(order, id) {
  return new Command((orders) => {
    orders.push(id);
    console.log(`You have successfully ordered ${order} (${id})`);
  });
}

function CancelOrderCommand(id) {
  return new Command((orders) => {
    orders = orders.filter((order) => order.id !== id);
    console.log(`You have canceled your order ${id}`);
  });
}

function TrackOrderCommand(id) {
  return new Command(() => console.log(`Your order ${id} will arrive in 20 minutes.`));
}

const manager = new OrderManager();

manager.execute(new PlaceOrderCommand('Pad Thai', '1234'));
manager.execute(new TrackOrderCommand('1234'));
manager.execute(new CancelOrderCommand('1234'));
```

通常在项目中，我们的`OrderManager`是内容会比较**多**，其中涉及**用户**，**支付**，**时效**等诸多方面，这时把**操作订单的函数**单独**抽离**出来，会让**功能更加单一**；而**操作订单的函数**可以通过`new Command`根据需要进行扩展，而**不会影响**已有的功能；最后通过调用`OrderManager`实例对象**manager.execute**方法，**传入命令**就可以对订单执行相关操作了。

## 总结：

命令模式可以**解耦函数和执行函数的对象**。命名模式在处理**有时效的函数**，或者**需要排队**并在**特定时间执行**的函数时，会有更强的**可控性**。

命令模式的**使用场景有限**，并且往往需要**添加不必要的样板文件**。

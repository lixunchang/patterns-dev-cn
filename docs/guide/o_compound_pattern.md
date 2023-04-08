# 复合组件模式

## 极简释义
复合组件模式：使用**多**个组件**协同**完成单一功能。

## 正文
在我们的项目中，经常有很多组件。有些组件通过**共享state**，或者共享**逻辑**，相互**依赖**。**复合组件**常见于`select`，`menu`，`dropdown`组件和他们的子项之间。**复合组件**模式正是通过创建**多个互相协作组件**共同完成一个功能。

## Context API

下面我们通过一个**图片列表**组件来具体阐述一下**复合组件模式**。比如说有一个图片列表组件，展示很多松鼠🐿图片，当然不仅展示松鼠图片，我们希望用户可以**编辑**和**删除**图片，所以我们给每个图片添加一个**操作按钮**。这时我们可以创建一个`FlyOut`组件，用来展示用户点击操作按钮后下拉弹出的**操作菜单**，如下图所示：


<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/562140f040ef4918a0ca2812221a466d~tplv-k3u1fbpfcp-watermark.image?" alt="image.png" width="100%" />

**分析**：要实现一个下拉菜单组件，我们需要拆分成**三**个组件：

- 一个容器组件 `FlyOut`，state状态，容纳操作按钮和下拉菜单；
- 一个操作按钮 `Toggle`，让用户点击；
- 一个列表菜单 `List`，让用户选择操作；

使用React **Context API**来实现这样一个下拉菜单组件是一个很好的共享状态的方案。

首先，我们实现容器组件`FlyOut`，这个组件包含**state**，返回一个**Context.Provider**，为子组件提供所需要的**open**状态。
```js
const FlyOutContext = createContext();
 
function FlyOut(props) {
  const [open, setOpen] = useState(false);
 
  return (
    <FlyOutContext.Provider value={{ open, setOpen }}>
      {props.children}
    </FlyOutContext.Provider>
  );
}
```

现在我们有了一个状态组件`FlyOut`，并且为所有的子组件提供了**open状态**和**修改open状态的方法**。

接下来我们来实现操作按钮组件`Toggle`，这个组件仅展示操作按钮，并修改`FlyOut`的open状态。

```
function Toggle() {
  const { open, setOpen } = useContext(FlyOutContext);
 
  return (
    <div onClick={() => setOpen(!open)}>
      <Icon />
    </div>
  );
}
```
为了让`Toggle`组件能正确地使用**FlyOutContext**，我们需要把`Toggle`组件用做`FlyOut`的**children**，当然我们也可以把`Toggle`组件作为`FlyOut`组件的一个属性，正如**antd**组件库`Slect.Option`那样的形式。
```js
const FlyOutContext = createContext();
 
function FlyOut(props) {
  const [open, toggle] = useState(false);
 
  return (
    <FlyOutContext.Provider value={{ open, toggle }}>
      {props.children}
    </FlyOutContext.Provider>
  );
}
 
function Toggle() {
  const { open, toggle } = useContext(FlyOutContext);
 
  return (
    <div onClick={() => toggle(!open)}>
      <Icon />
    </div>
  );
}

// 用作FlyOut的一个属性
FlyOut.Toggle = Toggle;
```

这样做的一个原因一方面是`Toggle`组件不能脱离`FlyOut`单独使用，另一方面，在引入组件时，只需要引入`FlyOut`就可以。

```js
import React from "react";
import { FlyOut } from "./FlyOut";
 
export default function FlyoutMenu() {
  return (
    <FlyOut>
      <FlyOut.Toggle />
    </FlyOut>
  );
}
```
接下来我们来开发`List`组件，`List`组件依赖**FlyOutContext**的**open**属性：


```js
function List({ children }) {
  const { open } = React.useContext(FlyOutContext);
  return open && <ul>{children}</ul>;
}
 
function Item({ children }) {
  return <li>{children}</li>;
}
```

`List`组件的**children**可能有多个`Item`，我们可以像`Toggle`组件一样，把`List`和`Item`组件作为`FlyOut`的一个属性，简化组件引入；
```js
const FlyOutContext = createContext();
 
function FlyOut(props) {
  const [open, toggle] = useState(false);
 
  return (
    <FlyOutContext.Provider value={{ open, toggle }}>
      {props.children}
    </FlyOutContext.Provider>
  );
}
 
function Toggle() {
  const { open, toggle } = useContext(FlyOutContext);
 
  return (
    <div onClick={() => toggle(!open)}>
      <Icon />
    </div>
  );
}
 
function List({ children }) {
  const { open } = useContext(FlyOutContext);
  return open && <ul>{children}</ul>;
}
 
function Item({ children }) {
  return <li>{children}</li>;
}
// 把Toggle、List、Item作为FlyOut的属性
FlyOut.Toggle = Toggle;
FlyOut.List = List;
FlyOut.Item = Item;
```

接下来我们看怎么使用`FlyOut`这个组件：

```js
import React from "react";
import { FlyOut } from "./FlyOut";
 
export default function FlyoutMenu() {
  return (
    <FlyOut>
      <FlyOut.Toggle />
      <FlyOut.List>
        <FlyOut.Item>Edit</FlyOut.Item>
        <FlyOut.Item>Delete</FlyOut.Item>
      </FlyOut.List>
    </FlyOut>
  );
}
```
现在我们`FlyOutMenu`组件不再需要任何**state**，只需要引入`FlyOut`组件就可以了。

[在线调试](https://codesandbox.io/s/provider-pattern-2-ck29r?from-embed)

当我们开发**多个相互依赖**的组件时，**复合模式**就很有用，相信大家在使用**antd**等优秀组件库时，就会发现这种模式比较常见。

## React.Children.map

当然除了使用**Context**外，我们也可以使用**React.Children.map**结合**React.cloneElement**把**open**和**setOpen**方法传递给子组件：

```js
export function FlyOut(props) {
  const [open, setOpen] = React.useState(false);
 
  return (
    <div>
      {React.Children.map(props.children, (child) =>
        React.cloneElement(child, { open, setOpen })
      )}
    </div>
  );
}
```
想想大家能看懂，**Children.map**方法会遍历所有的**children**,通过第二个参数，把**open**和**setOpen**映射给循环子组件；需要注意的是，这里的**map**方法要和**数组的map**方法对比记忆一下。

下面我们来看具体的**实现代码**：

```js
import React from "react";
import Icon from "./Icon";

export function FlyOut(props) {

    const [open, toggle] = React.useState(false);
    return (
        <div className={`flyout`}>
            {React.Children.map(props.children, child =>
                React.cloneElement(child, { open, toggle })
            )}
        </div>
    );
}

function Toggle({ open, toggle }) {

    return (
        <div className="flyout-btn" onClick={() => toggle(!open)}>
            <Icon />
        </div>
    );
}

function List({ children, open }) {
    return open && <ul className="flyout-list">{children}</ul>;
}

function Item({ children }) {
    return <li className="flyout-item">{children}</li>;
}

FlyOut.Toggle = Toggle;
FlyOut.List = List;
FlyOut.Item = Item;
```

## 总结

**复合模式**维护内部**state**，并**共享**给多个不同的子组件；当为**复合模式**添加新组件时，就**不用**再考虑**自己维护state**。

当**引入复合模式**的组件时，我们不用再**单独引入模式**内的子组件。

相较于**FlyOutContext.Provider**，**React.Children.map**这种传递**state**的方式只能向**直接子组件**提供，不能为**嵌套更深**的子组件传递**state**，同时意味着父级和子级组件中不能有其他元素比如div：

```js
export default function FlyoutMenu() {
  return (
    <FlyOut>
      {/*ERROR This breaks */}
      <div>
        <FlyOut.Toggle />
        <FlyOut.List>
          <FlyOut.Item>Edit</FlyOut.Item>
          <FlyOut.Item>Delete</FlyOut.Item>
        </FlyOut.List>
      </div>
    </FlyOut>
  );
}
```
另外**React.cloneElement**只能进行浅合并，所以存在**props命名**冲突、**覆盖**问题。

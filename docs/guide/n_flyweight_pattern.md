# 享元模式

## 极简释义

在处理**同一对象**的不同状态时，**复用已有**的**实例**对象。

## 写在前面

**享元模式**在使用大量**同一对象**时，是一种很有效的**节约内存**，**提升性能**的方式。

比如说，在一个应用程序中，用户可以**添加书籍**，所有书籍都有标题，作者，和统一的书号；然而一本往往有**多个副本**。

针对**每个**副本**创建**一个新的书籍**实例**，这**不**是一个有效的做法，而**复用已有的示例对象**是很有用的。我们可以通过 Book 的构造方法创建多个实例对象：

```js
class Book {
  constructor(title, author, isbn) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
  }
}
```

下面我们来**新增**一个功能：把新书**添加**到列表，如果书号已经存在 Map 之中，我们就**没必要**创建新的示例对象，直接**复用已有**实例对象：

```js
const books = new Map();

const createBook = (title, author, isbn) => {
  const existingBook = books.has(isbn);

  if (existingBook) {
    return books.get(isbn);
  }

  const book = new Book(title, author, isbn);
  books.set(isbn, book);

  return book;
};
```

当然，如果书号**不存**在，我们就**创建**书籍对象**添加**到以书号**isBn**为键的**Map**集合里。

一般会有**多个读者**读**同一本书**，这样就需要记录同一本书的**多个副本**，这时就可以把这些副本**添加**到一个数组中，方便统一管理。

```js
const bookList = [];

const addBook = (title, author, isbn, availability, sales) => {
  const book = {
    ...createBook(title, author, isbn),
    sales,
    availability,
    isbn,
  };

  bookList.push(book);
  return book;
};
```

这样每次**新增**一个读者，添加一个副本时就**不会**盲目地新增一本书了，从而**最大限度**地**复用已存在**的 book 实例对象；

接下来，我们来创建**5**个副本，总共涉及到了**3**本书：

```js
addBook('Harry Potter', 'JK Rowling', 'AB123', false, 100);
addBook('Harry Potter', 'JK Rowling', 'AB123', true, 50);
addBook('To Kill a Mockingbird', 'Harper Lee', 'CD345', true, 10);
addBook('To Kill a Mockingbird', 'Harper Lee', 'CD345', false, 20);
addBook('The Great Gatsby', 'F. Scott Fitzgerald', 'EF567', false, 20);
```

现在**内存**中，也只有 5 个副本和 3 本书，而不是 5 本书，[在线示例](https://codesandbox.io/s/flyweight-pattern-1-m5c31?from-embed)

## 总结

**享元模式**在我们需要**创建大量实例对象**时，是很有效的，可以**最大限度**地减少内存占用。

当然在 JavaScript 中，我们可以通过[原型](https://juejin.cn/post/7177736312312004669)继承来轻松解决这个问题。在内存以**GB**为单位的今天，**享元模式**正变得**不**那么重要了。

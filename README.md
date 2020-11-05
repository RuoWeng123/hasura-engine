
# Engine 

## 导出的模块说明
* **Engine:** 用于创建基于`HTTP`和`Websocket`的连接并发送相应的请求  
* **binding:** 用于构建面向对象的`graphql`  
* **binding2nd:** 该函数为`binding`柯里化函数。输入两个参数，返回包含一个参数的函数  
* **enumType:** 当`GraphQL`中包含枚举类型是，需要对枚举类型进行声明。主要用于`binding`类和基于`json`的查询。
* **TD:** 包含用于基于`BaaS`的构建面向对象的一些特殊方法：
    - **binding:** 与顶层的`binding`的区别在于不用声明枚举类型`enumType`  
    - **binding2nd:** 与顶层的`binding2nd`的区别在于不用声明枚举类型`enumType`
    - **returning:** 用于快速构建`mutation`返回的内容
    - **nodes:** 用于快速构建`aggregate`返回的`nodes`节点


## Engine API说明

用于查询的`query`和用于修改的`mutation`以及用于订阅的`subscribe`接口参数一致，具体的描述如下：  
- 参数`query`用于传递查询的语句，支持`binding`、`txbinding`、`json`以及原生`GraphQL`。
- 参数`variables`用于传递变量。通常来说，使用原生`GraphQL`会使用该参数。

用于批量查询的`queries`和用于事务的`mutations`接口参数一致，具体的描述如下：
- 参数`query`用于传递查询的语句，如果参数类型为`binding`、`txbinding`、`json`，则需用数组(`Array`)方式传递；如`GraphQL`则为原生字符串。
- 参数`variables`用于传递变量。通常来说，使用原生`GraphQL`会使用该参数。

## 构造引擎对象
```JavaScript
const engine = new Engine({ 
    endpoint: 'localhost:9999/v1alpha1/graphql',
    useWebsocket: true,
    secure: false,
    headers: {
        authorization: 'Bearer MY_TOKEN',
    }
}) 
```  

> 也可以使用`engine.setOption`)方法来传递配置参数
 
## 参数说明
我们需要用`binding`方法来构造我们要查询的数据结构，`binding`方法的函数签名如下：
```JavaScript
const binding = (fieldName, args, infoOrQuery, options) => {...}
```
**fieldName:** `String类型`，表示待查询数据的根字段，在`hasura`中可以理解为表名  
**args:** `Object类型`，针对于根字段的参数，在`hasura`中可以理解为查询条件  
**infoOrQuery:** `Array类型`， 指定操作的选择集，在`hasura`中可以理解为需要返回的字段。 **支持`Binding`的嵌套**  
**options:** `Object类型`，扩展选项  

> 当只传递*fieldName*时，返回一个包含另外两个参数(不包括`options`)的函数  
> 当参数args为空时可以不填写该字段，同时参数变为`fieldName`、`infoOrQuery`、`options`。  

```javascript
const binding2nd = (fieldName, arg1) => Array.isArray(arg1) ? (arg2) => binding(fieldName, arg2, arg1) : (arg2) => binding(fieldName, arg1, arg2)
```
**fieldName:** `String类型`，表示待查询数据的根字段，在`hasura`中可以理解为表名  
**args:** `Array`类型或`Object类型`，如果为数组类型，则绑定到`binding`的`infoOrQuery`参数；如果类型为`Object`则绑定到`binding`的`args`参数。
****
## 示例数据

> 我们假设存在以下数据模型， 并且已通过`hasura`配置好默认的关联关系：

### post(文章表)
| 字段 | 类型 |  说明 | 备注 | 
| --- | --- | --- | --- |
| id | Integer |  自增id | PK |
| created_at | DateTime | 创建时间 | now() |  
| updated_at | DateTime | 修改时间 | now() |  
| title | String | 文章标题 | |
| published | Boolean | 是否发布 | |
| user_id | Integer | 作者id | FK 关联User.id |
| rating | Integer| 评分 | 默认值为1 |

### user(用户表)
| 字段 | 类型 |  说明 | 备注 | 
| --- | --- | --- | --- |
| id | Integer |  自增id | PK |
| name | String | 用户名 |  |  
| email | String | 邮箱 | unique |  

### comment(评论表)
| 字段 | 类型 |  说明 | 备注 | 
| --- | --- | --- | --- |
| id | Integer |  自增id | PK |
| created_at | DateTime | 创建时间 |  |  
| post_id | Integer | 文章id | FK 关联 Post.id |  
| user_id | Integer | 用户id | FK 关联User.id |

## Queries
### 简单的对象查询
可以使用简单的对象查询来获取一个节点或同一类型的多个节点  

查询所有作者

```javascript
engine.query(
    binding('user', ["id", "name"])
).then(user => {
    console.log(user)
})
```

返回结果：

```json
{
  "user": [
    {
      "id": 1,
      "name": "admin"
    },
    {
      "id": 2,
      "name": "Cory"
    },
    {
      "id": 10,
      "name": "john"
    }
  ]
}
```

### 嵌套对象的查询
可以使用一对一或一对多的数据模型来支持嵌套查询  

查询所有文章和文章的作者信息

```javascript
engine.query(
    binding('post', ['id', 'title',
        binding('user', ['name'])
    ])
).then(posts => {
    console.log(posts)
})
```

返回结果

```json
{
  "post": [
    {
      "id": 2,
      "title": "Article 1",
      "user": {
        "name": "admin"
      }
    },
    {
      "id": 3,
      "title": "Article 2",
      "user": {
        "name": "admin"
      }
    },
    {
      "id": 4,
      "title": "Article 3",
      "user": {
        "name": "admin"
      }
    },
    {
      "id": 5,
      "title": "Update Post",
      "user": {
        "name": "Cory"
      }
    },
    {
      "id": 1,
      "title": "John's Post",
      "user": {
        "name": "john"
      }
    }
  ]
}
```

查询所有的作者和其文章的集合

```javascript
engine.query(
    binding('user', ['id', 'name',
        binding('posts', ['id', 'title'])
    ])
).then(users => {
    console.log(users)
})
```

返回结果

```json
{
  "user": [
    {
      "id": 1,
      "name": "admin",
      "posts": [
        {
          "id": 2,
          "title": "Article 1"
        },
        {
          "id": 3,
          "title": "Article 2"
        },
        {
          "id": 4,
          "title": "Article 3"
        }
      ]
    },
    {
      "id": 2,
      "name": "Cory",
      "posts": [
        {
          "id": 5,
          "title": "Update Post"
        }
      ]
    },
    {
      "id": 10,
      "name": "john",
      "posts": [
        {
          "id": 1,
          "title": "John's Post"
        }
      ]
    }
  ]
}
```

### 聚合查询
可以在节点上对列进行聚合查询。可用的聚合函数有`count`、`sum`、`avg`、`max`和`min`  

返回文章和以评分聚合的信息

```javascript
engine.query(
    binding('post_aggregate', [
        binding('aggregate', ['count',
            binding('sum', ['rating']),
            binding('avg', ['rating']),
            binding('max', ['rating'])
        ]),
        binding('nodes', {}, ['id', 'title', 'rating'])

    ])
).then(response => {
    console.log(response)
})
```

返回结果：

```json
{
  "post_aggregate": {
    "aggregate": {
      "count": 5,
      "sum": {
        "rating": 13
      },
      "avg": {
        "rating": 2.6
      },
      "max": {
        "rating": 4
      }
    },
    "nodes": [
      {
        "id": 1,
        "title": "John's Post",
        "rating": 3
      },
      {
        "id": 2,
        "title": "Article 1",
        "rating": 3
      },
      {
        "id": 3,
        "title": "Article 2",
        "rating": 2
      },
      {
        "id": 4,
        "title": "Article 3",
        "rating": 4
      },
      {
        "id": 5,
        "title": "Update Post",
        "rating": 1
      }
    ]
  }
}
```
### 查询结果过滤
* 等价操作符(_eq, _neq)
* 大于或小于操作符 (_gt, _lt, _gte, _lte)
* 基于列表的搜索操作符 (_in, _nin)
* 文本搜索或模式匹配操作符(_like, _similar, etc.)
* JSONB操作符(_contains, _has_key, etc.)
* PostGIS空间关系操作符 (_st_contains, _st_crosses, etc.)
* 过滤或检查空值操作符(_is_null)
* 基于某些失败的标准过滤操作符 (_not)
* 在同一查询中使用多个过滤器 (_and, _or)
* 过滤嵌套字段
* 基于嵌套的字段进行过滤
* 根据嵌套对象是否存在进行过滤

### 查询结果排序
可以使用`order_by`参数对查询结果进行排序，该参数也可用于对嵌套对象的排序。  

通过在`order_by`输入对象中指定的列名`asc`（升序）或`desc`（降序）的枚举值来设置排序顺序。  

默认情况下，升序排序会将空值（`null`）放到返回值的末尾，降序排序会将空值（`null`）放到返回值的开始。通过指定`asc_null_first`或`desc_nulls_last`来调整空值（`null`）在升序中的开始以及降序中的末尾。  

`order_by`参数允许以对象数组的方式按多列进行排序。  

还可以对嵌套对象的结果进行排序。只有包含关联关系或数组的聚合才能用于排序。  

#### 对象排序

获取所有作者并按照名字升序排列

```javascript
engine.query(
    binding('user', {order_by: {name: enumType('asc')}}, ["id", "name"])
).then(users => {
    console.log(users)
})

```

返回结果


```json
{
  "user": [
    {
      "id": 1,
      "name": "admin"
    },
    {
      "id": 2,
      "name": "Cory"
    },
    {
      "id": 10,
      "name": "john"
    }
  ]
}
```

#### 嵌套对象的排序

将名字升序排列的作者的文章以评分降序的方式排列

```javascript
engine.query(
    binding('user', {order_by: {name: enumType('asc')}}, ["id", "name",
        binding('posts', {order_by: {rating: enumType('desc')}}, ['id', 'title', 'rating'])
    ])
).then(users => {
    console.log(users)
})
```

返回结果：

```json
{
  "user": [
    {
      "id": 1,
      "name": "admin",
      "posts": [
        {
          "id": 4,
          "title": "Article 3",
          "rating": 4
        },
        {
          "id": 2,
          "title": "Article 1",
          "rating": 3
        },
        {
          "id": 3,
          "title": "Article 2",
          "rating": 2
        }
      ]
    },
    {
      "id": 2,
      "name": "Cory",
      "posts": [
        {
          "id": 5,
          "title": "Update Post",
          "rating": 1
        }
      ]
    },
    {
      "id": 10,
      "name": "john",
      "posts": [
        {
          "id": 1,
          "title": "John's Post",
          "rating": 3
        }
      ]
    }
  ]
}
```

#### 基于嵌套对象的排序

获取所有的文章，并且让他们以作者的`id`降序排列

```javascript
engine.query(
    binding('post', {order_by: {user: {id: enumType('desc')}}}, ['id', 'rating',
        binding('user', {}, ['id', 'name'])])
).then(posts => {
    console.log(posts)
})

```

返回结果：

```json
{
  "post": [
    {
      "id": 1,
      "rating": 3,
      "user": {
        "id": 10,
        "name": "john"
      }
    },
    {
      "id": 5,
      "rating": 1,
      "user": {
        "id": 2,
        "name": "Cory"
      }
    },
    {
      "id": 2,
      "rating": 3,
      "user": {
        "id": 1,
        "name": "admin"
      }
    },
    {
      "id": 3,
      "rating": 2,
      "user": {
        "id": 1,
        "name": "admin"
      }
    },
    {
      "id": 4,
      "rating": 4,
      "user": {
        "id": 1,
        "name": "admin"
      }
    }
  ]
}
```

### 查询结果去重
可以使用参数`distinct_on`来获取具有不同值的行。  

过滤评分一样的文章

```javascript
engine.query(
    binding('post', {
        distinct_on: enumType('rating'),
        order_by: [{rating: enumType('desc')}, {id: enumType('asc')}]
    }, ['id', 'title', 'rating'])
).then(posts => {
    console.log(posts)
})
```

```javascript
// TD版本
engine.query(
    binding('post', {
        distinct_on: enumType('rating'),
        order_by: [{rating: 'desc'}, {id: 'asc'}]
    }, ['id', 'title', 'rating'])
).then(posts => {
    console.log(posts)
})
```

返回结果：

```json
{
  "post": [
    {
      "id": 4,
      "title": "Article 3",
      "rating": 4
    },
    {
      "id": 1,
      "title": "John's Post",
      "rating": 3
    },
    {
      "id": 3,
      "title": "Article 2",
      "rating": 2
    },
    {
      "id": 5,
      "title": "Update Post",
      "rating": 1
    }
  ]
}
```

### 查询结果分页
操作符`limit `和`offset`用于分页。  
`limit`指定从结果集获取的行数，`offset`指定从什么位置进行偏移。

只返回两个作者

```javascript
engine.query(
    binding('user', {limit: 2}, ["id", "name"])
).then(users => {
    console.log(users)
})
```

返回结果：

```json
{
  "user": [
    {
      "id": 1,
      "name": "admin"
    },
    {
      "id": 2,
      "name": "Cory"
    }
  ]
}
```

返回从第1个开始的两个作者

```javascript
engine.query(
    binding('user', {limit: 2, offset: 1}, ["id", "name"])
).then(users => {
    console.log(users)
})
```

返回结果：

```json
{
  "user": [
    {
      "id": 2,
      "name": "Cory"
    },
    {
      "id": 10,
      "name": "john"
    }
  ]
}
```

### 查询中指定多个参数
可以在同一个查询中使用多个参数。  
例如可以使用`where`参数过滤结果，然后使用`order_by`对结果进行排序。  

查询所有作者两篇已发布的文章并且以创建时间排序

```javascript
// binding版本
engine.query(
    binding('user', ['id', 'name',
        binding('posts', {
            where: {published: {_eq: true}},
            order_by: {created_at: enumType('desc')},
            limit: 2
        }, ['id', 'title', 'published', 'created_at'])
    ])
).then(users => {
    console.log(users)
})
```

```javascript
// TD版本
engine.query(
    TD.binding('user', ['id', 'name',
        TD.binding('posts', {
            where: {published: {_eq: true}},
            order_by: {created_at: 'desc'},
            limit: 2
        }, ['id', 'title', 'published', 'created_at'])
    ])
).then(users => {
    console.log(users)
})
```

```javascript
// json版本
engine.query(
    {
        user: {
            posts: {
                __args: {
                    where: {published: {_eq: true}},
                    order_by: {created_at: enumType('desc')},
                    limit: 2
                },
                id: true,
                title: true,
                published: true,
                created_at: true,
            },
            id: true,
            name: true,
        }
    }
).then(users => {
    console.log(users)
})
```

```javascript
// gql版本
const gql = `
{
  user {
    posts(where: {published: {_eq: true}}, order_by: {created_at: desc}, limit: 2) {
      id
      title
      published
      created_at
    }
    id
    name
  }
}
`
engine.query(gql).then(users => {
    console.log(users)
})
```

返回结果：

```json
{
  "user": [
    {
      "id": 1,
      "name": "admin",
      "posts": [
        {
          "id": 4,
          "title": "Article 3",
          "published": true,
          "created_at": "2019-07-09T12:44:21.157379+00:00"
        },
        {
          "id": 2,
          "title": "Article 1",
          "published": true,
          "created_at": "2019-07-09T12:38:08.886357+00:00"
        }
      ]
    },
    {
      "id": 2,
      "name": "Cory",
      "posts": []
    },
    {
      "id": 10,
      "name": "john",
      "posts": [
        {
          "id": 1,
          "title": "John's Post",
          "published": true,
          "created_at": "2019-07-10T02:24:03.621888+00:00"
        }
      ]
    }
  ]
}
```

### 一个请求中请求多个查询
如果在一个请求中包含多个查询，则他们并行执行，整理后并返回相应的结果。可以在同一查询中获取不同类型的对象。  
TODO
### 查询在SQL中的自定义函数
TODO
### 查询派生数据
TODO
### 限制对某些字段的访问
TODO
## Mutations
### 插入数据（Insert）
* 参数`objects`是必须字段，`objects`可以传递数组以插入多条记录
* 可以通过参数`on_conflict`来将插入(insert)变成插入更新(upsert)
* 可以返回受影响的行数(`affected_rows`)和受影响的对象（支持嵌套对象）

#### 创建单条记录

示例：创建一个用户:

```javascript
const user = {name: 'admin', email: 'admin@iiotos.com'}
engine.mutation(
    binding('insert_user', {objects: user}, ['affected_rows',
        binding('returning', ['id', 'name', 'email']
        )]
    )
).then(user => {
    console.log(user)
})
```

```javascript
// TD版本
const user = {name: 'admin', email: 'admin@iiotos.com'}
engine.mutation(
    TD.binding('insert_user', {objects: user}, ['affected_rows',
        Td.returning('id', 'name', 'email')
       ]
    )
).then(user => {
    console.log(user)
})
```

返回结果： 
```json
{
  "insert_user": {
    "affected_rows": 1,
    "returning": [
      {
        "id": 1,
        "name": "admin",
        "email": "admin@iiotos.com"
      }
    ]
  }
}
```

#### 在一个请求中插入相同的多条记录

示例：添加两篇文章

```javascript
const posts = [
    {title: 'Article 1', published: false},
    {title: 'Article 2', published: false}]
    
engine.mutation(
    binding('insert_post', {objects: posts}, ['affected_rows',
        binding('returning', {}, ['id', 'title', 'published', 'created_at', 'updated_at']
        )]
    )
).then(posts => {
    console.log(posts)
})
```

```javascript
// TD版本
const posts = [
    {title: 'Article 1', published: false},
    {title: 'Article 2', published: false}]
    
engine.mutation(
    TD.binding('insert_post', {objects: posts}, ['affected_rows',
        Td.returning('id', 'title', 'published', 'created_at', 'updated_at')
        ]
    )
).then(posts => {
    console.log(posts)
})
```

返回结果：

```json
{
  "insert_post": {
    "affected_rows": 2,
    "returning": [
      {
        "id": 2,
        "title": "Article 1",
        "published": false,
        "created_at": "2019-07-09T12:38:08.886357+00:00",
        "updated_at": "2019-07-09T12:38:08.886357+00:00"
      },
      {
        "id": 3,
        "title": "Article 2",
        "published": false,
        "created_at": "2019-07-09T12:38:08.886357+00:00",
        "updated_at": "2019-07-09T12:38:08.886357+00:00"
      }
    ]
  }
}
```

#### 插入一条记录返回嵌套的结果

示例：添加一篇文章返回作者信息

```javascript
const post = {title: 'Article 3', user_id: 1, published: false}

engine.mutation(
    binding('insert_post', {objects: post}, ['affected_rows',
        binding('returning', ['id', 'title', binding('user', {}, [
                'name', 'email'])
            ]
        )]
    )
).then(post => {
    console.log(post)
})
```

```javascript
// TD版本
const post = {title: 'Article 3', user_id: 1, published: false}

engine.mutation(
    TD.binding('insert_post', {objects: post}, ['affected_rows',
        TD.returning('id', 'title', TD.binding('user', [ 'name', 'email']))
        ]
    )
).then(post => {
    console.log(post)
})
```

返回结果：

```json
{
  "insert_post": {
    "affected_rows": 1,
    "returning": [
      {
        "id": 4,
        "title": "Article 3",
        "user": {
          "name": "admin",
          "email": "admin@iiotos.com"
        }
      }
    ]
  }
}
```

#### 插入一条记录和嵌套的内容

示例：添加一篇文章同时添加作者信息

```javascript
const post = {
    title: 'Article 4',
    published: false,
    user: {
        data: {
            name: 'Cory',
            email: 'Cory@iiotos.com'
        }
    }
}

engine.mutation(
    binding('insert_post', {objects: post}, ['affected_rows',
        binding('returning', ['id', 'title', binding('user', {}, [
                'name', 'email'])
            ]
        )]
    )
).then(post => {
    console.log(post)
})
```

```javascript
// TD版本
const post = {
    title: 'Article 4',
    published: false,
    user: {
        data: {
            name: 'Cory',
            email: 'Cory@iiotos.com'
        }
    }
}

engine.mutation(
    TD.binding('insert_post', {objects: post}, ['affected_rows',
        TD.returning('id', 'title', binding('user', {}, ['name', 'email']))
        ]
    )
).then(post => {
    console.log(post)
})
```

返回结果：

```json
{
  "insert_post": {
    "affected_rows": 2,
    "returning": [
      {
        "user": {
          "email": "Cory@iiotos.com",
          "name": "Cory"
        },
        "id": 5,
        "title": "Article 4"
      }
    ]
  }
}
```

### 更新插入数据（Upsert）
需要使用`on_conflict`参数指定唯一键 `unique`或主键`primary key`将`Insert`变成`Upsert`，当唯一键或主键违反约束条件时，可以通过参数`update_columns`选择要更新的字段。

#### 当违反约束条件时更新指定的列

在post表中添加一条记录，如果违反了主键约束，则更新指定在`update_columns`中的列：

```javascript
const post = {id: 5, title: 'Article 5', user_id: 1, published: true}
const conflict = {constraint: enumType('post_pkey'), update_columns:[enumType('title')]}
engine.mutation(
    binding('insert_post', {objects: post, on_conflict: conflict}, ['affected_rows',
        binding('returning', {}, ['id', 'title', 'published']
        )]
    )
).then(post => {
    console.log(post)
})
```

```javascript
// TD版本
const post = {id: 5, title: 'Article 5', user_id: 1, published: true}
const conflict = {constraint: 'post_pkey', update_columns:['title']}
engine.mutation(
    TD.binding({objects: post, on_conflict: conflict}, ['affected_rows',
        TD.returning('id', 'title', 'published')
        ]
    )
).then(post => {
    console.log(post)
})
```

返回结果：

```json
{
  "insert_post": {
    "affected_rows": 1,
    "returning": [
      {
        "id": 5,
        "title": "Article 5",
        "published": false
      }
    ]
  }
}
```

> `constraint`和`update_columns`里的值要求是枚举类型，因此需要用枚举类型构造

#### 当违反约束时忽略请求
如果`update_columns`为空数组，当违反约束时将会忽略该请求。  
在`user`表插入一条记录，如果违反了主键约束（`user_pkey`），则忽略该请求

```javascript
const user = {id: 1, name: 'admin1', email: 'admin1@iiotos.com'}
const conflict = {constraint: enumType('user_pkey'), update_columns:[]}
engine.mutation(
    binding('insert_user', {objects: user, on_conflict: conflict}, ['affected_rows']
    )
).then(response => {
    console.log(response)
})
```

```javascript
// TD版本
const user = {id: 1, name: 'admin1', email: 'admin1@iiotos.com'}
const conflict = {constraint: 'user_pkey', update_columns:[]}
engine.mutation(
    TD.binding('insert_user', {objects: user, on_conflict: conflict}, ['affected_rows']
    )
).then(response => {
    console.log(response)
})
```

返回结果：

```json
{
  "insert_user": {
    "affected_rows": 0
  }
}
```

#### 嵌套的更新插入（Upsert）
在插入嵌套对象时，可以在子句上指定`on_conflict`

```javascript
const user = {id: 10, name: 'john', email: 'john@iiotos.com', posts: {
        data: [{id: 1, title: "John's Post", published: true}],
        on_conflict: {
            constraint: enumType('post_pkey'),
            update_columns: [enumType('title')]
        }
    }
}
engine.mutation(
    binding('insert_user', {objects: user}, ['affected_rows']
    )
).then(response => {
    console.log(response)
})
```

```javascript
// TD版本
const user = {id: 10, name: 'john', email: 'john@iiotos.com', posts: {
        data: [{id: 1, title: "John's Post", published: true}],
        on_conflict: {
            constraint: 'post_pkey',
            update_columns: ['title']
        }
    }
}
engine.mutation(
    TD.binding('insert_user', {objects: user}, ['affected_rows']
    )
).then(response => {
    console.log(response)
})
```

返回结果：

```json
{
  "insert_user": {
    "affected_rows": 2
  }
}
```

### 更新数据（Update）
更新时，`where`参数是必须指定的，用于筛选要更新的行，可以基于自身或者嵌套的字段进行更新。  

> 更新时，参数中至少需要`_set`、`_inc`操作符中的一个。如果是`jsonb`类型，则需指定`_append`、`_prepend`、`_delete_key`、`_delete_elem`、`_delete_at_path`其中的一个。

#### 根据对象的字段更新

```javascript
engine.mutation(
    binding('update_post', {
        where: {id: {_eq: 5}},
        _set: {
            title: 'Update Post',
            rating: 2
        }
    }, ['affected_rows', binding('returning', {}, ['id', 'title', 'rating'])])
).then(response => {
    console.log(response)
})
```

```javascript
// TD版本
engine.mutation(
    TD.binding('update_post', {
        where: {id: {_eq: 5}},
        _set: {
            title: 'Update Post',
            rating: 2
        }
    }, ['affected_rows', TD.returning('id', 'title', 'rating')])
).then(response => {
    console.log(response)
})
```

返回结果:

```json
{
  "update_post": {
    "affected_rows": 1,
    "returning": [
      {
        "id": 5,
        "title": "Update Post",
        "rating": 2
      }
    ]
  }
}
```

#### 基于嵌套的字段更新

将用户`john`所有文章的`rating`重置

```javascript
engine.mutation(
    binding('update_post', {
        where: {user: {name: {_eq: 'john'}}},
        _set: {rating: null}
    }, ['affected_rows'])
).then(response => {
    console.log(response)
})
```

返回结果:

```json
{
  "update_post": {
    "affected_rows": 1
  }
}
```

#### 更新所有对象
可以使用`{}`表达式作为`where`参数的值来更新所有的对象。`{}`基本对所有对象求值为`true`。

重置所有文章评分
```javascript
engine.mutation(
    binding('update_post', {
        where: {},
        _set: {rating: null}
    }, ['affected_rows'])
).then(response => {
    console.log(response)
})
```

返回结果:

```json
{
  "update_post": {
    "affected_rows": 5
  }
}
```

#### 基于`int`类型的字段自增
针对于`int`类型的列可以指定`_inc`操作符自增

```javascript
// rating初始值为1
engine.mutation(
    binding('update_post', {
        where: {id: {_eq: 1}},
        _inc: {rating: 2}
    }, ['affected_rows', binding('returning', {}, ['id', 'rating'])])
).then(response => {
    console.log(response)
})
```

```javascript
// TD版本
// rating初始值为1
engine.mutation(
    TD.binding('update_post', {
        where: {id: {_eq: 1}},
        _inc: {rating: 2}
    }, ['affected_rows', TD.returning('id', 'rating')])
).then(response => {
    console.log(response)
})
```

返回结果:

```json
{
  "update_post": {
    "affected_rows": 1,
    "returning": [
      {
        "id": 1,
        "rating": 3
      }
    ]
  }
}
```

### 删除数据（Delete）
* 必须指定`where`参数来过滤要删除的行，参阅查询以获取筛选选项。可以根据自身的字段或者嵌套的字段来删除对象。`{}`表达式可用于删除所有的行。
* 可以返回受影响的行数(`affected_rows`)和受影响的对象。

#### 基于对象的字段删除

删除评分低于3的文章

```javascript
engine.mutation(
    binding('delete_post', {
        where: {rating: {_lt: 3}}
    }, ['affected_rows'])
).then(response => {
    console.log(response)
})
```

#### 基于嵌套的字段删除

删除指定作者的所有文章

```javascript
engine.mutation(
    binding('delete_post', {
        where: {user: {name: {_eq: 'john'}}}
    }, ['affected_rows'])
).then(response => {
    console.log(response)
})
```

#### 删除所有对象

可以使用表达式`{}`做为`where`参数的值来删除所有数据，`{}`基本对所有对象求值为`true`  
删除所有文章

```javascript
engine.mutation(
    binding('delete_post', {
        where: {}
    }, ['affected_rows'])
).then(response => {
    console.log(response)
})
```

### 事务
可以使用`mutationAll`的接口来顺序执行`mutation`，如果任何一个`mutation`失败，则将回滚所有执行的`mutation`

#### 以事务运行顶层的mutations

#### 在一个mutation里插入包含嵌套的数据

const {Engine, binding, enumType, TD} = require('./main')
const engine = new Engine({
    endpoint: '192.168.1.65:9999/v1alpha1/graphql',
    useWebsocket: true
})
/// 创建单条记录示例
// const user = {name: 'admin', email: 'admin@iiotos.com'}
// engine.mutation(
//     binding('insert_user', {'objects': user}, ['affected_rows',
//         binding('returning', {}, ['id', 'name', 'email']
//         )]
//     )
// ).then(user => {
//     console.log(user)
// })

/// 插入一条记录返回嵌套的结果示例
// const posts = [
//     {title: 'Article 1', user_id: 1, published: false},
//     {title: 'Article 2', user_id: 1, published: false}]
//
// engine.mutation(
//     binding('insert_post', {'objects': posts}, ['affected_rows',
//         binding('returning', {}, ['id', 'title', binding('user')]
//         )]
//     )
// ).then(posts => {
//     console.log(posts)
// })

/// 插入一条记录和嵌套的内容示例
// const post = {
//     title: 'Article 4',
//     published: false,
//     user: {
//         data: {
//             name: 'Cory',
//             email: 'Cory@iiotos.com'
//         }
//     }
// }
//
// engine.mutation(
//     binding('insert_post', {'objects': post}, ['affected_rows',
//         binding('returning', {}, ['id', 'title', binding('user', {}, [
//                 'name', 'email'])
//             ]
//         )]
//     )
// ).then(post => {
//     console.log(post)
// })

/// 在post表中添加一条记录，如果违反了主键约束，则更新指定在update_columns中的列：
// const post = {id: 5, title: 'Article 5', user_id: 1, published: true}
// const conflict = {constraint: enumType('post_pkey'), update_columns:[enumType('title')]}
// engine.mutation(
//     binding('insert_post', {objects: post, on_conflict: conflict}, ['affected_rows',
//         binding('returning', {}, ['id', 'title', 'published']
//         )]
//     )
// ).then(post => {
//     console.log(post)
// })

// 在`user`表插入一条记录，如果违反了主键约束（`user_pkey`），则忽略该请求
// const user = {id: 1, name: 'admin1', email: 'admin1@iiotos.com'}
// const conflict = {constraint: enumType('user_pkey'), update_columns:[]}
// engine.mutation(
//     binding('insert_user', {objects: user, on_conflict: conflict}, ['affected_rows']
//     )
// ).then(response => {
//     console.log(response)
// })

// 在插入嵌套对象时，可以在子句上指定`on_conflict`
// const user = {id: 10, name: 'john', email: 'john@iiotos.com', posts: {
//         data: [{id: 1, title: "John's Post", published: true}],
//         on_conflict: {
//             constraint: enumType('post_pkey'),
//             update_columns: [enumType('title')]
//         }
//     }
// }
// engine.mutation(
//     binding('insert_user', {objects: user}, ['affected_rows']
//     )
// ).then(response => {
//     console.log(response)
// })

// 根据对象的字段更新
// engine.mutation(
//     binding('update_post', {
//         where: {id: {_eq: 5}}, _set: {
//             title: 'Update Post',
//             rating: 2
//         }
//     }, ['affected_rows', binding('returning', {}, ['id', 'title', 'rating'])])
// ).then(response => {
//     console.log(response)
// })

// 基于嵌套字段更新
// engine.mutation(
//     binding('update_post', {
//         where: {},
//         _set: {rating: null}
//     }, ['affected_rows'])
// ).then(response => {
//     console.log(response)
// })

// 基于`int`类型的字段自增
// engine.mutation(
//     binding('update_post', {
//         where: {id: {_eq: 1}},
//         _inc: {rating: 2}
//     }, ['affected_rows', binding('returning', {}, ['id', 'rating'])])
// ).then(response => {
//     console.log(response)
// })

// 删除评分低于3的文章
// engine.mutation(
//     binding('delete_post', {
//         where: {rating: {_lt: 3}}
//     }, ['affected_rows'])
// ).then(response => {
//     console.log(response)
// })

// 删除指定作者的所有文章
// engine.mutation(
//     binding('delete_post', {
//         where: {user: {name: {_eq: 'john'}}}
//     }, ['affected_rows'])
// ).then(response => {
//     console.log(response)
// })

// 删除所有文章
// engine.mutation(
//     binding('delete_post', {
//         where: {}
//     }, ['affected_rows'])
// ).then(response => {
//     console.log(response)
// })

// 简单的对象查询
// engine.query(
//     binding('user', {}, ["id", "name"])
// ).then(user => {
//     console.log(user)
// })

// 嵌套对象的查询
// engine.query(
//     binding('post', {}, ['id', 'title',
//         binding('user', {}, ['name'])
//     ])
// ).then(posts => {
//     console.log(posts)
// })

// engine.query(
//     binding('user', {}, ['id', 'name',
//         binding('posts', {}, ['id', 'title'])
//     ])
// ).then(users => {
//     console.log(users)
// })

// 聚合查询
// engine.query(
//     binding('post_aggregate', {}, [
//         binding('aggregate', {}, ['count',
//             binding('sum', {}, ['rating']),
//             binding('avg', {}, ['rating']),
//             binding('max', {}, ['rating'])
//         ]),
//         binding('nodes', {}, ['id', 'title', 'rating'])
//
//     ])
// ).then(response => {
//     console.log(response)
// })

// 查询结果排序
// engine.query(
//     binding('user', {order_by: {name: enumType('asc')}}, ["id", "name"])
// ).then(users => {
//     console.log(users)
// })

// 嵌套对象排序
// engine.query(
//     binding('user', {order_by: {name: enumType('asc')}}, ["id", "name",
//         binding('posts', {order_by: {rating: enumType('desc')}}, ['id', 'title', 'rating'])
//     ])
// ).then(users => {
//     console.log(users)
// })

// 基于嵌套对象的排序
// engine.query(
//     binding('post', {order_by: {user: {id: enumType('desc')}}}, ['id', 'rating',
//         binding('user', {}, ['id', 'name'])])
// ).then(posts => {
//     console.log(posts)
// })

// 查询结果去重
// engine.query(
//     binding('post', {
//         distinct_on: enumType('rating'),
//         order_by: [{rating: enumType('desc')}, {id: enumType('asc')}]
//     }, ['id', 'title', 'rating'])
// ).then(posts => {
//     console.log(posts)
// })

// 只返回一个作者信息
// engine.query(
//     binding('user', {limit: 2}, ["id", "name"])
// ).then(users => {
//     console.log(users)
// })

// 返回从第三个开始的两个作者
// engine.query(
//     binding('user', {limit: 2, offset: 1}, ["id", "name"])
// ).then(users => {
//     console.log(users)
// })

// 查询中指定多个参数 binding版本
// engine.query(
//     binding('user', {}, ['id', 'name',
//         binding('posts', {
//             where: {published: {_eq: true}},
//             order_by: {created_at: enumType('desc')},
//             limit: 2
//         }, ['id', 'title', 'published', 'created_at'])
//     ])
// ).then(users => {
//     console.log(users)
// })

// 查询中指定多个参数 txBinding版本
// engine.query(
//     TD.binding('user', ['id', 'name',
//         TD.binding('posts', {
//             where: {published: {_eq: true}},
//             order_by: {created_at: 'desc'},
//             limit: 2
//         }, ['id', 'title', 'published', 'created_at'])
//     ])
// ).then(users => {
//     console.log(users)
// })

// 查询中指定多个参数 json版本
// engine.query(
//     {
//         user: {
//             posts: {
//                 __args: {
//                     where: {published: {_eq: true}},
//                     order_by: {created_at: enumType('desc')},
//                     limit: 2
//                 },
//                 id: true,
//                 title: true,
//                 published: true,
//                 created_at: true,
//             },
//             id: true,
//             name: true,
//         }
//     }
// ).then(users => {
//     console.log(users)
// })

// 查询中指定多个参数 gql版本
// const gql = `
// {
//   user {
//     posts(where: {published: {_eq: true}}, order_by: {created_at: desc}, limit: 2) {
//       id
//       title
//       published
//       created_at
//     }
//     id
//     name
//   }
// }
// `
// engine.query(gql).then(users => {
//     console.log(users)
// })

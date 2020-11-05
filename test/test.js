const { engine, Teacher, Student, Class, ClassTearchMap } = require('./db.js')

function Init () {
  const teachers = [
    { name: '魏老师', id: 1 },
    { name: '许老师', id: 2 },
    { name: '王老师', id: 3 },
    { name: '李老师', id: 4 },
    { name: '孙老师', id: 5 },
    { name: '刘老师', id: 6 }
  ]
  const classes = [
    { name: '高81班', id: 1 },
    { name: '高82班', id: 2 },
    { name: '高83班', id: 3 },
    { name: '高84班', id: 4 },
    { name: '高85班', id: 5 }
  ]
  const students = [
    { name: '学生1', id: 1, class_id: 1 },
    { name: '学生2', id: 2, class_id: 1 },
    { name: '学生3', id: 3, class_id: 1 },
    { name: '学生4', id: 4, class_id: 1 },
    { name: '学生5', id: 5, class_id: 1 },
    { name: '学生6', id: 6, class_id: 1 },
    { name: '学生7', id: 7, class_id: 2 },
    { name: '学生8', id: 8, class_id: 2 },
    { name: '学生9', id: 9, class_id: 2 },
    { name: '学生10', id: 10, class_id: 2 },
    { name: '学生11', id: 11, class_id: 2 },
    { name: '学生12', id: 12, class_id: 2 },
    { name: '学生13', id: 13, class_id: 3 },
    { name: '学生14', id: 14, class_id: 3 },
    { name: '学生15', id: 15, class_id: 3 },
    { name: '学生16', id: 16, class_id: 3 },
    { name: '学生17', id: 17, class_id: 3 },
    { name: '学生18', id: 18, class_id: 3 },
    { name: '学生19', id: 19, class_id: 4 },
    { name: '学生20', id: 20, class_id: 4 },
    { name: '学生21', id: 21, class_id: 4 },
    { name: '学生22', id: 22, class_id: 4 },
    { name: '学生23', id: 23, class_id: 4 },
    { name: '学生24', id: 24, class_id: 4 },
    { name: '学生25', id: 25, class_id: 5 },
    { name: '学生26', id: 26, class_id: 5 },
    { name: '学生27', id: 27, class_id: 5 },
    { name: '学生28', id: 28, class_id: 5 },
    { name: '学生29', id: 29, class_id: 5 },
    { name: '学生30', id: 30, class_id: 5 }
  ]
  const classTearchMap = [
    { teacher_id: 1, class_id: 1 },
    { teacher_id: 6, class_id: 1 },
    { teacher_id: 2, class_id: 2 },
    { teacher_id: 3, class_id: 4 },
    { teacher_id: 4, class_id: 4 },
    { teacher_id: 5, class_id: 5 }
  ]
  Teacher.insert(teachers)
  Class.insert(classes)
  Student.insert(students)
  ClassTearchMap.insert(classTearchMap)
}

// Student
//   .getByPk(2)
//   .then(res => {
//     console.log(res)
//   })

// Student
//   .subscribe()
//   .subscribe(res => {
//     console.log(JSON.stringify(res, null, 4))
//   })

// engine
//   .queues(
//     Student.Query.first(),
//     Student.Query.count(),
//     Class.Query.find(),
//     Class.Query.count()
//   )
//   .run()
//   .then(res => {
//     console.log(JSON.stringify(res, null, 4))
//   })

// engine
//   .queues(
//     Student.Mutation.update(32, { name: '刘腾腾3' }),
//     Student.Mutation.increment(32, { number: -2 })
//   )
//   .run()
//   .then(res => {
//     console.log(res)
//   })

// Student
//   .insert({ name: '刘腾腾2', id: 33, class_id: 2 })
//   .then(res => {
//     console.log(res)
//   })
//   .catch(err => {
//     console.log(err)
//   })

const gql = `
  mutation {
    insert_map(
      objects: {
        id: 2,
        name: "专题图二", 
        layer_map_maps: {
          data: [
            {
              layer: {
                data: {
                  id: 2,
                  name: "图层二"
                }, 
                on_conflict: {
                  constraint: layer_pkey, 
                  update_columns: [name]
                }
              }
            },
            {
              layer: {
                data: {
                  id: 3,
                  name: "图层三"
                }, 
                on_conflict: {
                  constraint: layer_pkey, 
                  update_columns: [name]
                }
              }
            }
          ],
          on_conflict: {
            constraint: layer_map_map_pkey,
            update_columns: [layer_id, map_id]
          }
        }
      }, 
      on_conflict: {
        constraint: map_pkey, 
        update_columns: [name]
      }) {
      affected_rows
    }
  }
`

const gql1 = `
  mutation {
    insert_layer_category(
      objects: {
        id: 3
        name: "地质类++", 
        layers: {
          data: [
            {
              id: 7,
              name: "图层五"
            },
            {
              id: 8,
              name: "图层六"
            },
            {
              name: "图层七"
            }
          ],
          on_conflict: {
            constraint: layer_pkey, 
            update_columns: [id, name]
          }
        }
      }, 
      on_conflict: {
        constraint: layer_category_pkey,
        update_columns: [name]
      }
    ) {
      affected_rows
    }
    
    update_layer(
      where: { id: { _eq: 6 } },
      _set: { category_id: null }
    ) {
      affected_rows
    }
  }
`
//
// const data = {
//   name: '通风类',
//   layers: [
//     { name: '图层11' },
//     { name: '图层12' },
//     { name: '图层13' }
//   ]
// }
//
// const params = {
//   fields: ['id', 'name'],
//   constraint: 'layer_category_pkey',
//   update_columns: ['name'],
//   relations: {
//     layers: {
//       type: 'one-many',
//       foreignKey: 'category_id',
//       constraint: 'layer_pkey',
//       update_columns: ['id', 'name']
//     }
//   }
// }
//
// const getObject = function (data) {
//   return {
//     name: data.name,
//     layers: {
//       data: data.layers.map(item => {
//         return { id: item.id, name: item.name }
//       }),
//       on_conflict: {
//         constraint: 'layer_pkey',
//         update_columns: ['id', 'name']
//       }
//     }
//   }
// }
//

// Class
//   .find(null, {
//     include: { 'class_teacher_maps.teacher': true },
//     rename: ['class_teacher_maps:teachers'],
//     resolve: { 'class_teacher_maps:map': 'teacher' }
//   })
//   .then(res => {
//     console.log(JSON.stringify(res, null, 4))
//   })

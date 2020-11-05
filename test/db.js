const { Engine } = require('../src/main.js')
const engine = new Engine({ endpoint: 'localhost:9999/v1alpha1/graphql', useWebsocket: true })

const Teacher = engine.define('teacher', ['id', 'name', 'number'])
const Student = engine.define('student', ['id', 'name', 'number', 'class_id'])
const Class = engine.define('class', ['id', 'name'])
const ClassTearchMap = engine.define('class_teacher_map', ['id', 'teacher_id', 'class_id'])

Student.relation('class', Class)
Class.relation('students', Student)
Teacher.relation('class_teacher_maps', ClassTearchMap.relation('class', Class))
Class.relation('class_teacher_maps', ClassTearchMap.relation('teacher', Teacher))

module.exports = {
  engine,
  Teacher,
  Student,
  Class,
  ClassTearchMap
}

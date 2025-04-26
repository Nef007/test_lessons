import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import LessonTeacher from './lessonTeacher.model';
import LessonStudent from './lessonStudent.model';

@Table({
  tableName: 'lessons',
  timestamps: false,
})
export default class Lesson extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  date!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[0, 1]],
    },
  })
  status!: 0 | 1;

  @HasMany(() => LessonTeacher)
  lessonTeachers!: LessonTeacher[];

  @HasMany(() => LessonStudent)
  lessonStudents!: LessonStudent[];
}

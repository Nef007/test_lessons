import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Lesson from './lesson.model';
import Student from './student.model';

@Table({
  tableName: 'lesson_students',
  timestamps: false,
})
export default class LessonStudent extends Model {
  @ForeignKey(() => Lesson)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  lesson_id!: number;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  student_id!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  visit!: boolean;

  @BelongsTo(() => Lesson)
  lesson!: Lesson;

  @BelongsTo(() => Student)
  student!: Student;
}

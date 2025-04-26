import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import Lesson from './lesson.model';
import Teacher from './teacher.model';

@Table({
  tableName: 'lesson_teachers',
  timestamps: false,
})
export default class LessonTeacher extends Model {
  @ForeignKey(() => Lesson)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  lesson_id!: number;

  @ForeignKey(() => Teacher)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  teacher_id!: number;

  @BelongsTo(() => Lesson)
  lesson!: Lesson;

  @BelongsTo(() => Teacher)
  teacher!: Teacher;
}

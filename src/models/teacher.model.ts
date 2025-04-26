import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import Lesson from './lesson.model';
import LessonTeacher from './lessonTeacher.model';

@Table({
  tableName: 'teachers',
  timestamps: false,
})
export default class Teacher extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @BelongsToMany(() => Lesson, () => LessonTeacher)
  lessons!: Lesson[];
}

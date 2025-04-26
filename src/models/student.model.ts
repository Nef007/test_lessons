import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import LessonStudent from './lessonStudent.model';

@Table({
  tableName: 'students',
  timestamps: false,
})
export default class Student extends Model {
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

  @HasMany(() => LessonStudent)
  lessonStudents!: LessonStudent[];
}

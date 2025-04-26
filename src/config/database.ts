import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import {Lesson, LessonStudent, LessonTeacher, Student, Teacher} from '../models';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'lessons_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  models: [Lesson, LessonStudent, LessonTeacher, Student, Teacher],
  logging: false,
  pool: {
    max: 10,
    min: 0,
    idle: 10000
  }
});

export default sequelize;
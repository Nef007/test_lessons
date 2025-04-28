import { FindAndCountOptions, Op, WhereOptions, literal } from 'sequelize';
import {
  Lesson,
  LessonStudent,
  LessonTeacher,
  Student,
  Teacher,
} from '../models';

interface ILessonsFilter {
  date?: string;
  status?: 0 | 1;
  teacherIds?: string;
  studentsCount?: string;
  page?: number;
  lessonsPerPage?: number;
}

interface ILessonResponse {
  id: number;
  date: string;
  title: string;
  status: 0 | 1;
  visitCount: number;
  students: Array<{
    id: number;
    name: string;
    visit: boolean;
  }>;
  teachers: Array<{
    id: number;
    name: string;
  }>;
}

interface ILessonStudent {
  lesson_id: number;
  student_id: number;
  student: {
    id: number;
    name: string;
  };
  visit: boolean;
}

interface ILessonTeacher {
  lesson_id: number;
  teacher_id: number;
  teacher: {
    id: number;
    name: string;
  };
}

class LessonsService {
  async getLessons(filters: ILessonsFilter): Promise<ILessonResponse[]> {
    const {
      date,
      status,
      teacherIds,
      studentsCount,
      page = 1,
      lessonsPerPage = 5,
    } = filters;

    // Подготовка условий WHERE
    const where: WhereOptions<Lesson> = {};

    // Фильтр по дате
    if (date) {
      if (date.includes(',')) {
        const [startDate, endDate] = date.split(',');
        where.date = {
          [Op.between]: [startDate.trim(), endDate.trim()],
        };
      } else {
        where.date = date.trim();
      }
    }

    // Фильтр по статусу
    if (status !== undefined) {
      where.status = status;
    }

    // Фильтр по teacherIds через подзапрос
    if (teacherIds) {
      const ids = teacherIds.split(',').map((id) => parseInt(id.trim()));
      
      const lessonsWithTeachers = await LessonTeacher.findAll({
        attributes: ['lesson_id'],
        where: {
          teacher_id: { [Op.in]: ids }
        },
        group: ['lesson_id']
      });
      
      const lessonIds = lessonsWithTeachers.map(lt => lt.lesson_id);
      
      if (lessonIds.length === 0) {
        return [];
      }
      
      where.id = { [Op.in]: lessonIds };
    }


      // Фильтр по количеству студентов
      if (studentsCount) {
        const studentCountSubquery = `(
          SELECT COUNT(ls.student_id) 
          FROM lesson_students ls 
          WHERE ls.lesson_id = "Lesson"."id"
        )`;
  
        if (studentsCount.includes(',')) {
          const [min, max] = studentsCount
            .split(',')
            .map((num) => parseInt(num.trim()));
          where[Op.and as any] = [
            literal(`${studentCountSubquery} BETWEEN ${min} AND ${max}`),
          ];
        } else {
          const count = parseInt(studentsCount);
          where[Op.and as any] = [literal(`${studentCountSubquery} = ${count}`)];
        }
      }


      // Получаем только основные данные уроков
    const lessons = await Lesson.findAll({
      attributes: ['id', 'date', 'title', 'status'],
      where,
      limit: lessonsPerPage,
      offset: (page - 1) * lessonsPerPage,
      order: [
        ['id', 'ASC'],
        ['date', 'ASC'],
      ],
    });

    if (lessons.length === 0) {
      return [];
    }


    const lessonIds = lessons.map(lesson => lesson.id);


     // Получаем преподавателей для найденных уроков
     const lessonTeachers = await LessonTeacher.findAll({
      where: {
        lesson_id: { [Op.in]: lessonIds }
      },
      include: [{
        model: Teacher,
        as: 'teacher',
        attributes: ['id', 'name'],
      }],
    });

    // Получаем студентов для найденных уроков
    const lessonStudents = await LessonStudent.findAll({
      where: {
        lesson_id: { [Op.in]: lessonIds }
      },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'name'],
      }],
    });

        // Группируем преподавателей и студентов по урокам
        const teachersByLesson: Record<number, ILessonTeacher[]> = {};
        const studentsByLesson: Record<number, ILessonStudent[]> = {};

        lessonTeachers.forEach(lt => {
          if (!teachersByLesson[lt.lesson_id]) {
            teachersByLesson[lt.lesson_id] = [];
          }
          teachersByLesson[lt.lesson_id].push(lt.get({ plain: true }));
        });
    
        lessonStudents.forEach(ls => {
          if (!studentsByLesson[ls.lesson_id]) {
            studentsByLesson[ls.lesson_id] = [];
          }
          studentsByLesson[ls.lesson_id].push(ls.get({ plain: true }));
        });
    
        // Формируем ответ
        return lessons.map(lesson => {
          const lessonId = lesson.id;
          const teachers = teachersByLesson[lessonId] || [];
          const students = studentsByLesson[lessonId] || [];
    
          return {
            id: lesson.id,
            date: String(lesson.date).split('T')[0],
            title: lesson.title,
            status: lesson.status,
            visitCount: students.reduce((count, ls) => count + (ls.visit ? 1 : 0), 0),
            students: students.map(ls => ({
              id: ls.student.id,
              name: ls.student.name,
              visit: ls.visit,
            })),
            teachers: teachers.map(lt => ({
              id: lt.teacher.id,
              name: lt.teacher.name,
            })),
          };
        });
      }
    }
    
    export default new LessonsService();
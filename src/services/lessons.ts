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

    // Фильтр по учителям
    const teacherWhere: WhereOptions<LessonTeacher> = {};
    if (teacherIds) {
      const ids = teacherIds.split(',').map((id) => parseInt(id.trim()));
      teacherWhere.teacher_id = {
        [Op.in]: ids,
      };
    }

    // Основной запрос
    const queryOptions: FindAndCountOptions = {
      attributes: ['id', 'date', 'title', 'status'],
      where,
      include: [
        {
          model: LessonTeacher,
          as: 'lessonTeachers',
          where: teacherWhere,
          required: !!teacherIds,
          include: [
            {
              model: Teacher,
              as: 'teacher',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: LessonStudent,
          as: 'lessonStudents',
          required: false,
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      distinct: true,
      limit: lessonsPerPage,
      offset: (page - 1) * lessonsPerPage,
      order: [
        ['id', 'ASC'],
        ['date', 'ASC'],
      ],
      subQuery: false,
    };

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

    const lessons = await Lesson.findAll(queryOptions);

    // Формируем ответ

    return lessons.map((lesson) => {
      const lessonData = lesson.get({ plain: true });

      const { lessonStudents = [], lessonTeachers = [] } = lessonData;

      return {
        id: lesson.id,
        date: String(lesson.date).split('T')[0],
        title: lesson.title,
        status: lesson.status,
        visitCount: lessonStudents.reduce(
          (count: number, ls: ILessonStudent) => count + (ls.visit ? 1 : 0),
          0,
        ),
        students: lessonStudents.map((ls: ILessonStudent) => ({
          id: ls.student.id,
          name: ls.student.name,
          visit: ls.visit,
        })),
        teachers: lessonTeachers.map((lt: ILessonTeacher) => ({
          id: lt.teacher.id,
          name: lt.teacher.name,
        })),
      };
    });
  }
}

export default new LessonsService();

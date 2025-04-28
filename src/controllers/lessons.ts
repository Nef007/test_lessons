import { Request, Response, NextFunction, RequestHandler } from 'express';
import lessonsService from '../services/lessons';

export interface LessonsRequestQuery {
  date?: string;
  status?: string;
  teacherIds?: string;
  studentsCount?: string;
  page?: string;
  lessonsPerPage?: string;
}

const getLessons: RequestHandler = async (
  req: Request<{}, {}, {}, LessonsRequestQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { date, status, teacherIds, studentsCount, page, lessonsPerPage } =
      req.query;

    const lessons = await lessonsService.getLessons({
      date,
      status: status ? (parseInt(status) as 0 | 1) : undefined,
      teacherIds,
      studentsCount,
      page: page ? parseInt(page) : 1,
      lessonsPerPage: lessonsPerPage ? parseInt(lessonsPerPage) : 5,
    });

    res.json(lessons);
  } catch (error) {
    next(error);
  }
};

export default {
  getLessons,
};

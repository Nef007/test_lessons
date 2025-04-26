import { RequestHandler } from 'express';
import { z } from 'zod';

// Схема валидации параметров запроса
const lessonsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(,\d{4}-\d{2}-\d{2})?$/, {
      message: 'Invalid date format. Use YYYY-MM-DD or YYYY-MM-DD,YYYY-MM-DD',
    })
    .optional(),
  status: z.union([z.literal('0'), z.literal('1')]).optional(),
  teacherIds: z
    .string()
    .regex(/^\d+(,\d+)*$/, {
      message: 'teacherIds should contain numbers separated by commas',
    })
    .optional(),
  studentsCount: z
    .string()
    .regex(/^\d+(,\d+)?$/, {
      message: 'studentsCount should contain 1 or 2 numbers separated by comma',
    })
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, { message: 'page should be a number' })
    .optional(),
  lessonsPerPage: z
    .string()
    .regex(/^\d+$/, { message: 'lessonsPerPage should be a number' })
    .optional(),
});

export const validateLessonsParams: RequestHandler = (req, res, next) => {
  const result = lessonsQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      error: {
        message: 'Invalid parameters',
        details: result.error.issues.map((issue) => issue.message),
      },
    });
  }

  // Присваиваем провалидированные данные к запросу
  req.query = result.data;
  next();
};

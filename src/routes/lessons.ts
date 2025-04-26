import { Router } from 'express';
import { validateLessonsParams } from '../middlewares/validate';
import LessonController from '../controllers/lessons';

const router = Router();

router.get('/lessons', validateLessonsParams, LessonController.getLessons);

export default router;

import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database';
import lessonsRouter from './routes/lessons';

// Загрузка переменных окружения из .env файла
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Маршруты API
app.use('/api', lessonsRouter);

// Обработка ошибок
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Подключение к базе данных установлено успешно.');

    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Не удалось подключиться к базе данных:', error);
  }
}

startServer();

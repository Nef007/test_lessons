/**
 * Скрипт для тестирования API занятий
 * Запускается командой: node scripts/test-api.js
 */


const http = require('http');
const querystring = require('querystring');

// Базовый URL API
const API_BASE_URL = 'http://localhost:3000/api';

// Функция для выполнения GET-запроса к API
async function fetchAPI(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const queryParams = Object.keys(params).length > 0 
      ? '?' + querystring.stringify(params) 
      : '';
    
    const url = `${API_BASE_URL}${endpoint}${queryParams}`;
    console.log(`Выполняется запрос: ${url}`);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`Статус ответа: ${res.statusCode}`);
          resolve(jsonData);
        } catch (error) {
          reject(`Ошибка парсинга JSON: ${error.message}`);
        }
      });
    }).on('error', (error) => {
      reject(`Ошибка запроса: ${error.message}`);
    });
  });
}

// Тестирование различных сценариев API
async function runTests() {
  try {
    console.log('=== Тестирование API занятий ===');
    
    // Тест 1: Получение занятий без параметров (базовая пагинация)
    console.log('\nТест 1: Получение занятий без параметров');
    const test1 = await fetchAPI('/lessons');
    console.log(`Получено занятий: ${test1.length}`);
    
    // Тест 2: Фильтрация по дате
    console.log('\nТест 2: Фильтрация по дате');
    const test2 = await fetchAPI('/lessons', { date: '2019-09-01,2019-09-30' });
    console.log(`Получено занятий: ${test2.length}`);
    
    // Тест 3: Фильтрация по статусу
    console.log('\nТест 3: Фильтрация по статусу');
    const test3 = await fetchAPI('/lessons', { status: '1' });
    console.log(`Получено занятий: ${test3.length}`);
    
    // Тест 4: Фильтрация по учителям
    console.log('\nТест 4: Фильтрация по учителям');
    const test4 = await fetchAPI('/lessons', { teacherIds: '1,2' });
    console.log(`Получено занятий: ${test4.length}`);
    
    // Тест 5: Фильтрация по количеству студентов
    console.log('\nТест 5: Фильтрация по количеству студентов');
    const test5 = await fetchAPI('/lessons', { studentsCount: '10,15' });
    console.log(`Получено занятий: ${test5.length}`);
    
    // Тест 6: Комбинированная фильтрация
    console.log('\nТест 6: Комбинированная фильтрация');
    const test6 = await fetchAPI('/lessons', { 
      date: '2019-09-01,2019-09-30',
      status: '1',
      teacherIds: '1',
      studentsCount: '10,15',
      page: '1',
      lessonsPerPage: '10'
    });
    console.log(`Получено занятий: ${test6.length}`);
    
    console.log('\n=== Тестирование завершено ===');
  } catch (error) {
    console.error('Ошибка при выполнении тестов:', error);
  }
}

// Запуск тестов
runTests();
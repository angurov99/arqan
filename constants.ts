import { QuestionSet } from './types';

export const WINNING_SCORE = 5;

export const DEFAULT_QUESTIONS: QuestionSet = {
  id: 'default-set',
  name: 'Жалпы сұрақтар (Мысал)',
  questions: [
    { id: '1', text: '1 байтта неше бит бар?', answer: '8' },
    { id: '2', text: 'Ақпаратты өңдейтін негізгі құрылғы?', answer: 'процессор' },
    { id: '3', text: 'Компьютердің "миы" қалай аталады?', answer: 'процессор' },
    { id: '4', text: 'Мәтіндік ақпаратты сақтайтын файл кеңейтілуі?', answer: 'txt' },
    { id: '5', text: 'Интернеттегі парақшаларды қарауға арналған бағдарлама?', answer: 'браузер' },
    { id: '6', text: 'Ақпаратты қағазға басып шығаратын құрылғы?', answer: 'принтер' },
    { id: '7', text: 'Дыбысты енгізу құрылғысы?', answer: 'микрофон' },
    { id: '8', text: 'Компьютерді өшіру командасы?', answer: 'завершение работы' },
    { id: '9', text: 'Кестелік процессор?', answer: 'excel' },
    { id: '10', text: 'Мәтіндік процессор?', answer: 'word' },
  ],
};
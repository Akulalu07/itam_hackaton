import { SkillTest } from '../../types';

/**
 * Банк тестов для бэкенд-технологий
 * Каждый тест содержит 10 вопросов разной сложности
 * Уровни определяются по проценту правильных ответов:
 * - beginner: 0-49%
 * - intermediate: 50-69%
 * - advanced: 70-89%
 * - expert: 90-100%
 */

// ============================================
// GO (GOLANG) TEST
// ============================================
export const goTest: SkillTest = {
  id: 'go-test',
  skillName: 'Go',
  category: 'backend',
  description: 'Тест на знание языка Go: синтаксис, горутины, каналы, стандартная библиотека',
  passingScore: 50,
  timeLimit: 600, // 10 минут
  levelThresholds: {
    beginner: 0,
    intermediate: 50,
    advanced: 70,
    expert: 90,
  },
  questions: [
    {
      id: 'go-1',
      difficulty: 'easy',
      question: 'Какой результат выполнения кода?',
      code: `package main

import "fmt"

func main() {
    x := []int{1, 2, 3}
    y := x
    y[0] = 10
    fmt.Println(x[0])
}`,
      options: [
        { id: 'go-1-a', text: '1', isCorrect: false },
        { id: 'go-1-b', text: '10', isCorrect: true },
        { id: 'go-1-c', text: 'Ошибка компиляции', isCorrect: false },
        { id: 'go-1-d', text: '[1 2 3]', isCorrect: false },
      ],
      explanation: 'Слайсы в Go передаются по ссылке. y и x указывают на один и тот же underlying array.',
    },
    {
      id: 'go-2',
      difficulty: 'easy',
      question: 'Как объявить константу в Go?',
      options: [
        { id: 'go-2-a', text: 'var PI = 3.14', isCorrect: false },
        { id: 'go-2-b', text: 'const PI = 3.14', isCorrect: true },
        { id: 'go-2-c', text: 'let PI = 3.14', isCorrect: false },
        { id: 'go-2-d', text: 'define PI 3.14', isCorrect: false },
      ],
      explanation: 'В Go константы объявляются с помощью ключевого слова const.',
    },
    {
      id: 'go-3',
      difficulty: 'easy',
      question: 'Что делает оператор := в Go?',
      options: [
        { id: 'go-3-a', text: 'Сравнивает значения', isCorrect: false },
        { id: 'go-3-b', text: 'Объявляет и инициализирует переменную с автовыводом типа', isCorrect: true },
        { id: 'go-3-c', text: 'Присваивает значение существующей переменной', isCorrect: false },
        { id: 'go-3-d', text: 'Объявляет константу', isCorrect: false },
      ],
      explanation: 'Оператор := (short declaration) объявляет переменную и автоматически выводит её тип.',
    },
    {
      id: 'go-4',
      difficulty: 'medium',
      question: 'Какой результат выполнения кода?',
      code: `package main

import "fmt"

func main() {
    defer fmt.Println("1")
    defer fmt.Println("2")
    defer fmt.Println("3")
}`,
      options: [
        { id: 'go-4-a', text: '1 2 3', isCorrect: false },
        { id: 'go-4-b', text: '3 2 1', isCorrect: true },
        { id: 'go-4-c', text: 'Ошибка компиляции', isCorrect: false },
        { id: 'go-4-d', text: 'Случайный порядок', isCorrect: false },
      ],
      explanation: 'defer работает по принципу LIFO (Last In, First Out) - последний defer выполняется первым.',
    },
    {
      id: 'go-5',
      difficulty: 'medium',
      question: 'Как создать горутину в Go?',
      options: [
        { id: 'go-5-a', text: 'thread myFunc()', isCorrect: false },
        { id: 'go-5-b', text: 'go myFunc()', isCorrect: true },
        { id: 'go-5-c', text: 'async myFunc()', isCorrect: false },
        { id: 'go-5-d', text: 'spawn myFunc()', isCorrect: false },
      ],
      explanation: 'Ключевое слово go перед вызовом функции запускает её в новой горутине.',
    },
    {
      id: 'go-6',
      difficulty: 'medium',
      question: 'Какой результат выполнения кода?',
      code: `package main

import "fmt"

func main() {
    m := make(map[string]int)
    m["a"] = 1
    v, ok := m["b"]
    fmt.Println(v, ok)
}`,
      options: [
        { id: 'go-6-a', text: '0 false', isCorrect: true },
        { id: 'go-6-b', text: 'nil false', isCorrect: false },
        { id: 'go-6-c', text: 'panic', isCorrect: false },
        { id: 'go-6-d', text: '0 true', isCorrect: false },
      ],
      explanation: 'При обращении к несуществующему ключу map возвращает zero value типа (0 для int) и false.',
    },
    {
      id: 'go-7',
      difficulty: 'medium',
      question: 'Что такое интерфейс в Go?',
      options: [
        { id: 'go-7-a', text: 'Класс с абстрактными методами', isCorrect: false },
        { id: 'go-7-b', text: 'Набор сигнатур методов, реализуемый неявно', isCorrect: true },
        { id: 'go-7-c', text: 'Структура с публичными полями', isCorrect: false },
        { id: 'go-7-d', text: 'Тип для хранения указателей', isCorrect: false },
      ],
      explanation: 'Интерфейс в Go - это набор методов. Тип реализует интерфейс неявно, просто имея все его методы.',
    },
    {
      id: 'go-8',
      difficulty: 'hard',
      question: 'Какой результат выполнения кода?',
      code: `package main

import "fmt"

func main() {
    ch := make(chan int, 2)
    ch <- 1
    ch <- 2
    close(ch)
    
    for v := range ch {
        fmt.Print(v, " ")
    }
}`,
      options: [
        { id: 'go-8-a', text: '1 2 ', isCorrect: true },
        { id: 'go-8-b', text: 'deadlock', isCorrect: false },
        { id: 'go-8-c', text: 'panic: send on closed channel', isCorrect: false },
        { id: 'go-8-d', text: 'Бесконечный цикл', isCorrect: false },
      ],
      explanation: 'range по каналу читает значения до его закрытия. После close() канал отдаёт оставшиеся значения.',
    },
    {
      id: 'go-9',
      difficulty: 'hard',
      question: 'Какая проблема в этом коде?',
      code: `package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    for i := 0; i < 3; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            fmt.Println(i)
        }()
    }
    wg.Wait()
}`,
      options: [
        { id: 'go-9-a', text: 'Нет проблем, выведет 0 1 2', isCorrect: false },
        { id: 'go-9-b', text: 'Race condition: все горутины могут вывести 3', isCorrect: true },
        { id: 'go-9-c', text: 'Deadlock', isCorrect: false },
        { id: 'go-9-d', text: 'Ошибка компиляции', isCorrect: false },
      ],
      explanation: 'Классическая ошибка: замыкание захватывает переменную i по ссылке. К моменту выполнения горутин цикл завершится.',
    },
    {
      id: 'go-10',
      difficulty: 'hard',
      question: 'Что такое context в Go и для чего используется?',
      options: [
        { id: 'go-10-a', text: 'Для хранения глобальных переменных', isCorrect: false },
        { id: 'go-10-b', text: 'Для передачи deadlines, cancellation signals и request-scoped данных', isCorrect: true },
        { id: 'go-10-c', text: 'Для создания горутин', isCorrect: false },
        { id: 'go-10-d', text: 'Для работы с файлами', isCorrect: false },
      ],
      explanation: 'context.Context используется для управления временем жизни операций, передачи отмены и метаданных между горутинами.',
    },
  ],
};

// ============================================
// PYTHON TEST
// ============================================
export const pythonTest: SkillTest = {
  id: 'python-test',
  skillName: 'Python',
  category: 'backend',
  description: 'Тест на знание Python: синтаксис, ООП, работа с данными, async/await',
  passingScore: 50,
  timeLimit: 600,
  levelThresholds: {
    beginner: 0,
    intermediate: 50,
    advanced: 70,
    expert: 90,
  },
  questions: [
    {
      id: 'py-1',
      difficulty: 'easy',
      question: 'Какой результат выполнения кода?',
      code: `x = [1, 2, 3]
y = x
y.append(4)
print(len(x))`,
      options: [
        { id: 'py-1-a', text: '3', isCorrect: false },
        { id: 'py-1-b', text: '4', isCorrect: true },
        { id: 'py-1-c', text: 'Ошибка', isCorrect: false },
        { id: 'py-1-d', text: '[1, 2, 3, 4]', isCorrect: false },
      ],
      explanation: 'Списки в Python передаются по ссылке. y и x указывают на один и тот же объект.',
    },
    {
      id: 'py-2',
      difficulty: 'easy',
      question: 'Как создать виртуальное окружение в Python 3?',
      options: [
        { id: 'py-2-a', text: 'python -m venv myenv', isCorrect: true },
        { id: 'py-2-b', text: 'pip install venv', isCorrect: false },
        { id: 'py-2-c', text: 'python create venv', isCorrect: false },
        { id: 'py-2-d', text: 'virtualenv --create', isCorrect: false },
      ],
      explanation: 'Модуль venv встроен в Python 3 и создаёт виртуальное окружение командой python -m venv.',
    },
    {
      id: 'py-3',
      difficulty: 'easy',
      question: 'Что выведет код?',
      code: `print(type([]) == list)`,
      options: [
        { id: 'py-3-a', text: 'True', isCorrect: true },
        { id: 'py-3-b', text: 'False', isCorrect: false },
        { id: 'py-3-c', text: '<class "list">', isCorrect: false },
        { id: 'py-3-d', text: 'Ошибка', isCorrect: false },
      ],
      explanation: 'type([]) возвращает <class "list">, который равен list.',
    },
    {
      id: 'py-4',
      difficulty: 'medium',
      question: 'Какой результат выполнения кода?',
      code: `def func(a, b=[]):
    b.append(a)
    return b

print(func(1))
print(func(2))`,
      options: [
        { id: 'py-4-a', text: '[1]\\n[2]', isCorrect: false },
        { id: 'py-4-b', text: '[1]\\n[1, 2]', isCorrect: true },
        { id: 'py-4-c', text: '[1]\\n[1]', isCorrect: false },
        { id: 'py-4-d', text: 'Ошибка', isCorrect: false },
      ],
      explanation: 'Мутабельный аргумент по умолчанию создаётся один раз при определении функции. Это частая ошибка в Python.',
    },
    {
      id: 'py-5',
      difficulty: 'medium',
      question: 'Что такое декоратор в Python?',
      options: [
        { id: 'py-5-a', text: 'Способ наследования классов', isCorrect: false },
        { id: 'py-5-b', text: 'Функция, которая принимает функцию и возвращает новую функцию', isCorrect: true },
        { id: 'py-5-c', text: 'Метод для форматирования строк', isCorrect: false },
        { id: 'py-5-d', text: 'Способ создания генераторов', isCorrect: false },
      ],
      explanation: 'Декоратор - это функция высшего порядка, которая оборачивает другую функцию для расширения её поведения.',
    },
    {
      id: 'py-6',
      difficulty: 'medium',
      question: 'Какой результат выполнения кода?',
      code: `x = {1, 2, 3}
y = {2, 3, 4}
print(x & y)`,
      options: [
        { id: 'py-6-a', text: '{1, 2, 3, 4}', isCorrect: false },
        { id: 'py-6-b', text: '{2, 3}', isCorrect: true },
        { id: 'py-6-c', text: '{1, 4}', isCorrect: false },
        { id: 'py-6-d', text: 'Ошибка', isCorrect: false },
      ],
      explanation: 'Оператор & для множеств возвращает пересечение (intersection) - элементы, которые есть в обоих множествах.',
    },
    {
      id: 'py-7',
      difficulty: 'medium',
      question: 'Что делает __init__ метод в классе Python?',
      options: [
        { id: 'py-7-a', text: 'Создаёт новый экземпляр класса', isCorrect: false },
        { id: 'py-7-b', text: 'Инициализирует атрибуты экземпляра после создания', isCorrect: true },
        { id: 'py-7-c', text: 'Удаляет экземпляр класса', isCorrect: false },
        { id: 'py-7-d', text: 'Определяет статические методы', isCorrect: false },
      ],
      explanation: '__init__ - это конструктор, который вызывается после создания объекта для инициализации его атрибутов.',
    },
    {
      id: 'py-8',
      difficulty: 'hard',
      question: 'Какой результат выполнения кода?',
      code: `async def foo():
    return 42

result = foo()
print(type(result).__name__)`,
      options: [
        { id: 'py-8-a', text: 'int', isCorrect: false },
        { id: 'py-8-b', text: 'coroutine', isCorrect: true },
        { id: 'py-8-c', text: 'function', isCorrect: false },
        { id: 'py-8-d', text: '42', isCorrect: false },
      ],
      explanation: 'Вызов async функции без await возвращает coroutine объект, а не результат.',
    },
    {
      id: 'py-9',
      difficulty: 'hard',
      question: 'Что такое GIL в Python?',
      options: [
        { id: 'py-9-a', text: 'Библиотека для работы с графикой', isCorrect: false },
        { id: 'py-9-b', text: 'Global Interpreter Lock - механизм, позволяющий только одному потоку выполнять Python код', isCorrect: true },
        { id: 'py-9-c', text: 'Система сборки мусора', isCorrect: false },
        { id: 'py-9-d', text: 'Генератор случайных чисел', isCorrect: false },
      ],
      explanation: 'GIL предотвращает одновременное выполнение Python байткода несколькими потоками в CPython.',
    },
    {
      id: 'py-10',
      difficulty: 'hard',
      question: 'Какой результат выполнения кода?',
      code: `from collections import defaultdict

d = defaultdict(list)
d['a'].append(1)
d['b'].append(2)
print(d['c'])`,
      options: [
        { id: 'py-10-a', text: 'KeyError', isCorrect: false },
        { id: 'py-10-b', text: '[]', isCorrect: true },
        { id: 'py-10-c', text: 'None', isCorrect: false },
        { id: 'py-10-d', text: '0', isCorrect: false },
      ],
      explanation: 'defaultdict создаёт значение по умолчанию (пустой список) при обращении к несуществующему ключу.',
    },
  ],
};

// ============================================
// NODE.JS TEST
// ============================================
export const nodeTest: SkillTest = {
  id: 'nodejs-test',
  skillName: 'Node.js',
  category: 'backend',
  description: 'Тест на знание Node.js: event loop, async/await, модули, npm',
  passingScore: 50,
  timeLimit: 600,
  levelThresholds: {
    beginner: 0,
    intermediate: 50,
    advanced: 70,
    expert: 90,
  },
  questions: [
    {
      id: 'node-1',
      difficulty: 'easy',
      question: 'Какой результат выполнения кода?',
      code: `console.log('1');
setTimeout(() => console.log('2'), 0);
console.log('3');`,
      options: [
        { id: 'node-1-a', text: '1 2 3', isCorrect: false },
        { id: 'node-1-b', text: '1 3 2', isCorrect: true },
        { id: 'node-1-c', text: '2 1 3', isCorrect: false },
        { id: 'node-1-d', text: '1 3', isCorrect: false },
      ],
      explanation: 'setTimeout помещает callback в очередь макрозадач, которая выполняется после синхронного кода.',
    },
    {
      id: 'node-2',
      difficulty: 'easy',
      question: 'Как импортировать модуль в CommonJS?',
      options: [
        { id: 'node-2-a', text: 'import fs from "fs"', isCorrect: false },
        { id: 'node-2-b', text: 'const fs = require("fs")', isCorrect: true },
        { id: 'node-2-c', text: 'include "fs"', isCorrect: false },
        { id: 'node-2-d', text: 'load("fs")', isCorrect: false },
      ],
      explanation: 'В CommonJS модули импортируются с помощью функции require().',
    },
    {
      id: 'node-3',
      difficulty: 'easy',
      question: 'Что такое npm?',
      options: [
        { id: 'node-3-a', text: 'Node Process Manager', isCorrect: false },
        { id: 'node-3-b', text: 'Node Package Manager', isCorrect: true },
        { id: 'node-3-c', text: 'New Project Maker', isCorrect: false },
        { id: 'node-3-d', text: 'Network Protocol Module', isCorrect: false },
      ],
      explanation: 'npm (Node Package Manager) - менеджер пакетов для Node.js.',
    },
    {
      id: 'node-4',
      difficulty: 'medium',
      question: 'Какой результат выполнения кода?',
      code: `Promise.resolve()
  .then(() => console.log('1'))
  .then(() => console.log('2'));

Promise.resolve()
  .then(() => console.log('3'))
  .then(() => console.log('4'));`,
      options: [
        { id: 'node-4-a', text: '1 2 3 4', isCorrect: false },
        { id: 'node-4-b', text: '1 3 2 4', isCorrect: true },
        { id: 'node-4-c', text: '3 4 1 2', isCorrect: false },
        { id: 'node-4-d', text: 'Порядок не определён', isCorrect: false },
      ],
      explanation: 'Микрозадачи (then) выполняются по порядку добавления. Сначала все первые then, потом вторые.',
    },
    {
      id: 'node-5',
      difficulty: 'medium',
      question: 'Что делает process.nextTick()?',
      options: [
        { id: 'node-5-a', text: 'Ждёт следующую итерацию event loop', isCorrect: false },
        { id: 'node-5-b', text: 'Выполняет callback сразу после текущей операции, до I/O', isCorrect: true },
        { id: 'node-5-c', text: 'Создаёт новый процесс', isCorrect: false },
        { id: 'node-5-d', text: 'Завершает процесс', isCorrect: false },
      ],
      explanation: 'process.nextTick() добавляет callback в очередь nextTick, которая выполняется до микрозадач Promise.',
    },
    {
      id: 'node-6',
      difficulty: 'medium',
      question: 'Как обработать необработанные rejection промисов глобально?',
      options: [
        { id: 'node-6-a', text: 'try/catch на верхнем уровне', isCorrect: false },
        { id: 'node-6-b', text: 'process.on("unhandledRejection", handler)', isCorrect: true },
        { id: 'node-6-c', text: 'Promise.catch() глобально', isCorrect: false },
        { id: 'node-6-d', text: 'Это невозможно', isCorrect: false },
      ],
      explanation: 'Событие unhandledRejection позволяет перехватить все необработанные rejection промисов.',
    },
    {
      id: 'node-7',
      difficulty: 'medium',
      question: 'Что такое middleware в Express.js?',
      options: [
        { id: 'node-7-a', text: 'База данных', isCorrect: false },
        { id: 'node-7-b', text: 'Функция с доступом к req, res, next для обработки запросов', isCorrect: true },
        { id: 'node-7-c', text: 'Шаблонизатор', isCorrect: false },
        { id: 'node-7-d', text: 'Роутер', isCorrect: false },
      ],
      explanation: 'Middleware - функции, которые выполняются последовательно в цепочке обработки HTTP запроса.',
    },
    {
      id: 'node-8',
      difficulty: 'hard',
      question: 'В чём разница между spawn и exec в child_process?',
      options: [
        { id: 'node-8-a', text: 'Нет разницы', isCorrect: false },
        { id: 'node-8-b', text: 'spawn стримит данные, exec буферизирует весь вывод', isCorrect: true },
        { id: 'node-8-c', text: 'exec асинхронный, spawn синхронный', isCorrect: false },
        { id: 'node-8-d', text: 'spawn только для Linux', isCorrect: false },
      ],
      explanation: 'spawn возвращает stream и подходит для больших данных. exec буферизирует вывод и имеет лимит.',
    },
    {
      id: 'node-9',
      difficulty: 'hard',
      question: 'Что такое libuv в Node.js?',
      options: [
        { id: 'node-9-a', text: 'JavaScript движок', isCorrect: false },
        { id: 'node-9-b', text: 'Кроссплатформенная библиотека для async I/O и event loop', isCorrect: true },
        { id: 'node-9-c', text: 'HTTP парсер', isCorrect: false },
        { id: 'node-9-d', text: 'Менеджер зависимостей', isCorrect: false },
      ],
      explanation: 'libuv - C библиотека, обеспечивающая event loop, async I/O, thread pool в Node.js.',
    },
    {
      id: 'node-10',
      difficulty: 'hard',
      question: 'Какой результат выполнения кода?',
      code: `const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.once('event', () => console.log('A'));
emitter.on('event', () => console.log('B'));

emitter.emit('event');
emitter.emit('event');`,
      options: [
        { id: 'node-10-a', text: 'A B A B', isCorrect: false },
        { id: 'node-10-b', text: 'A B B', isCorrect: true },
        { id: 'node-10-c', text: 'A A B B', isCorrect: false },
        { id: 'node-10-d', text: 'B B', isCorrect: false },
      ],
      explanation: 'once() вызывает обработчик только один раз, on() - при каждом событии.',
    },
  ],
};

// ============================================
// JAVA TEST
// ============================================
export const javaTest: SkillTest = {
  id: 'java-test',
  skillName: 'Java',
  category: 'backend',
  description: 'Тест на знание Java: ООП, коллекции, многопоточность, Spring',
  passingScore: 50,
  timeLimit: 600,
  levelThresholds: {
    beginner: 0,
    intermediate: 50,
    advanced: 70,
    expert: 90,
  },
  questions: [
    {
      id: 'java-1',
      difficulty: 'easy',
      question: 'Какой результат выполнения кода?',
      code: `String s1 = "hello";
String s2 = "hello";
System.out.println(s1 == s2);`,
      options: [
        { id: 'java-1-a', text: 'true', isCorrect: true },
        { id: 'java-1-b', text: 'false', isCorrect: false },
        { id: 'java-1-c', text: 'Ошибка компиляции', isCorrect: false },
        { id: 'java-1-d', text: 'hello', isCorrect: false },
      ],
      explanation: 'Строковые литералы интернируются - одинаковые строки указывают на один объект в String Pool.',
    },
    {
      id: 'java-2',
      difficulty: 'easy',
      question: 'Какой модификатор доступа самый ограниченный?',
      options: [
        { id: 'java-2-a', text: 'public', isCorrect: false },
        { id: 'java-2-b', text: 'private', isCorrect: true },
        { id: 'java-2-c', text: 'protected', isCorrect: false },
        { id: 'java-2-d', text: 'default (package-private)', isCorrect: false },
      ],
      explanation: 'private ограничивает доступ только текущим классом.',
    },
    {
      id: 'java-3',
      difficulty: 'easy',
      question: 'Что такое JVM?',
      options: [
        { id: 'java-3-a', text: 'Java Version Manager', isCorrect: false },
        { id: 'java-3-b', text: 'Java Virtual Machine - виртуальная машина для выполнения байткода', isCorrect: true },
        { id: 'java-3-c', text: 'Java Visual Module', isCorrect: false },
        { id: 'java-3-d', text: 'Компилятор Java', isCorrect: false },
      ],
      explanation: 'JVM выполняет скомпилированный байткод Java, обеспечивая кроссплатформенность.',
    },
    {
      id: 'java-4',
      difficulty: 'medium',
      question: 'Какой результат выполнения кода?',
      code: `List<Integer> list = new ArrayList<>();
list.add(1);
list.add(2);
list.add(3);
list.remove(1);
System.out.println(list);`,
      options: [
        { id: 'java-4-a', text: '[2, 3]', isCorrect: false },
        { id: 'java-4-b', text: '[1, 3]', isCorrect: true },
        { id: 'java-4-c', text: '[1, 2]', isCorrect: false },
        { id: 'java-4-d', text: 'Ошибка', isCorrect: false },
      ],
      explanation: 'remove(1) удаляет элемент по индексу 1 (второй элемент), а не значение 1.',
    },
    {
      id: 'java-5',
      difficulty: 'medium',
      question: 'В чём разница между == и equals()?',
      options: [
        { id: 'java-5-a', text: 'Нет разницы', isCorrect: false },
        { id: 'java-5-b', text: '== сравнивает ссылки, equals() сравнивает содержимое объектов', isCorrect: true },
        { id: 'java-5-c', text: '== быстрее', isCorrect: false },
        { id: 'java-5-d', text: 'equals() только для строк', isCorrect: false },
      ],
      explanation: '== проверяет идентичность ссылок, equals() - логическое равенство объектов.',
    },
    {
      id: 'java-6',
      difficulty: 'medium',
      question: 'Что такое интерфейс Comparable?',
      options: [
        { id: 'java-6-a', text: 'Интерфейс для клонирования объектов', isCorrect: false },
        { id: 'java-6-b', text: 'Интерфейс для определения естественного порядка сортировки', isCorrect: true },
        { id: 'java-6-c', text: 'Интерфейс для сериализации', isCorrect: false },
        { id: 'java-6-d', text: 'Интерфейс для итерации', isCorrect: false },
      ],
      explanation: 'Comparable<T> позволяет объектам определить свой natural ordering через метод compareTo().',
    },
    {
      id: 'java-7',
      difficulty: 'medium',
      question: 'Что произойдёт при выполнении кода?',
      code: `try {
    throw new RuntimeException();
} catch (Exception e) {
    System.out.println("Caught");
} finally {
    System.out.println("Finally");
}`,
      options: [
        { id: 'java-7-a', text: 'Caught', isCorrect: false },
        { id: 'java-7-b', text: 'Caught\\nFinally', isCorrect: true },
        { id: 'java-7-c', text: 'Finally', isCorrect: false },
        { id: 'java-7-d', text: 'RuntimeException', isCorrect: false },
      ],
      explanation: 'RuntimeException - это Exception, поэтому catch сработает. finally выполняется всегда.',
    },
    {
      id: 'java-8',
      difficulty: 'hard',
      question: 'Что такое volatile в Java?',
      options: [
        { id: 'java-8-a', text: 'Модификатор для констант', isCorrect: false },
        { id: 'java-8-b', text: 'Гарантирует видимость изменений переменной между потоками', isCorrect: true },
        { id: 'java-8-c', text: 'Делает переменную неизменяемой', isCorrect: false },
        { id: 'java-8-d', text: 'Ускоряет доступ к переменной', isCorrect: false },
      ],
      explanation: 'volatile обеспечивает happens-before и запрещает кэширование переменной в регистрах CPU.',
    },
    {
      id: 'java-9',
      difficulty: 'hard',
      question: 'Какая коллекция потокобезопасна без внешней синхронизации?',
      options: [
        { id: 'java-9-a', text: 'ArrayList', isCorrect: false },
        { id: 'java-9-b', text: 'ConcurrentHashMap', isCorrect: true },
        { id: 'java-9-c', text: 'HashMap', isCorrect: false },
        { id: 'java-9-d', text: 'LinkedList', isCorrect: false },
      ],
      explanation: 'ConcurrentHashMap использует сегментную блокировку для потокобезопасности без блокировки всей коллекции.',
    },
    {
      id: 'java-10',
      difficulty: 'hard',
      question: 'Что такое @Transactional в Spring?',
      options: [
        { id: 'java-10-a', text: 'Аннотация для логирования', isCorrect: false },
        { id: 'java-10-b', text: 'Аннотация для управления транзакциями базы данных', isCorrect: true },
        { id: 'java-10-c', text: 'Аннотация для кэширования', isCorrect: false },
        { id: 'java-10-d', text: 'Аннотация для валидации', isCorrect: false },
      ],
      explanation: '@Transactional обеспечивает ACID транзакции - автоматический commit или rollback при ошибках.',
    },
  ],
};

// ============================================
// EXPORT ALL BACKEND TESTS
// ============================================
export const backendTests: SkillTest[] = [
  goTest,
  pythonTest,
  nodeTest,
  javaTest,
];

// Получить тест по названию навыка
export const getBackendTestBySkill = (skillName: string): SkillTest | undefined => {
  return backendTests.find(
    test => test.skillName.toLowerCase() === skillName.toLowerCase()
  );
};

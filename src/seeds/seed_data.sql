-- ============================================================
-- SEED DATA для qualification_service_db (camelCase колонки)
-- Порядок вставки учитывает внешние ключи
-- ============================================================

-- Очистка (в обратном порядке зависимостей)
TRUNCATE TABLE
  answers,
  questions,
  notifications,
  audit_logs,
  test_results,
  course_assignments,
  tests,
  briefings,
  internships,
  courses,
  user_roles,
  users,
  employees,
  positions,
  departments,
  training_types,
  roles
RESTART IDENTITY CASCADE;

-- ============================================================
-- 1. ROLES (роли)
-- ============================================================
INSERT INTO roles (name, description) VALUES
  ('admin', 'Администратор системы'),
  ('employee', 'Обычный сотрудник'),
  ('hr', 'HR-специалист'),
  ('manager', 'Руководитель');

-- ============================================================
-- 2. DEPARTMENTS (отделы)
-- ============================================================
INSERT INTO departments (name) VALUES
  ('IT-отдел'),
  ('Отдел кадров'),
  ('Бухгалтерия'),
  ('Отдел продаж'),
  ('Техническая поддержка');

-- ============================================================
-- 3. POSITIONS (должности)
-- ============================================================
-- enum PositionCategory: worker, specialist, manager
INSERT INTO positions (name, category) VALUES
  ('Разработчик', 'specialist'),
  ('HR-менеджер', 'specialist'),
  ('Бухгалтер', 'specialist'),
  ('Менеджер по продажам', 'specialist'),
  ('Системный администратор', 'specialist'),
  ('Руководитель отдела', 'manager'),
  ('Стажёр', 'worker');

-- ============================================================
-- 4. TRAINING_TYPES (типы обучения)
-- ============================================================
INSERT INTO training_types (name) VALUES
  ('Вводный инструктаж'),
  ('Пожарная безопасность'),
  ('Охрана труда'),
  ('Профессиональная переподготовка'),
  ('Повышение квалификации');

-- ============================================================
-- 5. EMPLOYEES (сотрудники) — camelCase колонки
-- ============================================================
INSERT INTO employees (
  "tabNumber", "fullName",
  "departmentId", "positionId",
  "hireDate"
) VALUES
  ('001', 'Алексей Иванов Сергеевич', 1, 1, '2022-03-15'),
  ('002', 'Мария Петрова Андреевна', 2, 2, '2021-06-01'),
  ('003', 'Дмитрий Сидоров Олегович', 3, 3, '2020-11-20'),
  ('004', 'Елена Козлова Викторовна', 4, 4, '2023-01-10'),
  ('005', 'Игорь Новиков Петрович', 5, 5, '2019-08-05'),
  ('006', 'Ольга Морозова Дмитриевна', 1, 6, '2018-04-22'),
  ('007', 'Сергей Волков Александрович', 4, 4, '2023-09-01'),
  ('008', 'Анна Соколова Ивановна', 2, 7, '2024-02-14'),
  ('009', 'Павел Лебедев Николаевич', 1, 1, '2021-12-01'),
  ('010', 'Наталья Попова Сергеевна', 3, 3, '2022-07-18');

-- ============================================================
-- 6. USERS (учётные записи) — camelCase колонки
-- ============================================================
INSERT INTO users (email, password, "employeeId") VALUES
  ('admin@company.ru', '$2b$10$xKQv3z6X1Y2mN5oP8rT7uOqWvLmJkHgFeDcBaZyXwVuTsRqPnMoLk', NULL),
  ('ivanov@company.ru', '$2b$10$xKQv3z6X1Y2mN5oP8rT7uOqWvLmJkHgFeDcBaZyXwVuTsRqPnMoLk', 1),
  ('petrova@company.ru', '$2b$10$xKQv3z6X1Y2mN5oP8rT7uOqWvLmJkHgFeDcBaZyXwVuTsRqPnMoLk', 2),
  ('sidorov@company.ru', '$2b$10$xKQv3z6X1Y2mN5oP8rT7uOqWvLmJkHgFeDcBaZyXwVuTsRqPnMoLk', 3),
  ('kozlova@company.ru', '$2b$10$xKQv3z6X1Y2mN5oP8rT7uOqWvLmJkHgFeDcBaZyXwVuTsRqPnMoLk', 4),
  ('novikov@company.ru', '$2b$10$xKQv3z6X1Y2mN5oP8rT7uOqWvLmJkHgFeDcBaZyXwVuTsRqPnMoLk', 5),
  ('morozova@company.ru', '$2b$10$xKQv3z6X1Y2mN5oP8rT7uOqWvLmJkHgFeDcBaZyXwVuTsRqPnMoLk', 6),
  ('volkov@company.ru', '$2b$10$xKQv3z6X1Y2mN5oP8rT7uOqWvLmJkHgFeDcBaZyXwVuTsRqPnMoLk', 7),
  ('sokolova@company.ru', '$2b$10$xKQv3z6X1Y2mN5oP8rT7uOqWvLmJkHgFeDcBaZyXwVuTsRqPnMoLk', 8),
  ('lebedev@company.ru', '$2b$10$xKQv3z6X1Y2mN5oP8rT7uOqWvLmJkHgFeDcBaZyXwVuTsRqPnMoLk', 9);
-- Пароль для всех: Password123!

-- ============================================================
-- 7. USER_ROLES (роли пользователей) — camelCase колонки
-- ============================================================
INSERT INTO user_roles ("userId", "roleId") VALUES
  (1, 1),   -- admin -> admin
  (2, 2),   -- ivanov -> employee
  (3, 3),   -- petrova -> hr
  (4, 2),   -- sidorov -> employee
  (5, 2),   -- kozlova -> employee
  (6, 2),   -- novikov -> employee
  (7, 4),   -- morozova -> manager
  (8, 2),   -- volkov -> employee
  (9, 2),   -- sokolova -> employee
  (10, 2);  -- lebedev -> employee

-- ============================================================
-- 8. COURSES (курсы) — camelCase колонки
-- ============================================================
INSERT INTO courses (
  name, "periodMonths", "trainingTypeId"
) VALUES
  ('Основы информационной безопасности', 1, 4),
  ('Пожарная безопасность на предприятии', 1, 2),
  ('Охрана труда для офисных работников', 1, 3),
  ('Введение в 1С:Бухгалтерия', 2, 5),
  ('Техники продаж B2B', 2, 5),
  ('Администрирование Linux', 3, 5),
  ('Вводный инструктаж для новых сотрудников', 1, 1),
  ('Excel для аналитиков', 1, 5);

-- ============================================================
-- 9. BRIEFINGS (инструктажи) — camelCase колонки
-- ============================================================
-- enum BriefingType: initial, repeated, unplanned, targeted
INSERT INTO briefings (
  "employeeId", type, date, "instructorId"
) VALUES
  (1, 'initial', '2022-03-15', 6),
  (2, 'initial', '2021-06-01', 6),
  (3, 'initial', '2020-11-20', 6),
  (4, 'initial', '2023-01-10', 6),
  (5, 'initial', '2019-08-05', 6),
  (1, 'repeated', '2024-01-15', 6),
  (2, 'repeated', '2024-01-15', 6),
  (3, 'repeated', '2024-01-15', 6),
  (5, 'targeted', '2024-03-01', 6),
  (9, 'initial', '2021-12-01', 6);

-- ============================================================
-- 10. INTERNSHIPS (стажировки) — camelCase колонки
-- ============================================================
INSERT INTO internships (
  "employeeId", "mentorId",
  "startDate", "endDate",
  "shiftsCount", passed
) VALUES
  (8, 2, '2024-02-14', '2024-03-14', 20, true),
  (7, 4, '2023-09-01', '2023-10-01', 22, true),
  (4, 7, '2023-01-10', '2023-02-10', 18, true),
  (1, 6, '2022-03-15', '2022-04-15', 20, true),
  (9, 1, '2024-06-01', '2024-07-01', 15, false);

-- ============================================================
-- 11. TESTS (тесты к курсам) — camelCase колонки
-- ============================================================
INSERT INTO tests (title, "courseId") VALUES
  ('Тест: Информационная безопасность', 1),
  ('Тест: Пожарная безопасность', 2),
  ('Тест: Охрана труда', 3),
  ('Тест: Основы 1С', 4),
  ('Тест: Техники продаж', 5);

-- ============================================================
-- 12. QUESTIONS (вопросы к тестам) — camelCase колонки
-- ============================================================
INSERT INTO questions ("testId", text) VALUES
  (1, 'Что такое фишинг?'),
  (1, 'Минимальная длина безопасного пароля?'),
  (2, 'Номер пожарной службы?'),
  (2, 'Что делать при пожаре?'),
  (3, 'Как часто проводится плановый инструктаж?'),
  (4, 'Что такое проводка в 1С?'),
  (5, 'Что такое SPIN-продажи?');

-- ============================================================
-- 13. ANSWERS (ответы к вопросам)
-- PK: i (не id!)
-- ============================================================
INSERT INTO answers (text, "isCorrect", "questionId") VALUES
  ('Вид рыбалки', false, 1),
  ('Вид атаки на пользователей', true, 1),
  ('Протокол передачи данных', false, 1),
  ('4 символа', false, 2),
  ('8 символов', true, 2),
  ('16 символов', false, 2),
  ('01', true, 3),
  ('02', false, 3),
  ('03', false, 3),
  ('Открыть окна', false, 4),
  ('Эвакуироваться', true, 4),
  ('Продолжать работу', false, 4),
  ('Раз в месяц', false, 5),
  ('Раз в год', false, 5),
  ('Раз в 6 месяцев', true, 5),
  ('Документ', false, 6),
  ('Запись в регистре', true, 6),
  ('Справочник', false, 6),
  ('Метод презентации', false, 7),
  ('Техника выявления потребностей', true, 7),
  ('Скрипт холодного звонка', false, 7);

-- ============================================================
-- 14. COURSE_ASSIGNMENTS (назначения курсов) — camelCase
-- ============================================================
-- enum AssignmentStatus: planned, in_progress, completed, overdue
INSERT INTO course_assignments (
  "employeeId", "courseId",
  "plannedDate", "factDate",
  passed, "filePath", status
) VALUES
  (1, 1, '2024-01-01', '2024-01-20', true, '/cert/ib_ivanov.pdf', 'completed'),
  (1, 3, '2024-01-01', '2024-01-25', true, '/cert/ot_ivanov.pdf', 'completed'),
  (2, 7, '2021-06-01', '2021-06-10', true, '/cert/intro_petrova.pdf', 'completed'),
  (2, 3, '2024-01-01', '2024-01-22', true, '/cert/ot_petrova.pdf', 'completed'),
  (3, 4, '2023-01-01', '2023-02-15', true, '/cert/1c_sidorov.pdf', 'completed'),
  (4, 5, '2024-03-01', NULL, false, NULL, 'in_progress'),
  (5, 6, '2023-06-01', '2023-08-20', true, '/cert/linux_novikov.pdf', 'completed'),
  (6, 1, '2024-01-01', '2024-01-18', true, '/cert/ib_morozova.pdf', 'completed'),
  (7, 5, '2024-04-01', NULL, false, NULL, 'planned'),
  (8, 7, '2024-02-14', '2024-02-25', true, '/cert/intro_sokolova.pdf', 'completed'),
  (9, 1, '2024-05-01', NULL, false, NULL, 'in_progress'),
  (1, 6, '2024-04-01', NULL, false, NULL, 'planned');

-- ============================================================
-- 15. TEST_RESULTS (результаты тестов) — camelCase
-- ============================================================
INSERT INTO test_results (
  "employeeId", "testId", score,
  passed, "takenAt"
) VALUES
  (1, 1, 85, true, '2024-01-20'),
  (1, 3, 90, true, '2024-01-25'),
  (2, 3, 78, true, '2024-01-22'),
  (3, 4, 72, true, '2023-02-15'),
  (5, 3, 95, true, '2023-08-20'),
  (6, 1, 88, true, '2024-01-18'),
  (8, 2, 82, true, '2024-02-25'),
  (4, 5, 60, false, '2024-03-15'),
  (4, 5, 76, true, '2024-03-22'),
  (9, 1, 55, false, '2024-05-10');

-- ============================================================
-- 16. AUDIT_LOGS (журнал действий) — camelCase
-- ============================================================
INSERT INTO audit_logs (
  "userId", action, entity, "entityId",
  details, "createdAt"
) VALUES
  (1, 'CREATE', 'course', 1, '{"title":"Основы информационной безопасности"}', '2024-01-01 09:00:00'),
  (1, 'CREATE', 'course', 2, '{"title":"Пожарная безопасность на предприятии"}', '2024-01-01 09:05:00'),
  (3, 'CREATE', 'employee', 8, '{"firstName":"Анна","lastName":"Соколова"}', '2024-02-14 10:00:00'),
  (3, 'UPDATE', 'employee', 4, '{"isActive":true}', '2024-03-01 11:30:00'),
  (1, 'ASSIGN', 'course_assignment', 9, '{"employeeId":7,"courseId":5}', '2024-04-01 14:00:00'),
  (7, 'UPDATE', 'course', 8, '{"isActive":true}', '2024-04-15 16:00:00'),
  (3, 'CREATE', 'internship', 5, '{"employeeId":9,"mentorId":1}', '2024-06-01 09:00:00'),
  (2, 'LOGIN', 'user', 2, NULL, '2024-05-15 08:45:00');

-- ============================================================
-- 17. NOTIFICATIONS (уведомления) — camelCase
-- ============================================================
INSERT INTO notifications (
  "employeeId", message, "isRead", "createdAt",
  "courseAssignmentId"
) VALUES
  (4, 'Вам назначен курс "Техники продаж B2B". Срок: 01.06.2024', false, '2024-04-01 14:00:00', 6),
  (7, 'Вам назначен курс "Техники продаж B2B". Срок: 01.06.2024', false, '2024-04-01 14:00:00', 9),
  (9, 'Вам назначен курс "Основы ИБ". Срок: 01.07.2024', false, '2024-05-01 10:00:00', 11),
  (1, 'Вам назначен курс "Администрирование Linux". Срок: 01.08.2024', true, '2024-04-01 14:00:00', 12),
  (4, 'Вы не прошли тест "Техники продаж" (60/75). Попробуйте ещё раз', true, '2024-03-15 15:00:00', NULL),
  (4, 'Вы успешно прошли тест "Техники продаж" (76/75)', true, '2024-03-22 11:00:00', NULL),
  (9, 'Вы не прошли тест "Основы ИБ" (55/70). Попробуйте ещё раз', false, '2024-05-10 16:00:00', NULL),
  (5, 'Напоминание: инструктаж на рабочем месте запланирован на 01.03.2025', false, '2025-02-01 09:00:00', NULL),
  (1, 'Напоминание: инструктаж по ПБ запланирован на 15.01.2025', true, '2025-01-01 09:00:00', NULL),
  (8, 'Ваша стажировка в отделе кадров успешно завершена', true, '2024-03-14 17:00:00', NULL);

-- ============================================================
-- Проверка количества записей
-- ============================================================
SELECT 'roles' AS table_name, COUNT(*) FROM roles UNION ALL
SELECT 'departments', COUNT(*) FROM departments UNION ALL
SELECT 'positions', COUNT(*) FROM positions UNION ALL
SELECT 'training_types', COUNT(*) FROM training_types UNION ALL
SELECT 'employees', COUNT(*) FROM employees UNION ALL
SELECT 'users', COUNT(*) FROM users UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles UNION ALL
SELECT 'courses', COUNT(*) FROM courses UNION ALL
SELECT 'briefings', COUNT(*) FROM briefings UNION ALL
SELECT 'internships', COUNT(*) FROM internships UNION ALL
SELECT 'tests', COUNT(*) FROM tests UNION ALL
SELECT 'questions', COUNT(*) FROM questions UNION ALL
SELECT 'answers', COUNT(*) FROM answers UNION ALL
SELECT 'course_assignments', COUNT(*) FROM course_assignments UNION ALL
SELECT 'test_results', COUNT(*) FROM test_results UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
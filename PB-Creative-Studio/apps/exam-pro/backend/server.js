const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3500;
const JWT_SECRET = process.env.JWT_SECRET || 'eduexam_secret_key_2024';

// Middleware
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend build
const frontendDist = path.join(__dirname, 'public');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// Multer config for CSV uploads
const upload = multer({ dest: path.join(__dirname, 'uploads/tmp/') });

// ─────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') throw new Error();
    req.admin = payload;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

const studentAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'student') throw new Error();
    req.student = payload;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

// ─────────────────────────────────────────────
// ADMIN AUTH
// ─────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: admin.id, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, username: admin.username });
});

// ─────────────────────────────────────────────
// STUDENT AUTH
// ─────────────────────────────────────────────
app.post('/api/student/login', (req, res) => {
  const { mobile, password } = req.body;
  const student = db.prepare('SELECT s.*, c.name as class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.mobile = ?').get(mobile);
  if (!student || !bcrypt.compareSync(password, student.password_hash))
    return res.status(401).json({ error: 'Invalid mobile or password' });
  const token = jwt.sign({ id: student.id, name: student.name, class_id: student.class_id, role: 'student' }, JWT_SECRET, { expiresIn: '4h' });
  res.json({ token, name: student.name, mobile: student.mobile, class_name: student.class_name });
});

// ─────────────────────────────────────────────
// ADMIN - DASHBOARD
// ─────────────────────────────────────────────
app.get('/api/admin/dashboard', adminAuth, (req, res) => {
  const totalExams = db.prepare('SELECT COUNT(*) as c FROM exams').get().c;
  const totalStudents = db.prepare('SELECT COUNT(*) as c FROM students').get().c;
  const totalResults = db.prepare('SELECT COUNT(*) as c FROM results').get().c;
  const avgScoreRow = db.prepare('SELECT AVG(CAST(score AS FLOAT) / NULLIF(total_questions,0) * 100) as avg FROM results').get();
  const avgScore = avgScoreRow.avg || 0;

  const classWiseResults = db.prepare(`
    SELECT c.name, AVG(CAST(r.score AS FLOAT) / NULLIF(r.total_questions,0) * 100) as avg_percentage
    FROM results r
    JOIN students s ON s.id = r.student_id
    JOIN classes c ON c.id = s.class_id
    GROUP BY c.id, c.name
  `).all();

  const participantStats = db.prepare(`
    SELECT c.name, COUNT(DISTINCT r.student_id) as participants
    FROM results r
    JOIN students s ON s.id = r.student_id
    JOIN classes c ON c.id = s.class_id
    GROUP BY c.id, c.name
  `).all();

  res.json({ totalExams, totalStudents, totalResults, avgScore, classWiseResults, participantStats });
});

// ─────────────────────────────────────────────
// ADMIN - CLASSES
// ─────────────────────────────────────────────
app.get('/api/admin/classes', adminAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM classes ORDER BY name').all());
});
app.post('/api/admin/classes', adminAuth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const r = db.prepare('INSERT INTO classes (name) VALUES (?)').run(name.trim());
    res.json({ id: r.lastInsertRowid, name: name.trim() });
  } catch { res.status(400).json({ error: 'Class already exists' }); }
});
app.delete('/api/admin/classes/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─────────────────────────────────────────────
// ADMIN - SUBJECTS
// ─────────────────────────────────────────────
app.get('/api/admin/subjects', adminAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM subjects ORDER BY name').all());
});
app.post('/api/admin/subjects', adminAuth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const r = db.prepare('INSERT INTO subjects (name) VALUES (?)').run(name.trim());
    res.json({ id: r.lastInsertRowid, name: name.trim() });
  } catch { res.status(400).json({ error: 'Subject already exists' }); }
});
app.delete('/api/admin/subjects/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM subjects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─────────────────────────────────────────────
// ADMIN - STUDENTS
// ─────────────────────────────────────────────
app.get('/api/admin/students', adminAuth, (req, res) => {
  const { class_id } = req.query;
  let query = 'SELECT s.*, c.name as class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id';
  const params = [];
  if (class_id) { query += ' WHERE s.class_id = ?'; params.push(class_id); }
  query += ' ORDER BY s.name';
  res.json(db.prepare(query).all(...params));
});

app.post('/api/admin/students', adminAuth, (req, res) => {
  const { name, mobile, password, class_id } = req.body;
  if (!name || !mobile || !class_id) return res.status(400).json({ error: 'Name, mobile, class required' });
  const pass = password || mobile;
  const hash = bcrypt.hashSync(pass, 10);
  try {
    const r = db.prepare('INSERT INTO students (name, mobile, password_hash, class_id) VALUES (?,?,?,?)').run(name.trim(), mobile.trim(), hash, class_id);
    res.json({ id: r.lastInsertRowid, name: name.trim(), mobile: mobile.trim(), class_id });
  } catch { res.status(400).json({ error: 'Mobile already registered' }); }
});

app.delete('/api/admin/students/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// CSV Upload for students
app.post('/api/admin/students/upload', adminAuth, upload.single('file'), (req, res) => {
  const { class_id } = req.body;
  if (!req.file || !class_id) return res.status(400).json({ error: 'File and class required' });
  
  const text = fs.readFileSync(req.file.path, 'utf8');
  fs.unlinkSync(req.file.path);
  
  const lines = text.split('\n').filter(l => l.trim());
  let added = 0, failed = 0, errors = [];
  
  const insertStmt = db.prepare('INSERT OR IGNORE INTO students (name, mobile, password_hash, class_id) VALUES (?,?,?,?)');
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const [name, mobile, password] = cols;
    if (!name || !mobile) { failed++; continue; }
    const pass = password || mobile;
    const hash = bcrypt.hashSync(pass, 10);
    try {
      const r = insertStmt.run(name, mobile, hash, class_id);
      if (r.changes > 0) added++; else failed++;
    } catch { failed++; errors.push(mobile); }
  }
  
  res.json({ success: true, added, failed, message: `${added} students added, ${failed} skipped.` });
});

// ─────────────────────────────────────────────
// ADMIN - EXAMS
// ─────────────────────────────────────────────
app.get('/api/admin/exams', adminAuth, (req, res) => {
  const exams = db.prepare(`
    SELECT e.*, c.name as class_name,
    (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as questions_count
    FROM exams e LEFT JOIN classes c ON c.id = e.class_id
    ORDER BY e.created_at DESC
  `).all();
  
  exams.forEach(exam => {
    exam.subjectLimits = db.prepare('SELECT * FROM exam_subject_limits WHERE exam_id = ?').all(exam.id);
  });
  
  const classes = db.prepare('SELECT * FROM classes ORDER BY name').all();
  res.json({ exams, classes });
});

app.post('/api/admin/exams', adminAuth, (req, res) => {
  const { title, description, class_id, duration_minutes, question_limit, use_specific_questions, use_global_questions } = req.body;
  if (!title || !class_id) return res.status(400).json({ error: 'Title and class required' });
  const r = db.prepare(`
    INSERT INTO exams (title, description, class_id, duration_minutes, question_limit, use_specific_questions, use_global_questions)
    VALUES (?,?,?,?,?,?,?)
  `).run(title, description || '', class_id, duration_minutes || 30, question_limit || 10,
    use_specific_questions ? 1 : 0, use_global_questions ? 1 : 0);
  res.json({ id: r.lastInsertRowid, success: true });
});

app.put('/api/admin/exams/:id', adminAuth, (req, res) => {
  const { title, description, class_id, duration_minutes, question_limit, use_specific_questions, use_global_questions } = req.body;
  db.prepare(`
    UPDATE exams SET title=?, description=?, class_id=?, duration_minutes=?, question_limit=?,
    use_specific_questions=?, use_global_questions=? WHERE id=?
  `).run(title, description || '', class_id, duration_minutes, question_limit,
    use_specific_questions ? 1 : 0, use_global_questions ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.patch('/api/admin/exams/:id/toggle', adminAuth, (req, res) => {
  const exam = db.prepare('SELECT is_active FROM exams WHERE id = ?').get(req.params.id);
  if (!exam) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE exams SET is_active = ? WHERE id = ?').run(exam.is_active ? 0 : 1, req.params.id);
  res.json({ success: true, is_active: !exam.is_active });
});

app.patch('/api/admin/exams/:id/subject-limits', adminAuth, (req, res) => {
  const { subjects, limits } = req.body;
  db.prepare('DELETE FROM exam_subject_limits WHERE exam_id = ?').run(req.params.id);
  if (subjects && subjects.length) {
    const stmt = db.prepare('INSERT INTO exam_subject_limits (exam_id, subject, limit_count) VALUES (?,?,?)');
    subjects.forEach((s, i) => { if (s) stmt.run(req.params.id, s, limits[i] || 5); });
  }
  res.json({ success: true });
});

app.delete('/api/admin/exams/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM exams WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─────────────────────────────────────────────
// ADMIN - QUESTIONS
// ─────────────────────────────────────────────
app.get('/api/admin/questions', adminAuth, (req, res) => {
  const { exam_id, class_id, subject, page = 1 } = req.query;
  const limit = 25;
  const offset = (page - 1) * limit;
  
  let where = [];
  let params = [];
  if (exam_id) { where.push('q.exam_id = ?'); params.push(exam_id); }
  if (class_id) { where.push('q.class_id = ?'); params.push(class_id); }
  if (subject) { where.push('q.subject = ?'); params.push(subject); }
  
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  
  const total = db.prepare(`SELECT COUNT(*) as c FROM questions q ${whereStr}`).get(...params).c;
  const questions = db.prepare(`
    SELECT q.*, c.name as class_name FROM questions q
    LEFT JOIN classes c ON c.id = q.class_id
    ${whereStr} ORDER BY q.id DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
  
  const classes = db.prepare('SELECT * FROM classes ORDER BY name').all();
  const exams = db.prepare('SELECT id, title, class_id FROM exams ORDER BY title').all();
  const subjects = db.prepare('SELECT DISTINCT name FROM subjects ORDER BY name').all().map(s => s.name);
  
  res.json({ questions, total, classes, exams, subjects, page: Number(page), totalPages: Math.ceil(total / limit) });
});

app.post('/api/admin/questions', adminAuth, (req, res) => {
  const { exam_id, class_id, subject, question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option)
    return res.status(400).json({ error: 'All fields required' });
  const r = db.prepare(`
    INSERT INTO questions (exam_id, class_id, subject, question_text, option_a, option_b, option_c, option_d, correct_option)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(exam_id || null, class_id || null, subject || null, question_text, option_a, option_b, option_c, option_d, correct_option);
  res.json({ id: r.lastInsertRowid, success: true });
});

app.put('/api/admin/questions/:id', adminAuth, (req, res) => {
  const { exam_id, class_id, subject, question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  db.prepare(`
    UPDATE questions SET exam_id=?, class_id=?, subject=?, question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=?
    WHERE id=?
  `).run(exam_id || null, class_id || null, subject || null, question_text, option_a, option_b, option_c, option_d, correct_option, req.params.id);
  res.json({ success: true });
});

app.delete('/api/admin/questions/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/admin/questions/bulk-delete', adminAuth, (req, res) => {
  const { ids } = req.body;
  if (!ids || !ids.length) return res.status(400).json({ error: 'No IDs' });
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM questions WHERE id IN (${placeholders})`).run(...ids);
  res.json({ success: true, deleted: ids.length });
});

// CSV Upload for questions
app.post('/api/admin/questions/upload', adminAuth, upload.single('file'), (req, res) => {
  const { exam_id, class_id } = req.body;
  if (!req.file) return res.status(400).json({ error: 'File required' });
  
  const text = fs.readFileSync(req.file.path, 'utf8');
  fs.unlinkSync(req.file.path);
  
  const lines = text.split('\n').filter(l => l.trim());
  let added = 0, failed = 0;
  
  const stmt = db.prepare(`
    INSERT INTO questions (exam_id, class_id, subject, question_text, option_a, option_b, option_c, option_d, correct_option)
    VALUES (?,?,?,?,?,?,?,?,?)
  `);
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    // Format: Subject, Question, A, B, C, D, CorrectOption
    const [subject, question_text, option_a, option_b, option_c, option_d, correct_option] = cols;
    if (!question_text || !option_a || !correct_option) { failed++; continue; }
    try {
      stmt.run(exam_id || null, class_id || null, subject || null, question_text, option_a, option_b || '', option_c || '', option_d || '', correct_option.toUpperCase());
      added++;
    } catch { failed++; }
  }
  
  res.json({ success: true, added, failed, message: `${added} questions added, ${failed} failed.` });
});

// Export questions CSV
app.get('/api/admin/questions/export', adminAuth, (req, res) => {
  const { exam_id, class_id } = req.query;
  let where = []; let params = [];
  if (exam_id) { where.push('exam_id = ?'); params.push(exam_id); }
  if (class_id) { where.push('class_id = ?'); params.push(class_id); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const questions = db.prepare(`SELECT * FROM questions ${whereStr}`).all(...params);
  
  let csv = 'Subject,Question,Option A,Option B,Option C,Option D,Correct\n';
  questions.forEach(q => {
    csv += `"${q.subject||''}","${q.question_text}","${q.option_a}","${q.option_b}","${q.option_c}","${q.option_d}","${q.correct_option}"\n`;
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=questions.csv');
  res.send(csv);
});

// ─────────────────────────────────────────────
// ADMIN - RESULTS
// ─────────────────────────────────────────────
app.get('/api/admin/results', adminAuth, (req, res) => {
  const { class_id, exam_id, search } = req.query;
  let where = []; let params = [];
  if (class_id) { where.push('s.class_id = ?'); params.push(class_id); }
  if (exam_id) { where.push('r.exam_id = ?'); params.push(exam_id); }
  if (search) { where.push('(s.name LIKE ? OR s.mobile LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  
  const results = db.prepare(`
    SELECT r.*, s.name as student_name, s.mobile as student_mobile,
    c.name as class_name, e.title as exam_title
    FROM results r
    JOIN students s ON s.id = r.student_id
    JOIN classes c ON c.id = s.class_id
    JOIN exams e ON e.id = r.exam_id
    ${whereStr}
    ORDER BY r.created_at DESC
  `).all(...params).map(r => ({
    ...r,
    subject_stats: r.subject_stats_json ? JSON.parse(r.subject_stats_json) : {}
  }));
  
  const classes = db.prepare('SELECT * FROM classes ORDER BY name').all();
  const exams = db.prepare('SELECT id, title, class_id FROM exams ORDER BY title').all();
  
  res.json({ results, classes, exams });
});

app.get('/api/admin/results/export', adminAuth, (req, res) => {
  const { class_id, exam_id } = req.query;
  let where = []; let params = [];
  if (class_id) { where.push('s.class_id = ?'); params.push(class_id); }
  if (exam_id) { where.push('r.exam_id = ?'); params.push(exam_id); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  
  const results = db.prepare(`
    SELECT r.*, s.name as student_name, s.mobile as student_mobile, c.name as class_name, e.title as exam_title
    FROM results r JOIN students s ON s.id = r.student_id
    JOIN classes c ON c.id = s.class_id JOIN exams e ON e.id = r.exam_id
    ${whereStr} ORDER BY r.created_at DESC
  `).all(...params);
  
  let csv = 'Student,Mobile,Class,Exam,Score,Total,Percentage,Attempted,Wrong,Blank,Time,Date\n';
  results.forEach(r => {
    const pct = r.total_questions > 0 ? ((r.score / r.total_questions) * 100).toFixed(1) : '0';
    csv += `"${r.student_name}","${r.student_mobile}","${r.class_name}","${r.exam_title}",${r.score},${r.total_questions},${pct}%,${r.attempted_count},${r.wrong_count},${r.blank_count},"${r.time_taken||''}","${r.created_at}"\n`;
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
  res.send(csv);
});

app.get('/api/admin/results/:id', adminAuth, (req, res) => {
  const result = db.prepare(`
    SELECT r.*, s.name as student_name, s.mobile as student_mobile,
    c.name as class_name, e.title as exam_title, e.duration_minutes
    FROM results r JOIN students s ON s.id = r.student_id
    JOIN classes c ON c.id = s.class_id JOIN exams e ON e.id = r.exam_id
    WHERE r.id = ?
  `).get(req.params.id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  result.subject_stats = result.subject_stats_json ? JSON.parse(result.subject_stats_json) : {};
  result.answers = result.answers_json ? JSON.parse(result.answers_json) : {};
  res.json(result);
});

// ─────────────────────────────────────────────
// STUDENT - DASHBOARD
// ─────────────────────────────────────────────
app.get('/api/student/dashboard', studentAuth, (req, res) => {
  const student = db.prepare('SELECT s.*, c.name as class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.id = ?').get(req.student.id);
  if (!student) return res.status(404).json({ error: 'Not found' });
  
  const exams = db.prepare('SELECT * FROM exams WHERE class_id = ? AND is_active = 1 ORDER BY created_at DESC').all(student.class_id);
  const attemptedIds = db.prepare('SELECT exam_id FROM results WHERE student_id = ?').all(req.student.id).map(r => r.exam_id);
  
  const examsWithStatus = exams.map(exam => ({
    ...exam,
    attempted: attemptedIds.includes(exam.id),
    result_id: attemptedIds.includes(exam.id) ?
      db.prepare('SELECT id FROM results WHERE student_id = ? AND exam_id = ?').get(req.student.id, exam.id)?.id : null
  }));
  
  res.json({ student: { ...student, password_hash: undefined }, exams: examsWithStatus });
});

// ─────────────────────────────────────────────
// STUDENT - EXAM
// ─────────────────────────────────────────────
app.get('/api/student/exam/:id', studentAuth, (req, res) => {
  const exam = db.prepare('SELECT * FROM exams WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  
  // Check already attempted
  const already = db.prepare('SELECT id FROM results WHERE student_id = ? AND exam_id = ?').get(req.student.id, exam.id);
  if (already) return res.status(400).json({ error: 'Already attempted', result_id: already.id });
  
  // Build question pool
  let questions = [];
  
  if (exam.use_specific_questions) {
    const specific = db.prepare('SELECT * FROM questions WHERE exam_id = ?').all(exam.id);
    questions = [...questions, ...specific];
  }
  
  if (exam.use_global_questions) {
    const global = db.prepare('SELECT * FROM questions WHERE class_id = ? AND (exam_id IS NULL OR exam_id != ?)').all(req.student.class_id, exam.id);
    questions = [...questions, ...global];
  }
  
  // Remove duplicates
  const seen = new Set();
  questions = questions.filter(q => { if (seen.has(q.id)) return false; seen.add(q.id); return true; });
  
  // Apply subject limits if configured
  const limits = db.prepare('SELECT * FROM exam_subject_limits WHERE exam_id = ?').all(exam.id);
  if (limits.length > 0) {
    let selected = [];
    limits.forEach(({ subject, limit_count }) => {
      const subjectQs = questions.filter(q => q.subject === subject);
      const shuffled = subjectQs.sort(() => Math.random() - 0.5).slice(0, limit_count);
      selected = [...selected, ...shuffled];
    });
    // Fill remaining from unconstrained subjects
    const limitSubjects = new Set(limits.map(l => l.subject));
    const remaining = questions.filter(q => !limitSubjects.has(q.subject));
    const needed = Math.max(0, exam.question_limit - selected.length);
    const extra = remaining.sort(() => Math.random() - 0.5).slice(0, needed);
    questions = [...selected, ...extra];
  }
  
  // Shuffle and limit
  questions = questions.sort(() => Math.random() - 0.5).slice(0, exam.question_limit);
  
  // Strip correct answers
  const safeQuestions = questions.map(({ correct_option, ...q }) => q);
  
  res.json({ exam, questions: safeQuestions });
});

app.post('/api/student/exam/:id/submit', studentAuth, (req, res) => {
  const { answers, time_taken } = req.body;
  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(req.params.id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  
  // Prevent duplicate
  const existing = db.prepare('SELECT id FROM results WHERE student_id = ? AND exam_id = ?').get(req.student.id, exam.id);
  if (existing) return res.json({ success: true, result_id: existing.id });
  
  // Grade answers
  const qIds = Object.keys(answers);
  const questions = db.prepare(`SELECT * FROM questions WHERE id IN (${qIds.map(() => '?').join(',')})`).all(...qIds.map(Number));
  
  let score = 0, attempted = 0, wrong = 0, blank = 0;
  const subject_stats = {};
  
  questions.forEach(q => {
    const studentAns = answers[String(q.id)];
    if (!subject_stats[q.subject || 'General']) subject_stats[q.subject || 'General'] = { correct: 0, wrong: 0, total: 0 };
    subject_stats[q.subject || 'General'].total++;
    
    if (!studentAns) { blank++; return; }
    attempted++;
    
    if (studentAns === q.correct_option) {
      score++;
      subject_stats[q.subject || 'General'].correct++;
    } else {
      wrong++;
      subject_stats[q.subject || 'General'].wrong++;
    }
  });
  
  const r = db.prepare(`
    INSERT INTO results (student_id, exam_id, score, total_questions, attempted_count, wrong_count, blank_count, time_taken, answers_json, subject_stats_json)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(req.student.id, exam.id, score, questions.length, attempted, wrong, blank,
    time_taken || '', JSON.stringify(answers), JSON.stringify(subject_stats));
  
  res.json({ success: true, result_id: r.lastInsertRowid });
});

app.get('/api/student/result/:id', studentAuth, (req, res) => {
  const result = db.prepare(`
    SELECT r.*, e.title as exam_title, e.duration_minutes
    FROM results r JOIN exams e ON e.id = r.exam_id
    WHERE r.id = ? AND r.student_id = ?
  `).get(req.params.id, req.student.id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  result.subject_stats = result.subject_stats_json ? JSON.parse(result.subject_stats_json) : {};
  res.json(result);
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
// Create uploads dir
const uploadsDir = path.join(__dirname, 'uploads/tmp');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Catch-all: serve frontend for SPA routes (must be after all API routes)
const frontendIndex = path.join(__dirname, 'public', 'index.html');
if (fs.existsSync(frontendIndex)) {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(frontendIndex);
    }
  });
}

app.listen(PORT, () => {
  console.log(`\n🎓 EduExam Pro Backend running at http://localhost:${PORT}`);
  console.log(`📊 Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`👨‍🎓 Student API: http://localhost:${PORT}/api/student\n`);
});

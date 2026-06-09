const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const router = express.Router();
const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
  ? (() => { throw new Error("FATAL: JWT_SECRET environment variable is required in production!"); })()
  : crypto.randomBytes(32).toString('hex')
);

// Multer config for CSV uploads
const upload = multer({ dest: path.join(__dirname, 'uploads/tmp/') });

// AUTH HELPERS
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

const hubAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'hub_admin') throw new Error();
    req.hub = payload;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

// ADMIN AUTH
router.post('/admin/signup', (req, res) => {
  const { username, password, email, mobile, org_name } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  const hash = bcrypt.hashSync(password, 10);
  try {
    const r = db.prepare(`
      INSERT INTO admins (username, email, mobile, org_name, password_hash) 
      VALUES (?, ?, ?, ?, ?)
    `).run(username.trim(), email?.trim() || null, mobile?.trim() || null, org_name?.trim() || null, hash);
    res.json({ id: r.lastInsertRowid, success: true });
  } catch (err) {
    res.status(400).json({ error: 'Username, Email, or Mobile already taken or invalid' });
  }
});

router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: admin.id, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, username: admin.username });
});

router.post('/hub/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM studio_admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: admin.id, username: admin.username, role: 'hub_admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, username: admin.username });
});

// STUDENT AUTH
router.post('/student/login', (req, res) => {
  const { mobile, password } = req.body;
  const student = db.prepare('SELECT s.*, c.name as class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.mobile = ?').get(mobile);
  if (!student || !bcrypt.compareSync(password, student.password_hash))
    return res.status(401).json({ error: 'Invalid mobile or password' });
  const token = jwt.sign({ id: student.id, name: student.name, class_id: student.class_id, role: 'student' }, JWT_SECRET, { expiresIn: '4h' });
  res.json({ token, name: student.name, mobile: student.mobile, class_name: student.class_name });
});

// ADMIN - DASHBOARD
router.get('/admin/dashboard', adminAuth, (req, res) => {
  const admin_id = req.admin.id;
  const totalExams = db.prepare('SELECT COUNT(*) as c FROM exams WHERE admin_id = ?').get(admin_id).c;
  const totalStudents = db.prepare('SELECT COUNT(*) as c FROM students WHERE admin_id = ?').get(admin_id).c;
  const totalResults = db.prepare('SELECT COUNT(*) as c FROM results WHERE admin_id = ?').get(admin_id).c;
  const avgScoreRow = db.prepare('SELECT AVG(CAST(score AS FLOAT) / NULLIF(total_questions,0) * 100) as avg FROM results WHERE admin_id = ?').get(admin_id);
  const avgScore = avgScoreRow.avg || 0;

  const classWiseResults = db.prepare(`
    SELECT c.name, AVG(CAST(r.score AS FLOAT) / NULLIF(r.total_questions,0) * 100) as avg_percentage
    FROM results r
    JOIN students s ON s.id = r.student_id
    JOIN classes c ON c.id = s.class_id
    WHERE r.admin_id = ?
    GROUP BY c.id, c.name
  `).all(admin_id);

  const participantStats = db.prepare(`
    SELECT c.name, COUNT(DISTINCT r.student_id) as participants
    FROM results r
    JOIN students s ON s.id = r.student_id
    JOIN classes c ON c.id = s.class_id
    WHERE r.admin_id = ?
    GROUP BY c.id, c.name
  `).all(admin_id);

  res.json({ totalExams, totalStudents, totalResults, avgScore, classWiseResults, participantStats });
});

// ADMIN - CLASSES
router.get('/admin/classes', adminAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM classes WHERE admin_id = ? ORDER BY name').all(req.admin.id));
});
router.post('/admin/classes', adminAuth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const r = db.prepare('INSERT INTO classes (name, admin_id) VALUES (?, ?)').run(name.trim(), req.admin.id);
    res.json({ id: r.lastInsertRowid, name: name.trim() });
  } catch { res.status(400).json({ error: 'Class already exists' }); }
});
router.delete('/admin/classes/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM classes WHERE id = ? AND admin_id = ?').run(req.params.id, req.admin.id);
  res.json({ success: true });
});

// ADMIN - SUBJECTS
router.get('/admin/subjects', adminAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM subjects WHERE admin_id = ? ORDER BY name').all(req.admin.id));
});
router.post('/admin/subjects', adminAuth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const r = db.prepare('INSERT INTO subjects (name, admin_id) VALUES (?, ?)').run(name.trim(), req.admin.id);
    res.json({ id: r.lastInsertRowid, name: name.trim() });
  } catch { res.status(400).json({ error: 'Subject already exists' }); }
});
router.delete('/admin/subjects/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM subjects WHERE id = ? AND admin_id = ?').run(req.params.id, req.admin.id);
  res.json({ success: true });
});

// ADMIN - STUDENTS
router.get('/admin/students', adminAuth, (req, res) => {
  const { class_id } = req.query;
  let query = 'SELECT s.*, c.name as class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.admin_id = ?';
  const params = [req.admin.id];
  if (class_id) { query += ' AND s.class_id = ?'; params.push(class_id); }
  query += ' ORDER BY s.name';
  res.json(db.prepare(query).all(...params));
});

router.post('/admin/students', adminAuth, (req, res) => {
  const { name, mobile, password, class_id } = req.body;
  if (!name || !mobile || !class_id) return res.status(400).json({ error: 'Name, mobile, class required' });
  const pass = password || mobile;
  const hash = bcrypt.hashSync(pass, 10);
  try {
    const r = db.prepare('INSERT INTO students (name, mobile, password_hash, class_id, admin_id) VALUES (?,?,?,?,?)').run(name.trim(), mobile.trim(), hash, class_id, req.admin.id);
    res.json({ id: r.lastInsertRowid, name: name.trim(), mobile: mobile.trim(), class_id });
  } catch { res.status(400).json({ error: 'Mobile already registered' }); }
});

router.delete('/admin/students/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM students WHERE id = ? AND admin_id = ?').run(req.params.id, req.admin.id);
  res.json({ success: true });
});

// CSV Upload for students
router.post('/admin/students/upload', adminAuth, upload.single('file'), (req, res) => {
  const { class_id } = req.body;
  if (!req.file || !class_id) return res.status(400).json({ error: 'File and class required' });
  
  const text = fs.readFileSync(req.file.path, 'utf8');
  fs.unlinkSync(req.file.path);
  
  const lines = text.split('\n').filter(l => l.trim());
  let added = 0, failed = 0, errors = [];
  
  const insertStmt = db.prepare('INSERT OR IGNORE INTO students (name, mobile, password_hash, class_id, admin_id) VALUES (?,?,?,?,?)');
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const [name, mobile, password] = cols;
    if (!name || !mobile) { failed++; continue; }
    const pass = password || mobile;
    const hash = bcrypt.hashSync(pass, 10);
    try {
      const r = insertStmt.run(name, mobile, hash, class_id, req.admin.id);
      if (r.changes > 0) added++; else failed++;
    } catch { failed++; errors.push(mobile); }
  }
  
  res.json({ success: true, added, failed, message: `${added} students added, ${failed} skipped.` });
});

// ADMIN - EXAMS
router.get('/admin/exams', adminAuth, (req, res) => {
  const admin_id = req.admin.id;
  const exams = db.prepare(`
    SELECT e.*, c.name as class_name,
    (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as questions_count
    FROM exams e LEFT JOIN classes c ON c.id = e.class_id
    WHERE e.admin_id = ?
    ORDER BY e.created_at DESC
  `).all(admin_id);
  
  exams.forEach(exam => {
    exam.subjectLimits = db.prepare('SELECT * FROM exam_subject_limits WHERE exam_id = ?').all(exam.id);
  });
  
  const classes = db.prepare('SELECT * FROM classes WHERE admin_id = ? ORDER BY name').all(admin_id);
  res.json({ exams, classes });
});

router.post('/admin/exams', adminAuth, (req, res) => {
  const { title, description, class_id, duration_minutes, question_limit, use_specific_questions, use_global_questions } = req.body;
  if (!title || !class_id) return res.status(400).json({ error: 'Title and class required' });
  const r = db.prepare(`
    INSERT INTO exams (title, description, class_id, admin_id, duration_minutes, question_limit, use_specific_questions, use_global_questions)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(title, description || '', class_id, req.admin.id, duration_minutes || 30, question_limit || 10,
    use_specific_questions ? 1 : 0, use_global_questions ? 1 : 0);
  res.json({ id: r.lastInsertRowid, success: true });
});

router.put('/admin/exams/:id', adminAuth, (req, res) => {
  const { title, description, class_id, duration_minutes, question_limit, use_specific_questions, use_global_questions } = req.body;
  db.prepare(`
    UPDATE exams SET title=?, description=?, class_id=?, duration_minutes=?, question_limit=?,
    use_specific_questions=?, use_global_questions=? WHERE id=? AND admin_id=?
  `).run(title, description || '', class_id, duration_minutes, question_limit,
    use_specific_questions ? 1 : 0, use_global_questions ? 1 : 0, req.params.id, req.admin.id);
  res.json({ success: true });
});

router.patch('/admin/exams/:id/toggle', adminAuth, (req, res) => {
  const exam = db.prepare('SELECT is_active FROM exams WHERE id = ? AND admin_id = ?').get(req.params.id, req.admin.id);
  if (!exam) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE exams SET is_active = ? WHERE id = ?').run(exam.is_active ? 0 : 1, req.params.id);
  res.json({ success: true, is_active: !exam.is_active });
});

router.patch('/admin/exams/:id/subject-limits', adminAuth, (req, res) => {
  const { subjects, limits } = req.body;
  const exam = db.prepare('SELECT id FROM exams WHERE id = ? AND admin_id = ?').get(req.params.id, req.admin.id);
  if (!exam) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM exam_subject_limits WHERE exam_id = ?').run(req.params.id);
  if (subjects && subjects.length) {
    const stmt = db.prepare('INSERT INTO exam_subject_limits (exam_id, subject, limit_count) VALUES (?,?,?)');
    subjects.forEach((s, i) => { if (s) stmt.run(req.params.id, s, limits[i] || 5); });
  }
  res.json({ success: true });
});

router.delete('/admin/exams/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM exams WHERE id = ? AND admin_id = ?').run(req.params.id, req.admin.id);
  res.json({ success: true });
});

// ADMIN - QUESTIONS
router.get('/admin/questions', adminAuth, (req, res) => {
  const { exam_id, class_id, subject, page = 1 } = req.query;
  const admin_id = req.admin.id;
  const limit = 25;
  const offset = (page - 1) * limit;
  
  let where = ['q.admin_id = ?'];
  let params = [admin_id];
  if (exam_id) { where.push('q.exam_id = ?'); params.push(exam_id); }
  if (class_id) { where.push('q.class_id = ?'); params.push(class_id); }
  if (subject) { where.push('q.subject = ?'); params.push(subject); }
  
  const whereStr = 'WHERE ' + where.join(' AND ');
  
  const total = db.prepare(`SELECT COUNT(*) as c FROM questions q ${whereStr}`).get(...params).c;
  const questions = db.prepare(`
    SELECT q.*, c.name as class_name FROM questions q
    LEFT JOIN classes c ON c.id = q.class_id
    ${whereStr} ORDER BY q.id DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
  
  const classes = db.prepare('SELECT * FROM classes WHERE admin_id = ? ORDER BY name').all(admin_id);
  const exams = db.prepare('SELECT id, title, class_id FROM exams WHERE admin_id = ? ORDER BY title').all(admin_id);
  const subjectsStr = db.prepare('SELECT DISTINCT name FROM subjects WHERE admin_id = ? ORDER BY name').all(admin_id).map(s => s.name);
  
  res.json({ questions, total, classes, exams, subjects: subjectsStr, page: Number(page), totalPages: Math.ceil(total / limit) });
});

router.post('/admin/questions', adminAuth, (req, res) => {
  const { exam_id, class_id, subject, question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option)
    return res.status(400).json({ error: 'All fields required' });
  const r = db.prepare(`
    INSERT INTO questions (exam_id, class_id, admin_id, subject, question_text, option_a, option_b, option_c, option_d, correct_option)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(exam_id || null, class_id || null, req.admin.id, subject || null, question_text, option_a, option_b, option_c, option_d, correct_option);
  res.json({ id: r.lastInsertRowid, success: true });
});

router.put('/admin/questions/:id', adminAuth, (req, res) => {
  const { exam_id, class_id, subject, question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  db.prepare(`
    UPDATE questions SET exam_id=?, class_id=?, subject=?, question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=?
    WHERE id=? AND admin_id=?
  `).run(exam_id || null, class_id || null, subject || null, question_text, option_a, option_b, option_c, option_d, correct_option, req.params.id, req.admin.id);
  res.json({ success: true });
});

router.delete('/admin/questions/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM questions WHERE id = ? AND admin_id = ?').run(req.params.id, req.admin.id);
  res.json({ success: true });
});

router.post('/admin/questions/bulk-delete', adminAuth, (req, res) => {
  const { ids } = req.body;
  if (!ids || !ids.length) return res.status(400).json({ error: 'No IDs' });
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM questions WHERE id IN (${placeholders}) AND admin_id = ?`).run(...ids, req.admin.id);
  res.json({ success: true, deleted: ids.length });
});

// CSV Upload for questions
router.post('/admin/questions/upload', adminAuth, upload.single('file'), (req, res) => {
  const { exam_id, class_id } = req.body;
  if (!req.file) return res.status(400).json({ error: 'File required' });
  
  const text = fs.readFileSync(req.file.path, 'utf8');
  fs.unlinkSync(req.file.path);
  
  const lines = text.split('\n').filter(l => l.trim());
  let added = 0, failed = 0;
  
  const stmt = db.prepare(`
    INSERT INTO questions (exam_id, class_id, admin_id, subject, question_text, option_a, option_b, option_c, option_d, correct_option)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `);
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const [subject, question_text, option_a, option_b, option_c, option_d, correct_option] = cols;
    if (!question_text || !option_a || !correct_option) { failed++; continue; }
    try {
      stmt.run(exam_id || null, class_id || null, req.admin.id, subject || null, question_text, option_a, option_b || '', option_c || '', option_d || '', correct_option.toUpperCase());
      added++;
    } catch { failed++; }
  }
  
  res.json({ success: true, added, failed, message: `${added} questions added, ${failed} failed.` });
});

// Export questions CSV
router.get('/admin/questions/export', adminAuth, (req, res) => {
  const { exam_id, class_id } = req.query;
  const admin_id = req.admin.id;
  let where = ['admin_id = ?']; let params = [admin_id];
  if (exam_id) { where.push('exam_id = ?'); params.push(exam_id); }
  if (class_id) { where.push('class_id = ?'); params.push(class_id); }
  const whereStr = 'WHERE ' + where.join(' AND ');
  const questionsList = db.prepare(`SELECT * FROM questions ${whereStr}`).all(...params);
  
  let csv = 'Subject,Question,Option A,Option B,Option C,Option D,Correct\n';
  questionsList.forEach(q => {
    csv += `"${q.subject||''}","${q.question_text}","${q.option_a}","${q.option_b}","${q.option_c}","${q.option_d}","${q.correct_option}"\n`;
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=questions.csv');
  res.send(csv);
});

// ADMIN - RESULTS
router.get('/admin/results', adminAuth, (req, res) => {
  const { class_id, exam_id, search } = req.query;
  const admin_id = req.admin.id;
  let where = ['r.admin_id = ?']; let params = [admin_id];
  if (class_id) { where.push('s.class_id = ?'); params.push(class_id); }
  if (exam_id) { where.push('r.exam_id = ?'); params.push(exam_id); }
  if (search) { where.push('(s.name LIKE ? OR s.mobile LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  const whereStr = 'WHERE ' + where.join(' AND ');
  
  const resultsList = db.prepare(`
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
  
  const classesList = db.prepare('SELECT * FROM classes WHERE admin_id = ? ORDER BY name').all(admin_id);
  const examsList = db.prepare('SELECT id, title, class_id FROM exams WHERE admin_id = ? ORDER BY title').all(admin_id);
  
  res.json({ results: resultsList, classes: classesList, exams: examsList });
});

router.get('/admin/results/export', adminAuth, (req, res) => {
  const { class_id, exam_id } = req.query;
  const admin_id = req.admin.id;
  let where = ['r.admin_id = ?']; let params = [admin_id];
  if (class_id) { where.push('s.class_id = ?'); params.push(class_id); }
  if (exam_id) { where.push('r.exam_id = ?'); params.push(exam_id); }
  const whereStr = 'WHERE ' + where.join(' AND ');
  
  const resultsExport = db.prepare(`
    SELECT r.*, s.name as student_name, s.mobile as student_mobile, c.name as class_name, e.title as exam_title
    FROM results r JOIN students s ON s.id = r.student_id
    JOIN classes c ON c.id = s.class_id JOIN exams e ON e.id = r.exam_id
    ${whereStr} ORDER BY r.created_at DESC
  `).all(...params);
  
  let csv = 'Student,Mobile,Class,Exam,Score,Total,Percentage,Attempted,Wrong,Blank,Time,Date\n';
  resultsExport.forEach(r => {
    const pct = r.total_questions > 0 ? ((r.score / r.total_questions) * 100).toFixed(1) : '0';
    csv += `"${r.student_name}","${r.student_mobile}","${r.class_name}","${r.exam_title}",${r.score},${r.total_questions},${pct}%,${r.attempted_count},${r.wrong_count},${r.blank_count},"${r.time_taken||''}","${r.created_at}"\n`;
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
  res.send(csv);
});

router.get('/admin/results/:id', adminAuth, (req, res) => {
  const resultDetail = db.prepare(`
    SELECT r.*, s.name as student_name, s.mobile as student_mobile,
    c.name as class_name, e.title as exam_title, e.duration_minutes
    FROM results r JOIN students s ON s.id = r.student_id
    JOIN classes c ON c.id = s.class_id JOIN exams e ON e.id = r.exam_id
    WHERE r.id = ? AND r.admin_id = ?
  `).get(req.params.id, req.admin.id);
  if (!resultDetail) return res.status(404).json({ error: 'Not found' });
  resultDetail.subject_stats = resultDetail.subject_stats_json ? JSON.parse(resultDetail.subject_stats_json) : {};
  resultDetail.answers = resultDetail.answers_json ? JSON.parse(resultDetail.answers_json) : {};
  res.json(resultDetail);
});

// STUDENT - DASHBOARD
router.get('/student/dashboard', studentAuth, (req, res) => {
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

// STUDENT - EXAM
router.get('/student/exam/:id', studentAuth, (req, res) => {
  const exam = db.prepare('SELECT * FROM exams WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  
  const already = db.prepare('SELECT id FROM results WHERE student_id = ? AND exam_id = ?').get(req.student.id, exam.id);
  if (already) return res.status(400).json({ error: 'Already attempted', result_id: already.id });
  
  let questions = [];
  if (exam.use_specific_questions) {
    const specific = db.prepare('SELECT * FROM questions WHERE exam_id = ?').all(exam.id);
    questions = [...questions, ...specific];
  }
  if (exam.use_global_questions) {
    const global = db.prepare('SELECT * FROM questions WHERE class_id = ? AND (exam_id IS NULL OR exam_id != ?)').all(req.student.class_id, exam.id);
    questions = [...questions, ...global];
  }
  const seen = new Set();
  questions = questions.filter(q => { if (seen.has(q.id)) return false; seen.add(q.id); return true; });
  const limits = db.prepare('SELECT * FROM exam_subject_limits WHERE exam_id = ?').all(exam.id);
  if (limits.length > 0) {
    let selected = [];
    limits.forEach(({ subject, limit_count }) => {
      const subjectQs = questions.filter(q => q.subject === subject);
      const shuffled = subjectQs.sort(() => Math.random() - 0.5).slice(0, limit_count);
      selected = [...selected, ...shuffled];
    });
    const limitSubjects = new Set(limits.map(l => l.subject));
    const remaining = questions.filter(q => !limitSubjects.has(q.subject));
    const needed = Math.max(0, exam.question_limit - selected.length);
    const extra = remaining.sort(() => Math.random() - 0.5).slice(0, needed);
    questions = [...selected, ...extra];
  }
  questions = questions.sort(() => Math.random() - 0.5).slice(0, exam.question_limit);
  const safeQuestions = questions.map(({ correct_option, ...q }) => q);
  res.json({ exam, questions: safeQuestions });
});

router.post('/student/exam/:id/submit', studentAuth, (req, res) => {
  try {
    const { answers, time_taken } = req.body;
    const student = db.prepare('SELECT admin_id FROM students WHERE id = ?').get(req.student.id);
    const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    const existing = db.prepare('SELECT id FROM results WHERE student_id = ? AND exam_id = ?').get(req.student.id, exam.id);
    if (existing) return res.json({ success: true, result_id: existing.id });
    
    const qIds = Object.keys(answers || {});
    if (qIds.length === 0) {
      const r = db.prepare(`
        INSERT INTO results (student_id, exam_id, admin_id, score, total_questions, attempted_count, wrong_count, blank_count, time_taken, answers_json, subject_stats_json)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).run(req.student.id, exam.id, student.admin_id, 0, 0, 0, 0, 0, time_taken || '', '{}', '{}');
      return res.json({ success: true, result_id: r.lastInsertRowid });
    }
    
    const questionsList = db.prepare(`SELECT * FROM questions WHERE id IN (${qIds.map(() => '?').join(',')})`).all(...qIds.map(Number));
    let score = 0, attempted = 0, wrong = 0, blank = 0;
    const stats = {};
    questionsList.forEach(q => {
      const studentAns = answers[String(q.id)];
      if (!stats[q.subject || 'General']) stats[q.subject || 'General'] = { correct: 0, wrong: 0, total: 0 };
      stats[q.subject || 'General'].total++;
      if (!studentAns) { blank++; return; }
      attempted++;
      if (studentAns === q.correct_option) {
        score++; stats[q.subject || 'General'].correct++;
      } else {
        wrong++; stats[q.subject || 'General'].wrong++;
      }
    });
    const r = db.prepare(`
      INSERT INTO results (student_id, exam_id, admin_id, score, total_questions, attempted_count, wrong_count, blank_count, time_taken, answers_json, subject_stats_json)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).run(req.student.id, exam.id, student.admin_id, score, questionsList.length, attempted, wrong, blank,
      time_taken || '', JSON.stringify(answers), JSON.stringify(stats));
    res.json({ success: true, result_id: r.lastInsertRowid });
  } catch (error) {
    console.error('[Exam Submit Error]', error);
    res.status(500).json({ error: 'Failed to submit exam: ' + error.message });
  }
});

router.get('/student/result/:id', studentAuth, (req, res) => {
  const result = db.prepare(`
    SELECT r.*, e.title as exam_title, e.duration_minutes
    FROM results r JOIN exams e ON e.id = r.exam_id
    WHERE r.id = ? AND r.student_id = ?
  `).get(req.params.id, req.student.id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  result.subject_stats = result.subject_stats_json ? JSON.parse(result.subject_stats_json) : {};
  res.json(result);
});

// STUDIO HUB - LEADS & INQUIRIES
router.post('/leads/submit', (req, res) => {
  const { name, email, mobile, message, type, source } = req.body;
  if (!name || !source) return res.status(400).json({ error: 'Name and Source are required' });
  
  try {
    const r = db.prepare(`
      INSERT INTO studio_leads (name, email, mobile, message, type, source)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, email || null, mobile || null, message || null, type || 'Inquiry', source);
    res.json({ success: true, id: r.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

router.get('/hub/leads', hubAuth, (req, res) => {
  const leads = db.prepare('SELECT * FROM studio_leads ORDER BY created_at DESC').all();
  res.json(leads);
});

router.get('/hub/leads/unread-count', hubAuth, (req, res) => {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM studio_leads WHERE is_read = 0').get();
  res.json({ count });
});

router.patch('/hub/leads/:id/read', hubAuth, (req, res) => {
  db.prepare('UPDATE studio_leads SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.delete('/hub/leads/:id', hubAuth, (req, res) => {
  db.prepare('DELETE FROM studio_leads WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

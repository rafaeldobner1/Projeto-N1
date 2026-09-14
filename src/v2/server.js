const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Tokens = require('csrf');
const pool = require('../db');
require('dotenv').config();

const app = express();
const tokens = new Tokens();
const csrfSecrets = new Map();
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], objectSrc: ["'none'"], baseUri: ["'self'"] } } }));

function validarEntrada({ username, email, password }, exigirSenha = false) {
  if (username !== undefined && !/^[A-Za-z0-9_.-]{3,40}$/.test(username)) return 'username inválido';
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'email inválido';
  if ((exigirSenha || password !== undefined) && (typeof password !== 'string' || password.length < 6 || password.length > 72)) return 'password deve ter entre 6 e 72 caracteres';
  return null;
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Token ausente' });
  try { req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'dev-secret'); next(); }
  catch { return res.status(401).json({ error: 'Token inválido ou expirado' }); }
}

function csrfProtection(req, res, next) {
  const secret = csrfSecrets.get(req.user.id); const token = req.get('x-csrf-token');
  if (!secret || !token || !tokens.verify(secret, token)) return res.status(403).json({ error: 'Token CSRF ausente ou inválido' });
  next();
}

app.get('/', (req, res) => res.status(200).json({ projeto: 'N1 Pentest - API V2 segura' }));

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'username, email e password são obrigatórios' });
  const erro = validarEntrada({ username, email, password }, true); if (erro) return res.status(400).json({ error: erro });
  try { const hash = await bcrypt.hash(password, 12); const [result] = await pool.execute('INSERT INTO users_v2 (username, email, password) VALUES (?, ?, ?)', [username, email, hash]); res.status(201).json({ id: result.insertId, username, email }); }
  catch (err) { if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'username ou email já cadastrado' }); res.status(500).json({ error: 'Erro interno' }); }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body; if (!username || !password) return res.status(400).json({ error: 'username e password são obrigatórios' });
  try { const [rows] = await pool.execute('SELECT id, username, email, password FROM users_v2 WHERE username = ?', [username]); if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) return res.status(401).json({ error: 'Credenciais inválidas' }); const token = jwt.sign({ id: rows[0].id, username: rows[0].username }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' }); res.status(200).json({ token }); }
  catch { res.status(500).json({ error: 'Erro interno' }); }
});

app.get('/csrf-token', auth, (req, res) => { let secret = csrfSecrets.get(req.user.id); if (!secret) { secret = tokens.secretSync(); csrfSecrets.set(req.user.id, secret); } res.status(200).json({ csrfToken: tokens.create(secret) }); });

app.get('/users', auth, async (req, res) => { try { const [rows] = await pool.execute('SELECT id, username, email, created_at FROM users_v2 ORDER BY id'); res.status(200).json(rows); } catch { res.status(500).json({ error: 'Erro interno' }); } });

app.put('/users/:id', auth, csrfProtection, async (req, res) => {
  const id = Number(req.params.id); const { username, email } = req.body;
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'id inválido' });
  const erro = validarEntrada({ username, email }); if (erro || !username || !email) return res.status(400).json({ error: erro || 'username e email são obrigatórios' });
  try { const [result] = await pool.execute('UPDATE users_v2 SET username = ?, email = ? WHERE id = ?', [username, email, id]); if (!result.affectedRows) return res.status(404).json({ error: 'Usuário não encontrado' }); res.status(200).json({ message: 'Usuário atualizado' }); }
  catch (err) { if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'username ou email já cadastrado' }); res.status(500).json({ error: 'Erro interno' }); }
});

app.delete('/users/:id', auth, csrfProtection, async (req, res) => {
  const id = Number(req.params.id); if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'id inválido' });
  try { const [result] = await pool.execute('DELETE FROM users_v2 WHERE id = ?', [id]); if (!result.affectedRows) return res.status(404).json({ error: 'Usuário não encontrado' }); res.status(200).json({ message: 'Usuário excluído' }); }
  catch { res.status(500).json({ error: 'Erro interno' }); }
});

const port = Number(process.env.PORT_V2 || 3002);
app.listen(port, () => console.log(`V2 segura em http://localhost:${port}`));

const express = require('express');
const cookieParser = require('cookie-parser');
const pool = require('../db');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => { res.setHeader('Access-Control-Allow-Origin', '*'); next(); });

// VERSÃO 1.0: deliberadamente vulnerável, somente para laboratório local.
app.get('/', (req, res) => res.send('<h1>N1 Pentest - API V1 Vulnerável</h1><p>Use somente em localhost.</p>'));

app.get('/users', async (req, res) => {
  const [rows] = await pool.query('SELECT id, username, email, password, created_at FROM users_v1');
  res.status(200).json(rows);
});

app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;
  const sql = `INSERT INTO users_v1 (username, email, password) VALUES ('${username}', '${email}', '${password}')`;
  try { const [result] = await pool.query(sql); res.status(201).json({ id: result.insertId, username, email }); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/users/:id', async (req, res) => {
  const { username, email } = req.body;
  const sql = `UPDATE users_v1 SET username='${username}', email='${email}' WHERE id=${req.params.id}`;
  try { const [result] = await pool.query(sql); if (!result.affectedRows) return res.status(404).json({ error: 'Usuário não encontrado' }); res.status(200).json({ message: 'Usuário atualizado' }); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/users/:id', async (req, res) => {
  try { const [result] = await pool.query(`DELETE FROM users_v1 WHERE id=${req.params.id}`); if (!result.affectedRows) return res.status(404).json({ error: 'Usuário não encontrado' }); res.status(200).json({ message: 'Usuário excluído' }); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/login-demo', (req, res) => res.send(`<!doctype html><html><body><h1>Login V1 vulnerável</h1><form method="POST" action="/login-vulneravel-form"><input name="username" value="admin"><input name="password" type="password" value="123456"><button>Entrar</button></form></body></html>`));

app.post('/login-vulneravel-form', async (req, res) => {
  const { username, password } = req.body;
  const sql = `SELECT id, username, email, password FROM users_v1 WHERE username='${username}' AND password='${password}'`;
  try { const [rows] = await pool.query(sql); if (!rows.length) return res.status(401).send('Credenciais inválidas'); res.cookie('userId', String(rows[0].id), { sameSite: 'lax' }); res.status(200).send('<h2>Login realizado na V1.</h2>'); }
  catch (err) { res.status(400).send(err.message); }
});

app.post('/login-vulneravel', async (req, res) => {
  const { username, password } = req.body;
  const sql = `SELECT id, username, email, password FROM users_v1 WHERE username='${username}' AND password='${password}'`;
  try { const [rows] = await pool.query(sql); if (!rows.length) return res.status(401).json({ error: 'Credenciais inválidas' }); res.cookie('userId', String(rows[0].id)); res.status(200).json(rows); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/profile/:id', async (req, res) => {
  try { const [rows] = await pool.query(`SELECT username, email FROM users_v1 WHERE id=${req.params.id}`); if (!rows.length) return res.status(404).send('Usuário não encontrado'); res.send(`<h2>Perfil</h2><p>Usuário: ${rows[0].username}</p><p>E-mail: ${rows[0].email}</p>`); }
  catch (err) { res.status(400).send(err.message); }
});

app.post('/change-email', async (req, res) => {
  const userId = req.cookies.userId; const { email } = req.body;
  if (!userId) return res.status(401).json({ error: 'Faça login primeiro' });
  try { await pool.query(`UPDATE users_v1 SET email='${email}' WHERE id=${userId}`); res.status(200).json({ message: 'E-mail alterado' }); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

const port = Number(process.env.PORT_V1 || 3001);
app.listen(port, () => console.log(`V1 vulnerável em http://localhost:${port}`));

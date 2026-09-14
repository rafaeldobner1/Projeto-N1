# Relatório Técnico

**Integrantes:** Rafael Dobner e André H. Voigt

## N1 - Vulnerabilidades em Aplicações Web (SaaS)

### 1. Tecnologias
Node.js, Express, MySQL/MariaDB, mysql2, JWT/jsonwebtoken, bcrypt, Helmet, csrf e Thunder Client/Postman.

### 2. Arquitetura
O projeto contém duas implementações da API e duas tabelas separadas no banco. A V1 mantém comportamentos deliberadamente inseguros para o laboratório; a V2 aplica controles de segurança.

### 3. V1 vulnerável
CRUD: `GET /users`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id`.

**SQL Injection:** a V1 concatena valores diretamente nos comandos SQL. O teste local comprovou alteração indevida da lógica da consulta. Correção na V2: `pool.execute()` com placeholders `?`.

**XSS:** a rota de perfil insere diretamente o username armazenado no HTML. O teste local comprovou execução de JavaScript armazenado. Correção: V2 responde JSON e utiliza Helmet/CSP.

**CSRF:** a V1 altera e-mail usando apenas um identificador em cookie e não exige token anti-CSRF. Correção: V2 exige JWT e token anti-CSRF nas operações sensíveis.

A V1 também mantém senha em texto puro propositalmente para demonstrar o risco.

### 4. V2 segura
`POST /register` recebe username, email e password e armazena hash bcrypt. `POST /login` valida as credenciais e retorna JWT com validade de uma hora. `GET /users` exige autenticação e não retorna senha. `PUT /users/:id` e `DELETE /users/:id` exigem JWT e token CSRF.

Nos testes, `GET /users` sem JWT retornou 401; com JWT válido retornou 200. Uma tentativa de PUT sem token CSRF retornou 403. A consulta direta à tabela `users_v2` confirmou armazenamento bcrypt.

### 5. Status HTTP
- 200: sucesso
- 201: criado
- 400: entrada inválida
- 401: autenticação inválida/ausente
- 403: CSRF inválido/ausente
- 404: usuário inexistente
- 409: conflito de dados
- 500: erro interno

### 6. Procedimento de teste
1. Executar `sql/database.sql`.
2. Configurar `.env`.
3. Executar `npm install`.
4. Iniciar V1 com `npm run v1` e demonstrar CRUD e vulnerabilidades apenas localmente.
5. Iniciar V2 com `npm run v2`.
6. Registrar usuário e fazer login.
7. Testar GET com e sem JWT.
8. Obter token em `GET /csrf-token`.
9. Testar PUT/DELETE com JWT e CSRF.
10. Repetir entradas maliciosas e comparar o comportamento.

### 7. Comparação
| Controle | V1 | V2 |
|---|---|---|
| SQL | concatenado | parametrizado |
| Senhas | texto puro | bcrypt |
| JWT | não | sim |
| PUT/DELETE protegidos | não | sim |
| Anti-CSRF | não | sim |
| CSP | não | sim |
| Validação | mínima | implementada |
| Senha no GET | sim | não |

### 8. Conclusão
A V1 demonstra como uma API funcional pode conter falhas críticas. A V2 aplica mecanismos preventivos relacionados às vulnerabilidades demonstradas. Todos os testes foram executados exclusivamente em localhost para fins acadêmicos.
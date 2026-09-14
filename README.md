# N1 - Vulnerabilidades em Aplicações Web (SaaS) / Pentesting

**Integrantes:** Rafael Dobner e André H. Voigt

Projeto desenvolvido para a disciplina de Segurança da Informação.

O trabalho possui duas versões da API:

- **V1:** versão vulnerável utilizada para os testes de SQL Injection, XSS e CSRF.
- **V2:** versão com as correções de segurança, utilizando JWT, bcrypt, consultas parametrizadas, validação de entrada, CSP e proteção CSRF.

## Tecnologias utilizadas

- Node.js
- Express
- MySQL / MariaDB
- JWT
- bcrypt
- Helmet
- Thunder Client / Postman

## Instalação

Instale as dependências:

```bash
npm install
```

Crie o banco executando o arquivo:

```text
sql/database.sql
```

Depois, crie um arquivo `.env` com base no `.env.example` e configure os dados do banco.

Exemplo:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=n1_pentest
DB_PORT=3306
JWT_SECRET=troque-esta-chave
PORT_V1=3001
PORT_V2=3002
```

## Executando a V1

```bash
npm run v1
```

A API ficará disponível em:

```text
http://localhost:3001
```

## Executando a V2

```bash
npm run v2
```

A API ficará disponível em:

```text
http://localhost:3002
```

## Testes realizados na V1

Foram realizados os testes solicitados no trabalho:

### SQL Injection

Foi utilizado o endpoint vulnerável de login:

```text
POST /login-vulneravel
```

Exemplo de entrada utilizada no campo `username`:

```text
' OR '1'='1' -- 
```

O teste mostrou que a consulta SQL montada por concatenação permitia burlar a autenticação.

### XSS

Foi cadastrado um usuário contendo JavaScript no nome:

```html
<script>alert(1)</script>
```

Ao acessar o perfil desse usuário na V1, o código era executado pelo navegador.

### CSRF

A rota abaixo altera o e-mail utilizando apenas a sessão por cookie e não exige token CSRF:

```text
POST /change-email
```

O arquivo `csrf-demo.html` foi utilizado para demonstrar o envio de uma requisição a essa rota.

## V2 - versão corrigida

Na V2 foram feitas as seguintes alterações:

- senhas armazenadas com bcrypt;
- autenticação com JWT;
- consultas SQL parametrizadas;
- validação dos dados recebidos;
- Helmet e Content Security Policy;
- token CSRF nas operações de alteração e exclusão.

### Cadastro

```text
POST /register
```

Body:

```json
{
  "username": "rafael",
  "email": "rafael@email.com",
  "password": "123456"
}
```

### Login

```text
POST /login
```

O login retorna um token JWT que deve ser enviado nas rotas protegidas:

```text
Authorization: Bearer TOKEN
```

### Rotas protegidas

```text
GET /users
PUT /users/:id
DELETE /users/:id
```

Para PUT e DELETE também é necessário obter o token CSRF em:

```text
GET /csrf-token
```

E enviá-lo no header:

```text
x-csrf-token: TOKEN_CSRF
```

## Arquivos do projeto

```text
src/v1/server.js                         API vulnerável
src/v2/server.js                         API corrigida
src/db.js                                conexão com o banco
sql/database.sql                         criação do banco e tabelas
csrf-demo.html                           teste de CSRF
postman/N1-Pentest.postman_collection.json
reports/Relatorio-Tecnico.md
reports/Relatorio-Tecnico.pdf
reports/Relatorio-Sumario-Executivo.md
reports/Relatorio-Sumario-Executivo.pdf
```

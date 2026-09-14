# Relatório - Sumário Executivo

**Integrantes:** Rafael Dobner e André H. Voigt

## N1 - Vulnerabilidades em Aplicações Web (SaaS)

### 1. Objetivo
Este trabalho demonstra, em ambiente controlado e local, como falhas comuns em aplicações web podem comprometer dados. Foram desenvolvidas duas versões de uma API RESTful para gerenciamento de usuários. A V1 foi criada propositalmente sem mecanismos adequados de segurança para demonstrar SQL Injection, XSS e CSRF. A V2 apresenta correções e mecanismos preventivos.

### 2. Principais riscos identificados
Na versão vulnerável, a concatenação direta de dados em comandos SQL permite alterar a lógica de consultas. Dados inseridos sem tratamento podem ser interpretados pelo navegador como JavaScript, caracterizando XSS. Uma operação sensível baseada apenas em cookie pode aceitar uma requisição originada por página externa, caracterizando CSRF. Os testes locais também demonstraram armazenamento de senha em texto puro na V1.

### 3. Medidas implementadas
- autenticação por JWT;
- proteção de rotas sensíveis;
- HTTP 401 para token ausente ou inválido;
- senhas com bcrypt;
- consultas parametrizadas;
- validação de entrada;
- Helmet e Content Security Policy;
- token anti-CSRF em atualização e exclusão;
- senha omitida da listagem de usuários.

### 4. Resultado
Os testes comprovaram SQL Injection, Stored XSS e ausência de proteção CSRF na V1. Na V2, foi verificado o bloqueio sem JWT, o acesso autenticado, o armazenamento bcrypt e o bloqueio de operação sensível sem token CSRF.

### 5. Conclusão
O trabalho demonstra a diferença entre uma aplicação apenas funcional e uma aplicação com controles de segurança. Os testes foram realizados exclusivamente em localhost para fins acadêmicos.
# Entrelinhas — Backend

API REST em Node.js + Express + MongoDB/Mongoose.

## Configuração
1. Instale Node.js e tenha MongoDB local ou MongoDB Atlas disponível.
2. Rode `npm install`.
3. Copie `.env.example` para `.env` e ajuste `MONGODB_URI` se necessário.
4. Rode `npm run seed` para criar/atualizar o login administrador.
5. Rode `npm run dev`.

API padrão: `http://localhost:3001/api`.

Login padrão do `.env.example`: `admin@entrelinhas.com` / `123456`. Troque a senha antes de uso real.

## Banco vazio
O backend aceita banco sem participantes, encontros ou anotações. As rotas de listagem retornam arrays vazios. O seed cria somente o usuário administrador.

## Rotas
- `GET /api/health`
- `POST /api/auth/login`
- `GET/POST /api/participants`
- `PATCH /api/participants/:id`: altera `name` e/ou `birthDate` e retorna o participante atualizado (200). Quando enviado, o nome deve ser uma string não vazia.
- `DELETE /api/participants/:id`
- `GET/POST /api/meetings`
- `DELETE /api/meetings/:id`: exclui um encontro, sem corpo na requisição, e retorna 204 sem conteúdo.
- `PATCH /api/meetings/:id/attendance/:participantId`
- `GET /api/notes`
- `DELETE /api/ideas/:id`: exclui uma ideia, sem corpo na requisição, e retorna 204 sem conteúdo.
- `PUT/DELETE /api/notes/:date`

## Novos recursos
Nas rotas acima com `:id`, use o `_id` do registro no MongoDB. A alteração de participante e as exclusões retornam 404 quando o registro não existe e 400 quando o identificador é inválido. O PATCH de participante exige ao menos um dos campos `name` ou `birthDate`.

### Data de nascimento

`GET /api/participants` inclui `birthDate`, com valor `null` para cadastros sem data, inclusive antigos. `POST /api/participants` aceita, por exemplo, `{"name":"Ana Silva","birthDate":"1995-09-29"}` e retorna o participante salvo (201). O campo é opcional; ausência ou `null` significa data não informada.

No PATCH, `{"birthDate":null}` remove a data; omitir o campo mantém o valor atual. Nome e data também podem ser enviados juntos. Datas são armazenadas como strings `YYYY-MM-DD`, sem conversão de fuso horário. Datas inexistentes, formatos inválidos e datas futuras retornam 400 com `{"message":"Data de nascimento inválida."}`. O limite de hoje usa o dia atual em UTC.

O calendário do frontend filtra essa lista pelo mês e ordena por dia e nome. Não há rota adicional de aniversariantes: `29/02` permanece em fevereiro em qualquer ano.

Execute `npm test` para verificar validação, compatibilidade com registros antigos e contratos HTTP. Os testes substituem as operações do banco por mocks e não exigem MongoDB.

- `GET /api/finance` e `PUT /api/finance`: consulta e atualização do saldo do clube.
- `GET /api/ideas`, `POST /api/ideas` e `PATCH /api/ideas/:id/status`: cadastro e decisão das ideias.

## Deploy na Vercel

O projeto possui `api/index.js` e `vercel.json` para funcionar como backend serverless na Vercel.

Configure no projeto da Vercel:

- `MONGODB_URI`: string de conexão do MongoDB Atlas.
- `FRONTEND_URL`: URL pública do frontend, sem barra no final.

Não envie o arquivo `.env`. A Vercel instala as dependências automaticamente; não envie `node_modules`.

Depois do deploy, teste `https://SEU-BACKEND.vercel.app/api/health`. A resposta esperada é `{ "ok": true }`.

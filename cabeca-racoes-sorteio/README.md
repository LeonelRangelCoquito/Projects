# Sorteio Cabeça Rações

Aplicação web para cadastrar participantes e confirmar, por declaração, os requisitos do sorteio. Cada cadastro recebe um identificador UUID. Os dados ficam em SQLite dentro de `data/`, fora dos arquivos públicos do site.

## Requisitos

- Node.js 24 ou superior (usa `node:sqlite`, sem dependências npm).

## Configuração

1. Copie `.env.example` para `.env`.
2. Preencha `INSTAGRAM_URL` e `GOOGLE_REVIEW_URL` com os links oficiais.
3. Ajuste `RAFFLE_DATE` se necessário. O valor inicial é `25/10`.

## Executar

```sh
npm start
```

Acesse `http://localhost:3000` (ou a porta definida em `PORT`). O banco e a tabela são criados automaticamente no primeiro início.

## API

- `GET /api/config`: data e links da campanha.
- `POST /api/registrations`: recebe `name`, `phone`, `followsInstagram` e `reviewedGoogle`.

O telefone é normalizado para o formato brasileiro e não pode ser cadastrado mais de uma vez. Não há painel público de participantes: os dados pessoais não são enviados ao navegador, apenas o UUID do próprio cadastro.

## Limite da validação

A aplicação exige que o participante confirme que segue a loja no Instagram e que avaliou a loja no Google. Essa confirmação é declaratória; não há integração capaz de comprovar automaticamente essas ações. A equipe da loja deve conferir os requisitos por conta própria antes de considerar uma inscrição elegível.

O sorteio é presencial, realizado na loja pela dona, na data configurada. O site não sorteia ganhadores.

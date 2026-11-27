# Estante — minha coleção de jogos

Aplicação web para gerenciar uma coleção de jogos: cadastrar, listar, filtrar por gênero, editar e excluir. Os dados ficam em uma API criada no [mockapi.io](https://mockapi.io) e consumida com `fetch` em JavaScript puro.

## Tema e campos

**Tema:** jogos
**Recurso no mockapi.io:** `jogos`

| Campo         | Tipo   | Obrigatório | Opções / regras |
|---------------|--------|-------------|-----------------|
| id            | String | (gerado)    | criado automaticamente pelo mockapi.io |
| nome          | String | sim         | até 80 caracteres |
| genero        | String | sim         | **categoria:** Ação, Aventura, RPG, Estratégia, Esporte, Corrida, Terror, Puzzle |
| plataforma    | String | sim         | PC, PlayStation, Xbox, Nintendo Switch, Mobile |
| anoLancamento | Number | sim         | inteiro entre 1970 e o ano atual |
| horasJogadas  | Number | sim         | inteiro, 0 ou mais |
| nota          | Number | não         | de 0 a 10 |
| capa          | String | não         | URL (http/https) da imagem de apresentação do jogo, usada no fundo desfocado |

## API

- Projeto no mockapi.io: `https://mockapi.io/projects/6b077a0e58419b87a438449d`
- URL base do recurso: `https://6b077a0e58419b87a438449c.mockapi.io/jogos-api/jogos`

| Operação          | Método | Rota          |
|-------------------|--------|---------------|
| Listar todos      | GET    | `/jogos`      |
| Buscar por id     | GET    | `/jogos/:id`  |
| Cadastrar         | POST   | `/jogos`      |
| Atualizar         | PUT    | `/jogos/:id`  |
| Excluir           | DELETE | `/jogos/:id`  |

A coleção do Postman com essas 5 requisições está em [`docs/`](docs/).

## Como abrir

1. Clone o repositório:
   ```
   git clone https://github.com/hkMello/projeto-individual.git
   ```
2. Abra o `index.html` no navegador (ou use a extensão Live Server do VS Code).

Não precisa instalar nada: é HTML, CSS e JavaScript puro.

## Estrutura

```
projeto-individual/
├── index.html
├── css/style.css
├── js/script.js
├── docs/            # coleção Postman exportada (.json)
└── README.md
```

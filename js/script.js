const API_URL = "https://6b077a0e58419b87a438449c.mockapi.io/jogos-api/jogos";

const GENEROS = ["Ação", "Aventura", "RPG", "Estratégia", "Esporte", "Corrida", "Terror", "Puzzle"];
const PLATAFORMAS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile", "All"];
const ANO_MINIMO = 1970;
const ANO_ATUAL = new Date().getFullYear();

const $ = (id) => document.getElementById(id);

const form = $("form-jogo");
const formErro = $("form-erro");
const tabela = $("tabela");
const statusEl = $("status");
const btnSalvar = $("btn-salvar");
const btnCancelar = $("btn-cancelar");

const campos = {
  id: $("f-id"),
  nome: $("f-nome"),
  genero: $("f-genero"),
  plataforma: $("f-plataforma"),
  anoLancamento: $("f-ano"),
  horasJogadas: $("f-horas"),
  nota: $("f-nota"),
  capa: $("f-capa"),
};

let temporizadorStatus;

function el(tag, props = {}, ...filhos) {
  const no = document.createElement(tag);
  for (const [chave, valor] of Object.entries(props)) {
    if (chave === "class") no.className = valor;
    else if (chave === "text") no.textContent = valor;
    else if (chave.startsWith("data-") || chave.startsWith("aria-")) no.setAttribute(chave, valor);
    else no[chave] = valor;
  }
  no.append(...filhos);
  return no;
}

const formatarNumero = (n, casas = 0) =>
  Number(n).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

function mostrarStatus(mensagem, tipo = "ok") {
  clearTimeout(temporizadorStatus);
  statusEl.textContent = mensagem;
  statusEl.className = tipo;
  statusEl.hidden = false;
  if (tipo === "ok") {
    temporizadorStatus = setTimeout(() => (statusEl.hidden = true), 4000);
  }
}

const TEMPO_TROCA_FUNDO = 8000;
const camadasFundo = document.querySelectorAll("#fundo .camada");
const reduzirMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
let camadaAtual = 0;
let capasFundo = [];
let indiceFundo = 0;
let temporizadorFundo;
let urlNoFundo = "";

function urlValida(texto) {
  try {
    const url = new URL(texto);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function mostrarNoFundo(url) {
  if (!url || url === urlNoFundo) return;
  const imagem = new Image();
  imagem.onload = () => {
    urlNoFundo = url;
    camadaAtual = 1 - camadaAtual;
    const entra = camadasFundo[camadaAtual];
    const sai = camadasFundo[1 - camadaAtual];
    entra.style.backgroundImage = `url(${JSON.stringify(url)})`;
    entra.classList.add("ativa");
    sai.classList.remove("ativa");
  };
  imagem.src = url;
}

function limparFundo() {
  urlNoFundo = "";
  camadasFundo.forEach((c) => c.classList.remove("ativa"));
}

function pararRotacaoFundo() {
  clearInterval(temporizadorFundo);
}

function iniciarRotacaoFundo() {
  pararRotacaoFundo();
  if (reduzirMovimento || capasFundo.length < 2) return;
  temporizadorFundo = setInterval(() => {
    indiceFundo = (indiceFundo + 1) % capasFundo.length;
    mostrarNoFundo(capasFundo[indiceFundo]);
  }, TEMPO_TROCA_FUNDO);
}

function atualizarFundo(jogos) {
  capasFundo = jogos.map((j) => urlValida(j.capa)).filter(Boolean);
  if (capasFundo.length === 0) {
    pararRotacaoFundo();
    limparFundo();
    return;
  }
  indiceFundo = capasFundo.length - 1;
  mostrarNoFundo(capasFundo[indiceFundo]);
  iniciarRotacaoFundo();
}

// API (fetch) 
async function requisicao(url, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch {
    throw new Error("Sem conexão com a API. Verifique a internet e a URL em API_URL.");
  }
  if (!resposta.ok) {
    const erro = new Error(
      resposta.status === 404 ? "Registro não encontrado." : `A API respondeu com erro (HTTP ${resposta.status}).`,
    );
    erro.status = resposta.status;
    throw erro;
  }
  return resposta.json();
}

const CABECALHO_JSON = { "Content-Type": "application/json" };

// GET geral 
async function listarJogos(genero) {
  if (!genero) return requisicao(API_URL);
  try {
    return await requisicao(`${API_URL}?genero=${encodeURIComponent(genero)}`);
  } catch (erro) {
    if (erro.status === 404) return [];
    throw erro;
  }
}

// GET por id
function buscarJogo(id) {
  return requisicao(`${API_URL}/${encodeURIComponent(id)}`);
}

// POST
function criarJogo(dados) {
  return requisicao(API_URL, { method: "POST", headers: CABECALHO_JSON, body: JSON.stringify(dados) });
}

// PUT
function atualizarJogo(id, dados) {
  return requisicao(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: CABECALHO_JSON,
    body: JSON.stringify(dados),
  });
}

// DELETE
function excluirJogo(id) {
  return requisicao(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

function linhaMensagem(texto, botao) {
  const celula = el("td", { class: "mensagem", colSpan: 7, text: texto });
  if (botao) celula.append(" ", botao);
  return el("tr", {}, celula);
}

function linhaJogo(jogo) {
  const temNota = jogo.nota !== null && jogo.nota !== undefined && jogo.nota !== "";
  const capa = urlValida(jogo.capa);

  const celulaNome = el("div", { class: "jogo-nome" });
  if (capa) {
    celulaNome.append(el("img", {
      class: "miniatura", src: capa, alt: "", loading: "lazy",
      onerror: (e) => e.target.remove(),
    }));
  }
  celulaNome.append(el("span", { text: jogo.nome }));

  const linha = el("tr", {},
    el("td", { "data-label": "Nome" }, celulaNome),
    el("td", { "data-label": "Gênero" }, el("span", { class: "selo", text: jogo.genero })),
    el("td", { "data-label": "Plataforma", text: jogo.plataforma }),
    el("td", { class: "num", "data-label": "Ano", text: jogo.anoLancamento }),
    el("td", { class: "num", "data-label": "Horas", text: formatarNumero(jogo.horasJogadas) }),
    el("td", { class: "num", "data-label": "Nota", text: temNota ? formatarNumero(jogo.nota, 1) : "—" }),
    el("td", { "data-label": "Ações" },
      el("div", { class: "acoes-linha" },
        el("button", {
          type: "button", class: "link", text: "Editar",
          "aria-label": `Editar ${jogo.nome}`,
          onclick: () => editarJogo(jogo.id),
        }),
        el("button", {
          type: "button", class: "link perigo", text: "Excluir",
          "aria-label": `Excluir ${jogo.nome}`,
          onclick: () => removerJogo(jogo.id, jogo.nome),
        }),
      ),
    ),
  );

  if (capa) {
    const destacar = () => { pararRotacaoFundo(); mostrarNoFundo(capa); };
    linha.addEventListener("mouseenter", destacar);
    linha.addEventListener("focusin", destacar);
    linha.addEventListener("mouseleave", iniciarRotacaoFundo);
    linha.addEventListener("focusout", iniciarRotacaoFundo);
  }
  return linha;
}

function atualizarResumo(lista) {
  const totalHoras = lista.reduce((soma, j) => soma + Number(j.horasJogadas || 0), 0);
  const notas = lista
    .filter((j) => j.nota !== null && j.nota !== undefined && j.nota !== "")
    .map((j) => Number(j.nota));
  const media = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null;

  $("ind-total").textContent = formatarNumero(lista.length);
  $("ind-horas").textContent = formatarNumero(totalHoras);
  $("ind-media").textContent = media === null ? "—" : formatarNumero(media, 1);
}

async function carregarJogos() {
  const genero = $("filtro-genero").value;
  tabela.replaceChildren(linhaMensagem("Carregando jogos…"));
  try {
    const jogos = await listarJogos(genero);
    if (jogos.length === 0) {
      tabela.replaceChildren(linhaMensagem(
        genero ? `Nenhum jogo de ${genero} cadastrado.` : "Nenhum jogo cadastrado ainda. Use o formulário para começar.",
      ));
    } else {
      tabela.replaceChildren(...jogos.map(linhaJogo));
    }
    atualizarResumo(jogos);
    atualizarFundo(jogos);
  } catch (erro) {
    tabela.replaceChildren(linhaMensagem(
      `Não foi possível carregar os jogos. ${erro.message}`,
      el("button", { type: "button", class: "link", text: "Tentar novamente", onclick: carregarJogos }),
    ));
    atualizarResumo([]);
  }
}

function lerFormulario() {
  const notaTexto = campos.nota.value.trim();
  return {
    nome: campos.nome.value.trim(),
    genero: campos.genero.value,
    plataforma: campos.plataforma.value,
    anoLancamento: Number(campos.anoLancamento.value),
    horasJogadas: Number(campos.horasJogadas.value),
    nota: notaTexto === "" ? null : Number(notaTexto),
    capa: campos.capa.value.trim(),
  };
}

function validar(dados) {
  const erros = [];

  if (!dados.nome) erros.push("Informe o nome do jogo.");
  if (!GENEROS.includes(dados.genero)) erros.push("Selecione um gênero.");
  if (!PLATAFORMAS.includes(dados.plataforma)) erros.push("Selecione uma plataforma.");

  if (campos.anoLancamento.value.trim() === "") {
    erros.push("Informe o ano de lançamento.");
  } else if (!Number.isInteger(dados.anoLancamento) || dados.anoLancamento < ANO_MINIMO || dados.anoLancamento > ANO_ATUAL) {
    erros.push(`O ano deve ser um número inteiro entre ${ANO_MINIMO} e ${ANO_ATUAL}.`);
  }

  if (campos.horasJogadas.value.trim() === "") {
    erros.push("Informe as horas jogadas.");
  } else if (!Number.isInteger(dados.horasJogadas) || dados.horasJogadas < 0) {
    erros.push("As horas jogadas devem ser um número inteiro, 0 ou mais.");
  }

  if (dados.nota !== null && (Number.isNaN(dados.nota) || dados.nota < 0 || dados.nota > 10)) {
    erros.push("A nota deve ser um número de 0 a 10.");
  }

  if (dados.capa && !urlValida(dados.capa)) {
    erros.push("A capa deve ser um link começando com http:// ou https://.");
  }

  return erros;
}

function mostrarErroFormulario(mensagens) {
  formErro.replaceChildren();
  if (mensagens.length === 1) {
    formErro.textContent = mensagens[0];
  } else {
    formErro.append(el("ul", {}, ...mensagens.map((m) => el("li", { text: m }))));
  }
  formErro.hidden = false;
}

function limparFormulario() {
  form.reset();
  campos.id.value = "";
  formErro.hidden = true;
  $("t-cadastro").textContent = "Cadastrar jogo";
  btnSalvar.textContent = "Cadastrar";
  btnCancelar.hidden = true;
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  formErro.hidden = true;

  const dados = lerFormulario();
  const erros = validar(dados);
  if (erros.length > 0) {
    mostrarErroFormulario(erros);
    return;
  }

  const id = campos.id.value;
  btnSalvar.disabled = true;
  try {
    if (id) {
      await atualizarJogo(id, dados);
      mostrarStatus(`"${dados.nome}" atualizado.`);
    } else {
      await criarJogo(dados);
      mostrarStatus(`"${dados.nome}" cadastrado.`);
    }
    limparFormulario();
    await carregarJogos();
  } catch (erro) {
    mostrarErroFormulario([`Não foi possível salvar. ${erro.message}`]);
  } finally {
    btnSalvar.disabled = false;
  }
});

btnCancelar.addEventListener("click", limparFormulario);

// ===== Editar: GET por id e preenche o formulário =====
async function editarJogo(id) {
  try {
    const jogo = await buscarJogo(id);
    limparFormulario();
    campos.id.value = jogo.id;
    campos.nome.value = jogo.nome ?? "";
    campos.genero.value = jogo.genero ?? "";
    campos.plataforma.value = jogo.plataforma ?? "";
    campos.anoLancamento.value = jogo.anoLancamento ?? "";
    campos.horasJogadas.value = jogo.horasJogadas ?? "";
    campos.nota.value = jogo.nota ?? "";
    campos.capa.value = jogo.capa ?? "";
    mostrarNoFundo(urlValida(jogo.capa));

    $("t-cadastro").textContent = "Editar jogo";
    btnSalvar.textContent = "Salvar alterações";
    btnCancelar.hidden = false;
    $("cadastro").scrollIntoView({ behavior: "smooth", block: "start" });
    campos.nome.focus({ preventScroll: true });
  } catch (erro) {
    mostrarStatus(`Não foi possível abrir o jogo para edição. ${erro.message}`, "erro");
  }
}

// ===== Excluir: DELETE =====
async function removerJogo(id, nome) {
  if (!confirm(`Excluir "${nome}"? Essa ação não pode ser desfeita.`)) return;
  try {
    await excluirJogo(id);
    if (campos.id.value === String(id)) limparFormulario();
    mostrarStatus(`"${nome}" excluído.`);
    await carregarJogos();
  } catch (erro) {
    mostrarStatus(`Não foi possível excluir. ${erro.message}`, "erro");
  }
}

// ===== Filtro por gênero (select + botão) =====
$("form-filtro").addEventListener("submit", (evento) => {
  evento.preventDefault();
  carregarJogos();
});

// ===== Início =====
// O HTML mantém o "required" nos campos; aqui desligamos os balões do navegador
// para mostrar as mensagens de validação próprias na tela.
form.noValidate = true;
campos.anoLancamento.max = ANO_ATUAL;
carregarJogos();

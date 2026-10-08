const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const vendas = [
  { vendedor: "João Silva", valor: 1200.50 },
  { vendedor: "João Silva", valor: 950.75 },
  { vendedor: "João Silva", valor: 1800.00 },
  { vendedor: "João Silva", valor: 1400.30 },
  { vendedor: "João Silva", valor: 1100.90 },
  { vendedor: "João Silva", valor: 1550.00 },
  { vendedor: "João Silva", valor: 1700.80 },
  { vendedor: "João Silva", valor: 250.30 },
  { vendedor: "João Silva", valor: 480.75 },
  { vendedor: "João Silva", valor: 320.40 },
  { vendedor: "Maria Souza", valor: 2100.40 },
  { vendedor: "Maria Souza", valor: 1350.60 },
  { vendedor: "Maria Souza", valor: 950.20 },
  { vendedor: "Maria Souza", valor: 1600.75 },
  { vendedor: "Maria Souza", valor: 1750.00 },
  { vendedor: "Maria Souza", valor: 1450.90 },
  { vendedor: "Maria Souza", valor: 400.50 },
  { vendedor: "Maria Souza", valor: 180.20 },
  { vendedor: "Maria Souza", valor: 90.75 },
  { vendedor: "Carlos Oliveira", valor: 800.50 },
  { vendedor: "Carlos Oliveira", valor: 1200.00 },
  { vendedor: "Carlos Oliveira", valor: 1950.30 },
  { vendedor: "Carlos Oliveira", valor: 1750.80 },
  { vendedor: "Carlos Oliveira", valor: 1300.60 },
  { vendedor: "Carlos Oliveira", valor: 300.40 },
  { vendedor: "Carlos Oliveira", valor: 500.00 },
  { vendedor: "Carlos Oliveira", valor: 125.75 },
  { vendedor: "Ana Lima", valor: 1000.00 },
  { vendedor: "Ana Lima", valor: 1100.50 },
  { vendedor: "Ana Lima", valor: 1250.75 },
  { vendedor: "Ana Lima", valor: 1400.20 },
  { vendedor: "Ana Lima", valor: 1550.90 },
  { vendedor: "Ana Lima", valor: 1650.00 },
  { vendedor: "Ana Lima", valor: 75.30 },
  { vendedor: "Ana Lima", valor: 420.90 },
  { vendedor: "Ana Lima", valor: 315.40 },
];

const produtos = [
  { codigoProduto: 101, descricaoProduto: "Caneta Azul", estoque: 150 },
  { codigoProduto: 102, descricaoProduto: "Caderno Universitário", estoque: 75 },
  { codigoProduto: 103, descricaoProduto: "Borracha Branca", estoque: 200 },
  { codigoProduto: 104, descricaoProduto: "Lápis Preto HB", estoque: 320 },
  { codigoProduto: 105, descricaoProduto: "Marcador de Texto Amarelo", estoque: 90 },
];

const movimentacoes = [];
const rl = readline.createInterface({ input, output });
const formatarMoeda = (centavos) =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function perguntar(texto) {
  return (await rl.question(texto)).trim();
}

async function perguntarInteiroPositivo(texto) {
  while (true) {
    const valor = Number(await perguntar(texto));
    if (Number.isSafeInteger(valor) && valor > 0) return valor;
    console.log("Informe um número inteiro maior que zero.");
  }
}

function converterParaCentavos(texto) {
  const entrada = texto.replace(/^R\$\s*/i, "").trim();
  const normalizado = entrada.includes(",")
    ? entrada.replace(/\./g, "").replace(",", ".")
    : entrada;
  const valor = Number(normalizado);
  if (!Number.isFinite(valor) || valor < 0) return null;
  return Math.round(valor * 100);
}

async function perguntarValor(texto) {
  while (true) {
    const centavos = converterParaCentavos(await perguntar(texto));
    if (centavos !== null) return centavos;
    console.log("Informe um valor válido e não negativo (ex.: 1250,50).");
  }
}

function calcularComissoes() {
  const totalPorVendedor = new Map();

  for (const venda of vendas) {
    const valorCentavos = Math.round(venda.valor * 100);
    let comissaoCentavos = 0;

    if (valorCentavos >= 50000) {
      comissaoCentavos = Math.round(valorCentavos * 0.05);
    } else if (valorCentavos >= 10000) {
      comissaoCentavos = Math.round(valorCentavos * 0.01);
    }

    totalPorVendedor.set(
      venda.vendedor,
      (totalPorVendedor.get(venda.vendedor) || 0) + comissaoCentavos,
    );
  }

  console.log("\nComissão total por vendedor:");
  for (const [vendedor, comissao] of totalPorVendedor) {
    console.log(`${vendedor}: ${formatarMoeda(comissao)}`);
  }
}

async function movimentarEstoque() {
  console.log("\nEstoque atual:");
  for (const produto of produtos) {
    console.log(
      `${produto.codigoProduto} - ${produto.descricaoProduto}: ${produto.estoque} unidades`,
    );
  }

  const codigo = Number(await perguntar("\nCódigo do produto: "));
  const produto = produtos.find((item) => item.codigoProduto === codigo);
  if (!produto) {
    console.log("Produto não encontrado.");
    return;
  }

  const tipo = (await perguntar("Tipo da movimentação (entrada/saida): ")).toLowerCase();
  if (tipo !== "entrada" && tipo !== "saida" && tipo !== "saída") {
    console.log("Tipo inválido. Informe entrada ou saída.");
    return;
  }

  const descricao = await perguntar("Descrição da movimentação: ");
  if (!descricao) {
    console.log("A descrição é obrigatória.");
    return;
  }

  const quantidade = await perguntarInteiroPositivo("Quantidade: ");
  const saida = tipo === "saida" || tipo === "saída";
  if (saida && quantidade > produto.estoque) {
    console.log(`Estoque insuficiente. Disponível: ${produto.estoque} unidades.`);
    return;
  }

  produto.estoque += saida ? -quantidade : quantidade;
  const idMovimentacao = proximoIdMovimentacao++;
  movimentacoes.push({
    id: idMovimentacao,
    descricao,
    tipo: saida ? "saída" : "entrada",
    codigoProduto: produto.codigoProduto,
    quantidade,
  });

  console.log(`\nMovimentação #${idMovimentacao} registrada.`);
  console.log(`Descrição: ${descricao}`);
  console.log(`${produto.descricaoProduto} - estoque final: ${produto.estoque} unidades.`);
}

function converterData(dataTexto) {
  const correspondencia = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataTexto);
  if (!correspondencia) return null;

  const dia = Number(correspondencia[1]);
  const mes = Number(correspondencia[2]);
  const ano = Number(correspondencia[3]);
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return null;
  }
  return data;
}

async function calcularJurosAtraso() {
  const valorCentavos = await perguntarValor("Valor original da dívida (ex.: 1200,50): ");
  let vencimento;
  while (!vencimento) {
    vencimento = converterData(await perguntar("Data de vencimento (DD/MM/AAAA): "));
    if (!vencimento) console.log("Data inválida. Use o formato DD/MM/AAAA.");
  }

  const hoje = new Date();
  const hojeUtc = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const diasAtraso = Math.max(0, Math.floor((hojeUtc - vencimento.getTime()) / 86400000));
  const jurosCentavos = Math.round(valorCentavos * 0.025 * diasAtraso);

  console.log(`\nDias de atraso: ${diasAtraso}`);
  console.log(`Juros/multa: ${formatarMoeda(jurosCentavos)}`);
  console.log(`Total atualizado: ${formatarMoeda(valorCentavos + jurosCentavos)}`);
}

let proximoIdMovimentacao = 1;

async function executar() {
  try {
    while (true) {
      console.log("\n=== Menu ===");
      console.log("1 - Calcular comissões");
      console.log("2 - Movimentar estoque");
      console.log("3 - Calcular juros por atraso");
      console.log("0 - Sair");

      const opcao = await perguntar("Escolha uma opção: ");
      if (opcao === "1") calcularComissoes();
      else if (opcao === "2") await movimentarEstoque();
      else if (opcao === "3") await calcularJurosAtraso();
      else if (opcao === "0") break;
      else console.log("Opção inválida.");
    }
  } finally {
    rl.close();
  }
}

executar().catch((erro) => {
  console.error("Erro ao executar o programa:", erro);
  process.exitCode = 1;
});

mapboxgl.accessToken =
  "pk.eyJ1IjoidGlhZ29tYnAiLCJhIjoiY2thdjJmajYzMHR1YzJ5b2huM2pscjdreCJ9.oT7nAiasQnIMjhUB-VFvmw";

let pto_origem, pto_destino;
let salarioGlobal,
  impactoSalarialGlobal = null;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-35.733926, -9.647684],
  zoom: 8,
});

const geocoder_origem = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  placeholder: "Endereço de origem",
  mapboxgl: mapboxgl,
  bbox: [-73.9872354804, -33.7683777809, -34.7299934555, 5.24448639569],
});

const geocoder_destino = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  placeholder: "Endereço de destino",
  mapboxgl: mapboxgl,
  bbox: [-73.9872354804, -33.7683777809, -34.7299934555, 5.24448639569],
});

map.addControl(geocoder_origem, "top-left");
map.addControl(geocoder_destino, "top-left");

geocoder_origem.on("result", (e) => {
  pto_origem = e.result.center;
});

geocoder_destino.on("result", (e) => {
  pto_destino = e.result.center;
});

function format_pct(n) {
  if (n == null) return 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function format(n) {
  if (n == null) return 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

let selectElement = document.getElementById("opcoes");
let cidadeElement = document.getElementById("cidade");
const resultadoElement = document.getElementById("resultado");
let custoOnibus = 3.49;

cidadeElement.addEventListener("change", definirCustoOnibus);
selectElement.addEventListener("change", mostrarOpcoes);

function definirCustoOnibus() {
  let cidadeSelecionada = cidadeElement.value;

  let centro_mapa = [-35.733926, -9.647684];

  switch (cidadeSelecionada) {
    case "maceio":
      centro_mapa = [-35.733926, -9.647684];
      custoOnibus = 3.49; // Custo para Maceió (AL)
      break;
    case "salvador":
      centro_mapa = [-38.481277, -12.98225];
      custoOnibus = 4.9; // Custo para Salvador (BA)
      break;
    case "aracaju":
      centro_mapa = [-37.077466, -10.916206];
      custoOnibus = 4.5; // Custo para Aracaju (SE)
      break;
    case "recife":
      centro_mapa = [-34.884819, -8.058493];
      custoOnibus = 4.1; // Custo para Recife (PE)
      break;
    case "natal":
      centro_mapa = [-35.208091, -5.805398];
      custoOnibus = 3.9; // Custo para Natal (RN)
      break;
    case "joao-pessoa":
      centro_mapa = [-34.882028, -7.121598];
      custoOnibus = 4.7; // Custo para João Pessoa (PB)
      break;
    case "teresina":
      centro_mapa = [-42.809588, -5.08964];
      custoOnibus = 4; // Custo para Teresina (PI)
      break;
    case "fortaleza":
      centro_mapa = [-38.521799, -3.730451];
      custoOnibus = 4.5; // Custo para Fortaleza (CE)
      break;
    case "sao-luis":
      centro_mapa = [-44.244872, -2.56346];
      custoOnibus = 4.2; // Custo para São Luís (MA)
      break;
  }

  // faz o mapa voar até a cidade selecionada;
  map.flyTo({
    center: centro_mapa,
    zoom: 9,
    speed: 1,
  });
}

let distancia;

function atualizarGrafico() {
  criarGrafico(salarioGlobal, impactoSalarialGlobal);
}
async function calcularImpactoSalarial() {
  console.log("Função calcularImpactoSalarial sendo chamada...");
  const instrucaoElement = document.getElementById("instrucao");
  instrucaoElement.style.display = "none";

  let opcaoSelecionada = selectElement.value;
  let custoTotal;

  //carros
  if (opcaoSelecionada === "carromais" || opcaoSelecionada === "carromenos") {
    let distancia = (await calcularDistancia()) / 1000;

    if (opcaoSelecionada === "carromais") {
      var consumoVeiculo = 15;
      var precoCombustivel = parseFloat(
        document.getElementById("combustivel").value
      );
      var depreciacaoVeiculo = (1500 / 21) * (distancia / 1000);
      var ct =
        ((distancia / consumoVeiculo) * precoCombustivel + depreciacaoVeiculo) *
        2 *
        21;
    } else if (opcaoSelecionada === "carromenos") {
      var consumoVeiculo = 9;
      var precoCombustivel = parseFloat(
        document.getElementById("combustivel").value
      );
      var depreciacaoVeiculo = (1500 / 21) * (distancia / 1000);
      var ct =
        ((distancia / consumoVeiculo) * precoCombustivel + depreciacaoVeiculo) *
        2 *
        21;
    }

    // onibus
  } else if (opcaoSelecionada === "onibus-gratuidade") {
    // Se for ônibus com gratuidade, o custo total é zero
    ct = 0;
  } else if (opcaoSelecionada === "onibus-meia") {
    var quantidadePassagens = parseInt(
      document.getElementById("passagens-gratuidade").value
    );
    ct = (custoOnibus / 2) * quantidadePassagens; // Meia passagem
  } else if (opcaoSelecionada === "onibus") {
    var quantidadePassagens = parseInt(
      document.getElementById("passagens-gratuidade").value
    );
    ct = custoOnibus * quantidadePassagens; // Passagem inteira

    //uber
  } else if (opcaoSelecionada === "uber") {
    let distancia = (await calcularDistancia()) / 1000;

    // Se a opção for "uber", calcula o custo com base na distância
    ct = calcula_valor_uber(distancia) * 2;
  }

  var salarioElement = document.getElementById("salario");
  var salario = parseFloat(salarioElement.value);

  var custo = ct * 21;
  var impactoSalarial = custo / salario;

  salarioGlobal = parseFloat(salarioElement.value);
  impactoSalarialGlobal = isNaN(impactoSalarial) ? null : impactoSalarial;

  console.log("Salário Global:", salarioGlobal);
  console.log("Impacto Salarial Global:", impactoSalarialGlobal);

  resultadoElement.textContent = isNaN(impactoSalarial)
    ? "Não foi possível calcular. Por favor, confira as informações inseridas."
    : "Por mês, o custo do seu deslocamento é de R$ " +
      format(custo) +
      " e tem o impacto de " +
      format_pct(impactoSalarial) +
      " no seu salário.";
  atualizarGrafico();

  criarGrafico(salarioGlobal, impactoSalarialGlobal);
}
async function calcularDistancia() {
  const apiGeocode = "https://api.openrouteservice.org/geocode/search";
  const apiDirections =
    "https://api.openrouteservice.org/v2/directions/driving-car";
  const apiKey = "5b3ce3597851110001cf62482d3588894c554675a511dbec551d4cca";

  if (!pto_destino || !pto_origem) {
    console.log("preencher endereços");
    return 0;
  }

  const start = `${pto_origem[0]},${pto_origem[1]}`;
  const end = `${pto_destino[0]},${pto_destino[1]}`;
  const url = `${apiDirections}?api_key=${apiKey}&start=${start}&end=${end}`;

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    const distance = dados.features[0].properties.segments[0].distance;
    console.log(distance);

    return distance;
  } catch (error) {
    console.error("Erro ao calcular a distância: ", error);
    return 0;
  }
}

function mostrarOpcoes() {
  let opcaoSelecionadaInput = selectElement.value;

  console.log("Opcao selecionada: " + opcaoSelecionadaInput);

  // Modifique esta linha para exibir a frase quando a opção incluir "onibus"
  if (!opcaoSelecionadaInput.includes("onibus")) {
    // O código dentro deste bloco será executado apenas se "onibus" não estiver incluído na opção selecionada
    document.getElementById("instrucao").style.display = "block";
  } else {
    document.getElementById("instrucao").style.display = "none";
  }

  document.querySelector("#opcao-combustivel").style.display = "none";
  document.querySelector("#opcoes-onibus-gratuidade").style.display = "none";
  document.querySelector("#opcoes-uber").style.display = "none";

  if (
    opcaoSelecionadaInput == "onibus-gratuidade" ||
    opcaoSelecionadaInput == "onibus-meia" ||
    opcaoSelecionadaInput == "onibus"
  ) {
    document.querySelector("#opcoes-onibus-gratuidade").style.display = "block";
    console.log("aqui");
    document.querySelector(".map-container").style.display = "none";
  } else if (opcaoSelecionadaInput == "uber") {
    document.querySelector(".map-container").style.display = "block";
  } else if (opcaoSelecionadaInput === "uber") {
    var taxaUber = 0;
    custoTotal = calcularCustoUber(distancia, taxaUber);
    document.querySelector(".map-container").style.display = "block";
  } else {
    document.querySelector("#opcao-combustivel").style.display = "block";
    document.querySelector(".map-container").style.display = "block";
  }
}

function calcularCustoUber(distancia, taxaUber) {
  return distancia * taxaUber;
}

function encontrar_mais_proximo(lista, x) {
  if (lista.length === 0) return null; // Retorna null se o array estiver vazio

  let maisProximo = lista[0];
  let menorDiferenca = Math.abs(x - maisProximo.km);

  lista.forEach((obj) => {
    let diferenca = Math.abs(x - obj.km);
    if (diferenca < menorDiferenca) {
      maisProximo = obj;
      menorDiferenca = diferenca;
    }
  });

  return maisProximo;
}
function calcula_valor_uber(distancia) {
  let faixas_uber = [
    {
      km: 65,
      valor: 89,
    },
    {
      km: 60,
      valor: 82,
    },
    {
      km: 55,
      valor: 75,
    },
    {
      km: 50,
      valor: 70,
    },
    {
      km: 45,
      valor: 60,
    },
    {
      km: 40,
      valor: 55,
    },
    {
      km: 35,
      valor: 52,
    },
    {
      km: 30,
      valor: 45,
    },
    {
      km: 23,
      valor: 35,
    },
    {
      km: 20,
      valor: 30,
    },
    {
      km: 15,
      valor: 25,
    },
    {
      km: 13,
      valor: 23,
    },
    {
      km: 10,
      valor: 20,
    },
    {
      km: 8,
      valor: 19,
    },
    {
      km: 6,
      valor: 15,
    },
    {
      km: 5,
      valor: 14,
    },
    {
      km: 2,
      valor: 10,
    },
    {
      km: 1,
      valor: 8,
    },
  ];

  let faixa = encontrar_mais_proximo(faixas_uber, distancia);
  console.log(distancia, faixa);

  // Se a faixa foi encontrada, calcular a taxa com base no valor da faixa
  if (faixa) {
    return faixa.valor;
  } else {
    // Caso a faixa não seja encontrada, retorna 0 ou outro valor padrão
    return 0;
  }
}

console.log(calcula_valor_uber(3));

function criarGrafico(salario, impactoSalarial) {
  const ctx = document.getElementById("grafico").getContext("2d");

  // Função para formatar os rótulos do eixo Y
  const formatarPercentual = (value) => {
    return value.toFixed(2) + "%";
  };

  const data = {
    labels: ["Salário"],
    datasets: [
      {
        label: "Impacto Salarial",
        data: [impactoSalarial * 100], // Convertido para porcentagem
        backgroundColor: "#dce731",
        borderWidth: 1,
      },
      {
        label: "Resto do Salário",
        data: [(1 - impactoSalarial) * 100], // O restante do salário
        backgroundColor: "#890ab2",
        borderWidth: 1,
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      indexAxis: "y",

      plugins: {
        title: {
          display: true,
          text: "Veja o impacto do transporte escolhido no seu salário",
        },
      },
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          // Adiciona a opção para formatar os rótulos do eixo Y
          ticks: {
            callback: function (value) {
              return value.toFixed(2) + "%";
            },
          },
        },
      },
    },
  };

  new Chart(ctx, config);
}

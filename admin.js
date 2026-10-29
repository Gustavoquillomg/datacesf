
import { db, auth, firebaseConfigurado } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const loginPanel = document.querySelector("#login-panel");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const dashboardMessage = document.querySelector("#dashboard-message");

const graficos = {};

function mostrarMensagem(elemento, texto, tipo = "") {
  elemento.textContent = texto;
  elemento.className = `message ${tipo}`;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!firebaseConfigurado) {
    mostrarMensagem(
      loginMessage,
      "Configure o Firebase no arquivo firebase.js.",
      "error"
    );
    return;
  }

  const email = document.querySelector("#admin-email").value.trim();
  const senha = document.querySelector("#admin-password").value;
  const botao = loginForm.querySelector("button");

  botao.disabled = true;
  mostrarMensagem(loginMessage, "Verificando acesso...");

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (erro) {
    console.error("Erro no login:", erro);

    mostrarMensagem(
      loginMessage,
      "Não foi possível entrar. Confira o e-mail e a senha.",
      "error"
    );
  } finally {
    botao.disabled = false;
  }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (erro) {
    console.error("Erro ao sair:", erro);

    mostrarMensagem(
      dashboardMessage,
      "Não foi possível sair da conta.",
      "error"
    );
  }
});

document.querySelector("#refresh-button").addEventListener(
  "click",
  carregarPainel
);

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    loginPanel.hidden = false;
    dashboard.hidden = true;
    return;
  }

  loginPanel.hidden = true;
  dashboard.hidden = false;

  await carregarPainel();
});

function contarValores(respostas, campo) {
  const contagem = {};

  respostas.forEach((resposta) => {
    const valor = resposta[campo] || "Não informado";
    contagem[valor] = (contagem[valor] || 0) + 1;
  });

  return contagem;
}

function criarGrafico(id, tipo, dados) {
  const canvas = document.getElementById(id);

  if (!canvas) return;

  if (graficos[id]) {
    graficos[id].destroy();
  }

  graficos[id] = new Chart(canvas, {
    type: tipo,
    data: {
      labels: Object.keys(dados),
      datasets: [{
        label: "Número de respostas",
        data: Object.values(dados),
        backgroundColor: [
          "#315da8",
          "#6d91e7",
          "#9bb5f2",
          "#24477f",
          "#77b9d0",
          "#8bd5c4",
          "#f1c875",
          "#e79b81",
          "#a6acc7"
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
        borderRadius: tipo === "bar" ? 5 : 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: tipo === "doughnut",
          position: "bottom"
        }
      },
      scales: tipo === "bar" ? {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      } : {}
    }
  });
}

async function carregarPainel() {
  if (!auth.currentUser) return;

  const botao = document.querySelector("#refresh-button");
  botao.disabled = true;

  mostrarMensagem(dashboardMessage, "Carregando dados...");

  try {
    const consulta = query(
      collection(db, "datavoto_cesf_respostas"),
      orderBy("criadoEm", "desc")
    );

    const resultado = await getDocs(consulta);

    const respostas = resultado.docs.map(
      (documento) => documento.data()
    );

    const total = respostas.length;

    const somaMoradores = respostas.reduce(
      (soma, resposta) => soma + Number(resposta.moradores || 0),
      0
    );

    const somaTrabalhadores = respostas.reduce(
      (soma, resposta) => soma + Number(resposta.trabalhadores || 0),
      0
    );

    const mediaMoradores = total ? somaMoradores / total : 0;
    const mediaTrabalhadores = total ? somaTrabalhadores / total : 0;

    document.querySelector("#total-respostas").textContent = total;

    document.querySelector("#media-moradores").textContent =
      mediaMoradores.toLocaleString("pt-BR", {
        maximumFractionDigits: 1
      });

    document.querySelector("#media-trabalhadores").textContent =
      mediaTrabalhadores.toLocaleString("pt-BR", {
        maximumFractionDigits: 1
      });

    criarGrafico(
      "idade-chart",
      "bar",
      contarValores(respostas, "faixaEtaria")
    );

    criarGrafico(
      "rotina-chart",
      "doughnut",
      contarValores(respostas, "rotina")
    );

    criarGrafico(
      "pautas-chart",
      "bar",
      contarValores(respostas, "prioridade")
    );

    criarGrafico(
      "voto-chart",
      "doughnut",
      contarValores(respostas, "certezaVoto")
    );

    mostrarMensagem(
      dashboardMessage,
      total
        ? "Dados carregados com sucesso."
        : "Ainda não existem respostas registradas.",
      total ? "success" : ""
    );
  } catch (erro) {
    console.error("Erro ao consultar Firestore:", erro);

    mostrarMensagem(
      dashboardMessage,
      "Erro ao consultar os dados. Verifique a conexão e as regras do Firestore.",
      "error"
    );
  } finally {
    botao.disabled = false;
  }
}

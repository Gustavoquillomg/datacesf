
import { db, firebaseConfigurado } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const form = document.querySelector("#survey-form");
const message = document.querySelector("#form-message");
const button = document.querySelector("#submit-button");

function mostrarMensagem(texto, tipo = "") {
  message.textContent = texto;
  message.className = `message ${tipo}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  if (!firebaseConfigurado) {
    mostrarMensagem(
      "Configure os dados do Firebase no arquivo firebase.js.",
      "error"
    );
    return;
  }

  const moradores = Number(form.moradores.value);
  const trabalhadores = Number(form.trabalhadores.value);

  if (
    !Number.isInteger(moradores) ||
    moradores < 1 ||
    moradores > 30
  ) {
    mostrarMensagem("Informe de 1 a 30 moradores.", "error");
    return;
  }

  if (
    !Number.isInteger(trabalhadores) ||
    trabalhadores < 0 ||
    trabalhadores > moradores
  ) {
    mostrarMensagem(
      "O número de trabalhadores deve estar entre zero e o total de moradores.",
      "error"
    );
    return;
  }

  const consentimento = form.querySelector(
    'input[type="checkbox"][required]'
  );

  if (!consentimento || !consentimento.checked) {
    mostrarMensagem(
      "Confirme o consentimento para continuar.",
      "error"
    );
    return;
  }

  const respostas = {
    faixaEtaria: form.faixaEtaria.value,
    bairro: form.bairro.value.trim(),
    rotina: form.rotina.value,
    rendaFamiliar: form.rendaFamiliar.value,
    moradores: moradores,
    trabalhadores: trabalhadores,
    certezaVoto: form.certezaVoto.value,

    // Nomes compatíveis com as regras do Firestore
    prioridade: form.pauta.value,
    outraPrioridade: form.outraPauta.value.trim(),
    consentimento: true,

    criadoEm: serverTimestamp()
  };

  button.disabled = true;
  button.textContent = "Enviando...";
  mostrarMensagem();

  try {
    await addDoc(
      collection(db, "datavoto_cesf_respostas"),
      respostas
    );

    form.reset();

    mostrarMensagem(
      "Resposta enviada com sucesso. Obrigado por participar!",
      "success"
    );
  } catch (erro) {
    console.error("Erro ao gravar:", erro);

    mostrarMensagem(
      `Falha ao enviar: ${erro.code || erro.message}`,
      "error"
    );
  } finally {
    button.disabled = false;
    button.textContent = "Enviar minhas respostas →";
  }
});

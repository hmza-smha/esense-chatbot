function showChatBotTostr(type, message) {
  const cbtoastContainer = document.createElement("div");
  var chatcontainer = document.getElementById("leftchatbox");
  cbtoastContainer.className = "cbtoast-container ";
  const cbtoast = document.createElement("div");
  cbtoast.classList.add("cbtoast", type);
  cbtoast.innerHTML = `${message} <span class="close-btn" onclick="closeChatBotTostr(this)">×</span>`;
  chatcontainer.appendChild(cbtoastContainer);
  cbtoastContainer.appendChild(cbtoast);
  setTimeout(() => {
    cbtoast.classList.add("show");
  }, 10);
}

function closeChatBotTostr(closeButton) {
  document.querySelectorAll(".cbtoast-container").forEach(function (cbtoast) {
    cbtoast.remove();
  });
}

const packageBoxes = document.querySelectorAll(".package-box");
const qrContainer = document.getElementById("qr-code");
const invalidMessage = document.getElementById("invalid-message");
const selectedInfo = document.getElementById("selectedInfo");
const startPaymentButton = document.getElementById("startPaymentButton");
const userIdInput = document.getElementById("userId");
const serverIdInput = document.getElementById("serverId");

let selectedPrice = null;
let selectedDataItem = null;
let isUserValid = false;

packageBoxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (isUserValid) {
      packageBoxes.forEach((otherBox) => otherBox.classList.remove("selected"));
      box.classList.add("selected");
      selectedPrice = box.getAttribute("data-price");
      selectedDataItem = box.getAttribute("data-item");
      selectedInfo.innerHTML = `Price / តម្លៃ $${selectedPrice}  ចំនួន ${selectedDataItem}💎`;
      selectedInfo1.innerHTML = `PAY NOW : ${selectedPrice} $ `;
      enablePaymentButton();
    }
  });
});

function enablePaymentButton() {
  startPaymentButton.disabled = false;
}

function disablePaymentButton() {
  startPaymentButton.disabled = true;
}

function startPayment() {
  if (isUserValid && selectedPrice !== null) {
    const denom = selectedDataItem;
    postApiRequest(selectedPrice, denom);
  } else {
    invalidMessage.innerHTML = "Please select a Package / Before Click Payment";
  }
}

function postApiRequest(amount_usd, denom) {
  const postData = {
    amount_usd: amount_usd,
    bakongid: "gusion_mlbb@aclb", //panhastore_game@aclb
    store_name: "H Store",
  };
  fetch("https://bakong-endpoiny.ngrok.app/run_js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const md5 = data.md5;
      checkPaymentStatus(md5);
      openModal(
        data.qr_string,
        md5,
        userIdInput.value,
        serverIdInput.value,
        denom
      );
    })
    .catch((error) => {
      invalidMessage.innerHTML = "Invalid QR Code";
      console.error("Error:", error);
    });
}

function checkPaymentStatus(md5) {
  const url = "https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5";
  const body = {
    md5: md5,
  };

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"; // Replace with your valid token
  const header = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Define the function to handle the response
  const handleResponse = (response) => {
    console.log(response.status);
    return response.json(); // Return the JSON-parsed response
  };

  // Define the function to process the JSON response
  const processJsonResponse = (jsonData) => {
    console.log(jsonData);

    // Check if the response contains a redirect link
    if (jsonData.responseCode === 0 && jsonData.data && jsonData.data.hash) {
      const redirectLink = "thank-for-buy.html"; // Replace with the actual redirect link
      console.log("Redirecting to:", redirectLink);
      window.location.href = redirectLink; // Redirect the user
    } else {
      // Process the response data as needed
    }
  };

  // Define the function to handle errors
  const handleError = (error) => {
    console.error("Error:", error);
  };

  // Set up interval for auto-check every 2 seconds
  const intervalId = setInterval(() => {
    fetch(url, {
      method: "POST",
      headers: header,
      body: JSON.stringify(body),
    })
      .then(handleResponse)
      .then(processJsonResponse)
      .catch(handleError);
  }, 2000);

  // Stop the interval after a certain duration (e.g., 10 seconds)
  setTimeout(() => {
    clearInterval(intervalId);
  }, 1000000); // Adjust duration as needed
}

// Example usage:
// checkPaymentStatus("your_md5_here");

function openModal(qrString, md5, userId, serverId, denom) {
  const modal = document.getElementById("myModal");
  modal.style.display = "flex";

  const qrCodeContainer = document.getElementById("qr-code-container-popup");
  qrCodeContainer.innerHTML = "";

  const telegramBotToken = "";
  const telegramChatId = "-1001995355870";

  const telegramMessage = `ការបញ្ជាទិញថ្មី  / New Order 📥 \n\nUserid : ${userId} \n\nZoneid : ${serverId} \n\nDiamond / កញ្ចប់: ${denom}  \n\nPrice / តម្លៃ : ${selectedPrice} \n\nGame : Mobile Legends: Bang Bang \n\nStatus ស្ថានភាព : កំពុងដំណើរការ⌛️ \n\nFrom មកពី : Panha.store \n\nMD5 = ${md5}`;
  sendTelegramMessage(telegramBotToken, telegramChatId, telegramMessage);

  const qrCode = new QRCode("qrcode", {
    text: qrString,
    width: 120,
    height: 120,
  });
}

function sendTelegramMessage(botToken, chatId, message) {
  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  fetch(telegramApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Telegram message sent successfully:", data);
    })
    .catch((error) => {
      console.error("Error sending Telegram message:", error);
    });
}

function closeModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "none";
}

window.onclick = function (event) {
  const closeButton = document.querySelector(".close");
  const modal = document.getElementById("myModal");
  if (event.target === closeButton) {
    modal.style.display = "none";
  }
};

function checkApi() {
  const userId = userIdInput.value;
  const serverId = serverIdInput.value;

  const url = "https://api.elitedias.com/checkid";
  const headers = {
    Origin: "dev.api.elitedias.com",
  };
  const payload = {
    userid: userId,
    serverid: serverId,
    game: "mlbb",
  };

  $.ajax({
    type: "POST",
    url: url,
    headers: headers,
    data: JSON.stringify(payload),
    contentType: "application/json",
    timeout: 60000,
    success: function (response) {
      if (response.valid === "valid") {
        isUserValid = true;
        invalidMessage.textContent = response.name
          ? `Name: ${response.name}`
          : "Valid ID, but name not provided.";
        enablePaymentButton();
      } else if (response.valid === "invalid") {
        isUserValid = false;
        invalidMessage.textContent = "Invalid ID. Please Check Again.";
        disablePaymentButton();
      } else {
        isUserValid = false;
        invalidMessage.textContent = "Unexpected response.";
        disablePaymentButton();
      }
    },
    error: function (error) {
      isUserValid = false;
      invalidMessage.textContent = "Error: " + JSON.stringify(error);
      disablePaymentButton();
    },
  });
}

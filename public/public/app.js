function convertMoney() {
  const amount = document.getElementById("amount").value;
  const rate = 2000; // example rate (change later)
  const result = amount * rate;

  document.getElementById("result").innerHTML =
    "You will receive: ₦" + result.toLocaleString();
}

function login() {
  const name = document.getElementById("name").value;
  const code = document.getElementById("code").value;

  const lowerName = name.toLowerCase();
  const lowerCode = code.toLowerCase();

  // ❌ 1. Naam is NIET Glory of Imane → SUS PAGE
  if (lowerName !== "glory" && lowerName !== "imane") {
    window.location.href = "sus.html";
    return;
  }

  // ✅ 2. Het juiste wachtwoord is ingevuld (Wie is het kleinste? -> Imane)
  if (lowerCode === "imane") {
    window.location.href = "messages/messages.html";
  } 
  // 😂 3. Glory probeert te liegen en zegt dat zij de kleinste is
  else if (lowerCode === "glory") {
    alert("Be fr wifey 😭");
  } 
  // 🕵️‍♂️ 4. Er is iets heel anders ingevuld
  else {
    alert(`Sooooo... who is ${code} 🕵🏻‍♂️🤨?????`);
  }
}

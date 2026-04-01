function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("active");
  }
  
  const envelope = document.getElementById('envelope');
  const modalOverlay = document.getElementById('modalOverlay');
  const flipCard = document.getElementById('flipCard');
  const bgMusic = document.getElementById('bgMusic');
  const mainInstruction = document.getElementById('mainInstruction');
  
  // Klikken op de envelop
  envelope.addEventListener('click', () => {
    envelope.classList.add('open');
    bgMusic.play().catch(e => console.log("Audio geblokkeerd"));
  
    setTimeout(() => {
      modalOverlay.classList.add('show');
      mainInstruction.innerText = "Klik op de brief om hem om te draaien...";
    }, 400);
  });
  
  // Omdraai-logica voor de brief
  flipCard.addEventListener('click', (e) => {
    flipCard.classList.toggle('flipped');
  });
  
  // Klikken buiten de kaart om alles weer te sluiten
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('show');
      setTimeout(() => {
        flipCard.classList.remove('flipped');
        envelope.classList.remove('open');
        mainInstruction.innerText = "Klik op de envelop om hem te openen...";
      }, 400);
    }
  });
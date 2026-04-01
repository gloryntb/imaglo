// Jouw web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxmmWATHbvmz800u56ZX_zaXU-AxIjAM4",
  authDomain: "loveline-cc923.firebaseapp.com",
  projectId: "loveline-cc923",
  storageBucket: "loveline-cc923.firebasestorage.app",
  messagingSenderId: "840718452710",
  appId: "1:840718452710:web:4f9cef08a4d060e803b827",
  databaseURL: "https://loveline-cc923-default-rtdb.firebaseio.com" // 👈 Deze heb ik voor je toegevoegd!
};

// Initialize Firebase op de klassieke manier
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Wie is er ingelogd? (We halen dit straks van het kladblokje)
const userId = localStorage.getItem("loggedInUser") || "gast";


// ==========================
// 🎁 REWARDS SYSTEM
// ==========================
const rewardsList = [
  { name: "Superhero Ticket", image: "pic/superhero_ticket.png", code: 'SUPERHERO_TICKET0326' },
  { name: "Bluey", image: "pic/bluey.png", code: 'BLUEY_KNUFFEL0326' },
  { name: "Ice Cream Ticket", image: "pic/Ice_Ticket.png", code: 'ICE_ICE_BABY0326' }
];
  
function getCurrentMonth() {
  const now = new Date();
  return now.getFullYear() + "-" + (now.getMonth() + 1);
}
  
function getRewardData() {
  const data = JSON.parse(localStorage.getItem("rewards"));
  
  if (!data || data.month !== getCurrentMonth()) {
    const newData = {
      month: getCurrentMonth(),
      index: 0
    };
    localStorage.setItem("rewards", JSON.stringify(newData));
    return newData;
  }
  
  return data;
}
  
// ==========================
// 🎯 ATTEMPTS SYSTEM
// ==========================
const MAX_ATTEMPTS = 5;
  
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}
  
function getAttemptsData() {
  const savedData = localStorage.getItem("attempts");
  const data = savedData ? JSON.parse(savedData) : null;
    
  if (data && data.date === getTodayDate()) {
    return data;
  }
    
  const newData = {
    date: getTodayDate(),
    attempts: MAX_ATTEMPTS
  };
  localStorage.setItem("attempts", JSON.stringify(newData));
  return newData;
}
  
function decreaseAttempt() {
  const savedData = localStorage.getItem("attempts");
  let data = savedData ? JSON.parse(savedData) : { attempts: 5 };
    
  if (data.attempts > 0) {
    data.attempts -= 1;
  }
    
  if (data.attempts === 0 && !data.lockoutTime) {
    data.lockoutTime = new Date().getTime();
  }
    
  data.date = getTodayDate(); 
    
  localStorage.setItem("attempts", JSON.stringify(data));
  console.log("Poging eraf! Nieuwe stand in kluis:", data.attempts);
}
  
// ==========================
// 🎲 SHUFFLE
// ==========================
function shuffleOptions(question) {
  let options = [...question.options];
  let correctAnswer = options[question.correct];
  
  options.sort(() => Math.random() - 0.5);
  
  let newCorrect = options.indexOf(correctAnswer);
  
  return {
    ...question,
    options,
    correct: newCorrect
  };
}
  
// ==========================
// 🎲 GET QUESTIONS
// ==========================
function getQuestions(pool) {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5).map(q => shuffleOptions(q));
}
  
// ==========================
// 🎮 GAME VARIABLES
// ==========================
let levels = ["easy", "medium", "hard", "impossible", "mama"];
let currentLevelIndex = 0;
  
let questions = getQuestions(questionPool[levels[currentLevelIndex]]);
let currentQuestion = 0;
  
let lives = 3;
let correctAnswers = 0;
  

// ==========================
// 📊 PROGRESS
// ==========================
function updateProgress() {
  const totalCorrect = currentLevelIndex * 5 + correctAnswers;
  const totalNeeded = levels.length * 5;
  
  const percentage = (totalCorrect / totalNeeded) * 100;
  
  // 🚨 HIER IS DE NAAM VERANDERD:
  const gameProgressBar = document.getElementById("quiz-progress-bar");

  if (gameProgressBar) {
      gameProgressBar.style.width = percentage + "%";
  }

  const progressText = document.getElementById("progress-text");
  if (progressText) {
      progressText.innerText = Math.round(percentage) + "%";
  }
}
  
// ==========================
// 📥 LOAD QUESTION
// ==========================
function loadQuestion() {
  const q = questions[currentQuestion];
  
  if (!q) {
    endGame();
    return;
  }
    
  document.getElementById("question").innerText = q.q;
  
  const levelNames = {
    easy: "Easy 😌",
    medium: "Medium 😏",
    hard: "Hard 😈",
    impossible: "Impossible 💀",
    mama: "Mama Na Ngai 👀🔥"
  };
  
  document.getElementById("level").innerText = "Level: " + levelNames[levels[currentLevelIndex]];
  document.getElementById("lives").innerText = "❤️ Lives: " + lives;
  
  q.options.forEach((opt, i) => {
    document.getElementById("a" + i).innerText = opt;
  });
  
  updateProgress();
}
  
// ==========================
// ✅ CHECK ANSWER
// ==========================
function checkAnswer(index) {
  const current = questions[currentQuestion];
  if (!current) return;
  const feedback = document.getElementById("feedback");
  
  if (index === current.correct) {
    correctAnswers++;
    currentQuestion++; 
    feedback.innerText = "Correct 😏💖";
    feedback.className = "correct";
  } else {
    lives--;
    currentQuestion++; 
    feedback.innerText = "Wrong 😭";
    feedback.className = "wrong";
  
    if (lives <= 0) {
      endGame(false);
      return;
    }
  }
  
  setTimeout(() => {
    feedback.innerText = "";
  }, 800);
  
  if (correctAnswers >= 5) {
    currentLevelIndex++;
      
    if (currentLevelIndex >= levels.length) {
      endGame(true);
      return;
    }
  
    questions = getQuestions(questionPool[levels[currentLevelIndex]]);
    currentQuestion = 0;
    correctAnswers = 0; 
    usedQuestions = [];
  }
  
  if (currentLevelIndex < levels.length && lives > 0) {
    if (questions[currentQuestion]) {
      loadQuestion();
    } else {
      questions = getQuestions(questionPool[levels[currentLevelIndex]]);
      currentQuestion = 0; 
      loadQuestion();
    }
  }
}
  
// ==========================
// 🏁 END GAME
// ==========================
function endGame(isWin) {
  const totalCorrect = currentLevelIndex * 5 + correctAnswers;
  const totalNeeded = levels.length * 5;
  const percentage = Math.round((totalCorrect / totalNeeded) * 100);
  
  if (lives <= 0) {
    decreaseAttempt();
  
    document.body.innerHTML = `
      <div style="text-align:center; margin-top:100px;">
        <h1>💀 Game Over</h1>
        <h2>Your score: ${percentage}%</h2>
        <p>Pogingen over vandaag: ${getAttemptsData().attempts}</p>
  
        <button onclick="restart()">🔄 Try again</button>
        <button onclick="exit()">🚪 Leave</button>
      </div>
    `;
    return;
  }
  
  if (totalCorrect >= totalNeeded) {
    showWinScreen();
    return;
  }
}
  
// ==========================
// 🎁 STRAK & MOOI WIN SCREEN
// ==========================
function showWinScreen() {
  const rewardData = getRewardData();

  // 🔥 DE FIX: We dwingen de achtergrond van de héle pagina naar roze!
  document.body.style.backgroundColor = "#fff5f6";
  document.body.style.margin = "0"; // Zorgt dat er geen witte randjes overblijven

  // 1. Check of ze alle cadeaus al heeft gehad
  if (rewardData.index >= rewardsList.length) {
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Segoe UI', sans-serif; background-color: #fff5f6; padding: 20px;">
        <div style="background-color: white; max-width: 500px; width: 100%; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center;">
          <h1 style="color: #ff4d6d;">🎉 GEWONNEN 🎉</h1>
          <h2 style="color: #333; margin-bottom: 20px;">Super goed gedaan!</h2>
          <p style="color: #666; font-size: 1.1rem; line-height: 1.6;">Je hebt alle cadeaus voor deze maand al in de wacht gesleept! 💖</p>
          
          <div style="margin-top: 40px; display: flex; justify-content: center; gap: 15px;">
            <button onclick="restart()" style="padding: 12px 24px; border-radius: 30px; border: none; background-color: #ff4d6d; color: white; cursor: pointer; font-weight: bold; flex: 1;">🔄 Opnieuw</button>
            <button onclick="exit()" style="padding: 12px 24px; border-radius: 30px; border: 1px solid #ffe3e8; background-color: white; color: #ff4d6d; cursor: pointer; font-weight: bold; flex: 1;">🚪 Sluiten</button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // 2. We pakken het cadeau uit de lijst
  const currentReward = rewardsList[rewardData.index];

  // 3. Toon het strakke scherm
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Segoe UI', sans-serif; background-color: #fff5f6; padding: 20px; box-sizing: border-box;">
      
      <div style="background-color: white; max-width: 650px; width: 100%; padding: 40px; border-radius: 24px; box-shadow: 0 15px 35px rgba(0,0,0,0.05); text-align: center;">
        
        <h1 style="color: #ff4d6d; font-size: 2.2rem; margin-bottom: 5px; letter-spacing: 1px;">🎉 GEWONNEN 🎉</h1>
        <h2 style="color: #555; font-size: 1.3rem; margin-top: 0; font-weight: 500; margin-bottom: 30px;">Hier is je prijs!</h2>

        <div style="border-radius: 12px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <img src="${currentReward.image}" style="width: 100%; height: auto; display: block;">
        </div>

        <div style="background-color: rgba(255, 77, 109, 0.05); padding: 25px; border-radius: 16px; border: 1px solid rgba(255, 77, 109, 0.15); margin-bottom: 30px;">
          
          <div style="margin-bottom: 15px;">
            <span style="display: block; font-size: 0.8rem; color: #ff4d6d; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; margin-bottom: 5px;">🔑 Affirmatiecode</span>
            <code style="font-family: 'Courier New', monospace; font-size: 1.4rem; color: #333; font-weight: bold; letter-spacing: 1px;">${currentReward.code}</code>
          </div>
          
          <div style="width: 50px; height: 1px; background-color: rgba(255, 77, 109, 0.2); margin: 15px auto;"></div>

          <p style="margin: 0; color: #666; font-size: 0.95rem; line-height: 1.6;">
            📸 <em>Maak een screenshot van dit scherm en stuur deze door naar mijn e-mail met de juiste affirmatie code</em>
          </p>
        </div>

        <p style="color: #999; font-size: 0.85rem; margin-bottom: 20px;">Nog ${rewardsList.length - rewardData.index - 1} prijzen over 🎁</p>

        <div style="display: flex; justify-content: center; gap: 15px; max-width: 400px; margin: 0 auto;">
          <button onclick="restart()" style="flex: 1; padding: 14px; border-radius: 30px; border: none; background-color: #ff4d6d; color: white; cursor: pointer; font-weight: bold; font-size: 1rem; transition: background 0.2s;">🔄 Opnieuw</button>
          <button onclick="exit()" style="flex: 1; padding: 14px; border-radius: 30px; border: 1px solid #ffe3e8; background-color: white; color: #ff4d6d; cursor: pointer; font-weight: bold; font-size: 1rem;">🚪 Sluiten</button>
        </div>

      </div>
    </div>
  `;

  // 📈 4. We hogen de teller ALVAST op in het geheugen voor de VOLGENDE keer!
  if (rewardData.index < rewardsList.length) {
    rewardData.index++;
  }
  localStorage.setItem("rewards", JSON.stringify(rewardData));
}
  
// ==========================
// 🔄 BUTTONS
// ==========================
function restart() {
  console.log("🔄 Spel wordt herstart via pagina-verversing...");
  location.reload(); 
}

function exit() {
  window.location.href = "../messages/messages.html"; 
}
  
// ==========================
// 🚀 START GAME & TIMER
// ==========================
function checkLockout() {
  const attemptData = getAttemptsData();
  const now = new Date().getTime();
  
  if (attemptData.attempts <= 0 && attemptData.lockoutTime) {
    const timePassed = now - attemptData.lockoutTime;
    const silverlining = 24 * 60 * 60 * 1000; 
  
    if (timePassed >= silverlining) {
      attemptData.attempts = MAX_ATTEMPTS;
      delete attemptData.lockoutTime;
      localStorage.setItem("attempts", JSON.stringify(attemptData));
        
      location.reload(); 
      return;
    }
  
    document.body.innerHTML = `
      <div style="text-align:center; margin-top:100px;">
        <h2>❌ Geen pogingen meer!</h2>
        <p>Je hebt al je pogingen verbruikt. Kom over exact 24 uur terug.</p>
        <h1 id="timer" style="color: #ff4d6d; font-size: 3rem; margin: 20px 0;">--:--:--</h1>
        <p>😈 Geduld is een schone zaak...</p>
      </div>
    `;
  
    const timerElement = document.getElementById("timer");
      
    const timerInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      const distance = silverlining - (currentTime - attemptData.lockoutTime);
  
      if (distance < 0) {
        clearInterval(timerInterval);
        location.reload();
      }
  
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
      const hDisplay = hours < 10 ? "0" + hours : hours;
      const mDisplay = minutes < 10 ? "0" + minutes : minutes;
      const sDisplay = seconds < 10 ? "0" + seconds : seconds;
  
      timerElement.innerText = `${hDisplay}:${mDisplay}:${sDisplay}`;
    }, 1000);
  
  } else {
    updateProgress();
    loadQuestion();
  }
}
  
// 🔥 DE FIX: Wacht tot de pagina (en de HTML van de progress bar) helemaal geladen is!
window.onload = function() {
  checkLockout();
};

// ==========================
// 🧪 DEBUG SHORTCUTS
// ==========================
document.addEventListener("keydown", function(e) {
  const key = e.key.toLowerCase();

  // 🏆 WIN (force win)
  if (key === "w") {
    showWinScreen();
  }

  // 💀 LOSE (force lose)
  if (key === "l") {
    lives = 0;
    endGame(false);
  }

  // 🔄 RESET GAME (Zet pogingen terug op 5 en herlaad)
  if (key === "r") {
    const resetData = {
      date: getTodayDate(), 
      attempts: 5
    };
    localStorage.setItem("attempts", JSON.stringify(resetData));
    location.reload();
  }
});
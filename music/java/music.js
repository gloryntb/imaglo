// 1. DE SPEELLIJST
const playlist = [
    { title: "TEXAS HOLD 'EM", artist: "Beyoncé", src: "/music/songs/Beyoncé - TEXAS HOLD 'EM (Karaoke).mp3" },
    { title: "Katapilla", artist: "Bruce Melodie", src: "/music/songs/Bruce Melodie - Katapilla lyrics (karaoke & Instrumental).mp3" },
    { title: "Strange", artist: "Celeste", src: "/music/songs/Celeste - Strange (Karaoke Version).mp3" },
    { title: "Sparks", artist: "Coldplay", src: "/music/songs/Coldplay - Sparks (Karaoke Version).mp3" },
    { title: "Japanese Denim", artist: "Daniel Caesar", src: "/music/songs/Daniel Caesar - Japanese Denim (Karaoke Version).mp3" },
    { title: "Always", artist: "Daniel Caesar", src: "/music/songs/Daniel Caesar - Always (Karaoke Version).mp3" },
    { title: "Wagon Wheel", artist: "Darius Rucker", src: "/music/songs/DariusRucker_WagonWheel.mp3" },
    { title: "Austin", artist: "Dasha", src: "/music/songs/Dasha_Austin.mp3" },
    { title: "American Boy", artist: "Estelle ft. Kanye West", src: "/music/songs/Estelle ft. Kanye West - American Boy (Karaoke Version).mp3" },
    { title: "God Gave Me Feet For Dancing", artist: "Ezra Collective", src: "/music/songs/Ezra Collective - God Gave Me Feet For Dancing (Instrumental).mp3" },
    { title: "No One's Watching Me", artist: "Ezra Collective", src: "/music/songs/Ezra Collective - No One's Watching Me (Instrumental).mp3" },
    { title: "Breaking Point", artist: "Leon Thomas", src: "/music/songs/Leon Thomas - Breaking Point (Instrumental).mp3" },
    { title: "MUTT", artist: "Leon Thomas", src: "/music/songs/Leon Thomas - MUTT (Karaoke Version).mp3" },
    { title: "rises the moon", artist: "Liana Flores", src: "/music/songs/Liana Flores - rises the moon (Karaoke Version).mp3" },
    { title: "Life is a Highway", artist: "Rascal Flatts", src: "/music/songs/Life is a Highway - Cars (Rascal Flatts)  Karaoke Version  KaraFun.mp3" },
    { title: "A Couple Minutes", artist: "Olivia Dean", src: "/music/songs/Olivia Dean - A Couple Minutes (Karaoke Version).mp3" }
];

// 2. STATUS VAN DE SPELER INLADEN
let currentTrackIndex = parseInt(localStorage.getItem('currentTrackIndex')) || 0;
let isPlaying = localStorage.getItem('isPlaying') === 'true';
let isShuffle = localStorage.getItem('isShuffle') === 'true';
let isRepeat = localStorage.getItem('isRepeat') === 'true';

const audio = new Audio();
audio.loop = false;

// 🚀 EXTRA GEHEUGENSTEUN VOOR DE GSM
let pendingSeekPercentage = null;

// 3. DE MUZIEKBALK AANMAKEN
function createPlayer() {
    const playerDiv = document.createElement('div');
    playerDiv.id = 'global-music-player';
    
    const isMinimized = localStorage.getItem('playerMinimized') === 'true';
    if (isMinimized) { 
        playerDiv.classList.add('minimized'); 
    }

    playerDiv.innerHTML = `
        <div class="player-full-content">
            <div class="player-left">
                <span class="player-title" id="p-title">Laden...</span>
                <span class="player-artist" id="p-artist"></span>
            </div>
            
            <div class="player-center">
                <div class="player-controls">
                    <button id="p-shuffle" class="${isShuffle ? 'active' : ''}">🔀</button>
                    <button id="p-prev">⏮</button>
                    <button id="p-play">▶</button>
                    <button id="p-next">⏭</button>
                    <button id="p-repeat" class="${isRepeat ? 'active' : ''}">🔁</button>
                </div>
                <div class="player-progress-container">
                    <span id="p-current-time">0:00</span>
                    <input type="range" id="p-progress-bar" min="0" max="100" value="0">
                    <span id="p-duration">0:00</span>
                </div>
            </div>

            <div class="player-right">
                <button id="p-minimize" title="Inklappen">▼</button>
            </div>
        </div>

        <div class="player-icon-content" id="p-maximize" title="Muziekspeler openen">
            🎵
        </div>
    `;
    document.body.appendChild(playerDiv);

    // Knoppen koppelen
    document.getElementById('p-play').addEventListener('click', togglePlay);
    document.getElementById('p-prev').addEventListener('click', playPrev);
    document.getElementById('p-next').addEventListener('click', playNext);
    document.getElementById('p-shuffle').addEventListener('click', toggleShuffle);
    document.getElementById('p-repeat').addEventListener('click', toggleRepeat);
    document.getElementById('p-minimize').addEventListener('click', toggleMinimize);
    document.getElementById('p-maximize').addEventListener('click', toggleMinimize);
    
    // Tijdsbalk besturing
    const progressBar = document.getElementById('p-progress-bar');
    
    const calculateSeek = (e) => {
        const percentage = parseFloat(e.target.value);
        const duration = audio.duration;
        
        if (duration && duration > 0) {
            const seekTime = (percentage / 100) * duration;
            audio.currentTime = seekTime;
            localStorage.setItem('audioCurrentTime', seekTime);
            pendingSeekPercentage = null;
        } else {
            pendingSeekPercentage = percentage;
        }
    };

    const handleTouchSeek = (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    
    let percentage = (clientX - rect.left) / rect.width;
    percentage = Math.max(0, Math.min(1, percentage)); 
    
    const duration = audio.duration;
    if (duration && duration > 0) {
        const seekTime = percentage * duration;
        audio.currentTime = seekTime;
        localStorage.setItem('audioCurrentTime', seekTime);
        pendingSeekPercentage = null;
    } else {
        pendingSeekPercentage = percentage * 100;
    }
};

// Vergeet niet de touch-listeners te activeren!
progressBar.addEventListener('touchstart', handleTouchSeek, { passive: false });
progressBar.addEventListener('touchmove', handleTouchSeek, { passive: false });

    progressBar.addEventListener('input', calculateSeek);
    progressBar.addEventListener('change', calculateSeek);

    // Audio events
    audio.addEventListener('timeupdate', updateProgress);
    
    audio.addEventListener('loadedmetadata', () => {
        document.getElementById('p-duration').textContent = formatTime(audio.duration);
        
        // 1. Was de gebruiker aan de balk aan het trekken terwijl het liedje laadde?
        if (pendingSeekPercentage !== null) {
            const seekTime = (pendingSeekPercentage / 100) * audio.duration;
            audio.currentTime = seekTime;
            pendingSeekPercentage = null; // Klaar!
        } else {
            // 2. Zo niet, laad dan gewoon de opgeslagen tijd van de vorige pagina in
            const savedTime = localStorage.getItem('audioCurrentTime');
            if (savedTime) {
                audio.currentTime = parseFloat(savedTime);
            }
        }
    });
    
    audio.addEventListener('ended', handleTrackEnded);
}

// 4. FUNCTIES VOOR DE BESTURING
function loadTrack(index) {
    const track = playlist[index];
    audio.src = track.src;
    document.getElementById('p-title').textContent = track.title;
    document.getElementById('p-artist').textContent = ` • ${track.artist}`;
    localStorage.setItem('currentTrackIndex', index);
}

function togglePlay() {
    if (audio.paused) {
        audio.play().catch(err => console.log("Afspeel error opgevangen."));
        document.getElementById('p-play').textContent = '⏸';
        localStorage.setItem('isPlaying', 'true');
    } else {
        audio.pause();
        document.getElementById('p-play').textContent = '▶';
        localStorage.setItem('isPlaying', 'false');
    }
}

function playNext() {
    if (isShuffle) {
        currentTrackIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }
    localStorage.setItem('audioCurrentTime', '0');
    pendingSeekPercentage = null; // Resetten bij nieuw liedje
    loadTrack(currentTrackIndex);
    audio.play();
    document.getElementById('p-play').textContent = '⏸';
    localStorage.setItem('isPlaying', 'true');
}

function playPrev() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    localStorage.setItem('audioCurrentTime', '0');
    pendingSeekPercentage = null; // Resetten bij nieuw liedje
    loadTrack(currentTrackIndex);
    audio.play();
    document.getElementById('p-play').textContent = '⏸';
    localStorage.setItem('isPlaying', 'true');
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    localStorage.setItem('isShuffle', isShuffle);
    document.getElementById('p-shuffle').classList.toggle('active', isShuffle);
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    localStorage.setItem('isRepeat', isRepeat);
    document.getElementById('p-repeat').classList.toggle('active', isRepeat);
}

function toggleMinimize() {
    const player = document.getElementById('global-music-player');
    const isCurrentlyMinimized = player.classList.contains('minimized');
    
    if (isCurrentlyMinimized) {
        player.style.transition = 'none';
        player.classList.remove('minimized');
        player.classList.add('slide-down');
        setTimeout(() => {
            player.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
            player.classList.remove('slide-down');
        }, 50);
        localStorage.setItem('playerMinimized', 'false');
    } else {
        player.classList.add('slide-down');
        setTimeout(() => {
            player.classList.add('minimized');
        }, 500);
        localStorage.setItem('playerMinimized', 'true');
    }
}

function handleTrackEnded() {
    if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
    } else {
        playNext();
    }
}

function updateProgress() {
    const progressBar = document.getElementById('p-progress-bar');
    const currentTimeSpan = document.getElementById('p-current-time');
    
    // Alleen updaten als we NIET op de balk aan het drukken zijn
    if (progressBar && pendingSeekPercentage === null) {
        const duration = audio.duration || 0;
        if (duration > 0) {
            const progress = (audio.currentTime / duration) * 100;
            progressBar.value = progress;
        }
        
        if (currentTimeSpan) {
            currentTimeSpan.textContent = formatTime(audio.currentTime);
        }
        
        localStorage.setItem('audioCurrentTime', audio.currentTime);
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// 5. DE SPEELLIJST OP DE WITTE KAART TEKENEN
function displayPlaylist() {
    const listContainer = document.getElementById('songList'); 
    
    if (!listContainer) return;

    listContainer.innerHTML = '';
    playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'song-item';
        item.innerHTML = `
            <div class="song-info">
                <span class="song-title">${track.title}</span>
                <span class="song-artist">${track.artist}</span>
            </div>
            <div class="play-icon">▶</div>
        `;
        
        item.addEventListener('click', () => {
            currentTrackIndex = index;
            localStorage.setItem('audioCurrentTime', '0'); 
            pendingSeekPercentage = null; // Resetten
            loadTrack(currentTrackIndex);
            audio.play();
            document.getElementById('p-play').textContent = '⏸';
            localStorage.setItem('isPlaying', 'true');
        });
        
        listContainer.appendChild(item);
    });
}

// 6. DE STARTSCHAKELAAR
document.addEventListener('DOMContentLoaded', () => {
    createPlayer();      
    displayPlaylist();   
    loadTrack(currentTrackIndex); 

    if (isPlaying) {
        audio.play().then(() => {
            document.getElementById('p-play').textContent = '⏸';
        }).catch(err => { 
            const enableAudioOnTouch = () => {
                audio.play();
                document.getElementById('p-play').textContent = '⏸';
                document.removeEventListener('click', enableAudioOnTouch);
                document.removeEventListener('touchstart', enableAudioOnTouch);
            };
            
            document.addEventListener('click', enableAudioOnTouch);
            document.addEventListener('touchstart', enableAudioOnTouch);
        });
    }
});
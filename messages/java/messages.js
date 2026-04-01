// 1. IMPORT INITIALISEREN (We halen Firestore functies binnen)
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🍔 HAMBURGER MENU FIX
window.toggleMenu = function() {
  const navLinks = document.getElementById("navLinks");
  const controlsContainer = document.getElementById("controlsContainer");
  
  if (navLinks) {
    navLinks.classList.toggle("active");
    
    // Als het menu openklapt, verbergen we even de 'Voeg iets toe' knop zodat ze niet over elkaar vallen
    if (navLinks.classList.contains("active")) {
      if (controlsContainer) controlsContainer.style.visibility = "hidden";
    } else {
      if (controlsContainer) controlsContainer.style.visibility = "visible";
    }
  }
};

const noteInput = document.getElementById('noteInput');
const addNoteBtn = document.getElementById('addNoteBtn');
const photoInput = document.getElementById('photoInput');
const boardArea = document.getElementById('boardArea');

// LOGICA VOOR HET IN- EN UITKLAPPEN
const toggleControlsBtn = document.getElementById('toggleControlsBtn');
const controlsContainer = document.getElementById('controlsContainer');

toggleControlsBtn.addEventListener('click', () => {
  controlsContainer.classList.toggle('active');
  
  if (controlsContainer.classList.contains('active')) {
    toggleControlsBtn.innerText = '➖ Sluiten';
  } else {
    toggleControlsBtn.innerText = '➕ Voeg iets toe';
  }
});

// FIREBASE INITIALISATIE
let boardItems = []; 
let highestZIndex = 50;

const db = window.db; 
const boardCollection = collection(db, "prikbord");

// 🚀 LIVE SYNC MET FIREBASE (Zorgt dat alles direct op het scherm verschijnt)
onSnapshot(boardCollection, (snapshot) => {
  // We kijken of je op dit moment iets aan het slepen bent
  const activeElement = document.querySelector('.draggable.active-dragging');
  const activeId = activeElement ? activeElement.getAttribute('data-id') : null;

  boardArea.innerHTML = '';
  boardItems = [];
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    const item = { id: doc.id, ...data };
    boardItems.push(item);
    
    // Als dit het item is dat je nu vasthoudt, tekenen we hem even NIET opnieuw
    if (item.id !== activeId) {
      const element = createDraggableElement(item);
      boardArea.appendChild(element);
    } else {
      // We zetten het bestaande element dat je vasthoudt gewoon weer terug op het bord
      boardArea.appendChild(activeElement);
    }
  });
});

function getRandomPosition() {
  const padding = 150; 
  return {
    x: padding + Math.random() * (window.innerWidth - padding * 2.5),
    y: padding + 150 + Math.random() * (window.innerHeight - padding * 3 - 150)
  };
}

// HET MAKEN VAN ELEMENTEN OP HET SCHERM
function createDraggableElement(item) {
  const container = document.createElement('div');
  container.classList.add('draggable');
  container.setAttribute('data-id', item.id);
  container.setAttribute('data-type', item.type);
  
  container.style.left = `${item.x}px`;
  container.style.top = `${item.y}px`;
  container.style.transform = `rotate(${item.rotation}deg)`;
  container.style.zIndex = item.zIndex || highestZIndex;
  
  if (item.type === 'photo' || item.type === 'sticker') {
    container.style.width = `${item.width || 200}px`;
    container.style.height = `${item.height || 200}px`;
  }
  
  if ((item.zIndex || highestZIndex) > highestZIndex) {
    highestZIndex = item.zIndex;
  }

  const controls = document.createElement('div');
  controls.classList.add('item-controls');
  
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.innerText = '❌';
  
  // 🗑️ VERWIJDEREN UIT FIREBASE
  deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await deleteDoc(doc(db, "prikbord", item.id));
  });

  const rotateHandle = document.createElement('div');
  rotateHandle.classList.add('rotate-handle');

  const resizeHandle = document.createElement('div');
  resizeHandle.classList.add('resize-handle');

  controls.appendChild(deleteBtn);
  controls.appendChild(rotateHandle);
  controls.appendChild(resizeHandle);
  container.appendChild(controls);

  if (item.type === 'post-it') {
    const postItContent = document.createElement('div');
    postItContent.classList.add('post-it');
    postItContent.innerHTML = `<span>${item.content}</span>`;
    container.appendChild(postItContent);
  } else if (item.type === 'photo') {
    const photoContent = document.createElement('div');
    photoContent.classList.add('photo-item');
    photoContent.style.width = '100%';
    photoContent.style.height = '100%';
    
    const img = document.createElement('img');
    img.src = item.content; 
    img.draggable = false;
    
    photoContent.appendChild(img);
    container.appendChild(photoContent);
  } else if (item.type === 'sticker') {
    const stickerContent = document.createElement('div');
    stickerContent.style.width = '100%';
    stickerContent.style.height = '100%';
    stickerContent.style.display = 'flex';
    stickerContent.style.alignItems = 'center';
    stickerContent.style.justifyContent = 'center';
    
    const img = document.createElement('img');
    img.src = item.content; 
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    
    stickerContent.appendChild(img);
    container.appendChild(stickerContent);
  }

  addAdvancedInteractionLogic(container, item, rotateHandle, resizeHandle);
  
  return container;
}

// TOEVOEGEN VAN NIEUWE POST-ITS
addNoteBtn.addEventListener('click', async () => {
  const text = noteInput.value.trim();
  if (text === '') return;
  
  const pos = getRandomPosition();
  highestZIndex++;

  await addDoc(boardCollection, {
    type: 'post-it',
    content: text,
    x: pos.x,
    y: pos.y,
    rotation: -5 + Math.random() * 10,
    zIndex: highestZIndex
  });
  
  noteInput.value = '';
  controlsContainer.classList.remove('active');
  toggleControlsBtn.innerText = '➕ Voeg iets toe';
});

// DE SLIMME GECOMBINEERDE KNOP VOOR FOTO'S EN STICKERS
photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileType = file.type.toLowerCase();
  
  const isStickerType = fileType.includes('png') || fileType.includes('webp') || fileType.includes('gif');
  const itemType = isStickerType ? 'sticker' : 'photo';

  const reader = new FileReader();
  
  reader.onload = function(event) {
    const pos = getRandomPosition();
    highestZIndex++;

    const img = new Image();
    img.onload = async function() {
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      
      let initialWidth = 200; 
      if (itemType === 'sticker') {
        initialWidth = 150; 
      }
      const initialHeight = initialWidth * aspectRatio;

      await addDoc(boardCollection, {
        type: itemType,
        content: event.target.result,
        x: pos.x,
        y: pos.y,
        width: initialWidth,
        height: initialHeight,
        rotation: itemType === 'sticker' ? (-5 + Math.random() * 10) : 0, 
        zIndex: highestZIndex
      });
      
      photoInput.value = ''; 
      
      controlsContainer.classList.remove('active');
      toggleControlsBtn.innerText = '➕ Voeg iets toe';
    };
    img.src = event.target.result;
  };
  
  reader.readAsDataURL(file);
});

// DE COMPLEXE INTERACTIE LOGICA (Volledig herschreven voor Firebase & Muis!)
function addAdvancedInteractionLogic(element, itemModel, rotateHandle, resizeHandle) {
  let isDragging = false;
  let isRotating = false;
  let isResizing = false;

  let startX, startY;
  let initialMouseX, initialMouseY;
  let startWidth, startHeight;
  let startRotation;

  const getPointerPos = (e) => {
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    return { x: clientX, y: clientY };
  };

  element.addEventListener('mousedown', (e) => {
    if (e.target !== rotateHandle && e.target !== resizeHandle && !e.target.classList.contains('delete-btn')) {
      e.preventDefault(); 
    }
    startAction(e, 'drag');
  });
  element.addEventListener('touchstart', (e) => startAction(e, 'drag'), { passive: false });

  rotateHandle.addEventListener('mousedown', (e) => { e.preventDefault(); startAction(e, 'rotate'); });
  rotateHandle.addEventListener('touchstart', (e) => startAction(e, 'rotate'), { passive: false });

  resizeHandle.addEventListener('mousedown', (e) => { e.preventDefault(); startAction(e, 'resize'); });
  resizeHandle.addEventListener('touchstart', (e) => startAction(e, 'resize'), { passive: false });

  async function startAction(e, type) {
    if (e.target.classList.contains('delete-btn')) {
      return;
    }

    element.classList.add('active-dragging');
    e.stopPropagation();  
    
    const pos = getPointerPos(e);
    initialMouseX = pos.x;
    initialMouseY = pos.y;

    highestZIndex++;
    element.style.zIndex = highestZIndex;
    
    await updateDoc(doc(db, "prikbord", itemModel.id), {
      zIndex: highestZIndex
    });

    if (type === 'drag') {
      if (e.target === rotateHandle || e.target === resizeHandle || e.target.classList.contains('delete-btn')) return;
      isDragging = true;
      startX = itemModel.x;
      startY = itemModel.y;
    } 
    else if (type === 'rotate') {
      isRotating = true;
      startRotation = itemModel.rotation || 0;
    } 
    else if (type === 'resize') {
      isResizing = true;
      startWidth = itemModel.width || element.offsetWidth;
      startHeight = itemModel.height || element.offsetHeight;
    }
  }

  function handleMove(e) {
    if (!isDragging && !isRotating && !isResizing) return;
    
    if (e.type === 'touchmove' && (isDragging || isRotating || isResizing)) {
      e.preventDefault(); 
    }    
    const pos = getPointerPos(e);

    if (isDragging) {
      const dx = pos.x - initialMouseX;
      const dy = pos.y - initialMouseY;
      
      itemModel.x = startX + dx;
      itemModel.y = startY + dy;
      
      element.style.left = `${itemModel.x}px`;
      element.style.top = `${itemModel.y}px`;
    }

    if (isRotating) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const radians = Math.atan2(pos.x - centerX, centerY - pos.y);
      let degrees = radians * (180 / Math.PI);
      
      itemModel.rotation = degrees;
      element.style.transform = `rotate(${degrees}deg)`;
    }

    if (isResizing) {
      const dx = pos.x - initialMouseX;
      const dy = pos.y - initialMouseY;
      
      const angle = (itemModel.rotation || 0) * (Math.PI / 180);
      
      const rotatedDx = dx * Math.cos(angle) + dy * Math.sin(angle);
      const rotatedDy = -dx * Math.sin(angle) + dy * Math.cos(angle);

      const newWidth = Math.max(80, startWidth + rotatedDx);
      const newHeight = Math.max(80, startHeight + rotatedDy);

      itemModel.width = newWidth;
      itemModel.height = newHeight;

      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;
    }
  }

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isTouchDevice) {
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', endAction);
  } else {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', endAction);
  }

  async function endAction() {
    if (isDragging || isRotating || isResizing) {
      isDragging = false;
      isRotating = false;
      isResizing = false;
      
      await updateDoc(doc(db, "prikbord", itemModel.id), {
        x: itemModel.x,
        y: itemModel.y,
        rotation: itemModel.rotation || 0,
        width: itemModel.width || 200,
        height: itemModel.height || 200
      });
    }
    element.classList.remove('active-dragging');
  }
}

// Zorgt dat het scherm bij het laden netjes naar het midden van het bord springt
window.addEventListener('load', () => {
  setTimeout(() => {
    const scrollX = (document.documentElement.scrollWidth - window.innerWidth) / 2;
    const scrollY = (document.documentElement.scrollHeight - window.innerHeight) / 2;
    window.scrollTo({
      left: scrollX,
      top: scrollY,
      behavior: 'smooth' 
    });
  }, 300); 
});

// 🛡️ ANTI-ZOOM FIX VOOR DE UI
const fixUIZoom = () => {
  const navbar = document.querySelector('.navbar');
  const controls = document.querySelector('.controls-container');
  const player = document.querySelector('.music-player');
  
  const visualViewport = window.visualViewport;
  if (!visualViewport) return;
  
  const scale = 1 / visualViewport.scale;
  
  if (navbar) {
    navbar.style.transform = `scale(${scale})`;
    navbar.style.transformOrigin = 'top left';
    navbar.style.width = `${100 * visualViewport.scale}%`;
  }
  
  if (controls) {
    controls.style.transform = `translateX(-50%) scale(${scale})`;
    controls.style.transformOrigin = 'top center';
  }
  
  if (player) {
    player.style.transform = `scale(${scale})`;
    player.style.transformOrigin = 'bottom left';
  }
};

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', fixUIZoom);
  window.visualViewport.addEventListener('scroll', fixUIZoom);
}
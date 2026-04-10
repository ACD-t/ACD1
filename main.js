const stage = document.getElementById("cardsStage");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

const cardsData = [
  { image: "images/card-1.jpg", link: "tut1.html" },
  { image: "images/card-2.jpg", link: "tut1.html" },
  { image: "images/card-3.jpg", link: "tut1.html" },
  { image: "images/card-4.jpg", link: "tut1.html" }
];

let currentIndex = 0;
let isAnimating = false;

let startX = 0;
let currentX = 0;
let isDragging = false;
let activeCard = null;

function getVisibleCards() {
  const visible = [];

  for (let i = 0; i < Math.min(4, cardsData.length); i++) {
    const index = (currentIndex + i) % cardsData.length;
    visible.push(cardsData[index]);
  }

  return visible;
}

function renderCards() {
  stage.innerHTML = "";

  const visibleCards = getVisibleCards();

  visibleCards
    .slice()
    .reverse()
    .forEach((card, reverseIndex) => {
      const visualIndex = visibleCards.length - 1 - reverseIndex;

      const el = document.createElement("div");
      el.className = "task-card";
      el.dataset.position = visualIndex;
      el.dataset.link = card.link;
      el.draggable = false;

      el.innerHTML = `
        <img src="${card.image}" alt="" class="task-card__image" draggable="false">
      `;

      stage.appendChild(el);
    });
}

function nextSlide() {
  if (isAnimating) return;

  const front = stage.querySelector('[data-position="0"]');
  if (!front) return;

  isAnimating = true;
  front.classList.add("is-leaving-left");

  setTimeout(() => {
    currentIndex = (currentIndex + 1) % cardsData.length;
    renderCards();
    isAnimating = false;
  }, 500);
}

function prevSlide() {
  if (isAnimating) return;

  const front = stage.querySelector('[data-position="0"]');
  if (!front) return;

  isAnimating = true;
  front.classList.add("is-leaving-right");

  setTimeout(() => {
    currentIndex = (currentIndex - 1 + cardsData.length) % cardsData.length;
    renderCards();
    isAnimating = false;
  }, 500);
}

if (nextBtn) nextBtn.addEventListener("click", nextSlide);
if (prevBtn) prevBtn.addEventListener("click", prevSlide);

renderCards();

stage.addEventListener("mousedown", startDrag);
stage.addEventListener("touchstart", startDrag, { passive: true });

function startDrag(e) {
  if (isAnimating) return;

  activeCard = stage.querySelector('[data-position="0"]');
  if (!activeCard) return;

  isDragging = true;
  startX = e.touches ? e.touches[0].clientX : e.clientX;
  currentX = startX;

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("touchmove", onDrag, { passive: false });

  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag);
}

function onDrag(e) {
  if (!isDragging || !activeCard) return;

  currentX = e.touches ? e.touches[0].clientX : e.clientX;
  const diff = currentX - startX;

  if (Math.abs(diff) > 6 && e.cancelable) {
    e.preventDefault();
  }

  activeCard.style.transform = `translateX(${diff}px) rotate(${diff / 18}deg)`;
}

function endDrag() {
  if (!isDragging || !activeCard) return;

  const diff = currentX - startX;
  const clickThreshold = 8;
  const swipeThreshold = 80;
  const link = activeCard.dataset.link;

  isDragging = false;

  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("mouseup", endDrag);
  document.removeEventListener("touchend", endDrag);

  if (diff < -swipeThreshold) {
    nextSlide();
  } else if (diff > swipeThreshold) {
    prevSlide();
  } else if (Math.abs(diff) <= clickThreshold) {
    window.location.href = link;
  } else {
    renderCards();
  }

  activeCard = null;
}
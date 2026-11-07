"use strict";

const activities = [
  { icon: "🍽️", name: "Romantic Dinner" },
  { icon: "🚗", name: "Long Drive" },
  { icon: "☕", name: "Coffee Shop" },
  { icon: "🍵", name: "Tea Stall" },
  { icon: "🌸", name: "Evening Walk" },
  { icon: "🎬", name: "Movie Date" },
  { icon: "🍦", name: "Ice Cream Date" },
  { icon: "🌳", name: "Park Visit" },
  { icon: "🍕", name: "Pizza Date" },
  { icon: "🌙", name: "Rooftop Conversation" },
  { icon: "🛍️", name: "Shopping Together" },
  { icon: "💗", name: "Surprise Date" }
];
const restaurants = [
  { icon: "🍽️", name: "Helium" },
  { icon: "🍔", name: "Chillox" },
  { icon: "🍕", name: "Pizz&Bug" }
];
const state = {
  currentStep: "welcome",
  selectedDate: "",
  selectedActivity: "",
  selectedRestaurant: "",
  selectedTime: "",
  visibleMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
};
const steps = [...document.querySelectorAll("[data-step]")];
const dateInputToday = new Date();
dateInputToday.setHours(0, 0, 0, 0);
const $ = (selector) => document.querySelector(selector);
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
let flowerFallTimer = 0;

function showStep(step) {
  if (!steps.some((element) => element.dataset.step === step)) return;
  state.currentStep = step;
  document.body.classList.toggle("celebration-active", step === "celebration");
  steps.forEach((element) => {
    const active = element.dataset.step === step;
    element.hidden = !active;
    element.setAttribute("aria-hidden", String(!active));
  });
  clearMessages();
  if (step === "calendar") renderCalendar();
  if (step === "activity") renderOptions("#activity-options", activities, state.selectedActivity);
  if (step === "restaurant") renderOptions("#restaurant-options", restaurants, state.selectedRestaurant);
  if (step === "time") updateTimeControls();
  if (step === "confirmation") renderSummary();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearMessages() {
  document.querySelectorAll(".inline-message").forEach((message) => { message.textContent = ""; });
}

function addSideBlooms(container) {
  const symbols = ["✿", "❀", "✾", "❁", "✽"];
  const colors = ["#fffafd", "#fff", "#f7b3ca", "#ed91b2", "#f9d5e0"];
  for (let side = 0; side < 2; side += 1) {
    for (let index = 0; index < 13; index += 1) {
      const bloom = document.createElement("span");
      bloom.className = "side-bloom";
      bloom.textContent = symbols[(index + side * 2) % symbols.length];
      bloom.style[side === 0 ? "left" : "right"] = "0";
      bloom.style.setProperty("--bloom-top", `${5 + index * 7.5 + Math.random() * 3}%`);
      bloom.style.setProperty("--bloom-color", colors[(index + side) % colors.length]);
      bloom.style.setProperty("--bloom-size", `${18 + Math.random() * 17}px`);
      bloom.style.setProperty("--bloom-delay", `${Math.random() * 1.1}s`);
      container.append(bloom);
    }
  }
}

function renderCalendar() {
  const year = state.visibleMonth.getFullYear();
  const month = state.visibleMonth.getMonth();
  $("#month-label").textContent = state.visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid = $("#calendar-days");
  grid.replaceChildren();
  for (let blank = 0; blank < firstDay; blank += 1) {
    const spacer = document.createElement("span");
    spacer.setAttribute("aria-hidden", "true");
    grid.append(spacer);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = dateKey(date);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = String(day);
    button.dataset.date = key;
    button.disabled = date < dateInputToday;
    button.setAttribute("aria-label", date.toLocaleDateString(undefined, { dateStyle: "full" }));
    button.setAttribute("aria-pressed", String(key === state.selectedDate));
    if (key === state.selectedDate) button.classList.add("selected");
    if (key === dateKey(dateInputToday)) button.classList.add("today");
    button.addEventListener("click", () => {
      state.selectedDate = key;
      renderCalendar();
      $("#calendar-message").textContent = "";
    });
    grid.append(button);
  }
}

$("#previous-month").addEventListener("click", () => {
  const previous = new Date(state.visibleMonth.getFullYear(), state.visibleMonth.getMonth() - 1, 1);
  if (previous.getFullYear() < dateInputToday.getFullYear() || (previous.getFullYear() === dateInputToday.getFullYear() && previous.getMonth() < dateInputToday.getMonth())) return;
  state.visibleMonth = previous;
  renderCalendar();
});
$("#next-month").addEventListener("click", () => {
  state.visibleMonth = new Date(state.visibleMonth.getFullYear(), state.visibleMonth.getMonth() + 1, 1);
  renderCalendar();
});

function renderOptions(containerSelector, options, selected) {
  const container = $(containerSelector);
  container.replaceChildren();
  options.forEach(({ icon, name }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-card";
    button.setAttribute("aria-pressed", String(name === selected));
    const iconElement = document.createElement("span");
    iconElement.className = "option-icon";
    iconElement.textContent = icon;
    const nameElement = document.createElement("span");
    nameElement.className = "option-name";
    nameElement.textContent = name;
    button.append(iconElement, nameElement);
    button.addEventListener("click", () => {
      if (containerSelector === "#activity-options") {
        state.selectedActivity = name;
        if (name !== "Romantic Dinner") state.selectedRestaurant = "";
      } else {
        state.selectedRestaurant = name;
      }
      renderOptions(containerSelector, options, name);
      $(`#${containerSelector.slice(1).replace("-options", "")}-message`).textContent = "";
    });
    container.append(button);
  });
}

function displayTime(value) {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function updateTimeControls() {
  $("#meeting-time").value = state.selectedTime;
  document.querySelectorAll(".time-chip").forEach((button) => {
    button.classList.toggle("selected", button.dataset.time === state.selectedTime);
    button.setAttribute("aria-pressed", String(button.dataset.time === state.selectedTime));
  });
}

$("#meeting-time").addEventListener("input", (event) => {
  state.selectedTime = event.currentTarget.value;
  updateTimeControls();
  $("#time-message").textContent = "";
});
document.querySelectorAll(".time-chip").forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedTime = button.dataset.time;
    updateTimeControls();
    $("#time-message").textContent = "";
  });
});

function dateLabel() {
  const [year, month, day] = state.selectedDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function renderSummary() {
  const date = dateLabel();
  const rows = [
    ["Date", date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })],
    ["Day", date.toLocaleDateString(undefined, { weekday: "long" })],
    ["Activity", state.selectedActivity],
    ...(state.selectedActivity === "Romantic Dinner" ? [["Restaurant", state.selectedRestaurant]] : []),
    ["Meeting time", displayTime(state.selectedTime)]
  ];
  const summary = $("#date-summary");
  summary.replaceChildren();
  const top = document.createElement("div");
  top.className = "summary-top";
  top.textContent = "♡ Our plan together ♡";
  summary.append(top);
  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "summary-row";
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const valueElement = document.createElement("strong");
    valueElement.textContent = value;
    row.append(labelElement, valueElement);
    summary.append(row);
  });
}

function nextStepFrom(step) {
  if (step === "calendar") return "activity";
  if (step === "activity") return state.selectedActivity === "Romantic Dinner" ? "restaurant" : "time";
  if (step === "restaurant") return "time";
  if (step === "time") return "confirmation";
  return "";
}

function continueFrom(step) {
  const requirements = {
    calendar: [state.selectedDate, "#calendar-message", "Please choose a date first 💗"],
    activity: [state.selectedActivity, "#activity-message", "Please choose an activity first 💗"],
    restaurant: [state.selectedRestaurant, "#restaurant-message", "Please choose a restaurant first 💗"],
    time: [state.selectedTime, "#time-message", "Please choose a meeting time first 💗"]
  };
  const [value, messageSelector, message] = requirements[step];
  if (!value) {
    $(messageSelector).textContent = message;
    return;
  }
  showStep(nextStepFrom(step));
}

document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => showStep(button.dataset.go)));
document.querySelectorAll("[data-continue]").forEach((button) => button.addEventListener("click", () => continueFrom(button.dataset.continue)));
document.querySelectorAll("[data-back]").forEach((button) => button.addEventListener("click", () => {
  const previousByStep = { calendar: "welcome", activity: "calendar", restaurant: "activity", time: state.selectedActivity === "Romantic Dinner" ? "restaurant" : "activity", confirmation: "time" };
  showStep(previousByStep[state.currentStep] || "welcome");
}));

$("#return-home").addEventListener("click", () => {
  state.selectedDate = "";
  state.selectedActivity = "";
  state.selectedRestaurant = "";
  state.selectedTime = "";
  state.visibleMonth = new Date(dateInputToday.getFullYear(), dateInputToday.getMonth(), 1);
  $("#meeting-time").value = "";
  updateTimeControls();
  $("#date-summary").replaceChildren();

  const image = $("#schedule-image");
  if (image.dataset.objectUrl) URL.revokeObjectURL(image.dataset.objectUrl);
  image.removeAttribute("src");
  image.hidden = true;
  delete image.dataset.objectUrl;
  delete $("#save-image").dataset.ready;
  delete $("#share-date").dataset.ready;
  showStep("welcome");
  const flowers = $(".flower-fall-layer");
  flowers.replaceChildren();
  addSideBlooms(flowers);
  document.body.classList.add("flower-fall-active");
  flowerFallTimer = window.setTimeout(() => {
    flowerFallTimer = 0;
    document.body.classList.remove("flower-fall-active");
    flowers.replaceChildren();
  }, 3100);
});

$("#confirm-date").addEventListener("click", () => {
  if (!state.selectedDate || !state.selectedActivity || !state.selectedTime || (state.selectedActivity === "Romantic Dinner" && !state.selectedRestaurant)) {
    $("#confirmation-message").textContent = "Please complete each part of your plan before confirming 💗";
    return;
  }
  if (flowerFallTimer) return;

  const confirmationButtons = [...document.querySelectorAll('[data-step="confirmation"] button')];
  confirmationButtons.forEach((button) => { button.disabled = true; });
  document.body.classList.add("flower-fall-active");
  const flowers = $(".flower-fall-layer");
  flowers.replaceChildren();
  const symbols = ["✿", "❀", "✾", "❁", "✽"];
  const colors = ["#fffafd", "#fff", "#f7b3ca", "#ed91b2", "#f9d5e0"];
  for (let index = 0; index < 110; index += 1) {
    const flower = document.createElement("span");
    flower.className = "falling-flower";
    flower.textContent = symbols[index % symbols.length];
    flower.style.setProperty("--flower-left", `${Math.random() * 100}%`);
    flower.style.setProperty("--flower-color", colors[index % colors.length]);
    flower.style.setProperty("--flower-size", `${13 + Math.random() * 21}px`);
    flower.style.setProperty("--flower-duration", `${3.8 + Math.random() * 0.7}s`);
    flower.style.setProperty("--flower-delay", `${Math.random() * 0.55}s`);
    flower.style.setProperty("--flower-drift", `${-65 + Math.random() * 130}px`);
    flower.style.setProperty("--flower-rotation", `${-240 + Math.random() * 480}deg`);
    flowers.append(flower);
  }

  flowerFallTimer = window.setTimeout(() => {
    flowerFallTimer = 0;
    document.body.classList.remove("flower-fall-active");
    flowers.replaceChildren();
    confirmationButtons.forEach((button) => { button.disabled = false; });
    showStep("celebration");
    try {
      createScheduleImage();
      $("#share-message").textContent = "";
    } catch (error) {
      $("#share-message").textContent = "Your date is confirmed, but the invitation image couldn't be created. Please try reloading the page.";
      console.error("Could not create schedule image:", error);
    }
  }, 5300);
});

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawHeart(context, x, y, size, color) {
  context.save();
  context.translate(x, y);
  context.scale(size / 100, size / 100);
  context.beginPath();
  context.moveTo(0, 86);
  context.bezierCurveTo(-105, 18, -38, -30, 0, 15);
  context.bezierCurveTo(38, -30, 105, 18, 0, 86);
  context.fillStyle = color;
  context.fill();
  context.restore();
}

function createScheduleImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  const background = context.createLinearGradient(0, 0, 1200, 1600);
  background.addColorStop(0, "#fff5f8");
  background.addColorStop(1, "#fce8f0");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(255,255,255,.72)";
  roundedRect(context, 70, 70, 1060, 1460, 48);
  context.fill();
  context.strokeStyle = "#edc2d2";
  context.lineWidth = 3;
  roundedRect(context, 94, 94, 1012, 1412, 34);
  context.stroke();

  context.textAlign = "center";
  context.fillStyle = "#d985a3";
  context.font = "54px Georgia, serif";
  context.fillText("❄     ✧     ❄     ✧     ❄", 600, 205);
  drawHeart(context, 600, 300, 58, "#df79a0");
  context.fillStyle = "#69475b";
  context.font = "600 68px Georgia, serif";
  context.fillText("OUR SPECIAL DATE", 600, 466);
  context.fillStyle = "#d9799c";
  context.font = "48px Georgia, serif";
  context.fillText("♡", 600, 530);
  context.strokeStyle = "#edc8d6";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(280, 578);
  context.lineTo(920, 578);
  context.stroke();

  const date = dateLabel();
  const dateText = date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  const weekdayText = date.toLocaleDateString(undefined, { weekday: "long" });
  const rows = [
    ["DATE", dateText],
    ["DAY", weekdayText],
    ["OUR PLAN", state.selectedActivity],
    ...(state.selectedActivity === "Romantic Dinner" ? [["DINNER SPOT", state.selectedRestaurant]] : []),
    ["MEETING TIME", displayTime(state.selectedTime)]
  ];
  const rowSpacing = rows.length > 4 ? 125 : 150;
  let y = rows.length > 4 ? 655 : 680;
  rows.forEach(([label, value]) => {
    context.fillStyle = "#bd829a";
    context.font = "700 25px Arial, sans-serif";
    context.fillText(label, 600, y);
    context.fillStyle = "#684a5c";
    context.font = "48px Georgia, serif";
    context.fillText(value, 600, y + 54);
    y += rowSpacing;
  });

  context.fillStyle = "#d9789c";
  context.font = "38px Georgia, serif";
  context.fillText("❄      ♡      ❄      ♡      ❄", 600, 1305);
  context.fillStyle = "#9c6f84";
  context.font = "italic 31px Georgia, serif";
  context.fillText("I can’t wait to make this memory with you.", 600, 1400);
  context.fillStyle = "#d9789c";
  context.font = "40px Georgia, serif";
  context.fillText("With love, always 💗", 600, 1460);

  canvas.toBlob((blob) => {
    if (!blob) {
      $("#share-message").textContent = "The invitation image couldn't be prepared. Please try again.";
      return;
    }
    if ($("#schedule-image").dataset.objectUrl) URL.revokeObjectURL($("#schedule-image").dataset.objectUrl);
    const url = URL.createObjectURL(blob);
    $("#schedule-image").src = url;
    $("#schedule-image").dataset.objectUrl = url;
    $("#schedule-image").hidden = false;
    $("#save-image").dataset.ready = "true";
    $("#share-date").dataset.ready = "true";
  }, "image/png");
}

function downloadImage() {
  const image = $("#schedule-image");
  if (!image.dataset.objectUrl) {
    $("#share-message").textContent = "Your invitation is still getting ready. Please try again in a moment.";
    return;
  }
  const link = document.createElement("a");
  link.href = image.dataset.objectUrl;
  link.download = "Our-Special-Date.png";
  document.body.append(link);
  link.click();
  link.remove();
  $("#share-message").textContent = "Your date schedule is ready to save 💗";
}

$("#save-image").addEventListener("click", downloadImage);
$("#share-date").addEventListener("click", async () => {
  const image = $("#schedule-image");
  if (!image.dataset.objectUrl) {
    $("#share-message").textContent = "Your invitation is still getting ready. Please try again in a moment.";
    return;
  }
  let blob;
  try {
    const response = await fetch(image.dataset.objectUrl);
    if (!response.ok) throw new Error("Could not read the generated invitation");
    blob = await response.blob();
  } catch (error) {
    console.error("Could not prepare schedule image for sharing:", error);
    $("#share-message").textContent = "The invitation couldn't be prepared for sharing. Please save the PNG instead.";
    return;
  }
  const file = new File([blob], "Our-Special-Date.png", { type: "image/png" });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ title: "Our Special Date 💗", text: "Our little date plan!", files: [file] });
      $("#share-message").textContent = "Your share sheet finished sharing the invitation 💗";
    } catch (error) {
      if (error.name === "AbortError") {
        $("#share-message").textContent = "Sharing was cancelled. Your invitation is ready whenever you are.";
      } else {
        console.error("Could not share schedule image:", error);
        $("#share-message").textContent = "Sharing isn't available right now. You can save the PNG instead.";
      }
    }
    return;
  }
  downloadImage();
  $("#share-message").textContent = "Image sharing isn't supported here, so your PNG download has started instead 💗";
});

function addAmbientDecorations() {
  const snow = $(".snow-layer");
  const celebrationSnow = $(".celebration-snow-layer");
  const hearts = $(".heart-layer");
  const flakeColors = ["#f3a8c1", "#f7bfd0", "#f9d4df", "#eda0bc"];
  const flakeSymbols = ["❄", "✧", "•", "·"];
  for (let index = 0; index < 34; index += 1) {
    const flake = document.createElement("span");
    flake.className = "celebration-snowflake";
    flake.textContent = flakeSymbols[index % flakeSymbols.length];
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.setProperty("--flake-color", flakeColors[index % flakeColors.length]);
    flake.style.setProperty("--flake-size", `${5 + Math.random() * 12}px`);
    flake.style.setProperty("--flake-opacity", String(0.4 + Math.random() * 0.5));
    flake.style.setProperty("--flake-duration", `${10 + Math.random() * 12}s`);
    flake.style.setProperty("--flake-delay", `${Math.random() * -22}s`);
    flake.style.setProperty("--flake-drift", `${-24 + Math.random() * 48}px`);
    celebrationSnow.append(flake);
  }
  for (let index = 0; index < 38; index += 1) {
    const flake = document.createElement("span");
    flake.className = "snowflake";
    flake.textContent = index % 4 === 0 ? "✧" : "•";
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.opacity = String(0.35 + Math.random() * 0.55);
    flake.style.fontSize = `${5 + Math.random() * 8}px`;
    flake.style.animationDuration = `${8 + Math.random() * 13}s`;
    flake.style.animationDelay = `${Math.random() * -20}s`;
    snow.append(flake);
  }
  for (let index = 0; index < 9; index += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = index % 2 ? "♡" : "♥";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${13 + Math.random() * 15}px`;
    heart.style.animationDuration = `${17 + Math.random() * 15}s`;
    heart.style.animationDelay = `${Math.random() * -25}s`;
    hearts.append(heart);
  }
}

addAmbientDecorations();
renderCalendar();
showStep("welcome");

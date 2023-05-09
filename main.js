let clockMode = false;

let startPage = {
  page: document.getElementById("start-page"),
  inputField: document.getElementById("num-minutes"),
  inputForm: document.getElementById("custom-minutes-form"),
  recentChips: document.getElementById("recent-chip-container"),
};
let timerPage = {
  page: document.getElementById("timer-page"),
  currentTimeLabel: document.getElementById("current-time-label"),
  currentTime: document.getElementById("current-time"),
  bottomLabel: document.getElementById("bottom-area-label"),
  bottomValue: document.getElementById("bottom-area-value"),
};
let toolbox = {
  container: document.getElementById("toolbox"),
  pause: {
    state: false,
    trueIcon: "play_arrow",
    falseIcon: "pause",
    trueColor: "#ffffff",
    falseColor: "#ffffff",
    trueDarkColor: "#1b5e20",
    falseDarkColor: "#1b5e20",
    element: document.getElementById("play-pause-icon"),
  },
  endTime: {
    state: false,
    trueIcon: "access_time",
    falseIcon: "access_time",
    trueColor: "#ffffff",
    falseColor: "#aaaaaa",
    trueDarkColor: "#002200",
    falseDarkColor: "#1b5e20",
    element: document.getElementById("show-time-icon"),
  },
  exit: {
    state: false, // never actually true
    trueIcon: "clear",
    falseIcon: "clear",
    trueColor: "#ffffff",
    falseColor: "#ffffff",
    trueDarkColor: "#1b5e20",
    falseDarkColor: "#1b5e20",
    element: document.getElementById("exit-icon"),
  },
  exitClock: {
    state: false, // never actually true
    trueIcon: "clear",
    falseIcon: "clear",
    trueColor: "#ffffff",
    falseColor: "#ffffff",
    trueDarkColor: "#1b5e20",
    falseDarkColor: "#1b5e20",
    element: document.getElementById("clock-exit-icon"),
  },
  set: (obj, state) => {
    obj.state = state;
    obj.element.innerText = state ? obj.trueIcon : obj.falseIcon;
    if (state) {
      obj.element.style.color = document.body.classList.contains("end")
        ? obj.trueDarkColor
        : obj.trueColor;
    } else {
      obj.element.style.color = document.body.classList.contains("end")
        ? obj.falseDarkColor
        : obj.falseColor;
    }
  },
};

toolbox.pause.element.addEventListener("click", (e) => {
  toolbox.set(toolbox.pause, !toolbox.pause.state);
  toolbox.container.dispatchEvent(
    new CustomEvent("toolbox-toggle", {
      detail: { el: "pause", state: toolbox.pause.state },
    })
  );
});
toolbox.endTime.element.addEventListener("click", (e) => {
  toolbox.set(toolbox.endTime, !toolbox.endTime.state);
  toolbox.container.dispatchEvent(
    new CustomEvent("toolbox-toggle", {
      detail: { el: "endTime", state: toolbox.endTime.state },
    })
  );
});
toolbox.exit.element.addEventListener("click", (e) => {
  toolbox.set(toolbox.exit, !toolbox.exit.state);
  toolbox.container.dispatchEvent(
    new CustomEvent("toolbox-toggle", {
      detail: { el: "exit", state: toolbox.exit.state },
    })
  );
});
toolbox.exitClock.element.addEventListener("click", (e) => {
  toolbox.set(toolbox.exitClock, !toolbox.exitClock.state);
  toolbox.container.dispatchEvent(
    new CustomEvent("toolbox-toggle", {
      detail: { el: "exitClock", state: toolbox.exitClock.state },
    })
  );
});

let addRecentChip = (min) => {
  if (localStorage.getItem("recent-timers") == null) {
    localStorage.setItem("recent-timers", JSON.stringify([]));
  }
  let recents = JSON.parse(localStorage.getItem("recent-timers"));

  recents.unshift(min);
  recents = [...new Set(recents)]; // set are unique and will have first at first
  recents = recents.slice(0, 8); // limit to 8

  localStorage.setItem("recent-timers", JSON.stringify(recents));
};
let updateRecentChips = () => {
  let existingItems = startPage.recentChips.getElementsByTagName("a");
  for (let i = existingItems.length - 1; i >= 0; i--) {
    existingItems[i].remove();
  }

  if (localStorage.getItem("recent-timers") == null) {
    localStorage.setItem("recent-timers", JSON.stringify([]));
  }
  let recents = JSON.parse(localStorage.getItem("recent-timers"));

  let chip = document.createElement("a");
  chip.className = "chip white black-text";

  for (const element of recents) {
    chip.href = "javascript:startTimer(" + element + ")";

    let h = Math.floor(element / 60);
    let m = element % 60;
    let str = "";
    if (h) {
      str += h;
      str += "h";
    }
    if (m && h) {
      str += " ";
    }
    if (m) {
      str += m;
      str += "m";
    }

    chip.innerText = str;

    startPage.recentChips.appendChild(chip.cloneNode(true));
  }
};
updateRecentChips();

let endTime = new Date();

let tickTimeout = setTimeout(() => {}, 0); // valid initial state

let tick = () => {
  clearTimeout(tickTimeout);

  let now = new Date();

  let h = String(now.getHours() % 12);
  if (h === "0") {
    h = "12";
  }
  let m = String(now.getMinutes());
  if (m.length === 1) {
    m = "0" + m;
  }
  timerPage.currentTime.innerText = h + ":" + m;

  if (!clockMode) {
    if (now.getTime() >= endTime.getTime()) {
      document.body.classList.add("end");
      toolbox.set(toolbox.pause, toolbox.pause.state);
      toolbox.set(toolbox.exit, toolbox.exit.state);
      toolbox.set(toolbox.endTime, toolbox.endTime.state);
    }

    if (toolbox.endTime.state) {
      let h = String(endTime.getHours() % 12);
      if (h === "0") {
        h = "12";
      }
      let m = String(endTime.getMinutes());
      if (m.length === 1) {
        m = "0" + m;
      }

      timerPage.bottomValue.innerText = h + ":" + m;
    } else {
      let remainingMin = (endTime.getTime() - now.getTime()) / 60000;
      timerPage.bottomValue.innerText = Math.ceil(remainingMin);
    }
  } else {
    timerPage.bottomLabel.innerText = Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(now);
  }

  tickTimeout = setTimeout(tick, 1000);
};

let realResize = () => {
  let lowerBound = 1;
  let upperBound = 1000000;

  while (lowerBound < upperBound - 1) {
    console.log(lowerBound, upperBound);
    timerPage.page.style.fontSize = (lowerBound + upperBound) / 2 + "px";
    if (
      timerPage.currentTimeLabel.offsetHeight +
        timerPage.currentTime.offsetHeight +
        timerPage.bottomLabel.offsetHeight +
        timerPage.bottomValue.offsetHeight >
        window.innerHeight - 32 ||
      Math.max(
        timerPage.currentTimeLabel.offsetWidth,
        timerPage.currentTime.offsetWidth,
        timerPage.bottomLabel.offsetWidth,
        timerPage.bottomValue.offsetWidth
      ) >
        window.innerWidth - 32
    ) {
      upperBound = Math.floor((lowerBound + upperBound) / 2);
    } else {
      lowerBound = Math.floor((lowerBound + upperBound) / 2);
    }
  }
};
let resizeTimeout = setTimeout(() => {}, 0); // valid initial state

let resize = () => {
  clearTimeout(resizeTimeout);
  setTimeout(realResize, 100);
};

let startTimer = (min) => {
  clockMode = false;

  toolbox.pause.element.classList.remove("hide");
  toolbox.endTime.element.classList.remove("hide");
  toolbox.exit.element.classList.remove("hide");
  toolbox.exitClock.element.classList.add("hide");

  timerPage.bottomValue.classList.remove("hide");

  let now = new Date();
  endTime = new Date(now.getTime() + min * 60000);

  startPage.page.classList.add("hide");
  timerPage.page.classList.remove("hide");
  toolbox.container.classList.remove("hide");

  toolbox.set(toolbox.pause, false);
  toolbox.set(toolbox.endTime, false);
  toolbox.set(toolbox.exit, false);

  timerPage.bottomLabel.innerText = "Time Remaining";

  addRecentChip(min);

  tick();
  realResize();
};

let showClock = () => {
  clockMode = true;

  toolbox.pause.element.classList.add("hide");
  toolbox.endTime.element.classList.add("hide");
  toolbox.exit.element.classList.add("hide");
  toolbox.exitClock.element.classList.remove("hide");

  timerPage.bottomValue.classList.add("hide");

  startPage.page.classList.add("hide");
  timerPage.page.classList.remove("hide");
  toolbox.container.classList.remove("hide");

  toolbox.set(toolbox.pause, false);
  toolbox.set(toolbox.endTime, false);
  toolbox.set(toolbox.exit, false);

  tick();
  realResize();
};

window.addEventListener("resize", resize);

let pauseAt = 0;
let pauseTimer = () => {
  pauseAt = new Date().getTime();
  timerPage.page.style.color = "#aaaaaa";
  clearTimeout(tickTimeout);
};
let resumeTimer = () => {
  let delta = new Date().getTime() - pauseAt;
  endTime = new Date(endTime.getTime() + delta);
  timerPage.page.style.color = "#ffffff";
  setTimeout(tick, 0);
};
let displayEndTime = () => {
  timerPage.bottomLabel.innerText = "End Time";
  tick();
};
let displayRemaining = () => {
  timerPage.bottomLabel.innerText = "Time Remaining";
  tick();
};
let exitTimer = () => {
  clearTimeout(tickTimeout);
  updateRecentChips();

  document.body.classList.remove("end");

  startPage.page.classList.remove("hide");
  timerPage.page.classList.add("hide");
  toolbox.container.classList.add("hide");
};
let exitClock = () => {
  clearTimeout(tickTimeout);

  document.body.classList.remove("end");

  startPage.page.classList.remove("hide");
  timerPage.page.classList.add("hide");
  toolbox.container.classList.add("hide");
};

toolbox.container.addEventListener("toolbox-toggle", (e) => {
  switch (e.detail.el) {
    case "pause":
      e.detail.state ? pauseTimer() : resumeTimer();
      break;
    case "endTime":
      e.detail.state ? displayEndTime() : displayRemaining();
      break;
    case "exit":
      exitTimer();
      break;
    case "exitClock":
      exitClock();
      break;
  }
});

startPage.inputForm.addEventListener("submit", (e) => {
  e.preventDefault && e.preventDefault();

  let value = parseInt(startPage.inputField.value);

  if (Number.isNaN(value)) {
    alert("Invalid number");
  } else {
    startTimer(value);
  }

  return false;
});

document
  .getElementById("clock-mode-button")
  .addEventListener("click", showClock);

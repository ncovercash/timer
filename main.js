let startPage = {
	page: document.getElementById("start-page"),
	inputField: document.getElementById("num-minutes"),
	inputForm: document.getElementById("custom-minutes-form"),
	recentChips: document.getElementById("recent-chip-container")
};
let timerPage = {
	page: document.getElementById("timer-page"),
	currentTimeLabel: document.getElementById("current-time-label"),
	currentTime: document.getElementById("current-time"),
	bottomLabel: document.getElementById("bottom-area-label"),
	bottomValue: document.getElementById("bottom-area-value")
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
		element: document.getElementById("play-pause-icon")
	},
	endTime: {
		state: false,
		trueIcon: "access_time",
		falseIcon: "access_time",
		trueColor: "#ffffff",
		falseColor: "#aaaaaa",
		trueDarkColor: "#002200",
		falseDarkColor: "#1b5e20",
		element: document.getElementById("show-time-icon")
	},
	exit: {
		state: false, // never actually true
		trueIcon: "clear",
		falseIcon: "clear",
		trueColor: "#ffffff",
		falseColor: "#ffffff",
		trueDarkColor: "#1b5e20",
		falseDarkColor: "#1b5e20",
		element: document.getElementById("exit-icon")
	},
	set: (obj, state) => {
		obj.state = state;
		obj.element.innerText = state ? obj.trueIcon : obj.falseIcon;
		obj.element.style.color = state ? (document.body.classList.contains("end") ? obj.trueDarkColor : obj.trueColor) : (document.body.classList.contains("end") ? obj.falseDarkColor : obj.falseColor);
	}
};

toolbox.pause.element.addEventListener("click", (e) => {
	toolbox.set(toolbox.pause, !toolbox.pause.state);
	toolbox.container.dispatchEvent(new CustomEvent("toolbox-toggle", { detail: { el: "pause", state: toolbox.pause.state } }));
});
toolbox.endTime.element.addEventListener("click", (e) => {
	toolbox.set(toolbox.endTime, !toolbox.endTime.state);
	toolbox.container.dispatchEvent(new CustomEvent("toolbox-toggle", { detail: { el: "endTime", state: toolbox.endTime.state } }));
});
toolbox.exit.element.addEventListener("click", (e) => {
	toolbox.set(toolbox.exit, !toolbox.exit.state);
	toolbox.container.dispatchEvent(new CustomEvent("toolbox-toggle", { detail: { el: "exit", state: toolbox.exit.state } }));
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
	for (var i = existingItems.length-1; i >= 0; i--) {
		existingItems[i].remove();
	}

	if (localStorage.getItem("recent-timers") == null) {
		localStorage.setItem("recent-timers", JSON.stringify([]));
	}
	let recents = JSON.parse(localStorage.getItem("recent-timers"));

	let chip = document.createElement("a");
	chip.className = "chip white black-text";

	for (var i = 0; i < recents.length; i++) {
		chip.href = "javascript:startTimer("+recents[i]+")";

		let h = Math.floor(recents[i]/60);
		let m = recents[i] % 60;
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
	if (now.getTime() >= endTime.getTime()) {
		document.body.classList.add("end");
		toolbox.set(toolbox.pause, toolbox.pause.state);
		toolbox.set(toolbox.exit, toolbox.exit.state);
		toolbox.set(toolbox.endTime, toolbox.endTime.state);
	}

	let h = String(now.getHours() % 12);
	if (h === "0") {
		h = "12";
	}
	let m = String(now.getMinutes());
	if (m.length === 1) {
		m = "0" + m;
	}
	timerPage.currentTime.innerText = h + ":" + m;

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
		let remainingMin = (endTime.getTime() - now.getTime())/60000;
		timerPage.bottomValue.innerText = Math.ceil(remainingMin);
	}

	tickTimeout = setTimeout(tick, 1000);
}

let resize = () => {
	let maxHeight = window.innerHeight;

	let smallHeight = maxHeight*0.15;
	let bigHeight = maxHeight*0.35;

	timerPage.currentTimeLabel.style.lineHeight = Math.floor(smallHeight)+"px";
	timerPage.currentTimeLabel.style.fontSize = Math.floor(smallHeight*2/3)+"px";
	timerPage.currentTime.style.lineHeight = Math.floor(bigHeight)+"px";
	timerPage.currentTime.style.fontSize = Math.floor(bigHeight*2/3)+"px";

	timerPage.bottomLabel.style.lineHeight = Math.floor(smallHeight)+"px";
	timerPage.bottomLabel.style.fontSize = Math.floor(smallHeight*2/3)+"px";
	timerPage.bottomValue.style.lineHeight = Math.floor(bigHeight)+"px";
	timerPage.bottomValue.style.fontSize = Math.floor(bigHeight*2/3)+"px";

	// decrease font size to fit
	let i=0;
	while (timerPage.currentTimeLabel.offsetHeight > smallHeight+2) { // 2px to account for rounding
		timerPage.currentTimeLabel.style.fontSize = Math.floor((smallHeight*2/3)-(i++))+"px";
	}
	i=0;
	while (timerPage.currentTime.offsetHeight > bigHeight+2) { // 2px to account for rounding
		timerPage.currentTime.style.fontSize = Math.floor((bigHeight*2/3)-(i++))+"px";
	}
	i=0;
	while (timerPage.bottomLabel.offsetHeight > smallHeight+2) { // 2px to account for rounding
		timerPage.bottomLabel.style.fontSize = Math.floor((smallHeight*2/3)-(i++))+"px";
	}
	i=0;
	while (timerPage.bottomValue.offsetHeight > bigHeight+2) { // 2px to account for rounding
		timerPage.bottomValue.style.fontSize = Math.floor((bigHeight*2/3)-(i++))+"px";
	}
};

let startTimer = (min) => {
	let now = new Date();
	endTime = new Date(now.getTime() + min*60000);

	startPage.page.classList.add("hide");
	timerPage.page.classList.remove("hide");
	// timerPage.page.style.color = "#ffffff";
	toolbox.container.classList.remove("hide");

	toolbox.set(toolbox.pause, false);
	toolbox.set(toolbox.endTime, false);
	toolbox.set(toolbox.exit, false);

	timerPage.bottomLabel.innerText = "Time Remaining";

	addRecentChip(min);

	tick();
	resize();
}

window.addEventListener("resize", resize);

let pauseAt = 0;
let pauseTimer = () => {
	pauseAt = (new Date()).getTime();
	timerPage.page.style.color = "#aaaaaa";
	clearTimeout(tickTimeout);
};
let resumeTimer = () => {
	let delta = new Date().getTime() - pauseAt;
	endTime = new Date(endTime.getTime() + delta);
	timerPage.page.style.color = "#ffffff";
	tickTimout = setTimeout(tick, 0);
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
	}
})

startPage.inputForm.addEventListener("submit", (e) => {
	e.preventDefault && e.preventDefault();

	let value = parseInt(startPage.inputField.value);

	if (Number.isNaN(value)) {
		alert("Invalid number");
		return false;
	}

	startTimer(value);

	return false;
});

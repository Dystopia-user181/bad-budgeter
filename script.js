let currentDate = 0
function refreshDate() {
    currentDate = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
}
refreshDate();
setInterval(refreshDate, 1000);

const saveKey = "2h5vlo2xhy7qlojblcq";
let record = {};
let savedCategories = ["Rent", "Food", "Health", "Care", "Clean", "Transport"];
const specialCategories = ["Misc"];

const saved = localStorage.getItem(saveKey);
if (saved) {
    const obj = JSON.parse(saved);
    record = obj.record;
    savedCategories = obj.savedCategories;
}

let viewCategories = new Set(savedCategories.concat(specialCategories));

function addEvent() {
    const category = document.getElementById("event-category").value;
    const price = parseFloat(document.getElementById("event-amount").value);
    const note = document.getElementById("event-note").value;
    if (!record[currentDate]) {
        record[currentDate] = [];
    }
    record[currentDate].push([category, price, note]);
    save();
    updateEventsListInterface();
}

function deleteEvent(idx) {
    record[currentDate].splice(idx, 1);
    save();
    updateEventsListInterface();
}

function createCategory() {
    const name = prompt("Name your new category:");
    if (!savedCategories.includes(name) && !specialCategories.includes(name)) savedCategories.push(name);
    save();
    updateCategoryDisplay();
}

function deleteCategory(idx) {
    const name = savedCategories[idx];
    if (prompt(`Are you sure you want to delete category ${name}? Type "YES" to continue`) === "YES") {
        savedCategories.splice(idx, 1);
        for (const d in record) {
            for (const i of record[d]) {
                if (i[0] === name) i[0] = "Misc";
            }
        }
        save();
        updateCategoryDisplay();
        updateEventsListInterface();
    }
}
function createCategoryElement(base, idx) {
    const text = document.createElement("b");
    text.innerText = savedCategories[idx];
    base.appendChild(text);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = viewCategories.has(savedCategories[idx]);
    checkbox.addEventListener("change", (event) => {
        if (event.target.checked) {
            viewCategories.add(savedCategories[idx]);
        } else {
            viewCategories.delete(savedCategories[idx]);
        }
        updateEventsListInterface();
        updateCategoryDisplay();
    });
    base.appendChild(checkbox);
    const del = document.createElement("button");
    del.innerText = "Del";
    del.addEventListener("click", () => deleteCategory(idx));
    base.appendChild(del);
}

function createSpecialCategoryElement(base, idx) {
    const text = document.createElement("b");
    text.innerText = specialCategories[idx];
    base.appendChild(text);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = viewCategories.has(specialCategories[idx]);
    checkbox.addEventListener("change", (event) => {
        if (event.target.checked) {
            viewCategories.add(specialCategories[idx]);
        } else {
            viewCategories.delete(specialCategories[idx]);
        }
        updateEventsListInterface();
        updateCategoryDisplay();
    });
    base.appendChild(checkbox);
    base.appendChild(document.createElement("div"));
}

function toggleAllCategoryDisplay() {
    if (viewCategories.size < savedCategories.length + specialCategories.length) {
        viewCategories = new Set(savedCategories.concat(specialCategories));
    } else {
        viewCategories.clear();
    }
    updateCategoryDisplay();
}

function updateCategoryDisplay() {
    const cDisp = document.getElementById("category-display");
    cDisp.innerHTML = "";
    const text = document.createElement("b");
    text.innerText = "All";
    cDisp.appendChild(text);
    const masterCheckbox = document.createElement("input");
    masterCheckbox.type = "checkbox";
    masterCheckbox.checked = viewCategories.size >= savedCategories.length + specialCategories.length;
    masterCheckbox.addEventListener("change", toggleAllCategoryDisplay);
    cDisp.appendChild(masterCheckbox);
    cDisp.appendChild(document.createElement("div"));
    let choice = "";
    for (const i in savedCategories) {
        createCategoryElement(cDisp, i);
        choice += `<option value="${savedCategories[i]}">${savedCategories[i]}</option>`
    }
    for (const i in specialCategories) {
        createSpecialCategoryElement(cDisp, i);
        choice += `<option value="${specialCategories[i]}">${specialCategories[i]}</option>`
    }
    document.getElementById("event-category").innerHTML = choice;
    updateEventsListInterface();
}
updateCategoryDisplay();

function getDaysInMonth(year, month) {
  var date = new Date(Date.UTC(year, month, 1));
  var days = [];
  while (date.getUTCMonth() === month) {
    days.push(new Date(date));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return days;
}

let showAddEvents = false;
function showHideAddEvents() {
    showAddEvents = !showAddEvents;
    if (showAddEvents) {
        document.getElementById("add-events").style.display = "block";
    } else {
        document.getElementById("add-events").style.display = "none";
    }
}

function save() {
    localStorage.setItem(saveKey, JSON.stringify({ record, savedCategories }));
}

function initViewSelectInterface() {
    const yearList = [new Date().getFullYear()];
    for (const i in record) {
        const y = new Date(i).getUTCFullYear();
        if (!yearList.includes(y)) yearList.push(y);
    }
    yearList.sort();
    let yearChoice = "";
    for (const y of yearList) {
        yearChoice += `<option value="${y}" ${
            yearList === new Date().getFullYear() ? "selected" : ""
        }>${y}</option>`;
    }
    document.getElementById("view-year").innerHTML = yearChoice;
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthChoice = "";
    for (let i = 0; i < 12; i++) {
        monthChoice += `<option value="${i}" ${
            i === new Date().getMonth() ? "selected" : ""
        }>${months[i]}</option>`;
    }
    document.getElementById("view-month").innerHTML = monthChoice;
    updateViewSelectInterface();
}

function updateViewSelectInterface() {
    const y = Number(document.getElementById("view-year").value);
    const m = Number(document.getElementById("view-month").value);
    const days = getDaysInMonth(y, m).length;
    let dayChoice = "<option value='-1'>All</option>";
    for (let i = 1; i <= days; i++) {
        dayChoice += `<option value="${i}" ${
            y === new Date().getFullYear() &&
            m === new Date().getMonth() &&
            i === new Date().getDate() ? "selected" : ""
        }>${('0' + i).slice(-2)}</option>`;
    }
    document.getElementById("view-day").innerHTML = dayChoice;
    updateEventsListInterface();
}

initViewSelectInterface();

function updateEventsListInterface() {
    const y = Number(document.getElementById("view-year").value);
    const m = Number(document.getElementById("view-month").value);
    const d = Number(document.getElementById("view-day").value);
    let eventsList = [];
    let total = 0;
    for (const timestamp in record) {
        if (new Date(Number(timestamp)).getUTCFullYear() === y &&
        new Date(Number(timestamp)).getUTCMonth() === m &&
        (d === -1 || new Date(Number(timestamp)).getUTCDate() == d)) {
            eventsList = eventsList.concat(record[timestamp]);
        }
    }
    let base = "";
    for (const i in eventsList) {
        const e = eventsList[i];
        if (!viewCategories.has(e[0])) continue;
        base += `<b>${e[0]}</b> <span>\$${e[1].toFixed(2)}</span> <span class="note">${e[2]}</span>`;
        total += e[1];
    }
    if (base === "") base = "Nothing here";
    else {
        base += "<hr><hr><hr>";
        base += `<b>All</b> <span>\$${total.toFixed(2)}</span>`;
    }
    document.getElementById("events-list").innerHTML = base;
}

function removeLastEvent() {
    if (confirm("Are you sure?")) {
        let latest = 0;
        for (const t in record) latest = Math.max(latest, t);
        record[latest].pop();
        updateEventsListInterface();
    }
}

function exportData() {
    const element = document.createElement('a');
    const text = JSON.stringify({
        saveKey,
        record,
        savedCategories,
    });
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', "budgeter-export.txt");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function importData(files) {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const x = JSON.parse(reader.result);
            if (x.saveKey === saveKey) {
                record = x.record;
                savedCategories = x.savedCategories;
                initViewSelectInterface();
                updateCategoryDisplay();
            }
        } catch (e) {}
    }
    reader.readAsText(file);
}
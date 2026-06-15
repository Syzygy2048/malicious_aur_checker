const bundledMaliciousListUrl = "./compromised_aurs.list";

const packageInput = document.getElementById("package-input");
const maliciousInput = document.getElementById("malicious-input");
const packageFile = document.getElementById("package-file");
const maliciousFile = document.getElementById("malicious-file");
const checkButton = document.getElementById("check-button");
const clearPackagesButton = document.getElementById("clear-packages");
const clearMaliciousButton = document.getElementById("clear-malicious");
const resultList = document.getElementById("result-list");
const resultEmpty = document.getElementById("result-empty");
const inputCount = document.getElementById("input-count");
const maliciousCount = document.getElementById("malicious-count");
const matchCount = document.getElementById("match-count");
const listFilter = document.getElementById("list-filter");
const listBrowser = document.getElementById("list-browser");
const template = document.getElementById("result-template");

let loadedMaliciousList = [];

const normalizePackageName = (value) => value.trim().toLowerCase();

function parsePackageLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .map((line) => line.split(/\s+/)[0])
    .map(normalizePackageName)
    .filter(Boolean);
}

function copyText(text, button) {
  const done = () => {
    const previous = button.textContent;
    button.textContent = "✓";
    window.setTimeout(() => {
      button.textContent = previous;
    }, 1000);
  };

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(fallbackCopy);
    return;
  }

  fallbackCopy();

  function fallbackCopy() {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.top = "-9999px";
    fallback.style.left = "-9999px";
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
    done();
  }
}

function renderResults(matches, checkedCount) {
  inputCount.textContent = String(checkedCount);
  matchCount.textContent = String(matches.length);
  resultList.innerHTML = "";

  if (!matches.length) {
    resultEmpty.hidden = false;
    resultList.hidden = true;
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const match of matches) {
    const card = template.content.cloneNode(true);
    card.querySelector(".pkg-name").textContent = match;
    fragment.appendChild(card);
  }

  resultList.appendChild(fragment);
  resultEmpty.hidden = true;
  resultList.hidden = false;
}

function renderMaliciousList(filterValue = "") {
  const query = normalizePackageName(filterValue);
  const filtered = query
    ? loadedMaliciousList.filter((pkg) => pkg.includes(query))
    : loadedMaliciousList;

  listBrowser.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const pkg of filtered) {
    const item = document.createElement("li");
    if (query) {
      const index = pkg.indexOf(query);
      const before = pkg.slice(0, index);
      const match = pkg.slice(index, index + query.length);
      const after = pkg.slice(index + query.length);
      item.innerHTML = `${before}<mark>${match}</mark>${after}`;
    } else {
      item.textContent = pkg;
    }
    fragment.appendChild(item);
  }

  listBrowser.appendChild(fragment);
  maliciousCount.textContent = String(loadedMaliciousList.length);
}

function checkPackages() {
  const installed = [...new Set(parsePackageLines(packageInput.value))];
  const maliciousSet = new Set(parsePackageLines(maliciousInput.value));
  const matches = installed.filter((pkg) => maliciousSet.has(pkg)).sort((a, b) => a.localeCompare(b));
  renderResults(matches, installed.length);
}

function loadTextIntoField(file, field, afterLoad) {
  if (!file) {
    return;
  }

  file
    .text()
    .then((text) => {
      field.value = text;
      afterLoad?.();
    })
    .catch((error) => {
      console.error(error);
    });
}

function wireCopyButtons() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy]");
    if (!button) {
      return;
    }

    event.preventDefault();
    copyText(button.dataset.copy, button);
  });
}

async function loadBundledMaliciousList() {
  try {
    const response = await fetch(bundledMaliciousListUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    maliciousInput.value = text;
    loadedMaliciousList = parsePackageLines(text);
    renderMaliciousList(listFilter.value);
    checkPackages();
  } catch (error) {
    console.error(error);
    renderMaliciousList(listFilter.value);
  }
}

packageFile.addEventListener("change", () => {
  loadTextIntoField(packageFile.files?.[0], packageInput, checkPackages);
});

maliciousFile.addEventListener("change", () => {
  loadTextIntoField(maliciousFile.files?.[0], maliciousInput, () => {
    loadedMaliciousList = parsePackageLines(maliciousInput.value);
    renderMaliciousList(listFilter.value);
    checkPackages();
  });
});

packageInput.addEventListener("input", () => {
  checkPackages();
});

maliciousInput.addEventListener("input", () => {
  loadedMaliciousList = parsePackageLines(maliciousInput.value);
  renderMaliciousList(listFilter.value);
  checkPackages();
});

clearPackagesButton.addEventListener("click", () => {
  packageInput.value = "";
  packageFile.value = "";
  checkPackages();
});

clearMaliciousButton.addEventListener("click", () => {
  maliciousInput.value = "";
  maliciousFile.value = "";
  loadedMaliciousList = [];
  renderMaliciousList(listFilter.value);
  checkPackages();
});

checkButton.addEventListener("click", checkPackages);

listFilter.addEventListener("input", (event) => {
  renderMaliciousList(event.target.value);
});

wireCopyButtons();
loadBundledMaliciousList();

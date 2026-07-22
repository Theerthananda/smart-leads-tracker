const inputBtn = document.getElementById("input-btn");
const clearBtn = document.getElementById("clear-btn");
const inputEle = document.getElementById("input-ele");
const ulEle = document.getElementById("ul-ele");
const tabBtn = document.getElementById("tab-btn");
const searchEle = document.getElementById("search-ele");
const counterEle = document.getElementById("counter-ele");
const toast = document.getElementById("toast");
const sortBtn = document.getElementById("sort-btn");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const themeBtn = document.getElementById("theme-btn");
const savedTheme = localStorage.getItem("theme");

let MyLeads = [];
let toastTimer;
let isAscending = true;

if (savedTheme === "dark") {
  document.body.classList.add("dark");

  themeBtn.textContent = "☀️ Light Mode";
}

const leadsFromLocalStorage = JSON.parse(localStorage.getItem("MyLeads"));

if (leadsFromLocalStorage) {

    MyLeads = leadsFromLocalStorage.map(item => {

        if (typeof item === "string") {

            return {
                id: Date.now() + Math.random(),
                url: item,
                favorite: false,
                createdAt: new Date().toISOString()
            };

        }

        return item;

    });
sortLeads();
    render(MyLeads);

}

function formatUrl(url) {
  url = url.trim();

  if (
    url.includes(".") &&
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) {
    url = "https://" + url;
  }

  return url;
}

function showToast(message) {
  clearTimeout(toastTimer);

  toast.textContent = message;

  toast.classList.add("show");

  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2000);
}

themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeBtn.textContent = "☀️ Light Mode";

    localStorage.setItem("theme", "dark");
  } else {
    themeBtn.textContent = "🌙 Dark Mode";

    localStorage.setItem("theme", "light");
  }
});
searchEle.addEventListener("input", function () {
  const searchText = searchEle.value.toLowerCase();

  const filteredLeads = MyLeads.filter(function (lead) {
    return lead.url.toLowerCase().includes(searchText);
  });

  render(filteredLeads);
});

tabBtn.addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0].url;

  if (MyLeads.some((lead) => lead.url === currentTab)) {
    showToast("⚠️ URL already exists");
    return;
}

    MyLeads.push({
      id: Date.now(),
      url: currentTab,
      favorite: false,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem("MyLeads", JSON.stringify(MyLeads));
sortLeads();
    render(MyLeads);

    showToast("✅ Tab Saved");
  });
});

inputBtn.addEventListener("click", function () {
  const newLead = formatUrl(inputEle.value);

  if (newLead === "") {
    return;
  }

  if (MyLeads.some((lead) => lead.url === newLead)) {
    showToast("⚠️ URL already exists");
    return;
  }

  MyLeads.push({
    id: Date.now(),
    url: newLead,
    favorite: false,
    createdAt: new Date().toISOString(),
  });

  inputEle.value = "";

  localStorage.setItem("MyLeads", JSON.stringify(MyLeads));
sortLeads();
  render(MyLeads);

  showToast("✅ Link Saved");
});

clearBtn.addEventListener("dblclick", function () {
  localStorage.removeItem("MyLeads");

  MyLeads = [];
sortLeads();
  render(MyLeads);

  showToast("🧹 All Links Deleted");
});

inputEle.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    inputBtn.click();
  }
});

exportBtn.addEventListener("click", function () {
  const data = JSON.stringify(MyLeads, null, 2);

  const blob = new Blob([data], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = "my-links.json";

  a.click();

  URL.revokeObjectURL(url);

  showToast("📤 Links Exported");
});

importBtn.addEventListener("click", function () {
  importFile.click();
});

importFile.addEventListener("change", function () {
  const file = importFile.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    try {
 
      const importedLeads = JSON.parse(reader.result);

      const normalizedLeads = importedLeads.map(item => {
  if (typeof item === "string") {
    return {
      id: Date.now() + Math.random(),
      url: item,
      favorite: false,
      createdAt: new Date().toISOString()
    };
  }
  return item;
});

MyLeads = [...MyLeads, ...normalizedLeads];

MyLeads = MyLeads.filter(
    (lead, index, self) =>
        index === self.findIndex(item => item.url === lead.url)
);

      localStorage.setItem("MyLeads", JSON.stringify(MyLeads));
sortLeads();
      render(MyLeads);

      showToast("📥 Links Imported");
    } catch (error) {
      console.error(error);

      showToast("❌ Invalid JSON File");
    }
  };

  reader.readAsText(file);
});

function sortLeads() {
  MyLeads.sort((a, b) => {
    if (a.favorite === b.favorite) {
      return a.url.localeCompare(b.url);
    }

    return b.favorite - a.favorite;
  });
}

function render(leads) {
  let listItems = "";

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const url = lead.url;

   let domain = "";
let favicon = "";
let displayName = "";
    try {
      domain = new URL(url).hostname;

  const siteName = domain
  .replace("www.", "")
  .split(".")[0];

displayName =
  siteName.charAt(0).toUpperCase() + siteName.slice(1);

      favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
    domain = "Unknown Website";
    displayName = "Unknown";
    favicon = "";
}
    listItems += `
<li class="lead-card">

<div class="lead-content">

    <img
        class="favicon"
        src="${favicon}"
        alt="Website Icon"
        loading="lazy"
        onerror="this.style.display='none';"
    >

    <div class="lead-info">

        <div class="site-name">
            ${displayName}
        </div>

        <a
            href="${url}"
            target="_blank"
        >
            ${url}
        </a>

    </div>

</div>

 <div class="lead-actions">

<button
    class="favorite-btn"
    data-id="${lead.id}"
>
    ${lead.favorite ? "★" : "☆"}
</button>

<button
    class="copy-btn"
    data-url="${url}"
>
    Copy
</button>

<button
    class="delete-btn"
    data-id="${lead.id}"
>
    Delete
</button>

</div>

</li>
`;
  }

  ulEle.innerHTML = listItems;

  counterEle.textContent = `📚 Saved Links: ${MyLeads.length}`;
}

ulEle.addEventListener("click", function (event) {
    // Favorite
if (event.target.classList.contains("favorite-btn")) {

    const id = Number(event.target.dataset.id);

    const lead = MyLeads.find(lead => lead.id === id);

    if (lead) {
        lead.favorite = !lead.favorite;

        localStorage.setItem("MyLeads", JSON.stringify(MyLeads));

        sortLeads();
        render(MyLeads);

        showToast(
            lead.favorite
                ? "⭐ Added to Favorites"
                : "☆ Removed from Favorites"
        );
    }

    return;
}
  // Copy Link
  if (event.target.classList.contains("copy-btn")) {
    const url = event.target.dataset.url;

    navigator.clipboard.writeText(url);

    showToast("📋 Link Copied");

    return;
  }

  // Delete Link
  if (event.target.classList.contains("delete-btn")) {
   const id = Number(event.target.dataset.id);

MyLeads = MyLeads.filter(lead => lead.id !== id);

    localStorage.setItem("MyLeads", JSON.stringify(MyLeads));
sortLeads();
    render(MyLeads);

    showToast("🗑️ Link Deleted");
  }
});

sortBtn.addEventListener("click", function () {
  if (isAscending) {
    MyLeads.sort((a, b) => {
  if (a.favorite !== b.favorite) {
    return b.favorite - a.favorite;
  }

  return a.url.localeCompare(b.url);
});
    showToast("🔤 Sorted A → Z");
  } else {
   MyLeads.sort((a, b) => {
  if (a.favorite !== b.favorite) {
    return b.favorite - a.favorite;
  }

  return b.url.localeCompare(a.url);
});

    showToast("🔠 Sorted Z → A");
  }

  isAscending = !isAscending;

  localStorage.setItem("MyLeads", JSON.stringify(MyLeads));
sortLeads();
  render(MyLeads);
});

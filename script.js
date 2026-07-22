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
    MyLeads = leadsFromLocalStorage;
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

        return lead.toLowerCase().includes(searchText);

    });

    render(filteredLeads);

});

tabBtn.addEventListener("click", function () {

    chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {

            const currentTab = tabs[0].url;

            if (MyLeads.includes(currentTab)) {
                showToast("⚠️ URL already exists");
                return;
            }

            MyLeads.push(currentTab);

            localStorage.setItem(
                "MyLeads",
                JSON.stringify(MyLeads)
            );

            render(MyLeads);

            showToast("✅ Tab Saved");

        }
    );

});

inputBtn.addEventListener("click", function () {

    const newLead = formatUrl(inputEle.value);

    if (newLead === "") {
        return;
    }

    if (MyLeads.includes(newLead)) {
        showToast("⚠️ URL already exists");
        return;
    }

    MyLeads.push(newLead);

    inputEle.value = "";

    localStorage.setItem(
        "MyLeads",
        JSON.stringify(MyLeads)
    );

    render(MyLeads);

    showToast("✅ Link Saved");
});

clearBtn.addEventListener("dblclick", function () {

    localStorage.removeItem("MyLeads");

    MyLeads = [];

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
        type: "application/json"
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

        console.log("Reader Result:");
        console.log(reader.result);

        const importedLeads = JSON.parse(reader.result);

        console.log("Imported Leads:");
        console.log(importedLeads);

        MyLeads = [...new Set([...MyLeads, ...importedLeads])];

        console.log("MyLeads:");
        console.log(MyLeads);

        localStorage.setItem(
            "MyLeads",
            JSON.stringify(MyLeads)
        );

        render(MyLeads);

        showToast("📥 Links Imported");

    } catch (error) {

        console.error(error);

        showToast("❌ Invalid JSON File");

    }

};

    reader.readAsText(file);

});


function render(leads) {

    let listItems = "";

    for (let i = 0; i < leads.length; i++) {

        const url = leads[i];

let domain = "";
let favicon = "";

try {

    domain = new URL(url).hostname;

    favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

} catch {

    domain = "Unknown Website";
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
            ${domain.replace("www.", "")}
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

   <button class="copy-btn" data-url="${url}">
    Copy
</button>

<button class="delete-btn" data-index="${i}">
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

    // Copy Link
    if (event.target.classList.contains("copy-btn")) {

        const url = event.target.dataset.url;

        navigator.clipboard.writeText(url);

        showToast("📋 Link Copied");

        return;
    }

    // Delete Link
    if (event.target.classList.contains("delete-btn")) {

        const index = Number(event.target.dataset.index);

        MyLeads.splice(index, 1);

        localStorage.setItem(
            "MyLeads",
            JSON.stringify(MyLeads)
        );

        render(MyLeads);

        showToast("🗑️ Link Deleted");
    }

});

sortBtn.addEventListener("click", function () {

    if (isAscending) {

        MyLeads.sort();

        showToast("🔤 Sorted A → Z");

    } else {

        MyLeads.sort().reverse();

        showToast("🔠 Sorted Z → A");

    }

    isAscending = !isAscending;

    localStorage.setItem(
        "MyLeads",
        JSON.stringify(MyLeads)
    );

    render(MyLeads);

});
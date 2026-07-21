const inputBtn = document.getElementById("input-btn");
const clearBtn = document.getElementById("clear-btn");
const inputEle = document.getElementById("input-ele");
const ulEle = document.getElementById("ul-ele");
const tabBtn = document.getElementById("tab-btn");

let MyLeads = [];

const leadsFromLocalStorage = JSON.parse(localStorage.getItem("MyLeads"));

if (leadsFromLocalStorage) {
    MyLeads = leadsFromLocalStorage;
    render(MyLeads);
}

tabBtn.addEventListener("click", function () {
    chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
            MyLeads.push(tabs[0].url);

            localStorage.setItem(
                "MyLeads",
                JSON.stringify(MyLeads)
            );

            render(MyLeads);
        }
    );
});

inputBtn.addEventListener("click", function () {

    if (inputEle.value.trim() === "") {
        return;
    }

    MyLeads.push(inputEle.value.trim());

    inputEle.value = "";

    localStorage.setItem(
        "MyLeads",
        JSON.stringify(MyLeads)
    );

    render(MyLeads);
});

clearBtn.addEventListener("dblclick", function () {

    localStorage.removeItem("MyLeads");

    MyLeads = [];

    render(MyLeads);
});

inputEle.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {
        inputBtn.click();
    }

});

function render(leads) {

    let listItems = "";

    for (let i = 0; i < leads.length; i++) {

        listItems += `
            <li>
                <a target="_blank" href="${leads[i]}">
                    ${leads[i]}
                </a>
            </li>
        `;
    }

    ulEle.innerHTML = listItems;
}
(function () {
    "use strict";

    var statusMsg = document.getElementById("status-msg");
    var emptyMsg = document.getElementById("empty-msg");
    var grid = document.getElementById("members-grid");
    var searchInput = document.getElementById("search-input");

    var allMembers = [];

    function createCard(member) {
        var card = document.createElement("article");
        card.className = "member-card";

        card.appendChild(Mentecatos.buildAvatar(member.alias, member.urlFoto));

        var alias = document.createElement("h3");
        alias.className = "member-alias";
        alias.textContent = member.alias;
        card.appendChild(alias);

        if (member.nombre) {
            var nombre = document.createElement("p");
            nombre.className = "member-name";
            nombre.textContent = member.nombre;
            card.appendChild(nombre);
        }

        var birthday = Mentecatos.formatBirthday(member.fecNac);
        if (birthday) {
            var bday = document.createElement("span");
            bday.className = "member-birthday";
            bday.textContent = "🎂 " + birthday;
            card.appendChild(bday);
        }

        return card;
    }

    function render(members) {
        grid.innerHTML = "";

        if (members.length === 0) {
            grid.hidden = true;
            emptyMsg.hidden = false;
            return;
        }

        emptyMsg.hidden = true;
        grid.hidden = false;

        members.forEach(function (member) {
            grid.appendChild(createCard(member));
        });
    }

    function applyFilter() {
        var term = searchInput.value.trim().toLowerCase();

        if (!term) {
            render(allMembers);
            return;
        }

        var filtered = allMembers.filter(function (m) {
            return m.alias.toLowerCase().indexOf(term) !== -1 ||
                (m.nombre && m.nombre.toLowerCase().indexOf(term) !== -1);
        });

        render(filtered);
    }

    function showError() {
        statusMsg.hidden = false;
        grid.hidden = true;
        emptyMsg.hidden = true;
        statusMsg.innerHTML = "";

        var text = document.createTextNode("No se pudo cargar la lista de integrantes. ");
        statusMsg.appendChild(text);

        var btn = document.createElement("button");
        btn.className = "retry-btn";
        btn.textContent = "Reintentar";
        btn.onclick = loadMembers;
        statusMsg.appendChild(document.createElement("br"));
        statusMsg.appendChild(btn);
    }

    function loadMembers() {
        statusMsg.hidden = false;
        statusMsg.textContent = "Cargando integrantes...";
        grid.hidden = true;
        emptyMsg.hidden = true;

        Mentecatos.fetchMembers()
            .then(function (members) {
                allMembers = members;
                statusMsg.hidden = true;
                applyFilter();
            })
            .catch(function (err) {
                console.error("Error cargando integrantes:", err);
                showError();
            });
    }

    searchInput.addEventListener("input", applyFilter);

    loadMembers();
})();

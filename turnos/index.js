(function () {
    "use strict";

    var CSV_URL_TURNOS = "https://docs.google.com/spreadsheets/d/" + Mentecatos.SHEET_ID + "/gviz/tq?tqx=out:csv&sheet=Turnos";

    var statusMsg = document.getElementById("turnos-status");
    var groupsEl = document.getElementById("turnos-groups");

    function buildMembersMap(members) {
        var map = {};
        members.forEach(function (m) {
            map[m.alias.toLowerCase()] = m;
        });
        return map;
    }

    function createTurnoCard(alias, membersMap) {
        var member = membersMap[alias.toLowerCase()];

        var card = document.createElement("div");
        card.className = "turno-card";
        card.appendChild(Mentecatos.buildAvatar(alias, member ? member.urlFoto : ""));

        var aliasEl = document.createElement("p");
        aliasEl.className = "turno-alias";
        aliasEl.textContent = alias;
        card.appendChild(aliasEl);

        if (member && member.nombre) {
            var nombreEl = document.createElement("p");
            nombreEl.className = "turno-name";
            nombreEl.textContent = member.nombre;
            card.appendChild(nombreEl);
        }

        return card;
    }

    function renderTurnos(groups, membersMap) {
        groupsEl.innerHTML = "";

        groups.forEach(function (group, idx) {
            var section = document.createElement("div");
            section.className = "turno-group";

            var header = document.createElement("div");
            header.className = "turno-group-header";

            var badge = document.createElement("span");
            badge.className = "turno-group-badge";
            badge.textContent = idx + 1;
            header.appendChild(badge);

            var title = document.createElement("h3");
            title.className = "turno-group-title";
            title.textContent = group.name;
            header.appendChild(title);

            section.appendChild(header);

            var membersRow = document.createElement("div");
            membersRow.className = "turno-members";
            group.aliases.forEach(function (alias) {
                membersRow.appendChild(createTurnoCard(alias, membersMap));
            });
            section.appendChild(membersRow);

            groupsEl.appendChild(section);
        });

        groupsEl.hidden = false;
    }

    function showError() {
        statusMsg.hidden = false;
        groupsEl.hidden = true;
        statusMsg.innerHTML = "";

        statusMsg.appendChild(document.createTextNode("No se pudo cargar la lista de turnos. "));

        var btn = document.createElement("button");
        btn.className = "retry-btn";
        btn.textContent = "Reintentar";
        btn.onclick = loadTurnos;
        statusMsg.appendChild(document.createElement("br"));
        statusMsg.appendChild(btn);
    }

    function loadTurnos() {
        statusMsg.hidden = false;
        statusMsg.textContent = "Cargando turnos...";
        groupsEl.hidden = true;

        Promise.all([
            Mentecatos.fetchMembers(),
            fetch(CSV_URL_TURNOS, { cache: "no-store" }).then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.text();
            })
        ])
            .then(function (results) {
                var members = results[0];
                var csvText = results[1];

                // First row is the header ("Grupo","integrante"); data starts at row 2.
                var rows = Mentecatos.parseCsv(csvText).slice(1);
                var order = [];
                var byGroup = {};

                rows.forEach(function (r) {
                    var groupName = (r[0] || "").trim();
                    var alias = (r[1] || "").trim();
                    if (!groupName || !alias) return;

                    if (!byGroup[groupName]) {
                        byGroup[groupName] = { name: groupName, aliases: [] };
                        order.push(byGroup[groupName]);
                    }
                    byGroup[groupName].aliases.push(alias);
                });

                statusMsg.hidden = true;
                renderTurnos(order, buildMembersMap(members));
            })
            .catch(function (err) {
                console.error("Error cargando turnos:", err);
                showError();
            });
    }

    loadTurnos();
})();

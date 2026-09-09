// Shared helpers used by both index.html (Integrantes) and turnos/index.html.
var Mentecatos = (function () {
    "use strict";

    var SHEET_ID = "1mi1JqDxDVEE3EsyNHxSnyU5fKkHQYzq6MUGDk4jQZCQ";
    var CSV_URL_MEMBERS = "https://docs.google.com/spreadsheets/d/" + SHEET_ID + "/gviz/tq?tqx=out:csv";

    var PLACEHOLDER_COLORS = ["#f6d500", "#a8c93c", "#eab308", "#c7d95a"];
    var MESES = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    function parseCsv(text) {
        var rows = [];
        var row = [];
        var field = "";
        var inQuotes = false;

        for (var i = 0; i < text.length; i++) {
            var c = text[i];

            if (inQuotes) {
                if (c === '"') {
                    if (text[i + 1] === '"') {
                        field += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    field += c;
                }
            } else if (c === '"') {
                inQuotes = true;
            } else if (c === ",") {
                row.push(field);
                field = "";
            } else if (c === "\n" || c === "\r") {
                if (c === "\r" && text[i + 1] === "\n") i++;
                row.push(field);
                rows.push(row);
                row = [];
                field = "";
            } else {
                field += c;
            }
        }

        if (field.length > 0 || row.length > 0) {
            row.push(field);
            rows.push(row);
        }

        return rows.filter(function (r) {
            return r.length > 1 || (r[0] && r[0].trim() !== "");
        });
    }

    function formatBirthday(fecNac) {
        var match = /^(\d{4})-(\d{2})-(\d{2})/.exec((fecNac || "").trim());
        if (!match) return null;

        var year = parseInt(match[1], 10);
        var month = parseInt(match[2], 10);
        var day = parseInt(match[3], 10);

        if (!year || !month || !day) return null;

        return day + " de " + MESES[month - 1] + " de " + year;
    }

    function initials(name) {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(function (w) { return w.charAt(0).toUpperCase(); })
            .join("");
    }

    function colorForAlias(alias) {
        var str = alias || "?";
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
        }
        return PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
    }

    function buildPlaceholder(alias) {
        var div = document.createElement("div");
        div.className = "member-photo placeholder";
        div.style.background = colorForAlias(alias);
        div.textContent = initials(alias || "?");
        return div;
    }

    function buildAvatar(alias, urlFoto) {
        var wrap = document.createElement("div");
        wrap.className = "member-photo-wrap";
        wrap.appendChild(buildPlaceholder(alias));

        if (urlFoto) {
            var img = document.createElement("img");
            img.className = "member-photo";
            img.alt = alias;
            img.loading = "lazy";
            img.referrerPolicy = "no-referrer";
            img.onload = function () {
                img.classList.add("is-loaded");
            };
            img.onerror = function () {
                img.style.display = "none";
            };
            img.src = urlFoto;
            wrap.appendChild(img);
        }

        return wrap;
    }

    // Fetches the Integrantes sheet and resolves with the parsed, sorted member list.
    // The ci (cedula) column is intentionally never read - it's not for public display.
    function fetchMembers() {
        return fetch(CSV_URL_MEMBERS, { cache: "no-store" })
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.text();
            })
            .then(function (csvText) {
                // First row from the Sheets export is always a header row; data starts at row 2.
                var dataRows = parseCsv(csvText).slice(1);

                return dataRows
                    .map(function (r) {
                        return {
                            alias: (r[0] || "").trim(),
                            nombre: (r[2] || "").trim(),
                            fecNac: (r[3] || "").trim(),
                            urlFoto: (r[4] || "").trim()
                        };
                    })
                    .filter(function (m) { return m.alias !== ""; })
                    .sort(function (a, b) {
                        return a.alias.localeCompare(b.alias, "es", { sensitivity: "base" });
                    });
            });
    }

    return {
        SHEET_ID: SHEET_ID,
        parseCsv: parseCsv,
        formatBirthday: formatBirthday,
        buildAvatar: buildAvatar,
        fetchMembers: fetchMembers
    };
})();

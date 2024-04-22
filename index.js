const express = require("express");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sass = require('sass');
const ejs = require('ejs');

const Client = require('pg').Client;

var client = new Client({
    database: "cti_2024",
    user: "dvmi",
    password: "ciscosecpa55",
    host: "localhost",
    port: 5432
});
client.connect();

client.query("select * from unnest(enum_range(null::categorie_produs))", function(err, rez) {
    console.log(rez);
})

client.query("select * from products", function (err, rez) {
    console.log(rez);
});

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
}

vect_foldere = ["temp", "temp1"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());
app.set("view engine", "ejs");
app.use("/resurse", express.static(__dirname + "/resurse"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));
// app.listen(8080);
// console.log("Serverul a pornit");

// app.get("/", function(req, res) {
//     res.sendFile(__dirname + "/index.html");
// })

app.get(["/", "/home", "/index"], function (req, res) {
    res.render("pagini/index", { IP: req.IP, imagini: obGlobal.obImagini.imagini });
})

app.get("/data", function (req, res, next) {
    res.write("Data: ");
    next();
})

app.get("/data", function (req, res) {
    res.write("" + new Date());
    res.end();
})

app.get("/suma/:a/:b", function (req, res) {
    var suma = parseInt(req.params.a) + parseInt(req.params.b);
    res.send("" + suma);
})

app.get("/favicon.ico", function (req, res) {
    res.sendFile(path.join(__dirname, "resurse/favicon/favicon.ico"));
})

// -----------------------------------Produse------------------------------

app.get("/produse", function (req, res) {
    console.log(req.query)
    var conditieQuery = "";
    if (req.query.tip) {
        conditieQuery = ` where tip_produs='${req.query.tip}'`
    }
    client.query("select * from unnest(enum_range(null::categorie_produs))", function (err, rezOptiuni) {
        client.query(`select * from products ${conditieQuery}`, function (err, rez) {
            if (err) {
                console.log(err);
                afisareEroare(res, 2);
            }
            else {
                res.render("pagini/produse", { produse: rez.rows, optiuni: [] })
            }
        })
    });
})

app.get("/produs/:id", function (req, res) {
    client.query(`select * from products where id = ${req.params.id}`, function (err, rez) {
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
        }
        else {
            res.render("pagini/produs", { prod: rez.rows[0] });
        }
    });
})

app.get("/*.ejs", function (req, res) {
    afisareEroare(res, 400);
})

app.get(new RegExp("^\/[A-Za-z\/0-9]*\/$"), function (req, res) {
    afisareEroare(res, 403);
})

app.get("/*", function (req, res) {
    //console.log(req.url)
    try {
        res.render("pagini" + req.url, function (err, rezHtml) {
            // console.log(rezHtml);
            // console.log("Eroare:" + err)
            if (err) {
                if (err.message.startsWith("Failed to lookup view")) {
                    afisareEroare(res, 404);
                    console.log("Nu a gasit pagina: ", req.url)
                }
            }
        });
    }
    catch (err1) {
        if (err1.message.startsWith("Cannot find module")) {
            afisareEroare(res, 404);
            console.log("Nu a gasit resursa: ", req.url)
        }
        else {
            afisareEroare(res);
            console.log("Eroare:" + err1)
        }
    }
})

function initErori() {
    var continut = fs.readFileSync(path.join(__dirname, "/resurse/json/eroare.json").toString());
    console.log(continut);
    obGlobal.obErori = JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }
    obGlobal.obErori.eroare_default = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine);
    console.log(obGlobal.obErori);
}

initErori();

function afisareEroare(res, _identificator, _titlu, _text, _imagine) {
    let eroare = obGlobal.obErori.info_erori.find(
        function (elem) {
            return elem.identificator == _identificator;
        }
    );
    if (!eroare) {
        let eroare_default = obGlobal.obErori.eroare_default;
        res.render("eroare", {
            titlu: _titlu || eroare_default.titlu,
            text: _text || eroare_default.text,
            imagine: _imagine || eroare_default.imagine
        }); // al doilea argument este locals
        return;
    }
    else {
        if (eroare.status)
            res.status(eroare.identificator);
        res.render("pagini/eroare", {
            titlu: _titlu || eroare.titlu,
            text: _text || eroare.text,
            imagine: _imagine || eroare.imagine
        });
        return;
    }
}

function initImagini() {
    var continut = fs.readFileSync(path.join(__dirname, "/resurse/json/galerie.json").toString("utf-8"));

    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini) {
        [numeFis, ext] = imag.fisier.split(".");
        let caleFisAbs = path.join(caleAbs, imag.fisier);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        imag.fisier_mediu = path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp");
        imag.fisier = path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier);
    }
    console.log(obGlobal.obImagini);
}
initImagini();

function compileazaScss(caleScss, caleCss) {
    console.log("cale:", caleCss);
    if (!caleCss) {
        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0];   /// "a.scss"  -> ["a","scss"]
        caleCss = numeFis + ".css";
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true });
    }

    // la acest punct avem cai absolute in caleScss si  caleCss
    //TO DO
    let numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisCss))// +(new Date()).getTime()
    }
    rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css);
    //console.log("Compilare SCSS",rez);
}

//compileazaScss("a.scss");
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    console.log(eveniment, numeFis);
    if (eveniment == "change" || eveniment == "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
})

app.listen(8080);
console.log("Serverul a pornit");
const express = require("express");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sass = require('sass');
const ejs = require('ejs');

const AccesBD = require("./module_proprii/accesbd.js");
const formidable = require("formidable");
const { Utilizator } = require("./module_proprii/utilizator.js")
const session = require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");
const utilizator = require("./module_proprii/utilizator.js");

const Client = require('pg').Client;

var client = new Client({
    database: "cti_2024",
    user: "dvmi",
    password: "ciscosecpa55",
    host: "localhost",
    port: 5432
});
client.connect();

client.query("select * from unnest(enum_range(null::categorie_produs))", function (err, rez) {
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

client.query("select * from unnest(enum_range(null::tipuri_produse))", function (err, rezCategorie) {
    if (err) {
        console.log(err);
    }
    else {
        obGlobal.optiuniMeniu = rezCategorie.rows;
    }
});

vect_foldere = ["temp", "temp1", "backup", "poze_uploadate"];
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

app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg', //folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
}));

app.use("/*", function (req, res, next) {
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;
    res.locals.Drepturi = Drepturi;
    if (req.session.utilizator) {
        req.utilizator = res.locals.utilizator = new Utilizator(req.session.utilizator);
    }
    next();
})

app.set("view engine", "ejs");
app.use("/resurse", express.static(__dirname + "/resurse"));
app.use("/poze_uploadate", express.static(__dirname + "/poze_uploadate"));
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

// ----------------------------------Utilizatori-------------------------------

app.post("/inregistrare", function (req, res) {
    var username;
    var poza;
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) { //4
        console.log("Inregistrare:", campuriText);
        console.log(campuriFisier);
        console.log(poza, username);
        var eroare = "";

        var utilizNou = new Utilizator();
        try {
            utilizNou.setareNume = campuriText.nume;
            utilizNou.setareUsername = campuriText.username;
            utilizNou.email = campuriText.email
            utilizNou.prenume = campuriText.prenume

            utilizNou.parola = campuriText.parola;
            utilizNou.culoare_chat = campuriText.culoare_chat;
            utilizNou.poza = poza;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function (u, parametru, eroareUser) {
                if (eroareUser == -1) { //nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else {
                    eroare += "Mai exista username-ul";
                }
                if (!eroare) {
                    res.render("pagini/inregistrare", { raspuns: "Inregistrare cu succes!" })
                }
                else
                    res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
            })
        }
        catch (e) {
            console.log(e);
            eroare += "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare })
        }
    });
    formular.on("field", function (nume, val) {  // 1
        console.log(`--- ${nume}=${val}`);

        if (nume == "username")
            username = val;
    })
    formular.on("fileBegin", function (nume, fisier) { // 2
        console.log("fileBegin");

        console.log(nume, fisier);
        var folderUser = path.join((__dirname, "poze_uploadate", username));
        if (!fs.existsSync(folderUser))
            fs.mkdir(folderUser);

        fisier.filepath = path.join(folderUser, fisier.originalFilename)
        poza = fisier.originalFilename;
        //fisier.filepath=folderUser+"/"+fisier.originalFilename
        console.log("fileBegin:", poza)
        console.log("fileBegin, fisier:", fisier)
    })
    formular.on("file", function (nume, fisier) { // 3
        console.log("file");
        console.log(nume, fisier);
    });
});

app.post("/login", function (req, res) {
    var username;
    console.log("ceva");
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {
        var parametriCallback = {
            req: req,
            res: res,
            parola: campuriText.parola[0],
        }
        Utilizator.getUtilizDupaUsername(campuriText.username[0], parametriCallback, function (u, obparam, eroare) {
            let parolaCriptata = Utilizator.criptareParola(obparam.parola);
            if (u.parola == parolaCriptata && u.confirmat_mail) {
                u.poza = u.poza ? path.join("poze_uploadate", u.username, u.poza) : "";
                obparam.req.session.utilizator = u;
                obparam.req.session.mesajLogin = "Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
            }
            else {
                console.log("Eroare logare")
                obparam.req.session.mesajLogin = "Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.locals.utilizator = null;
    res.render("pagini/logout");
});

//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}
app.get("/cod/:username/:token", function (req, res) {
    /*TO DO parametriCallback: cu proprietatile: request (req) si token (luat din parametrii cererii)
        setat parametriCerere pentru a verifica daca tokenul corespunde userului
    */
    console.log(req.params);
    try {
        var parametriCallback = {
            req: req,
            token: req.params.token
        }
        Utilizator.getUtilizDupaUsername(req.params.username, parametriCallback, function (u, obparam) {
            let parametriCerere = {
                tabel: "utilizatori",
                campuri: { confirmat_mail: true },
                conditiiAnd: [`id=${u.id}`]
            };
            AccesBD.getInstanta().update(
                parametriCerere,
                function (err, rezUpdate) {
                    if (err || rezUpdate.rowCount == 0) {
                        console.log("Cod:", err);
                        afisareEroare(res, 3);
                    }
                    else {
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e) {
        console.log(e);
        afisareEroare(res, 2);
    }
})

app.post("/profil", function (req, res) {
    console.log("profil");
    if (!req.session.utilizator) {
        afisareEroare(res, 403,)
        res.render("pagini/eroare_generala", { text: "Nu sunteti logat." });
        return;
    }
    var formular = new formidable.IncomingForm();
    formular.parse(req, function (err, campuriText, campuriFile) {
        var parolaCriptata = Utilizator.criptareParola(campuriText.parola[0]);
        AccesBD.getInstanta().updateParametrizat(
            {
                tabel: "utilizatori",
                campuri: ["nume", "prenume", "email", "culoare_chat"],
                valori: [
                    `${campuriText.nume[0]}`,
                    `${campuriText.prenume[0]}`,
                    `${campuriText.email[0]}`,
                    `${campuriText.culoare_chat[0]}`],
                conditiiAnd: [
                    `parola='${parolaCriptata}'`,
                    `username='${campuriText.username[0]}'`
                ]
            },
            function (err, rez) {
                if (err) {
                    console.log(err);
                    afisareEroare(res, 2);
                    return;
                }
                console.log(rez.rowCount);
                if (rez.rowCount == 0) {
                    res.render("pagini/profil", { mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa." });
                    return;
                }
                else {
                    //actualizare sesiune
                    console.log("ceva");
                    req.session.utilizator.nume = campuriText.nume[0];
                    req.session.utilizator.prenume = campuriText.prenume[0];
                    req.session.utilizator.email = campuriText.email[0];
                    req.session.utilizator.culoare_chat = campuriText.culoare_chat[0];
                    res.locals.utilizator = req.session.utilizator;
                }
                res.render("pagini/profil", { mesaj: "Update-ul s-a realizat cu succes." });
            });
    });
});

app.get("/*.ejs", function (req, res) {
    afisareEroare(res, 400);
})

app.get(new RegExp("^\/[A-Za-z\/0-9]*\/$"), function (req, res) {
    afisareEroare(res, 403);
})

app.get("/*", function (req, res) {
    // console.log(req.url)
    try {
        res.render("pagini" + req.url, function (err, rezHtml) {
            // console.log(rezHtml);
            // console.log("Eroare:" + err)
            if (err) {
                console.log(err);
                if (err.message.startsWith("Failed to lookup view")) {
                    afisareEroare(res, 404);
                    console.log("Nu a gasit pagina: ", req.url)
                }
            }
            else {
                res.send(rezHtml);
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
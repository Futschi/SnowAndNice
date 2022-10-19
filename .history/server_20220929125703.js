const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

var connection = mysql.createConnection({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "wiedervorlagen_db",
});

connection.connect(function (err) {
  if (!err) {
    console.log("Database is connected");
  } else {
    console.log("Error while connection with database");
  }
});

app.get("/createdb", (req, res) => {
  let sql = "CREATE DATABASE wiedervorlagen_db";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log("result");
    res.send("Database Created");
  });
});

// alles im Lit
app.set("view engine", "ejs"); /*Setzt EJS als "View Engine" -> Template fest*/

app.use(bodyParser.urlencoded({
  extended: true
})); /*um Post requests abzufangen*/

app.use(express.static("public")); /*Middleware, um dem Server "statische" Dateien zur Verfügung zu stellen... z.B. css, js, img https://expressjs.com/de/starter/static-files.html*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '/public/uploads/'))
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})

const upload = multer({
  storage: storage
});

let ruleValue = "0"; /*Initialwert für vorgangNeu.ejs*/
let antragsteller = "natPer";
let eigentuemer = "natPer";

let user = 122; /*Platzhalter, später dynamisch durch Useranmeldung*/
let vorgangsNummer = 1; /*Zählt durch jedes Anlegen eines Vorgangs hoch -> app.post(VorgangNeu)*/
let vorgangsID = user + "-" + vorgangsNummer; /*ID um durch GET-methode (Vorgangs)details.ejs Aufzurufen*/
let detailsID = 0;

let vorgangList = [{
    zustaendigkeit: 122,
    vorgangsID: "0-122",
    grundlage: 5517,
    straßeAst: "Straße 5",
    nummerAst: 4,
    plzAst: "12345",
    nameAst: "Power",
    vornameAst: "Max",
    titelAst: "Overlord",
    geburtstagAst: "",
    gesellschaftNameAst: "",
    gesellschaftFormBt: "",
    vollmachtAst: "",
    straßeEt: "Wutzkyallee",
    nummerEt: 3,
    plzEt: "13245",
    nameEt: "",
    vornameEt: "",
    titelEt: "",
    geburtstagEt: "",
    gesellschaftNameBt: "HuGuMu",
    gesellschaftFormBt: "CoKG",
    vollmachtEt: "true",
    straßeGs: "Kurfürstendamm",
    nummerGs: 666,
    plzGs: "14325",
    bezirkGs: "Schöneberg",
    grundbuchAmtGs: "Schöneberg",
    blattGs: "12AG541"
  }
]; /*wird durch db ersetzt*/

let wiedervorlageList = []; /*wird durch db ersetzt*/
let dokumentList = []; /*wird durch db ersetzt*/

function vorgang( /*constructor zum Anlegen eines Vorgangs*/
  zustaendigkeit,
  vorgangsID,
  grundlage,
  straßeAst,
  nummerAst,
  plzAst,
  nameAst,
  vornameAst,
  titelAst,
  geburtstagAst,
  gesellschaftNameAst,
  gesellschaftFormAst,
  vollmachtAst,
  straßeEt,
  nummerEt,
  plzEt,
  nameEt,
  vornameEt,
  titelEt,
  geburtstagEt,
  gesellschaftNameBt,
  gesellschaftFormBt,
  vollmachtEt,
  straßeGs,
  nummerGs,
  plzGs,
  bezirkGs,
  grundbuchAmtGs,
  blattGs) {
  this.zustaendigkeit = zustaendigkeit;
  this.vorgangsID = vorgangsID;
  this.grundlage = grundlage;
  this.straßeAst = straßeAst;
  this.nummerAst = nummerAst;
  this.plzAst = plzAst;
  this.nameAst = nameAst;
  this.vornameAst = vornameAst;
  this.titelAst = titelAst;
  this.geburtstagAst = geburtstagAst;
  this.gesellschaftNameAst = gesellschaftNameAst;
  this.gesellschaftFormAst = gesellschaftFormAst;
  this.vollmachtAst = vollmachtAst;
  this.straßeEt = straßeEt;
  this.nummerEt = nummerEt;
  this.plzEt = plzEt;
  this.nameEt = nameEt;
  this.vornameEt = vornameEt;
  this.titelEt = titelEt;
  this.geburtstagEt = geburtstagEt;
  this.gesellschaftNameBt = gesellschaftNameBt;
  this.gesellschaftFormBt = gesellschaftFormBt;
  this.vollmachtEt = vollmachtEt;
  this.straßeGs = straßeGs;
  this.nummerGs = nummerGs;
  this.plzGs = plzGs;
  this.bezirkGs = bezirkGs;
  this.grundbuchAmtGs = grundbuchAmtGs;
  this.blattGs = blattGs;
};

function wiedervorlage(vorgangsID, bemerkung, datum, zustaendigkeit) {
  /*constructor zum Anlegen einer wiedervorlage*/
  this.vorgangsID = vorgangsID;
  this.bemerkung = bemerkung;
  this.datum = datum;
  this.zustaendigkeit = zustaendigkeit;
};

function dokument(id, datum, originalName, neuerName) {
  /*constructor zum hochladen eines Dokuments*/
  this.id = id;
  this.datum = datum;
  this.originalName = originalName;
  this.neuerName = neuerName;
}


// GetBereich
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/vorgangNeu", function(req, res) {
  res.render("vorgangNeu", {
    ruleValue: ruleValue,
    antragsteller: antragsteller,
    eigentuemer: eigentuemer
  });
});

app.get("/vorgaenge", function(req, res) {
  res.render("vorgaenge", {
    vorgangList: vorgangList,
    wiedervorlageList: wiedervorlageList,
    user: user
  });
});

// Platzhalter Anfang
app.get("/:vorgang", function(req, res) {
  // console.log(req.params.vorgang);
  detailsID = req.params.vorgang;
  vorgangList.forEach((vorgang) => {

    if (vorgang.vorgangsID === req.params.vorgang) {
      res.render("details", {
        vorgang: vorgang,
        wiedervorlageList: wiedervorlageList,
        dokumentList : dokumentList
      });
    };
  });
});
// Platzhalter Ende

// Post Bereich
app.post("/form", function(req, res) {

  ruleValue = req.body.rules;
  // console.log(ruleValue);
  res.redirect("/vorgangNeu");

});

app.post("/antragsteller", function(req, res) {

  antragsteller = req.body.contact;
  console.log(req.body);
  res.redirect("/vorgangNeu");

});

app.post("/eigentuemer", function(req, res) {

  eigentuemer = req.body.contact;
  console.log(req.body);
  res.redirect("/vorgangNeu");

});

app.post("/vorgangNeu", function(req, res) {
  //console.log(req.body);
  let neuerVorgang = new vorgang(
    user,
    vorgangsID,
    req.body.rule,
    req.body.streetApplicant[0],
    req.body.numberApplicant[0],
    req.body.zipCodeApplicant[0],
    req.body.laNameApplicant,
    req.body.fiNameApplicant,
    req.body.degreeApplicant,
    req.body.birthDateApplicant,
    req.body.compNameApplicant,
    req.body.compFormApplicant,
    req.body.poaApplicant,
    req.body.streetOwner[0],
    req.body.numberOwner[0],
    req.body.zipCodeOwner[0],
    req.body.laNameOwner,
    req.body.fiNameOwner,
    req.body.degreeOwner,
    req.body.birthDateOwner,
    req.body.compNameOwner,
    req.body.compFormOwner,
    req.body.poaOwner,
    req.body.plotStreet,
    req.body.plotNumber,
    req.body.plotZipCode,
    req.body.plotDistrict,
    req.body.plotRegistry,
    req.body.plotSheet,
  );
  vorgangList.push(neuerVorgang);
  vorgangsNummer++;
  vorgangsID = user + "-" + vorgangsNummer;
  res.redirect("/vorgangNeu");
});

app.post("/details/:wiedervorlage", function(req, res) {

  let neueWiedervorlage = new wiedervorlage(
    req.params.wiedervorlage,
    req.body.description,
    req.body.date,
    req.body.responsibility
  )
  wiedervorlageList.push(neueWiedervorlage);
  res.redirect("/" + req.params.wiedervorlage)
});

app.post("/dokument", upload.single("document"), function(req, res) {
  let date = new Date();
  let document = new dokument(
    req.body.vorgangID,
    date,
    req.file.originalname,
    req.body.neuerName
  );

  dokumentList.push(document);

  res.redirect("/" + req.body.vorgangID);

  console.log(req.file);
  console.log(req.body);
});

app.listen(port, function() {
  console.log("server started on port " + port)
});

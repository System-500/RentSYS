const mongoose = require("mongoose");
const user = 'Admin';
const passwd = 'Admin';
//const host =  'mongodb:27017' ;  dla dockera
const host = 'localhost:27017' ; 
const dbName = 'CarDB'


const uri = `mongodb://${user}:${passwd}@${host}/${dbName}?authSource=admin&authMechanism=DEFAULT`;
mongoose.connect(uri)
   .then(() => {
      console.log("Połączono z bazą");
   }).catch((err) => {
      console.log("Nie można połączyć się z MongoDB. Błąd: " + err);
   });
const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '115EZ_cm_I95UDTT2H_JdMhrKHJfV-RiefsCfB-MiaQo';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));


async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);

  // TODO(you): Finish onGet.
  var data = [];
  for(let i=1;i<rows.length;i++){
    var item = {};
    for(let j=0;j<rows[0].length;j++){
      item[rows[0][j]] = rows[i][j];
    }
    data.push(item);
  }
  //res.json( { status: 'unimplemented!!!'} );
  res.json(data);
}
app.get('/api', onGet);

async function onPost(req, res) {
  const messageBody = req.body;

  // TODO(you): Implement onPost.
  const result = await sheet.getRows();
  const rows = result.rows;
  let newRow = [];
  for (let i=0;i<rows[0].length;i++) {
    for(let key in messageBody){
      if(key.toLowerCase() == rows[0][i].toLowerCase())
        newRow.push(messageBody[key]);
    }
  }
  await sheet.appendRow(newRow);
  res.json( { response: 'success'} );
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;

  // TODO(you): Implement onPatch.
  const result = await sheet.getRows();
  const rows = result.rows;
  let col_index, row_index;

  for(let i=0;i<rows[0].length;i++){
    if(rows[0][i].toLowerCase() == column.toLowerCase()){
      col_index = i;
      break;
    }
  }
  for(let j=1;j<rows.length;j++){
    if(rows[j][col_index] == value){
      row_index = j;
      break;
    }
  }
  let newRow = rows[row_index];
  for(let key in messageBody){
    newRow[rows[0].indexOf(key)] = messageBody[key];
  }
  await sheet.setRow(row_index,newRow);
  res.json( { response: 'success'} );
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  
  // TODO(you): Implement onDelete.
  const result = await sheet.getRows();
  const rows = result.rows;
  let col_index;

  for(let i=0;i<rows[0].length;i++){
    if(rows[0][i].toLowerCase() == column.toLowerCase()){
      col_index = i;
    }
  }
  for(let j=1;j<rows.length;j++){
    if(rows[j][col_index] == value){
      await sheet.deleteRow(j);
      break;
    }
  }

  res.json( { response: 'success'} );
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});

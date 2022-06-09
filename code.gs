function doGet(request) {
  return HtmlService.createTemplateFromFile('Index').evaluate();
}

/* DEFINE GLOBAL VARIABLES, CHANGE THESE VARIABLES TO MATCH WITH YOUR SHEET */
function globalVariables(){ 
  var varArray = {
    spreadsheetId   : '14VHIxDhpbEjNuzf0rFMvcDu3CEqZ0Qp05lwsAsQJLZI', //** CHANGE !!!
    dataRage        : 'Dados!A2:G',                                    //** CHANGE !!!
    idRange         : 'Dados!A2:A',                                    //** CHANGE !!!
    lastCol         : 'G',                                            //** CHANGE !!!
    insertRange     : 'Dados!A1:G1',                                   //** CHANGE !!!
    sheetID         : '0'                                             //** CHANGE !!! 
    //Ref:https://developers.google.com/sheets/api/guides/concepts#sheet_id
  };
  return varArray;//
}

/* PROCESS FORM */
function processForm(formObject){  
  if(formObject.RecId && checkID(formObject.RecId)){//Execute if form passes an ID and if is an existing ID
    updateData(getFormValues(formObject),globalVariables().spreadsheetId,getRangeByID(formObject.RecId)); // Update Data
  }else{ //Execute if form does not pass an ID
    appendData(getFormValues(formObject),globalVariables().spreadsheetId,globalVariables().insertRange); //Append Form Data
  }
  return getLastTenRows();//Retorna as 10 últimas linhas.
}

/* GET FORM VALUES AS AN ARRAY */
function getFormValues(formObject){
/* ADD OR REMOVE VARIABLES ACCORDING TO YOUR FORM*/
  if(formObject.RecId && checkID(formObject.RecId)){
    var values = [[formObject.RecId.toString(),
                  formObject.name,
                  formObject.gender,
                  formObject.dateOfBirth,
                  formObject.email,
                  formObject.phone,
                  formObject.country]];
  }else{
    var values = [[new Date().getTime().toString(),//REF: https://webapps.stackexchange.com/a/51012/244121
                  formObject.name,
                  formObject.gender,
                  formObject.dateOfBirth,
                  formObject.email,
                  formObject.phone,
                  formObject.country]];
  }
  return values;
}

/* CREATE/ APPEND DATA */
function appendData(values, spreadsheetId,range){
  var valueRange = Sheets.newRowData();
  valueRange.values = values;
  var appendRequest = Sheets.newAppendCellsRequest();
  appendRequest.sheetID = spreadsheetId;
  appendRequest.rows = valueRange;
  var results = Sheets.Spreadsheets.Values.append(valueRange, spreadsheetId, range,{valueInputOption: "RAW"});
}

/* LEITURA DOS DADOS */
function readData(spreadsheetId,range){
  var result = Sheets.Spreadsheets.Values.get(spreadsheetId, range);
  return result.values;
}

/* UPDATE */
function updateData(values,spreadsheetId,range){
  debugger;
  var valueRange = Sheets.newValueRange();
  valueRange.values = values;
  var result = Sheets.Spreadsheets.Values.update(valueRange, spreadsheetId, range, {
  valueInputOption: "RAW"});
}

/*DELETE*/
function deleteData(ID){ 
  //REF: https://developers.google.com/sheets/api/guides/batchupdate
  //REF: https://developers.google.com/sheets/api/samples/rowcolumn#delete_rows_or_columns
  var startIndex = getRowIndexByID(ID);
  
  var deleteRange = {
                      "sheetId"     : globalVariables().sheetID,
                      "dimension"   : "ROWS",
                      "startIndex"  : startIndex,
                      "endIndex"    : startIndex+1
                    }
  
  var deleteRequest= [{"deleteDimension":{"range":deleteRange}}];
  Sheets.Spreadsheets.batchUpdate({"requests": deleteRequest}, globalVariables().spreadsheetId);
  
  return getLastTenRows();//Return last 10 rows
}

/*## HELPERS PARA AS OPERAÇÔES DO CRUD ##*/ 

/* VERIFICA SE EXISTE ID, RETORNA V/F */
function checkID(ID){
  var idList = readData(globalVariables().spreadsheetId,globalVariables().idRange,).reduce(function(a,b){return a.concat(b);});
  return idList.includes(ID);
}

/* GET DATA RANGE A1 NOTATION FOR GIVEN ID */
function getRangeByID(id){
  if(id){
    var idList = readData(globalVariables().spreadsheetId,globalVariables().idRange);
    for(var i=0;i<idList.length;i++){
      if(id==idList[i][0]){
        return 'Dados!A'+(i+2)+':'+globalVariables().lastCol+(i+2);
      }
    }
  }
}

/* GET RECORD BY ID */
function getRecordById(id){
  if(id && checkID(id)){
    var result = readData(globalVariables().spreadsheetId,getRangeByID(id));
    return result;
  }
}

/* GET ROW NUMBER FOR GIVEN ID */
function getRowIndexByID(id){
  if(id){
    var idList = readData(globalVariables().spreadsheetId,globalVariables().idRange);
    for(var i=0;i<idList.length;i++){
      if(id==idList[i][0]){
        var rowIndex = parseInt(i+1);
        return rowIndex;
      }
    }
  }
}

/*GET LAST 10 RECORDS */
function getLastTenRows(){
  var lastRow = readData(globalVariables().spreadsheetId,globalVariables().dataRage).length+1;
  if(lastRow<=11){
    var range = globalVariables().dataRage;
  }else{
    var range = 'Dados!A'+(lastRow-9)+':'+globalVariables().lastCol;
  }
  var lastTenRows = readData(globalVariables().spreadsheetId,range);
  return lastTenRows;
}

/* GET ALL RECORDS */
function getAllData(){
  var data = readData(globalVariables().spreadsheetId,globalVariables().dataRage);
  return data;
}

/*## OUTROS HELPERS ##*/

/*GET DROPDOWN LIST */
function getDropdownList(range){
  var list = readData(globalVariables().spreadsheetId,range);
  return list;
}

/* INCLUDE HTML PARTS, EG. JAVASCRIPT, CSS, OTHER HTML FILES */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

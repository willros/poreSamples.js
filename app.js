const CELLS = [
  "A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1",
  "A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2",
  "A3", "B3", "C3", "D3", "E3", "F3", "G3", "H3",
  "A4", "B4", "C4", "D4", "E4", "F4", "G4", "H4",
  "A5", "B5", "C5", "D5", "E5", "F5", "G5", "H5",
  "A6", "B6", "C6", "D6", "E6", "F6", "G6", "H6",
  "A7", "B7", "C7", "D7", "E7", "F7", "G7", "H7",
  "A8", "B8", "C8", "D8", "E8", "F8", "G8", "H8",
  "A9", "B9", "C9", "D9", "E9", "F9", "G9", "H9",
  "A10", "B10", "C10", "D10", "E10", "F10", "G10", "H10",
  "A11", "B11", "C11", "D11", "E11", "F11", "G11", "H11",
  "A12", "B12", "C12", "D12", "E12", "F12", "G12", "H12"
];

// Custom functions for tables
var customReceiver = function (fromRow, toRow, fromTable) {
  if (toRow) {
    toRow.update({ "barcode": fromRow.getData().barcode });
    return true;
  }
  return false;
}

var cellColor = function (cell, params) {
  var value = cell.getValue();

  if (value === "") {
    return value
  }
  if (value.includes("POS")) {
    cell.getElement().style.backgroundColor = "#56B88D";
  } else if (value.includes("NEG")) {
    cell.getElement().style.backgroundColor = "#E63946";
  } else {
    cell.getElement().style.backgroundColor = "#3D5A80";
  }
  return value;
}


var bottom = new Tabulator("#bottom", {
  placeholder: "No Data Available",
  layout: "fitColumns",
  reactiveData: true, 
  columns: [
    { title: "name", field: "name" },
    { title: "age", field: "age" },
    { title: "Barcode", field: "barcode" },
    { title: "Row number", field: "rownum" },
  ],
  movableRows: true,
  movableRowsConnectedTables: "#top-left",
  movableRowsReceiver: customReceiver,
  rowFormatter: function (row) {
    var data = row.getData();
    if (data.name == "jim") {
      row.getElement().style.backgroundColor = "#9bfaf2";
    }
  },
});

var barcodes = [
  { barcode: "barcode1" },
  { barcode: "barcode2" },
  { barcode: "barcode3" },
  { barcode: "barcode4" },
  { barcode: "barcode5" },
];

var top_left = new Tabulator("#top-left", {
  placeholder: "No Data Available",
  layout: "fitColumns",
  movableRows: true,
  movableRowsSender: "delete",
  movableRowsConnectedTables: "#bottom",
  data: barcodes,
  columns: [
    { title: "Barcodes", field: "barcode" },
  ],
});


// Create the well plate
var wellPlate = [];
for (var i = 1; i <= 8; i++) {
  // Adds A-H
  var row = { row: String.fromCharCode(i + 64)};
  for (var j = 1; j <= 12; j++) {
    row[j] = "";
  }
  wellPlate.push(row);
}


var top_right = new Tabulator("#top-right", {
  data: wellPlate,
  height: "100%",
  width: "100%",
  reactiveData: true,
  columns: [
    { title: "", field: "row", headerSort: false},
    { title: "1", field: "1", headerSort: false, formatter: cellColor },
    { title: "2", field: "2", headerSort: false, formatter: cellColor },
    { title: "3", field: "3", headerSort: false, formatter: cellColor },
    { title: "4", field: "4", headerSort: false, formatter: cellColor },
    { title: "5", field: "5", headerSort: false, formatter: cellColor },
    { title: "6", field: "6", headerSort: false, formatter: cellColor },
    { title: "7", field: "7", headerSort: false, formatter: cellColor },
    { title: "8", field: "8", headerSort: false, formatter: cellColor },
    { title: "9", field: "9", headerSort: false, formatter: cellColor },
    { title: "10", field: "10", headerSort: false, formatter: cellColor },
    { title: "11", field: "11", headerSort: false, formatter: cellColor },
    { title: "12", field: "12", headerSort: false, formatter: cellColor },
  ],
  layout: "fitColumns",
});

// Functions
var inputFile = document.getElementById("open-file-btn");
var df;
inputFile.addEventListener("change", async () => {
  var file = inputFile.files[0];
  await dfd.readCSV(file).then((dataframe) => {
    df = dataframe;
    const data = dfd.toJSON(df);
    bottom.setData(data);
    //bottom.hideColumn("rownum");

    // let sub = df.loc({
    //   rows: df["age"].lt(40),
    // })
    df = df.addColumn("new",
      df.age.$data.map((x) => x * 2)
    ).addColumn("HAIR",
      df.hair.$data.map((x) => x.toUpperCase())
    );
    df.print()
  }).catch((err) => {
    console.log("ERROR!", err);
  })
});

function updateTopRightTable() {
  var bottomData = bottom.getData("active");

  var counter = 0;
  bottomData.forEach(element => {
    var col = counter % 8;
    var row = Math.floor(counter / 8);
    wellPlate[col][row + 1] = element.name
    wellPlate[col]["name"] = element.name
    counter++
  });
  top_right.setData(wellPlate);
};

bottom.on("renderComplete", function () {
  if (bottom.getData().length === 0) {
    return
  }
  // TODO reorder the order of the Rows
  // use the getData("active")
  updateTopRightTable();
});


document.getElementById("positive-control-btn").addEventListener("click", () => {
  bottom.addRow({name: "POSITVE CONTROL"}, true); // Add to the top
})

document.getElementById("negative-control-btn").addEventListener("click", () => {
  bottom.addRow({name: "NEGATIVE CONTROL"}, false); // Add to the bottom
})


document.getElementById("download-file-btn").addEventListener("click", function () {
  var data = bottom.getData("active");
  data.forEach(function (row, index) {
    row.rownum = CELLS[index];
  });
  bottom.setData(data);
  bottom.showColumn("rownum");
  if (data.length > 0) {
    bottom.download("xlsx", "data.xlsx", { sheetName: "My Data" });
  } else {
    console.log("Create the table");
  }
  bottom.hideColumn("rownum");
});


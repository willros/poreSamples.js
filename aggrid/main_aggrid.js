
let topLeftBefore;
let bottomBefore;

const gridOptionsBottom = {
    columnDefs: [
        { field: "name" },
        { field: "barcode" },
        { field: "order" },
        { field: "rowname" },
    ],
    rowClassRules: {
        "red-row": 'data.name == "NEGATIVE CONTROL"',
        "green-row": 'data.name == "POSITIVE CONTROL"',
        //"blue-row": 'data.name != "POSITVE CONTROL || NEGATIVE CONTROL"',
    },
    defaultColDef: {
        sortable: true,
        flex: 2,
    },
    rowSelection: 'multiple',
    // important to set rowDragManaged to false to prevent row to be added to the table
    rowDragManaged: false,
    rowDragEntireRow: false,
    rowDragMultiRow: false,
    onRowDataUpdated: gridChanged,
    onSortChanged: sortChanged,
    onFirstDataRendered: sortChanged,
};

//  --------------------------------------------------------------------- barcode-grid
let barcodeData = [
    { barcode: "barcode1" },
    { barcode: "barcode2" },
    { barcode: "barcode3" },
    { barcode: "barcode4" },
    { barcode: "barcode5" },
];

const gridOptionsTopLeft = {
    defaultColDef: {
        flex: 1,
    },
    columnDefs: [
        { field: "barcode", rowDrag: true },
    ],
    rowSelection: 'multiple',
    //rowDragManaged: true,
    //animateRows: true,
    rowDragMultiRow: true,
    rowDragEntireRow: true,
    rowData: barcodeData,
    onGridReady: (params) => {
        addGridDropZone(params);
    },
    onRowDragLeave: (params) => {
        bottomBefore = getAllRows(gridOptionsBottom, false);
        console.log(bottomBefore);
    },
};


function updateData(gridOption, newData) {
    let oldData = getAllRows(gridOption, false);
    gridOption.api.applyTransaction({
        remove: oldData
    })
    gridOption.api.setRowData(newData)
}
function undo() {
    updateData(gridOptionsBottom, bottomBefore);
    updateData(gridOptionsTopLeft, topLeftBefore);
}
function addGridDropZone(params) {
    const dropZoneParams = gridOptionsBottom.api.getRowDropZoneParams({
        onDragStop: (params) => {
            // setup undo
            topLeftBefore = getAllRows(gridOptionsTopLeft, false)

            let to = params.overNode.rowIndex;
            let from = params.nodes
            let barcodes = from.map(x => x.data.barcode);

            let data = getAllRows(gridOptionsBottom, false);
            // clear the data
            gridOptionsBottom.api.applyTransaction({
                remove: data,
            });
            // add new data
            barcodeLength = barcodes.length;
            if (barcodeLength > 1) {
                var counter = 0;
                for (var i = to; i < barcodeLength + to; i++) {
                    data[i].barcode = barcodes[counter]
                    counter++
                }
            } else {
                data[to].barcode = barcodes[0];
            }
            gridOptionsBottom.api.setRowData(data);

            // removed data from top grid
            gridOptionsTopLeft.api.applyTransaction({
                remove: from.map(function (node) {
                    return node.data;
                })
            });
        },
    });
    params.api.addRowDropZone(dropZoneParams);
}


// ----------------------- PLATE GRID
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

// Create the well plate
var wellPlate = [];
for (var i = 1; i <= 8; i++) {
    // Adds A-H
    var row = { row: String.fromCharCode(i + 64) };
    for (var j = 1; j <= 12; j++) {
        row[j] = "";
    }
    wellPlate.push(row);
}

const gridOptionsTopRight = {
    defaultColDef: {
        flex: 3,
        cellStyle: { color: 'black', border: '1px solid' },
    },
    columnDefs: [
        { field: "row", cellStyle: { color: "red" } },
        { field: "1" },
        { field: "2" },
        { field: "3" },
        { field: "4" },
        { field: "5" },
        { field: "6" },
        { field: "7" },
        { field: "8" },
        { field: "9" },
        { field: "10" },
        { field: "11" },
        { field: "12" },
    ],
    rowData: wellPlate,
};




// -------------------------------------------------------------------------------------- FUNCTIONS
function getAllRows(gridOption, flat = false) {
    let rowData = [];
    gridOption.api.forEachNodeAfterFilterAndSort(function (node) {
        rowData.push(node.data);
    });

    if (flat === true) {
        rowData = rowData.map(x => x.name)
    }

    return rowData
}

function updateWellPlate() {
    let counter = 0;
    let bottomData = getAllRows(gridOptionsBottom, false);

    bottomData.forEach(element => {
        var col = counter % 8;
        var row = Math.floor(counter / 8);
        wellPlate[col][row + 1] = element.name
        counter++
    });

    // clear the data
    var toRemove = getAllRows(gridOptionsTopRight, false);
    gridOptionsTopRight.api.applyTransaction({
        remove: toRemove,
    });

    // add new data
    gridOptionsTopRight.api.setRowData(wellPlate);
};

function sortChanged(params) {
    updateRowNumber();
}
function gridChanged(params) {
    updateWellPlate();
}

function updateRowNumber() {
    let data = getAllRows(gridOptionsBottom, false);
    // clear the data
    gridOptionsBottom.api.applyTransaction({
        remove: data,
    });

    let counter = 0;
    data.forEach(element => {
        data[counter].rowname = CELLS[counter]
        counter++
    })
    // add new data
    gridOptionsBottom.api.setRowData(data);
}

function wrangleAnalytix(df) {
    df = df.addColumn("order",
        new Array(df.shape[0]).fill(0)
    );
    df = df.addColumn("rowname",
        CELLS.slice(0, df.shape[0])
    );
    // select columns
    df = df.loc({ columns: ['name', 'age', "order"] });

    let data = dfd.toJSON(df);
    return data
}

function chooseDataFormat(df, option) {
    switch (option) {
        case "analytix":
            data = wrangleAnalytix(df);
            break;
        default:
            console.log("no function");
            break;
    }
    return data
}


function dataFromFile() {
    let inputFile = document.getElementById("open-file-btn");
    inputFile.addEventListener("change", async () => {
        let file = inputFile.files[0];
        await dfd.readCSV(file).then((dataframe) => {
            data = chooseDataFormat(dataframe, document.querySelector("#dataFormat").value);
            gridOptionsBottom.api.setRowData(data);
        }).catch((err) => {
            console.log("ERROR!", err);
        })
    });
}

let POSITIVE_CONTROL = 0;
function addPositive() {
    document.querySelector("#positive-control-btn").addEventListener("click", () => {
        let data = { name: "POSITIVE CONTROL", age: POSITIVE_CONTROL++, order: 1 };
        gridOptionsBottom.api.applyTransaction({
            add: [data]
        });
        sortChanged();
    });
}

let NEGATIVE_CONTROL = 0;
function addNegative() {
    document.querySelector("#negative-control-btn").addEventListener("click", () => {
        let data = { name: "NEGATIVE CONTROL", age: NEGATIVE_CONTROL++, order: -1 };
        let = transaction = {
            add: [data]
        };
        gridOptionsBottom.api.applyTransaction(transaction);
        sortChanged();
    });
}

function downloadFile() {
    document.querySelector("#download-file-btn").addEventListener("click", () => {
        gridOptionsBottom.api.exportDataAsCsv();
    })
}

function undoBtn() {
    document.querySelector("#undo").addEventListener("click", () => {
        undo();
    })
}
// --------------------------- ENTRY POINT


document.addEventListener('DOMContentLoaded', function () {
    // bottom grid
    let bottom = document.querySelector('#bottom');
    new agGrid.Grid(bottom, gridOptionsBottom);
    // input button
    dataFromFile();

    // barcode-grid
    let topLeft = document.querySelector("#top-left");
    new agGrid.Grid(topLeft, gridOptionsTopLeft);

    // plate-grid
    let topRight = document.querySelector("#top-right");
    new agGrid.Grid(topRight, gridOptionsTopRight);

    // functions
    // buttons
    addPositive();
    addNegative();
    downloadFile();
    undoBtn();
});

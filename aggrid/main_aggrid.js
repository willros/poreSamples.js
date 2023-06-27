let topLeftBefore;

const gridOptionsBottom = {
    columnDefs: [
        { field: "sample_id" },
        { field: "barcode" },
        { field: "order" },
        { field: "rowname" },
        { field: "kit" },
        { field: "flowcell" },
        { field: "sex" },
        { field: "age" },
        { field: "comment" },
        { field: "control", hide: true },
    ],
    rowClassRules: {
        "red-row": 'data.name == "Negative CONTROL"',
        "green-row": 'data.name == "Positive CONTROL"',
        //"blue-row": '!data.name.includes("CONTROL")',
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
    onRowDataUpdated: updateWellPlate,
    onSortChanged: updateRowNumber,
    onFirstDataRendered: updateRowNumber,
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
};


function updateData(gridOption, newData) {
    let oldData = getAllRows(gridOption, false);
    gridOption.api.applyTransaction({
        remove: oldData
    })
    gridOption.api.setRowData(newData)
}

function undo() {
    updateData(gridOptionsTopLeft, topLeftBefore);

    let bottomData = getAllRows(gridOptionsBottom, false);
    // clear the data
    gridOptionsBottom.api.applyTransaction({
        remove: bottomData,
    });

    barcodes.forEach(barcode => {
        for ([i, e] of bottomData.entries()) {
            if (e.barcode === barcode) {
                bottomData[i].barcode = ""
            }
        }
    })
    gridOptionsBottom.api.setRowData(bottomData);
}

let barcodes;
function addGridDropZone(params) {
    const dropZoneParams = gridOptionsBottom.api.getRowDropZoneParams({
        onDragStop: (params) => {
            // setup undo
            topLeftBefore = getAllRows(gridOptionsTopLeft, false)

            to = params.overNode.rowIndex;
            let from = params.nodes
            barcodes = from.map(x => x.data.barcode);

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

function createWellPlate() {
    let wellPlate = [];
    for (var i = 1; i <= 8; i++) {
        // Adds A-H
        var row = { row: String.fromCharCode(i + 64) };
        for (var j = 1; j <= 12; j++) {
            row[j] = "";
        }
        wellPlate.push(row);
    }
    return wellPlate
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
    // clear the data
    wellPlate = createWellPlate();
    var toRemove = getAllRows(gridOptionsTopRight, false);
    gridOptionsTopRight.api.applyTransaction({
        remove: toRemove,
    });

    let counter = 0;
    let bottomData = getAllRows(gridOptionsBottom, false);

    bottomData.forEach(element => {
        var col = counter % 8;
        var row = Math.floor(counter / 8);
        wellPlate[col][row + 1] = element.name
        counter++
    });


    // add new data
    gridOptionsTopRight.api.setRowData(wellPlate);
};


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

function wrangleAnalytix2(df) {
    console.log(df.columns)
    //df.columns = ["client", "sex", "sample_name", "sample_date", "analysis", "age", "sample_id", "apprvl_date", "result"]
    const columns = df.columns;
    const renameMap = {
        [columns[0]]: "client",
        [columns[1]]: "sex",
        [columns[2]]: "sample_name",
        [columns[3]]: "sample_date",
        [columns[4]]: "analysis",
        [columns[5]]: "age",
        [columns[6]]: "sample_id",
        [columns[7]]: "apprvl_date",
        [columns[8]]: "result",
    };
    df.rename(renameMap, { axis: 1, inplace: true });
    console.log(df.columns)
    df = df.dropNa({ axis: 1 });

    df = df.addColumn("order",
        new Array(df.shape[0]).fill(0)
    );
    df = df.addColumn("barcode",
        new Array(df.shape[0]).fill("")
    );
    df = df.addColumn("control",
        new Array(df.shape[0]).fill("SAMPLE")
    );
    df = df.addColumn("kit",
        new Array(df.shape[0]).fill("")
    );
    df = df.addColumn("flowcell",
        new Array(df.shape[0]).fill("")
    );
    df = df.addColumn("comment",
        new Array(df.shape[0]).fill("")
    );
    // select columns
    df = df.loc({ columns: ["sample_id", "barcode", "kit", "flowcell", "sex", "age", "comment", "order", "control"] });

    let data = dfd.toJSON(df);
    return data
}

function wrangleAnalytix(df) {
    df = df.addColumn("order",
        new Array(df.shape[0]).fill(0)
    );
    df = df.addColumn("barcode",
        new Array(df.shape[0]).fill("")
    );
    df = df.addColumn("control",
        new Array(df.shape[0]).fill("SAMPLE")
    )
    // df = df.addColumn("rowname",
    //     CELLS.slice(0, df.shape[0])
    // );
    // select columns
    df = df.loc({ columns: ["name", "age", "order", "barcode", "control"] });

    let data = dfd.toJSON(df);
    return data
}

function chooseDataFormat(df, option) {
    switch (option) {
        case "analytix":
            data = wrangleAnalytix2(df);
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
        await dfd.readCSV(file, configs = { delimiter: ";", encoding: "utf-8" }).then((dataframe) => {
            data = chooseDataFormat(dataframe, document.querySelector("#dataFormat").value);
            gridOptionsBottom.api.setRowData(data);
        }).catch((err) => {
            console.log("ERROR!", err);
        })
    });
}



function addPositiveControl() {
    let button = document.querySelector("#numberPositive")
    button.addEventListener("change", () => {
        let data = getAllRows(gridOptionsBottom);
        let df = new dfd.DataFrame(data);
        df = df.loc({
            rows: df["control"].ne("POSITIVE")
        })

        let number = button.value;
        if (number < 1) {
            let jsonData = dfd.toJSON(df)
            updateData(gridOptionsBottom, jsonData);
            updateWellPlate();
            updateRowNumber();
            return
        }

        let posControls = [];
        for (let i = 0; i < number; i++) {
            let control = { name: "Positive CONTROL", age: i, order: 1, barcode: "BARCODE", control: "POSITIVE" };
            posControls.push(control);
        }
        posControlDf = new dfd.DataFrame(posControls);

        let addedControls = dfd.concat({ dfList: [posControlDf, df], axis: 0 })
        let addedControlData = dfd.toJSON(addedControls)

        updateData(gridOptionsBottom, addedControlData);
        updateWellPlate();
        updateRowNumber();
    });
}

function addNegativeControl() {
    let button = document.querySelector("#numberNegative")
    button.addEventListener("change", () => {
        let data = getAllRows(gridOptionsBottom);
        let df = new dfd.DataFrame(data);
        df = df.loc({
            rows: df["control"].ne("NEGATIVE")
        })

        let number = button.value;
        if (number < 1) {
            let jsonData = dfd.toJSON(df)
            updateData(gridOptionsBottom, jsonData);
            updateWellPlate();
            updateRowNumber();
            return
        }

        let negControls = [];
        for (let i = 0; i < number; i++) {
            let control = { name: "Negative CONTROL", age: i, order: -1, barcode: "BARCODE", control: "NEGATIVE" };
            negControls.push(control);
        }
        negControlDf = new dfd.DataFrame(negControls);

        let addedControls = dfd.concat({ dfList: [df, negControlDf], axis: 0 })
        let addedControlData = dfd.toJSON(addedControls)

        updateData(gridOptionsBottom, addedControlData);
        updateWellPlate();
        updateRowNumber();
    });
}


function toDataFrame(gridOption, columnsToShow) {
    gridOption.columnApi.setColumnsVisible(columnsToShow, true)

    let df_data = getAllRows(gridOptionsBottom, false);
    let df = new dfd.DataFrame(df_data);
    // TO wrangle the data
    // let sub = df.loc({
    //   rows: df["age"].lt(40),
    // })
    // df = df.addColumn("new",
    //   df.age.$data.map((x) => x * 2)
    // ).addColumn("HAIR",
    //   df.hair.$data.map((x) => x.toUpperCase())
    // );
    df = df.addColumn("TEST",
        df.order.$data.map((x) => parseInt(x) * 2)
    )
    df = df.addColumn("TEST2",
        df.control.$data.map((x) => {
            switch (x) {
                case "SAMPLE":
                    return "FUL"
                    break;
                default:
                    return "HEJ"
                    break;
            }
        })
    )
    console.log(String(df));

    gridOption.columnApi.setColumnsVisible(columnsToShow, false)
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


function keyDownListener(e) {
    // delete rows
    if (e.keyCode === 8 || e.keyCode === 46) {
        const sel = gridOptionsBottom.api.getSelectedRows();
        gridOptionsBottom.api.applyTransaction({ remove: sel });
    }
    // undo barcodes
    if (e.ctrlKey && e.key === 'z') {
        undo();
    }
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
    wellPlate = createWellPlate();
    gridOptionsTopRight.api.setRowData(wellPlate);

    // functions
    document.addEventListener('keydown', keyDownListener);
    // buttons
    downloadFile();
    undoBtn();
    addNegativeControl();
    addPositiveControl();
});

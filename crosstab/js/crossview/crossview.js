/**
 * Created by neolord on 2017. 7. 3..
 */
$.fn.crossview = function(data, formInfo) {
    setCSS(formInfo.css);
    var crossData, tablePainter, table;
    crossData = new CrossData(data, formInfo);
    tablePainter = new TablePainter();
    table = tablePainter.draw(crossData);
    setEvent($(table));
    this.append(table);
};

$.fn.crossviewUI = function(data, formInfo) {
    setCSSForUI();
    var crossViewUI = new CrossViewUI(data, formInfo);
    this.append(crossViewUI.do());
};

function setCSS(jsonObject) {
    var css, css2;
    var css =
        ".cvTable {\n" +
        "    border-collapse:collapse;\n" +
        "}\n" +
        ".cell {\n" +
        "    border: 1px solid black;\n" +
        "    background-color: white;\n" +
        "    -webkit-touch-callout: none;\n" +
        "    -webkit-user-select: none;\n" +
        "    -khtml-user-select: none;\n" +
        "    -moz-user-select: -moz-none;\n" +
        "    -ms-user-select: none;\n" +
        "    user-select: none;\n" +
        "}\n" +
        ".col_resizer {\n" +
        "    width: 5px;\n" +
        "    cursor: col-resize;\n" +
        "}\n" +
        ".row_resizer {\n" +
        "    height: 5px;\n" +
        "    cursor: row-resize;\n" +
        "}\n" +
        ".content {\n" +
        "    text-align:center;\n" +
        "    vertical-align:middle;\n" +
        "}\n";
    CSSJSON.toHEAD(css);

    if (typeof(jsonObject) != "undefined" && jsonObject != null) {
        css2 = CSSJSON.toCSS(jsonObject);
        CSSJSON.toHEAD(css2);
    }
}

function setCSSForUI() {
    var css =
        ".itemList {\n" +
        "   padding: 5px;\n" +
        "   background-color: beige;\n" +
        "   border-radius: 5px;\n" +
        "   border: 1px solid gray;\n" +
        "   flex: 1;\n" +
        "}\n" +
        ".itemList li {\n" +
        "   align:center;\n" +
        "   padding: 8px 8px;\n" +
        "   list-style-type: none;\n" +
        "   cursor:move;\n" +
        "}\n" +
        ".itemList li span.item {\n" +
        "   -webkit-text-size-adjust: 100%;\n" +
        "   background: #F3F3F3;\n" +
        "   border: 1px solid #DEDEDE;\n" +
        "   padding: 2px 5px;\n" +
        "   white-space:nowrap;\n" +
        "   -webkit-border-radius: 5px;\n" +
        "   -moz-border-radius: 5px;\n" +
        "   border-radius: 5px;\n" +
        "}\n" +
        ".itemList li.placeholder {\n" +
        "   -webkit-border-radius: 5px;\n" +
        "   padding: 3px 15px;\n" +
        "   -moz-border-radius: 5px;\n" +
        "   border-radius: 5px;\n" +
        "   border: 1px dashed #aaa;\n" +
        "}\n" +
        ".itemSort {\n" +
        "   -webkit-text-size-adjust: 100%;\n" +
        "   background-color: lightblue;\n" +
        "   white-space:nowrap;\n" +
        "   -webkit-border-radius: 3px;\n" +
        "   -moz-border-radius: 3px;\n" +
        "   border-radius: 3px;\n" +
        "}\n" +
        ".itemFunc {\n" +
        "   -webkit-text-size-adjust: 100%;\n" +
        "   background-color: lightblue;\n" +
        "   white-space:nowrap;\n" +
        "   -webkit-border-radius: 3px;\n" +
        "   -moz-border-radius: 3px;\n" +
        "   border-radius: 3px;\n" +
        "}\n" +
        ".horizList li { display: inline; }\n" +
        ".vertList { vertical-align: top; }\n" +
        ".table-content {\n" +
        "   display: flex;\n" +
        "   flex-direction: column;\n" +
        "   height: 100%;\n" +
        "}\n" +
        ".horizCheckboxLi {\n" +
        "   padding: 0px 8px;\n" +
        "   list-style-type: none;\n" +
        "   display:inline;\n" +
        "}\n" +
        ".vertCheckboxLi {\n" +
        "   padding: 0px 8px;\n" +
        "   list-style-type: none;\n" +
        "}\n" +
        ".summaryDirection {\n" +
        "   -webkit-text-size-adjust: 100%;\n" +
        "   background-color: lightblue;\n" +
        "   white-space:nowrap;\n" +
        "   -webkit-border-radius: 3px;\n" +
        "   -moz-border-radius: 3px;\n" +
        "   border-radius: 3px;\n" +
        "}\n";
    CSSJSON.toHEAD(css);
}


function setEvent($_table) {
    var draggingType;
    var draggingRowColIndex;
    var isDragging = false;
    var draggingStart;
    var draggingOldSize;
    var draggingOldRowSize;
    $_table.find(".cell .col_resizer").mousedown(function(e) {
        if (isDragging == false) {
            isDragging = true;
            draggingType = "col";
            draggingRowColIndex = e.target.getAttribute("_colIndex");
            draggingStart = e.pageX;
            draggingOldSize = parseInt($_table.find(".col:eq(" + draggingRowColIndex + ")").attr("width"));
        }
    });
    $_table.find(".cell .row_resizer").mousedown(function(e) {
        var cells;
        if (isDragging == false) {
            isDragging = true;
            draggingType = "row";
            draggingRowColIndex = e.target.getAttribute("_rowIndex");
            cells = $(".cvTable .cell").filter(function(){
                var rowIndex = parseInt($(this).attr("_rowIndex"));
                var rowSpan = parseInt($(this).attr("rowspan") || 1);
                var endRowIndex =  rowIndex + rowSpan - 1;
                if (rowIndex <= draggingRowColIndex && draggingRowColIndex <= endRowIndex) {
                    return true;
                }
                return false;
            });
            draggingStart = e.pageY;
            draggingOldSize = [];
            cells.each(function (index, object) {
                draggingOldSize.push(parseInt($(object).attr("height")));
            });

            draggingOldRowSize = parseInt($_table.find("> tr:eq(" + (parseInt(draggingRowColIndex) + 1) + ")").attr("_height"));
        }
    });
    $(window).mousemove(function(e){
        var delta, tds, i, len;
        if (isDragging == true) {
            if (draggingType == "col") {
                delta = e.pageX - draggingStart;
                tds = $_table.find(".col:eq(" + draggingRowColIndex + ")");
                if (draggingOldSize + delta > 20) {
                    tds.attr("width", draggingOldSize + delta)
                }
            } else {
                delta = e.pageY - draggingStart;
                tds = $_table.find(".cell").filter(function(){
                    var rowIndex = parseInt($(this).attr("_rowIndex"));
                    var rowSpan = parseInt($(this).attr("rowspan") || 1);
                    var endRowIndex =  rowIndex + rowSpan - 1;
                    if (rowIndex <= draggingRowColIndex && draggingRowColIndex <= endRowIndex) {
                        return true;
                    }
                    return false;
                });
                for (i = 0, len = draggingOldSize.length; i < len; i += 1) {
                    if (draggingOldSize[i] + delta < 20) {
                        return;
                    }
                }
                tds.each(function (index, object) {
                    $(object).attr("height", draggingOldSize[index] + delta)
                });

                $_table.find("> tr:eq(" + (parseInt(draggingRowColIndex) + 1) + ")").attr("_height", draggingOldRowSize + delta);
            }
        }
    }).mouseup(function(e){
        isDragging = false;
    });
};

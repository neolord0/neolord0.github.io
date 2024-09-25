 /**
 * Created by neolord on 2017. 7. 5..
 */

var TablePainter = function () {
    var TablePainter = function () {
        var that = this;
        var templeteData ='<td class="{{className}} cell" height="{{height}}" colspan="{{colspan}}" rowspan="{{rowspan}}" _rowIndex="{{rowIndex}}">'
            + '<table cellspacing="0" cellpadding="0" width="100%" height="100%">'
            + '<tr>'
            + '<td class="{{className}}_text content">{{text}}</td>'
            + '<td class="col_resizer" _colIndex="{{resizeColIndex}}"/>'
            + '</tr>'
            + '<tr>'
            + '<td colspan="2" class="row_resizer" _rowIndex="{{resizeRowIndex}}"/>'
            + '</tr>'
            + '</table>'
            + '</td>';

        this.table_td_templete = Handlebars.compile(templeteData);
        this.DATA = null;
        this.table = null;
        this.tr = null;
        this.rowIndex = 0;
        this.colIndex = 0;
        this.colKeyInfoList = [];
    };

    TablePainter.prototype.draw = function (crossData) {
        var FORM = crossData.formInfo;
        this.DATA = crossData;
        this.table = document.createElement("table");
        this.table.className = "cvTable";

        this.colSize();
        this.header_colGroup();
        if (FORM.rowGroup.total.toTop == false) {
            this.rowGroup_dataMatrix_colTotal();
            this.rowTotals_grandTotal();
        } else {
            this.rowTotals_grandTotal();
            this.rowGroup_dataMatrix_colTotal();
        }
        return this.table;
    };

    TablePainter.prototype.getColumnCount = function () {
        var DATA = this.DATA,
            FORM = this.DATA.formInfo,
            nodeList = DATA._groupTree.col.childs,
            node, colCount, i, len;
        colCount = FORM.rowGroup.fields.length;
        if (FORM.colGroup.showTitle == true) {
            colCount += 1;
        }
        for (i = 0, len = nodeList.length; i < len; i += 1) {
            node = nodeList[i];
            colCount += node.nodeCount(FORM.colGroup.total.showSub) * ((FORM.summary.direction == "Horizontal") ? FORM.summary.fields.length : 1);
        }
        if (FORM.colGroup.total.showGrand == true) {
            colCount += (FORM.summary.direction == "Horizontal") ? FORM.summary.fields.length : 1;
        }
        return colCount;
    };

    TablePainter.prototype.getRowCount = function () {
        var DATA = this.DATA,
            FORM = this.DATA.formInfo,
            nodeList = DATA._groupTree.row.childs,
            node, rowCount, i, len;
        rowCount = FORM.colGroup.fields.length;
        if (FORM.rowGroup.showTitle == true) {
            rowCount += 1;
        }
        for (i = 0, len = nodeList.length; i < len; i += 1) {
            node = nodeList[i];
            rowCount += node.nodeCount(FORM.rowGroup.total.showSub) * ((FORM.summary.direction == "Vertical") ? FORM.summary.fields.length : 1);
        }
        if (FORM.rowGroup.total.showGrand == true) {
            rowCount += (FORM.summary.direction == "Vertical") ? FORM.summary.fields.length : 1;
        }
        return rowCount;
    };

    TablePainter.prototype.getRowHeight = function(rowIndex, rowSpan) {
        var Heights = this.DATA.formInfo.rowSizes,
            height = 0, row;
        if (typeof(heights) != "undefined") {
            for (row = rowIndex; row < rowIndex + rowSpan; row += 1) {
                height += Heights[row];
            }
        } else {
            height = rowSpan+1 * 10;
        }
        return height;
    };


    TablePainter.prototype.colSize = function() {
        var colCount = this.getColumnCount(),
            FORM = this.DATA.formInfo,
            i, tr, th, colSize;
        tr = document.createElement("tr");
        for (i = 0; i < colCount; i++) {
            if (typeof(FORM.colSize) != "undefined" && FORM.colSizes.length > i) {
                colSize = FORM.colSizes[i];
            } else {
                colSize = 10;
            }

            th = document.createElement("th");
            th.className = "col";
            th.setAttribute("height", 0);
            th.setAttribute("width", colSize);
            tr.appendChild(th);
        }
        this.table.appendChild(tr);
    };

    TablePainter.prototype.start_tr = function(startColIndex) {
        this.tr = document.createElement("tr");
        this.rowIndex += 1;
        this.colIndex = startColIndex;
        this.tr.setAttribute("_height", this.getRowHeight(this.rowIndex, 1));
    };
    
    TablePainter.prototype.end_tr = function () {
        this.table.appendChild(this.tr);
    };

    TablePainter.prototype.add_td = function(className, colSpan, rowSpan, text) {
        var obj = {
            className: className,
            height: this.getRowHeight(this.rowIndex, rowSpan),
            rowIndex: this.rowIndex,
            colspan: colSpan,
            rowspan: rowSpan,
            text: text,
            resizeColIndex: this.colIndex + colSpan - 1,
            resizeRowIndex: this.rowIndex + rowSpan - 1};
        $(this.tr).append(this.table_td_templete(obj));
        this.colIndex += colSpan;
    };

    TablePainter.prototype.header_colGroup = function() {
        var DATA = this.DATA,
            FORM = this.DATA.formInfo,
            i, len, col, colSpan, rowSpan,
            headerColSpan = 0,
            nodeList = DATA._groupTree.col.childs,
            colGroup_colTotalLabel, that = this;

        colGroup_colTotalLabel = (function () {
            if (FORM.colGroup.total.toLeft == false) {
                return function() {
                    nodeList = that.colGroup(nodeList);

                    if (that.rowIndex == 0) {
                        that.colTotalLabel();
                    };
                }
            } else {
                return function () {
                    if (that.rowIndex == 0) {
                        that.colTotalLabel();
                    }
                    nodeList = that.colGroup(nodeList);
                };
            }
        }());

        this.rowIndex = -1;
        for (i = 0, len = FORM.colGroup.fields.length; i < len; i += 1) {
            this.start_tr(headerColSpan);

            // header part
            if (this.rowIndex == 0) {
                    colSpan = FORM.rowGroup.fields.length;
                    rowSpan = FORM.colGroup.fields.length;
                this.add_td("header", colSpan, rowSpan, null);
                headerColSpan = colSpan;
            }

            // col group titles
            if (FORM.colGroup.showTitle == true) {
                this.add_td("label_col_title", 1, 1, FORM.colGroup.fields[i].name);
            }

            colGroup_colTotalLabel();

            this.end_tr();
        }

        if (FORM.rowGroup.showTitle == true && FORM.rowGroup.fields.length !== 0) {
            this.start_tr(0);

            // row group titles
            for (col = 0, len1 = FORM.rowGroup.fields.length; col < len1; col += 1) {
                this.add_td("label_row_title", 1, 1, FORM.rowGroup.fields[col].name);
            }

            if (FORM.colGroup.fields.length == 0 && FORM.colGroup.total.showGrand == true) {
                this.add_td("label_col_grandtotal", 1, 1, FORM.colGroup.grandLabel);
            } else if (FORM.colGroup.showTitle == true && FORM.colGroup.fields.length != 0) {
                this.add_td("label_row_title", 1, 1, "");
            }

            this.end_tr();
        }
    };

    TablePainter.prototype.colGroup = function(nodeList) {
        var FORM = this.DATA.formInfo,
            newNodeList = [],
            i, len, node, colSpan, rowSpan;

        for (i = 0, len = nodeList.length; i < len; i += 1) {
            node = nodeList[i];

            colSpan = node.nodeCount(FORM.colGroup.total.showSub) * ((FORM.summary.direction == "Horizontal") ? FORM.summary.fields.length : 1);
            if (node.isSubTotal == false) {
                rowSpan = (node.isTerminer() && FORM.rowGroup.showTitle  == true && FORM.rowGroup.fields.length !== 0) ? 2 : 1;
            } else {
                rowSpan = FORM.colGroup.fields.length - this.rowIndex + ((FORM.rowGroup.showTitle == true && FORM.rowGroup.fields.length !== 0) ? 1 : 0);
            }
            if (node.isSubTotal == true) {
                if (node.name !== "" && FORM.colGroup.total.showSub == true) {
                    this.add_td("label_col_subtotal", colSpan, rowSpan, FORM.colGroup.total.subLabel);
                }
            } else {
                this.add_td("label_col_group", colSpan, rowSpan, node.name);
            }
            if (FORM.colGroup.total.showSub == true || node.isSubTotal == false) {
                if (typeof node.key === "undefined") {
                    newNodeList.extend(node.childs);
                } else {
                    this.colKeyInfoList.push({key:node.key, isSubTotal:node.isSubTotal});
                }
            }
        }
        return newNodeList;
    };

    TablePainter.prototype.colTotalLabel = function() {
        var FORM = this.DATA.formInfo,
            rowSpan, colSpan;
        if (FORM.colGroup.total.showGrand == true) {
            rowSpan =  FORM.colGroup.fields.length + (FORM.rowGroup.showTitle == false || FORM.rowGroup.fields.length === 0 ? 0 : 1);
            colSpan = (FORM.summary.direction == "Horizontal") ? FORM.summary.fields.length : 1;
            this.add_td("label_col_grandtotal", colSpan, rowSpan, FORM.colGroup.total.grandLabel);
        }
    };

    TablePainter.prototype.rowGroup_dataMatrix_colTotal = function () {
        var DATA = this.DATA,
            FORM = this.DATA.formInfo,
            newLine = true,
            depthFirstSearch, node, rowSpan, colSpan, rowKeyInfo,
            dataStartColIndex = 0,
            that = this;
        depthFirstSearch = (function() {
            if (FORM.summary.direction == "Vertical") {
                return function (nodeArray, depth) {
                    var i, len, j, len2;
                    for (i = 0, len = nodeArray.length; i < len; i += 1) {
                        node = nodeArray[i];
                        if (newLine == true) {
                            if (FORM.rowGroup.total.showSub == true || (node.isSubTotal == false && node.name !== "")) {
                                that.start_tr(depth - 1);
                                that.end_tr();
                            }
                            newLine = false;
                        }

                        // row group
                        if (node.isSubTotal == false) {
                            colSpan = (node.isTerminer() && FORM.colGroup.showTitle == true && FORM.colGroup.fields.length > 0) ? 2 : 1;
                        } else {
                            colSpan = FORM.rowGroup.fields.length - depth + ((FORM.colGroup.showTitle == true && FORM.colGroup.fields.length > 0) ? 2 : 1);
                        }
                        rowSpan = node.nodeCount(FORM.rowGroup.total.showSub) * FORM.summary.fields.length;

                        if (node.isSubTotal == true) {
                            if (node.name !== "" && FORM.rowGroup.total.showSub == true) {
                                that.add_td("label_row_subtotal", colSpan, rowSpan, FORM.rowGroup.total.subLabel);
                            }
                        } else {
                            that.add_td("label_row_group", colSpan, rowSpan, node.name);
                        }

                        if (node.isTerminer()) {
                            dataStartColIndex = that.colIndex;
                            if (FORM.rowGroup.total.showSub == true || (node.isSubTotal == false && node.name !== "")) {
                                for (j = 0, len2 = FORM.summary.fields.length; j < len2; j += 1) {
                                    that.colIndex = dataStartColIndex;
                                    that.dataMatrix_colTotal({key:node.key, isSubTotal:node.isSubTotal}, j);
                                    if (j < len2 - 1) {
                                        that.start_tr(dataStartColIndex);
                                        that.end_tr();
                                    }
                                }
                                if (FORM.rowGroup.total.toTop == true) {
                                    newLine = true;
                                }
                            }
                            if (FORM.rowGroup.total.toTop == false) {
                                newLine = true;
                            }
                        } else {
                            depthFirstSearch(node.childs, depth + 1);
                        }
                    }
                };
            } else {
                return function (nodeArray, depth) {
                    var i,
                        len;
                    for (i = 0, len = nodeArray.length; i < len; i += 1) {
                        node = nodeArray[i];

                        if (newLine == true) {
                            if (FORM.rowGroup.total.showSub == true || (node.isSubTotal == false && node.name !== "")) {
                                that.start_tr(depth - 1);
                                that.end_tr();
                            }
                            newLine = false;
                        }

                        // row group
                        if (node.isSubTotal == false) {
                            colSpan = (node.isTerminer() && FORM.colGroup.showTitle == true && FORM.colGroup.fields.length !== 0) ? 2 : 1;
                        } else {
                            colSpan = FORM.rowGroup.fields.length - depth + ((FORM.colGroup.showTitle== true && FORM.colGroup.fields.length !== 0) ? 2 : 1);
                        }
                        rowSpan = node.nodeCount(FORM.rowGroup.total.showSub);

                        if (node.isSubTotal == true) {
                            if (node.name !== "" && FORM.rowGroup.total.showSub == true) {
                                that.add_td("label_row_subtotal", colSpan, rowSpan, FORM.rowGroup.total.subLabel);
                            }
                        } else {
                            that.add_td("label_row_group", colSpan, rowSpan, node.name);
                        }

                        if (node.isTerminer()) {
                            if (FORM.rowGroup.total.showSub  == true || (node.isSubTotal == false && node.name !== "")) {
                                that.dataMatrix_colTotal({key:node.key, isSubTotal:node.isSubTotal});
                                if (FORM.rowGroup.total.toTop == true) {
                                    newLine = true;
                                }
                            }
                            if (FORM.rowGroup.total.toTop == false) {
                                newLine = true;
                            }
                        } else {
                            depthFirstSearch(node.childs, depth + 1);
                        }
                    }
                };
            }
        }());
        depthFirstSearch(DATA._groupTree.row.childs, 1);
    };

    TablePainter.prototype.dataMatrix_colTotal = function(rowKeyInfo, summaryIndex) {
        var FORM = this.DATA.formInfo;
        if (FORM.colGroup.total.toLeft == false) {
            this.dataMatrix(rowKeyInfo, summaryIndex);
            this.colTotal(rowKeyInfo, summaryIndex);
        } else {
            this.colTotal(rowKeyInfo, summaryIndex);
            this.dataMatrix(rowKeyInfo, summaryIndex);
        }
    };

    TablePainter.prototype.dataMatrix = function(rowKeyInfo, summaryIndex) {
        var FORM = this.DATA.formInfo;
        if (FORM.summary.direction == "Horizontal") {
            this.dataMatrixHorizontal(rowKeyInfo);
        } else if (FORM.summary.direction == "Vertical") {
            this.dataMatrixVertical(rowKeyInfo, summaryIndex);
        }
    };

     TablePainter.prototype.dataMatrixHorizontal = function(rowKeyInfo) {
         var DATA = this.DATA,
             FORM = this.DATA.formInfo,
             colKeyInfoList = this.colKeyInfoList,
             colKeyInfo,  className,
             i, len, j, len2, summarizers, val;
         for (i = 0, len = colKeyInfoList.length; i < len; i += 1) {
             colKeyInfo = colKeyInfoList[i];
             summarizers = DATA.getSummarizer(rowKeyInfo.key, colKeyInfo.key);
             for (j = 0, len2 = FORM.summary.fields.length; j < len2; j += 1) {
                 if (summarizers != null) {
                     val = summarizers[j].value();
                 } else {
                     val = "";
                 }
                 className = getClassName(colKeyInfo.isSubTotal, rowKeyInfo.isSubTotal)
                 this.add_td(className, 1, 1, val);
             }
         }
     };

     TablePainter.prototype.dataMatrixVertical = function(rowKeyInfo, summaryIndex) {
         var DATA = this.DATA,
             FORM = this.DATA.formInfo,
             colKeyInfoList = this.colKeyInfoList,
             colKeyInfo,  className,
             i, len, summarizers, val;
         for (i = 0, len = colKeyInfoList.length; i < len; i += 1) {
             colKeyInfo = colKeyInfoList[i];
             summarizers = DATA.getSummarizer(rowKeyInfo.key, colKeyInfo.key);
             if (summarizers != null) {
                 val = summarizers[summaryIndex].value();
             } else {
                 val = "";
             }
             className = getClassName(colKeyInfo.isSubTotal, rowKeyInfo.isSubTotal)
             this.add_td(className, 1, 1, val);
         }
     };

     function getClassName(isColSubTotal, isRowSubTotal) {
        if (isColSubTotal == false && isRowSubTotal == false) {
            return "data_normal";
        }
        if (isColSubTotal == true && isRowSubTotal == true) {
            return "data_rowcol_subtotal";
        }
        if (isRowSubTotal == true) {
            return "data_row_subtotal";
        }
        if (isColSubTotal == true) {
            return "data_col_subtotal";
        }
    }

    TablePainter.prototype.colTotal = function(rowKeyInfo, suumaryIndex) {
        var DATA = this.DATA,
            FORM = this.DATA.formInfo,
            j, len2, summarizers, val;

        if (FORM.colGroup.total.showGrand == true) {
            if (FORM.summary.direction == "Horizontal") {
                summarizers = DATA.getRowTotalSummarizer(rowKeyInfo.key);
                for (j = 0, len2 = FORM.summary.fields.length; j < len2; j += 1) {
                    val = summarizers[j].value();
                    this.add_td("data_col_grandtotal", 1, 1, val);
                }
            } else if (FORM.summary.direction == "Vertical") {
                summarizers = DATA.getRowTotalSummarizer(rowKeyInfo.key);
                val = summarizers[suumaryIndex].value();
                this.add_td("data_col_grandtotal", 1, 1, val);
            }
        }
    };

    TablePainter.prototype.rowTotals_grandTotal = function () {
        var DATA = this.DATA,
            FORM = this.DATA.formInfo,
            colKeyInfoList = this.colKeyInfoList,
            colSpan, col, len, j, len2,
            dataStartColIndex = 0,
            summarizers, val, rowTotals, allTotal,
            that = this;
        if (FORM.rowGroup.total.showGrand == true) {
            if (FORM.summary.direction == "Horizontal") {
                this.start_tr(0);

                // row grandtotal label
                colSpan = ((FORM.rowGroup.fields.length == 0) ? 1 : FORM.rowGroup.fields.length)
                    + ((FORM.colGroup.showTitle == true && FORM.colGroup.fields.length > 0) ? 1 : 0);
                this.add_td("label_row_grandtotal", colSpan, 1, FORM.rowGroup.total.grandLabel);

                rowTotals = function() {
                    for (col = 0, len = colKeyInfoList.length; col < len; col += 1) {
                        summarizers = DATA.getColTotalSummarizer(colKeyInfoList[col].key);

                        for (j = 0, len2 =  FORM.summary.fields.length; j < len2; j += 1) {
                            val = summarizers[j].value();
                            that.add_td("data_row_grandtotal", 1, 1, val);
                        }
                    }
                };

                allTotal = function () {
                    summarizers = DATA.getAllTotalSummarizer();
                    for (j = 0, len2 =  FORM.summary.fields.length; j < len2; j += 1) {
                        val = summarizers[j].value();
                        that.add_td("data_all_total", 1, 1, val);
                    }
                };

                if (FORM.colGroup.total.toLeft == true) {
                    allTotal();
                    rowTotals();
                } else {
                    rowTotals();
                    allTotal();
                }

                this.end_tr();
            } else if (FORM.summary.direction == "Vertical") {
                rowTotals = function() {
                    for (col = 0, len = colKeyInfoList.length; col < len; col += 1) {
                        summarizers = DATA.getColTotalSummarizer(colKeyInfoList[col].key);
                        val = summarizers[j].value();
                        that.add_td("data_row_grandtotal", 1, 1, val);
                    }
                };
                allTotal = function () {
                    if (FORM.colGroup.total.showGrand == true) {
                        summarizers = DATA.getAllTotalSummarizer();
                        val = summarizers[j].value();
                        that.add_td("data_all_total", 1, 1, val);
                    }
                };

                for (j = 0, len2 =  FORM.summary.fields.length; j < len2; j += 1) {
                    this.start_tr(dataStartColIndex);

                    if (j == 0) {
                        // row grandtotal label
                        colSpan = ((FORM.rowGroup.fields.length == 0) ? 1 : FORM.rowGroup.fields.length)
                            + ((FORM.colGroup.showTitle == true && FORM.colGroup.fields.length > 0) ? 1 : 0);
                        that.add_td("label_row_grandtotal", colSpan, FORM.summary.fields.length, FORM.rowGroup.total.grandLabel);

                        dataStartColIndex = colSpan;
                    }

                    if (FORM.colGroup.total.toLeft == true) {
                        allTotal();
                        rowTotals();
                    } else {
                        rowTotals();
                        allTotal();
                    }

                    this.end_tr();
                }
            }
        }
    };

    return TablePainter;
}();
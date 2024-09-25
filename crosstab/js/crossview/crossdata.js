/**
 * Created by neolord on 2017. 7. 3..
 */

Array.prototype.extend = function (otherArray) {
    otherArray.forEach(function(v) {this.push(v)}, this);
};

var CrossData = function () {
    function CrossData(data, formInfo) {
        this.aggregator = makeAggregator();
        this.metaInfo = data.metaInfo;
        this.formInfo = formInfo;
        this._groupTree = {
            col: new GroupTreeNode(),
            row: new GroupTreeNode()
        };

        this._summarys = {
            colTotals: {},
            rowTotals: {},
            allTotal: [],
            dataMatrix: {}
        };

        this._keyMap = {
            col: {newKey: 0},
            row: {newKey: 0}
        };

        this.process(data.content, formInfo);
    }

    CrossData.prototype.getSummarizer = function (rowKey, colKey) {
        return this._summarys.dataMatrix[rowKey][colKey];
    };

    CrossData.prototype.getRowTotalSummarizer = function (rowKey) {
        return this._summarys.rowTotals[rowKey];
    };

    CrossData.prototype.getColTotalSummarizer = function (colKey) {
        return this._summarys.colTotals[colKey];
    };

    CrossData.prototype.getAllTotalSummarizer = function () {
        return this._summarys.allTotal;
    };

    CrossData.prototype.process = function(dataContent, formInfo) {
        var i,
            len;

        this.formInfo = formInfo;
        this._summarys.allTotal = this.makeSummarizers();

        for (i = 0, len = dataContent.length; i < len; i += 1) {
            this.processRecord(dataContent[i]);
        }
        this.sortGroups();
    };

    CrossData.prototype.processRecord = function (record) {
        var FORM = this.formInfo,
            rowGroupValuesList,
            colGroupValuesList,
            rowKeyList,
            colKeyList;

        rowGroupValuesList = this.makeValuesList(FORM.rowGroup.fields, record);
        colGroupValuesList = this.makeValuesList(FORM.colGroup.fields, record);

        rowKeyList = this.makeRowKeyList(rowGroupValuesList);
        colKeyList = this.makeColKeyList(colGroupValuesList);

        this.addRowGroup(rowKeyList, rowGroupValuesList);
        this.addColGroup(colKeyList, colGroupValuesList);

        this.pushData(rowKeyList, colKeyList, record);
    };

    CrossData.prototype.makeValuesList = function (fields, record) {
        var valuesList = [],
            values, tempValues, i, len, j;
        values = this.makeValues(fields, record);
        for (i = 0, len = fields.length; i < len; i += 1) {
            tempValues = [];
            for (j = 0; j < len; j += 1) {
                if (j <= i) {
                    tempValues.push(values[j]);
                } else {
                    tempValues.push("***");
                }
            }
            valuesList.push(tempValues);
        }
        return valuesList;
    };

    CrossData.prototype.makeValues = function (fields, record) {
        var values = [],
            i, len,
            name;
        for (i = 0, len = fields.length; i < len; i += 1) {
            name = fields[i].name;
            values.push(this.getFieldValue(name, record));
        }
        return values;
    };

    CrossData.prototype.getFieldValue = function(fieldName, record) {
        var index = this.metaInfo[fieldName].index;
        return record[index];
    };

    CrossData.prototype.makeRowKeyList = function (valuesList) {
        return makeKeyList(this._keyMap.row, valuesList);
    }; 

    CrossData.prototype.makeColKeyList = function (valuesList) {
        return makeKeyList(this._keyMap.col, valuesList);
    };

    var makeKeyList = function (keyMap, valuesList) {
        var result = [],
            i, len;
        for (i = 0, len = valuesList.length; i < len; i += 1) {
            result.push(makeKey(keyMap, valuesList[i]));
        }
        return result;
    };

    var makeKey = function (keyMap, values) {
        var key;
        for (key in keyMap) {
            if (!keyMap.hasOwnProperty(key)) continue;
            if (arrayEqual(values, keyMap[key])) {
                return key;
            }
        }
        keyMap.newKey += 1;
        keyMap[keyMap.newKey] = values;
        return keyMap.newKey;
    };

    var arrayEqual = function (arr1, arr2) {
        var len1 = arr1.length,
            len2 = arr2.length,
            i;
        if (len1 != len2) {
            return false;
        }
        for (i = 0; i < len1; i += 1) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    };

    CrossData.prototype.addRowGroup = function(rowKeyList, rowGroupValuesList) {
        var i, len;
        for (i = 0, len = rowKeyList.length; i < len; i += 1) {
            if (this.isNewRow(rowKeyList[i])) {
                this.addRow(rowKeyList[i], rowGroupValuesList[i]);
            }
        }
    };

    CrossData.prototype.addColGroup = function(colKeyList, colGroupValuesList) {
        var i, len;
        for (i = 0, len = colKeyList.length; i < len; i += 1) {
            if (this.isNewColumn(colKeyList[i])) {
                this.addColumn(colKeyList[i], colGroupValuesList[i]);
            }
        }
    };

    CrossData.prototype.isNewRow = function (rowKey) {
        return isNewRowColumn(this._summarys.rowTotals, rowKey);
    };

    CrossData.prototype.isNewColumn = function (colKey) {
        return isNewRowColumn(this._summarys.colTotals, colKey);
    };

    var isNewRowColumn = function (totals, key) {
        if (typeof totals[key] === "undefined") {
            return true;
        }
        return false;
    };

    CrossData.prototype.addRow = function (key, groupValues) {
        var totalSummarizers =  this.makeSummarizers();
        this.addToRowGroupTree(key, groupValues, totalSummarizers);
        this._summarys.rowTotals[key] = totalSummarizers;
    };

    CrossData.prototype.addColumn = function (key, groupValues) {
        var totalSummarizers = this.makeSummarizers();
        this.addToColGroupTree(key, groupValues, totalSummarizers);
        this._summarys.colTotals[key] = totalSummarizers;
    };

    CrossData.prototype.makeSummarizers = function() {
        var FORM = this.formInfo,
            AGG = this.aggregator,
            summarizers = [],
            i, len, summarizerName;
        for (i = 0, len = FORM.summary.fields.length; i < len; i++) {
            summarizerName = FORM.summary.fields[i].func;
            summarizers.push(new AGG.summarizers[summarizerName]);
        }
        return summarizers;
    };

    CrossData.prototype.addToRowGroupTree = function(key, groupValues, totalSummarizers) {
        addToGroupTree(this._groupTree.row, key, groupValues, totalSummarizers);
    };

    CrossData.prototype.addToColGroupTree = function(key, groupValues, totalSummarizers) {
        addToGroupTree(this._groupTree.col, key, groupValues, totalSummarizers);
    };

    var addToGroupTree = function(rootNode, key, groupValues, totalSummarizers) {
        var currentNode = rootNode,
            parentSubTotal = false,
            i, len, name,nextNode;
        for (i = 0, len = groupValues.length; i < len; i += 1) {
            name = groupValues[i];
            if (name == "***") {
                currentNode.total = totalSummarizers;
            }
            nextNode = findChild(name, currentNode);
            if (nextNode == null) {
                nextNode = new GroupTreeNode(name);
                if (i == len - 1) {
                    nextNode.key = key;
                    nextNode.total = totalSummarizers;
                    delete nextNode.childs;
                }
                if (parentSubTotal == true) {
                    nextNode.name = "";
                }
                currentNode.childs.push(nextNode);
            }
            if (name == "***") {
                parentSubTotal = true;
            }
            currentNode = nextNode;
        }
    };

    var findChild = function(name, node) {
        var i, len, child;
        for (i = 0, len = node.childs.length; i < len; i++) {
            child = node.childs[i];
            if (child.name == name) {
                return child;
            }
        }
        return null;
    };

    CrossData.prototype.pushData = function (rowKeyList, colKeyList, record ) {
        var FORM = this.formInfo,
            i, len1, j, len2, k, len3, value;
        for (i = 0, len1 = FORM.summary.fields.length; i < len1; i += 1) {
            value = this.getFieldValue(FORM.summary.fields[i].name, record);
            value = parseFloat(value);
            for (j = 0, len2 = rowKeyList.length; j < len2; j += 1) {
                for (k = 0, len3 = colKeyList.length; k < len3; k += 1) {
                    this.push(rowKeyList[j], colKeyList[k], i, value);
                }
            }

            for (k = 0, len3 = colKeyList.length; k < len3; k += 1) {
                this._summarys.colTotals[colKeyList[k]][i].push(value);
            }

            for (j = 0, len2 = rowKeyList.length; j < len2; j += 1) {
                this._summarys.rowTotals[rowKeyList[j]][i].push(value);
            }

            this._summarys.allTotal[i].push(value);
        }
    };

    CrossData.prototype.push = function (rowKey, colKey, summaryIndex, value) {
        var rowNode,
            valueNode;
        rowNode = this._summarys.dataMatrix[rowKey];
        if (typeof rowNode === "undefined") {
            rowNode = this._summarys.dataMatrix[rowKey] = {};
        }

        valueNode = rowNode[colKey];
        if (typeof valueNode === "undefined") {
            valueNode = rowNode[colKey] = this.makeSummarizers();
        }

        valueNode[summaryIndex].push(value);
    };

    CrossData.prototype.sortGroups = function () {
        var colGroupSortFuncList = this.colGroupSortFuncList(),
            rowGroupSortFuncList = this.rowGroupSortFuncList();
        sortGroupTree(this._groupTree.col, colGroupSortFuncList);
        sortGroupTree(this._groupTree.row, rowGroupSortFuncList);
    };

    CrossData.prototype.colGroupSortFuncList = function () {
        var FORM = this.formInfo,
            AGG = this.aggregator,
            result  = [],
            i, len, sortName, sorter;
        for (i = 0 ,len = FORM.colGroup.fields.length; i < len; i += 1) {
            sortName = FORM.colGroup.fields[i].sort;
            sorter = AGG.groupSorters[sortName](FORM.colGroup.total.toLeft);
            result.push(sorter);
        }
        return result;
    };

    CrossData.prototype.rowGroupSortFuncList = function () {
        var FORM = this.formInfo,
            AGG = this.aggregator,
            result  = [],
            i, len, sortName, sorter;
        for (i = 0 ,len = FORM.rowGroup.fields.length; i < len; i += 1) {
            sortName = FORM.rowGroup.fields[i].sort;
            sorter = AGG.groupSorters[sortName](FORM.rowGroup.total.toTop);
            result.push(sorter);
        }
        return result;
    };

    var sortGroupTree = function(groupTree, sortFuncList) {
        var depth = -1;

        var depthFirstSearch = function(nodeList) {
            depth += 1;
            var i, len;
            for (i = 0, len = nodeList.length; i < len; i++)  {
                if (typeof (nodeList[i].childs) !== "undefined") {
                    depthFirstSearch(nodeList[i].childs);
                }
            }
            nodeList.sort(sortFuncList[depth]);
            depth -= 1;
        };
        depthFirstSearch(groupTree.childs);
    };

    var GroupTreeNode = function(name) {
        this.name = name;
        this.isTopSubTotal = false;
        this.isSubTotal = (name == "***") ? true : false;
        this.childs = [];
        this.nodeCount = function(showSubTotal) {
            var i,
                len,
                result = 0;
            if (typeof this._nodeCount !== "undefined") {
                return this._nodeCount;
            }

            if (typeof this.childs === "undefined") {
                if (showSubTotal == false && this.isSubTotal == true) {
                    this._nodeCount = 0;
                    return this._nodeCount;
                } else {
                    this._nodeCount = 1;
                    return this._nodeCount;
                }
            }
            for (i = 0, len = this.childs.length; i < len; i += 1) {
                result += this.childs[i].nodeCount(showSubTotal );
            }
            this._nodeCount = result;
            return this._nodeCount;
        };
        this.isTerminer = function () {
            return typeof this.childs === "undefined";
        };
    };

    return CrossData;
}();

var CrossViewUI = function() {
    function CrossViewUI(data, formInfo) {
        this.data = data;
        this.formInfo = formInfo;

        this._oldFormString = null;
        this._crossViewParent = null;
        this._table = null;
    }

    CrossViewUI.prototype.do = function () {
        this.createUI();
        this.fillFields();
        this.fillRows();
        this.fillCols();
        this.fillSummaries();
        this.eventHandler();
        return this._table;
    };

    CrossViewUI.prototype.createUI = function() {
        var tr, td,
            FORM = this.formInfo;
        this._table = $("<table>");
        this._table.attr("width", "100%").attr("height", "700"  );

        tr = $("<tr>");
        td = $("<td>").attr("width", "100").attr("rowspan", "6").attr("valign", "top");
        td.append(this.cellDiv("fields.", "fieldlist", "vertList"));
        tr.append(td);
        tr.append($("<td>").attr("width","160").attr("height", 50).attr("rowspan", "2"));
        td = $("<td>").attr("height", 50).attr("valign", "top");
        td.append(this.cellDiv("columns.", "colfields", "horizList"));
        tr.append(td);
        this._table.append(tr);

        tr = $("<tr>");
        td = $("<td>").attr("height", 50).attr("valign", "top");
        td.append(this.checkBox("Show title", "col.title", "horizCheckboxLi", FORM.colGroup.showTitle));
        td.append(this.checkBox("Show GrandTotal", "col.grand", "horizCheckboxLi", FORM.colGroup.total.showGrand))
        td.append(this.checkBox("Show SubTotal", "col.sub", "horizCheckboxLi", FORM.colGroup.total.showSub));
        td.append(this.checkBox("Total to Left", "col.left", "horizCheckboxLi", FORM.colGroup.total.toLeft));
        tr.append(td);
        this._table.append(tr);

        tr = $("<tr>");
        td = $("<td>").attr("width", "160").attr("height", 200).attr("valign", "top");
        td.append(this.cellDiv("rows.", "rowfields", "vertList"));
        tr.append(td);
        this._crossViewParent = $("<td>").attr("rowspan", "4").attr("valign", "top").attr("align", "left");
        this._crossViewParent.crossview(this.data, this.formInfo);
        tr.append(this._crossViewParent);
        this._table.append(tr);

        tr = $("<tr>");
        td = $("<td>").attr("width", "160").attr("height", 100).attr("valign", "top");
        td.append(this.checkBox("Show title", "row.title", "vertCheckboxLi", FORM.rowGroup.showTitle));
        td.append(this.checkBox("Show GrandTotal", "row.grand", "vertCheckboxLi", FORM.rowGroup.total.showGrand))
        td.append(this.checkBox("Show SubTotal", "row.sub", "vertCheckboxLi", FORM.rowGroup.total.showSub));
        td.append(this.checkBox("Total to Top", "row.top","vertCheckboxLi", FORM.rowGroup.total.toTop));
        tr.append(td);
        this._table.append(tr);

        tr = $("<tr>");
        td = $("<td>").attr("width", "160").attr("height", 200).attr("valign", "top");
        td.append(this.cellDiv("summary.", "summaryfields", "vertList"));
        tr.append(td);
        this._table.append(tr);

        tr = $("<tr>");
        td = $("<td>").attr("valign", "top").attr("align", "center");
        td.append(this.spanForSummaryDirection());
        tr.append(td);
        this._table.append(tr);
    };

    CrossViewUI.prototype.cellDiv = function(name, class1, class2) {
         var div = $("<div>").addClass("table-content");
         div.append($("<div>").css("text-align", "center").css("float", "top").text(name));
         div.append($("<div>").addClass(class1).addClass(class2).addClass("itemList").addClass("item"));
         return div;
    };

    CrossViewUI.prototype.checkBox = function(text, name, classForLi, defaultValue) {
        var checkbox = $("<input>").attr("type", "checkbox").attr("name", name).click(this, this.clickCheckBox);
        if (defaultValue == true) {
            checkbox.attr("checked", "checked");
        }
        return $("<li>").addClass(classForLi).append(checkbox).append(text);
    };

    CrossViewUI.prototype.clickCheckBox = function (e) {
        var name = $(e.currentTarget).attr("name"),
            value = 	$(e.currentTarget).prop("checked"),
            that = e.data,
            FORM = that.formInfo;
        if (name == "col.title") {
        	 	FORM.colGroup.showTitle = value;
        } else if (name == "col.grand") {
            FORM.colGroup.total.showGrand = value;
        } else if (name == "col.sub") {
            FORM.colGroup.total.showSub = value;
        } else if (name == "col.left") {
            FORM.colGroup.total.toLeft = value;
        } else if (name == "row.title") {
            FORM.rowGroup.showTitle = value;
        } else if (name == "row.grand") {
            FORM.rowGroup.total.showGrand = value;
        } else if (name == "row.sub") {
            FORM.rowGroup.total.showSub = value;
        } else if (name == "row.top") {
            FORM.rowGroup.total.toTop= value;
        }
        that.updateCrossView();
    };


    CrossViewUI.prototype.spanForSummaryDirection = function() {
        var FORM = this.formInfo,
            span = $("<span>").addClass("summaryDirection").text(FORM.summary.direction).click(this, this.clickSummaryDirection);
        return span;
    };

    CrossViewUI.prototype.clickSummaryDirection = function(e) {
        var $_span = $(e.currentTarget),
            value = $_span.text(),
            that = e.data,
            FORM = that.formInfo;
        if (value == "Horizontal") {
            FORM.summary.direction = "Vertical";
        } else {
            FORM.summary.direction = "Horizontal";
        }

        $_span.text(FORM.summary.direction);
        that.updateCrossView();
    };

    CrossViewUI.prototype.fillFields = function() {
        var i, len, fieldList, li,
            DATA = this.data,
            fields = Object.keys(DATA.metaInfo);

        this._table.find(".fieldlist li").remove();
        fieldList = this._table.find(".fieldlist");

        for (i = 0, len =  fields.length; i < len; i++) {
            li = $("<li>").append($("<span>").addClass("item").text(fields[i]));
            li.attr("_name", fields[i]);
            fieldList.append(li);
        }
    };

    CrossViewUI.prototype.fillRows = function() {
        var i, len, fieldList, li,
            FORM = this.formInfo,
            fields = FORM.rowGroup.fields;

        this._table.find(".rowfields li").remove();
        fieldList = this._table.find(".rowfields");

        for (i = 0, len = fields.length; i < len; i++) {
            li = $("<li>").append($("<span>").addClass("item").text(fields[i].name + " ").append($("<span>").addClass("itemSort").text(sortName(fields[i].sort))));
            li.attr("_index", i);
            li.attr("_name", fields[i].name);
            li.attr("_sort", fields[i].sort);

            li.unbind();
            li.click(this, clickRowGroup);
            fieldList.append(li);
        }
    };

    function clickRowGroup(e) {
        var li = $(e.currentTarget),
            that = e.data,
            FORM = that.formInfo,
            next = nextSort(li.attr("_sort")),
           index = parseInt(li.attr("_index"));
        li.attr("_sort", next);
        li.find("span span").text(sortName(next));
        FORM.rowGroup.fields[index].sort = next;
        that.updateCrossView();
    }

    function sortName(sort) {
        if (sort == "AscendingByName") {
            return "name↑";
        } else if (sort == "DescendingByName") {
            return "name↓";
        } else if (sort == "AscendingByValue") {
            return "value↑";
        } else if (sort == "DescendingByValue") {
            return "value↓";
        }
        return "name↑";
    }

    function nextSort(sort) {
        if (sort == "AscendingByName") {
            return "DescendingByName";
        } else if (sort == "DescendingByName") {
            return "AscendingByValue";
        } else if (sort == "AscendingByValue") {
            return "DescendingByValue";
        } else if (sort == "DescendingByValue") {
            return "AscendingByName";
        }
        return "AscendingByName";
    }

    CrossViewUI.prototype.fillCols = function() {
        var i, len, fieldList, li,
            FORM = this.formInfo,
            fields = FORM.colGroup.fields;

        this._table.find(".colfields li").remove();
        fieldList = this._table.find(".colfields");

        for (i = 0, len = fields.length; i < len; i++) {
            li = $("<li>").append($("<span>").addClass("item").text(fields[i].name + " ").append($("<span>").addClass("itemSort").text(sortName(fields[i].sort))));
            li.attr("_index", i);
            li.attr("_name", fields[i].name);
            li.attr("_sort", fields[i].sort);

            li.unbind();
            li.click(this, clickColGroup);

            fieldList.append(li);
        }
    };

    function clickColGroup(e) {
        var li = $(e.currentTarget),
            that = e.data,
            FORM = that.formInfo,
            next = nextSort(li.attr("_sort")),
            index = parseInt(li.attr("_index"));
        li.attr("_sort", next);
        li.find("span span").text(sortName(next));
        FORM.colGroup.fields[index].sort = next;
        that.updateCrossView();
    }

    CrossViewUI.prototype.fillSummaries = function() {
        var i, len, fieldList, li,
            FORM = this.formInfo,
            fields = FORM.summary.fields;

        this._table.find(".summaryfields li").remove();
        fieldList = this._table.find(".summaryfields");

        for (i = 0, len = fields.length; i < len; i++) {
            li = $("<li>").append($("<span>").addClass("item").text(fields[i].name + " ").append($("<span>").addClass("itemSort").text(fields[i].func)));
            li.attr("_index", i);
            li.attr("_name", fields[i].name);
            li.attr("_func", fields[i].func);

            li.unbind();
            li.click(this, clickSummary);

            fieldList.append(li);
        }
    };

    function clickSummary(e) {
        var li = $(e.currentTarget),
            that = e.data,
            FORM = that.formInfo,
            next = nextFunc(li.attr("_func")),
            index = parseInt(li.attr("_index"));
        li.attr("_func", next);
        li.find("span span").text(next);
        FORM.summary.fields[index].func= next;
        that.updateCrossView();
    }

    function nextFunc(func) {
        if (func == "sum") {
            return "avg";
        } else if (func == "avg") {
            return "count";
        } else if (func == "count") {
            return "max";
        } else if (func == "max") {
            return "min";
        } else if (func == "min") {
            return "var";
        } else if (func == "var") {
            return "stddev";
        } else if (func == "stddev") {
            return "sum";
        }
        return "sum";
    }

    CrossViewUI.prototype.eventHandler = function() {
        var that = this;

        this._table.find(".itemList").sortable({
            update: function(e, ui) {
                that.fillFields();
                that.updateCheckRows();
                that.updateCheckCols();
                that.updateCheckSummaries();
                that.updateCrossView();
            },
            connectWith: that._table.find(".itemList"),
            items: 'li',
            placeholder: 'placeholder'
        });
    };

    CrossViewUI.prototype.updateCheckRows = function() {
        var rowfields = [],
            FORM = this.formInfo;
        this._table.find(".rowfields li").each(function(index, obj) {
            var $_obj = $(obj),
                name = $_obj.attr("_name"),
                sort = $_obj.attr("_sort");
            $_obj.attr("_index", index)
            if (typeof (sort) == "undefined") {
                $_obj.attr("_sort", "AscendingByName");
                sort = "AscendingByName";
            }
            rowfields.push({name:name, sort:sort});
        });
        FORM.rowGroup.fields = rowfields;
        this.fillRows();
    };

    CrossViewUI.prototype.updateCheckCols = function() {
        var colfields = [],
            FORM = this.formInfo;
        this._table.find(".colfields li").each(function(index, obj) {
            var $_obj = $(obj),
                name = $_obj.attr("_name"),
                sort = $_obj.attr("_sort");

            $_obj.attr("_index", index)
            if (typeof (sort) == "undefined") {
                $_obj.attr("_sort", "AscendingByName");
                sort = "AscendingByName";
            }
            colfields.push({name:name, sort:sort});
        });
        FORM.colGroup.fields = colfields;
        this.fillCols();
    };

    CrossViewUI.prototype.updateCheckSummaries = function() {
        var summaryFields = [],
            FORM = this.formInfo;
        this._table.find(".summaryfields li").each(function(index, obj) {
            var $_obj = $(obj),
                name = $_obj.attr("_name"),
                func = $_obj.attr("_func");
            $_obj.attr("_index", index)
            if (typeof (func) == "undefined") {
                $_obj.attr("_func", "sum");
                func = "sum";
            }
            summaryFields.push({name:name, func:func});
        });
        FORM.summary.fields = summaryFields;
        this.fillSummaries();
    };
    
    CrossViewUI.prototype.updateCrossView = function () {
        var formString = JSON.stringify(this.formInfo);
        if(this._oldFormString != formString) {
            this._crossViewParent.empty();
            this._crossViewParent.crossview(this.data, this.formInfo);

            this._oldFormString = formString;
        }
    };

    return CrossViewUI;
}();

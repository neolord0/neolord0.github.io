var JSGridUI = function() {
    function JSGridUI(data, formInfo, filter) {
        this.data = data;
        this.formInfo = formInfo;
        this.filter = filter;
        this._oldFormString = null;
        this._oldFilterString = null;
        this._jsGridParent = null;
        this._table = null;
        this._dialog_filter = null;
    }

    JSGridUI.prototype.do = function () {
        this.createUI();
        this.setFilterDlg();
        this.fillFields();
        this.fillFilter();
        this.fillCols();
        this.eventHandler();
        this.updateGrid();
        return this._table;
    };

    JSGridUI.prototype.createUI = function() {
        var tr, td;

        this._table = $("<table>");
        this._table.attr("width", "100%").attr("height", "700");

        tr = $("<tr>");
        td = $("<td>").attr("width", "100").attr("height", "700").attr("rowspan", "3").attr("valign", "top");
        td.append(this.cellDiv("fields.", "fieldlist", "vertList"));
        tr.append(td);

        td = $("<td>").attr("height", 50).attr("valign", "top");
        td.append(this.cellDiv("filters.", "filters", "horizList"));
        tr.append(td);
        this._table.append(tr);

        tr = $("<tr>");
        td = $("<td>").attr("height", 50).attr("valign", "top");
        td.append(this.cellDiv("columns.", "colfields", "horizList"));
        tr.append(td);
        this._table.append(tr);

        tr = $("<tr>");
        td = $("<td>").attr("valign", "top").attr("align", "left")
        this._jsGridParent = td;
        tr.append(td);
        this._table.append(tr);
    };

    JSGridUI.prototype.cellDiv = function(name, class1, class2) {
        var div = $("<div>").addClass("table-content");
        div.append($("<div>").css("text-align", "center").css("float", "top").text(name));
        div.append($("<div>").addClass(class1).addClass(class2).addClass("itemList").addClass("item"));
        return div;
    };


    JSGridUI.prototype.setFilterDlg = function() {
        var that = this,
            $_select = $("select[multiple]");

        this._dialog_filter = $("#dialog_filter").dialog({
            autoOpen: false,
            height: 600,
            width: 800,
            modal: true,
            buttons: {
                "확인": function() {
                    that.setSelectedFilter();
                    that.updateFilter();
                    that.updateGrid();
                    that._dialog_filter.dialog("close");
                },
                "취소": function() {
                    that.updateFilter();
                    that._dialog_filter.dialog("close");
                }
            },
            open: function () {
                var name = that._dialog_filter._$_li.attr("_name"),
                    title = that._dialog_filter._$_li.attr("_title"),
                    condition = that._dialog_filter._$_li.attr("_condition");
                $("#filterTitle").text(title + "필드의 필터를 선택해 주세요.");
                if (typeof(condition) != "undefined" && condition != null && condition.length > 0) {
                    that.fillFilterOption(name, condition);
                } else {
                    that.fillFilterOptionWithOutFilterCondition(name);
                }
            }
        });
        
        $_select.multiselect({
            columns: 4,
            maxWidth: 800,
            maxHeight: 400,
            placeholder: 'Select Item',
            search: true
        });
    };

    JSGridUI.prototype.fillFilterOption = function(fieldName, filterCondition) {
        var ROWS = this.data["rows"],
            insertedDatas = [],
            $_select = $("select[multiple]"), $_option;
        $_select.empty();
        ROWS.forEach(function (row) {
        	if (insertedDatas.includes(row[fieldName]) == false) {
                $_option = $("<option>").attr("value", row[fieldName]).text(row[fieldName]);
                if (filterCondition.includes(row[fieldName])) {
                    $_option.attr("selected", "selected");
                }
                $_select.append($_option);
                insertedDatas.push(row[fieldName]);
            }
        });
   
        $_select.multiselect("reload", {
            columns: 4,
            maxWidth: 800,
            maxHeight: 400,
            placeholder: 'Select Item',
            search: true
        });
    };


    JSGridUI.prototype.fillFilterOptionWithOutFilterCondition = function(fieldName) {
        var ROWS = this.data["rows"],
            insertedDatas = [],
            $_select = $("select[multiple]");
        $_select.empty();
        ROWS.forEach(function (row) {
            if (insertedDatas.includes(row[fieldName]) == false) {
                $_select.append($("<option>").attr("value", row[fieldName]).text(row[fieldName]));
                insertedDatas.push(row[fieldName]);
            }
        });

        $_select.multiselect("reload", {
            columns: 4,
            maxWidth: 800,
            maxHeight: 400,
            placeholder: 'Select Item',
            search: true
        });
    };


    JSGridUI.prototype.setSelectedFilter = function() {
        var condition = [];
        $("select[multiple] option:selected").each(function(index, obj) {
        		condition.push($(obj).text());
        });

        if (condition.length > 0) {
            this._dialog_filter._$_li.attr("_condition", condition);
        } else {
        		this._dialog_filter._$_li.remove();
        }
    };


    JSGridUI.prototype.fillFields = function() {
        var i, len, fieldList, li,
            DATA = this.data,
            fields = DATA["fields"],
            field;

        this._table.find(".fieldlist li").remove();
        fieldList = this._table.find(".fieldlist");

        for (i = 0, len =  fields.length; i < len; i++) {
            field = fields[i];

            li = $("<li>").append($("<span>").addClass("item").text(field["title"]));
            li.attr("_name", field["name"]);
            li.attr("_title", field["title"]);
            fieldList.append(li);
        }
    };

    JSGridUI.prototype.fillFilter = function() {
        var i, len, filterlist, li,
            FILTER = this.filter,
            eachFilter,
            that = this;

        if (FILTER != null) {
            this._table.find(".filters li").remove();
            filterlist = this._table.find(".filters");

            for (i = 0, len = FILTER.length; i < len; i++) {
                eachFilter = FILTER[i];
                li = $("<li>").append($("<span>").addClass("item").text(filterText(eachFilter)));
                li.attr("_name", eachFilter["name"]);
                li.attr("_title", eachFilter["title"]);
                li.attr("_condition", eachFilter["condition"]);
 
                li.click(function(e) {
                    that._dialog_filter._$_li = $(e.target).parent();
                    that._dialog_filter.dialog("open");
	            });
                
                filterlist.append(li);
            }
        }
    };

    function filterText(eachFilter) {
        var condition = eachFilter["condition"];
        return eachFilter["title"] + " = " + condition;
    }
    
    JSGridUI.prototype.fillCols = function() {
        var i, len, fieldList, li,
            FORM = this.formInfo,
            fields = FORM.fields,
            field;

        this._table.find(".colfields li").remove();
        fieldList = this._table.find(".colfields");

        for (i = 0, len = fields.length; i < len; i++) {
            field = fields[i];
            li = $("<li>").append($("<span>").addClass("item").text(field["title"]));
            li.attr("_name", field["name"]);
            li.attr("_title", field["title"]);
            fieldList.append(li);
        }
    };

    JSGridUI.prototype.eventHandler = function() {
        var that = this;
        this._table.find(".itemList").sortable({
            update: function(e, ui) {
                that.fillFields();
                that.updateCheckCols();
                if (that.checkNewFilter() == false) {
                		that.updateFilter();
                }
                that.updateGrid();
            },
            connectWith: that._table.find(".itemList"),
            items: 'li',
            placeholder: 'placeholder'
        });
    };

    JSGridUI.prototype.updateCheckCols = function() {
        var colfields = [],
            FORM = this.formInfo;
        this._table.find(".colfields li").each(function(index, obj) {
            var $_obj = $(obj),
                name = $_obj.attr("_name"),
                title = $_obj.attr("_title");

            colfields.push({name:name, title:title});
        });
        FORM.fields = colfields;
        this.fillCols();
    };

    JSGridUI.prototype.checkNewFilter = function() {
        var that = this,
        		addedNewFilter = false;
     
        this._table.find(".filters li").each(function(index, obj) {
            var $_obj = $(obj),
                condition = $_obj.attr("_condition");
            if (condition == null) {
            		addedNewFilter = true;
                that._dialog_filter._$_li = $_obj;
                that._dialog_filter.dialog("open");
            }
        });
        return addedNewFilter;
    };
    
    JSGridUI.prototype.updateFilter = function() {
        var FILTER = this.filter;
        FILTER.splice(0, this.filter.length)

        this._table.find(".filters li").each(function(index, obj) {
            var $_obj = $(obj),
            		name = $_obj.attr("_name"),
              	title = $_obj.attr("_title"),
              	condition = $_obj.attr("_condition");
            if (typeof(condition) != "undefined" && condition != null && condition.length > 0) {
            		FILTER.push({name:name, title:title, condition:condition});
            }
        });
        this.fillFilter();
    };

    JSGridUI.prototype.updateGrid = function() {
        var FORM = this.formInfo,
            FILTER = this.filter,
            jsgrid = {},
            formString = JSON.stringify(FORM),
        		filterString = JSON.stringify(FILTER),
        		that = this;
        
        if (this._oldFormString != formString || this._oldFilterString != filterString) {
            for (var attr in FORM) {
                if (FORM.hasOwnProperty(attr)) {
                    jsgrid[attr] = FORM[attr];
                }
            }
            jsgrid["data"] = this.dataAdjustFilter();
            this._jsGridParent.empty();
            this._jsGridParent.jsGrid(jsgrid);

            this._oldFormString = formString;
            this._oldFilterString = filterString;
        }
   };

   JSGridUI.prototype.dataAdjustFilter = function() {
	   var ROWS = this.data["rows"],
	   	   FILTER = this.filter,	   
	   	   len1, len2, index1, index2,
	   	   row, eachFilter, suitableData, name, condition;
	   	   result = [];
	   
	   if (FILTER == null || FILTER.length == 0) {
		   return ROWS;
	   }
	   
	   len1 = ROWS.length;
	   len2 = FILTER.length
	  
	   for (index1 = 0; index1 < len1; index1++) {
		   row = ROWS[index1];
		   suitableData = true;
		   for (index2 = 0; index2 < len2 && suitableData == true; index2++) {
			   eachFilter = FILTER[index2];
			   name = eachFilter["name"];
			   condition = eachFilter["condition"];
			   if (condition.includes(row[name]) == false) {
				   suitableData = false;
			   }
		   }
		   if (suitableData == true) {
			   result.push(row);
		   }
	   }	
	   return result;
   };

   return JSGridUI;
}();


$.fn.jsgridUI = function(data, formInfo, filter) {
    setCSSForUI();
    var jsGridUI = new JSGridUI(data, formInfo, filter);
    this.append(jsGridUI.do());
};

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

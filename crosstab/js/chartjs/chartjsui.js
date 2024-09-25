
var ChartJSUI = function() {
    function ChartJSUI(data, formInfo) {
        this.data = data;
        this.formInfo = formInfo;
        this.palettes = [
            ["#556270", "#4ECDC4", "#C7F464", "#FF6B6B", "#C44D58", "#556270", "#4ECDC4","#C7F464"],
            ["#FE58BA", "#1EC9E7", "#FF80B2", "#CFD87B", "#D5025F", "#FE58BA", "#1EC9E7", "#FF80B2"],
            ["#FFBF00", "#FF8F00", "#9E550E", "#032304", "#300645", "#FFBF00", "#FF8F00", "#9E550E"],
            ["#008DDF", "#EEEEEE", "#C7E9FF", "#D162FF", "#FFEE02", "#008DDF", "#EEEEEE", "#C7E9FF"]
        ];

        this._oldFormString = null;
        this._table = null;
        this._chart = null;
    }

    ChartJSUI.prototype.do = function () {
        this.createUI();
        this.fillFields();
        this.fillDatasets();

        return this._table;
    };

    ChartJSUI.prototype.createUI = function() {
        var tr, td;

        this._table = $("<table>");
        this._table.attr("width", "100%").attr("height", "500");

        tr = $("<tr>");
        td = $("<td>").attr("width", "160").attr("height", "500").attr("rowspan", "4").attr("valign", "top");
        td.append(this.cellDiv("fields.", "fieldlist", "vertList"));
        tr.append(td);
        td = $("<td>").attr("height", "50").attr("colspan", "2").attr("valign", "top");
        this.typeSelector(td);
        tr.append(td);

        this._table.append(tr);

        tr = $("<tr>");
        td = $("<td>").attr("width", "160").attr("height", "200").attr("valign", "top");
        this.label_etcs(td);
        tr.append(td);
        td = $("<td>").attr("rowspan", "3").attr("valign", "top");
        td.append($("<div>").attr("width", "70%").append($("<canvas>").attr("height", 120).attr("id","canvasForChart")));
        tr.append(td);

        this._table.append(tr);

        tr = $("<tr>");
        td = $("<td>").attr("width", "160").attr("height", "300").attr("valign", "top");
        td.append(this.cellDiv("dataset.", "dataFieldList", "vertList"));
        tr.append(td);
        this._table.append(tr);

        tr = $("<tr>");
        td = $("<td>").attr("width", "160").attr("valign", "top");
        tr.append(td);
        this._table.append(tr);
    };

    ChartJSUI.prototype.cellDiv = function(name, class1, class2) {
        var div = $("<div>").addClass("table-content");
        div.append($("<div>").css("text-align", "center").css("float", "top").text(name));
        div.append($("<div>").addClass(class1).addClass(class2).addClass("itemList").addClass("item"));
        return div;
    };

    ChartJSUI.prototype.typeSelector = function (td) {
        var FORM = this.formInfo;

        td.append($("<label>").attr("for", "chartType-1").text("막대"));
        td.append($("<input>").attr("type", "radio").attr("id", "chartType-1").attr("name","chartType").attr("value", "bar"));
        td.append("&nbsp;&nbsp;");
        td.append($("<label>").attr("for", "chartType-2").text("가로 막대"));
        td.append($("<input>").attr("type", "radio").attr("id", "chartType-2").attr("name","chartType").attr("value", "horizontalBar"));
        td.append("&nbsp;&nbsp;");
        td.append($("<label>").attr("for", "chartType-3").text("선"));
        td.append($("<input>").attr("type", "radio").attr("id", "chartType-3").attr("name","chartType").attr("value", "line"));
        td.append("&nbsp;&nbsp;");
        td.append($("<label>").attr("for", "chartType-4").text("영역"));
        td.append($("<input>").attr("type", "radio").attr("id", "chartType-4").attr("name","chartType").attr("value", "area"));
        td.append("&nbsp;&nbsp;");
        td.append($("<label>").attr("for", "chartType-5").text("레이더"));
        td.append($("<input>").attr("type", "radio").attr("id", "chartType-5").attr("name","chartType").attr("value", "radar"));
        td.append("&nbsp;&nbsp;");
        td.append($("<label>").attr("for", "chartType-6").text("도넛"));
        td.append($("<input>").attr("type", "radio").attr("id", "chartType-6").attr("name","chartType").attr("value", "doughnut"));
        td.append("&nbsp;&nbsp;");
        td.append($("<label>").attr("for", "chartType-7").text("파이"));
        td.append($("<input>").attr("type", "radio").attr("id", "chartType-7").attr("name","chartType").attr("value", "pie"));

        td.children(":input:radio[value='" + FORM.type + "']").attr("checked", "checked");
    };

    ChartJSUI.prototype.label_etcs = function (td) {
        var $temp = null,
            DATA = this.data,
            FORM = this.formInfo,
            fields = Object.keys(DATA),
            i, len;

        td.append($("<label>").attr("for", "labelField").text("라벨 필드"));
        $temp = $("<select>").attr("name", "labelField").attr("id", "labelField");
        for (i = 0, len =  fields.length; i < len; i++) {
            if (fields[i] == FORM.dataLink.labels) {
                $temp.append($("<option>").attr("selected", "selected").text(fields[i]));
            } else {
                $temp.append($("<option>").text(fields[i]));
            }
        }

        td.append($temp);

        td.append($("<h4>"));

        $temp = $("<label>").attr("for", "eachColor").text("값마다 다른 색으로");
        if (FORM.eachColor == true) {
            $temp.append($("<input>").attr("type", "checkbox").attr("name", "eachColor").attr("id", "eachColor").attr("checked", "true"));
        } else {
            $temp.append($("<input>").attr("type", "checkbox").attr("name", "eachColor").attr("id", "eachColor"));
        }

        td.append($temp);
        td.append("&nbsp;&nbsp;");
        $temp = $("<label>").attr("for", "smooth").text("부드럽게");
        if (FORM.smooth == true) {
            $temp.append($("<input>").attr("type", "checkbox").attr("name", "smooth").attr("id", "smooth").attr("checked", "true"));
        } else {
            $temp.append($("<input>").attr("type", "checkbox").attr("name", "smooth").attr("id", "smooth"));
        }
        td.append($temp);

        td.append($("<h4>"));

        td.append($("<label>").attr("for", "palette").text("팔렛트"));
        $temp = $("<select>").attr("name", "palette").attr("id", "palette");
        for (i = 1, len =  this.palettes.length; i <= len; i++) {
            if (i == FORM.palette.index) {
                $temp.append($("<option>").attr("selected", "selected").text("팔렛트" + i));
            } else {
                $temp.append($("<option>").text("팔렛트" + i));
            }
        }
        td.append($temp);
    };

    ChartJSUI.prototype.fillFields = function() {
        var i, len, fieldList, li,
            DATA = this.data,
            fields = Object.keys(DATA);

        this._table.find(".fieldlist li").remove();
        fieldList = this._table.find(".fieldlist");

        for (i = 0, len =  fields.length; i < len; i++) {
            li = $("<li>").append($("<span>").addClass("item").text(fields[i]));
            li.attr("_name", fields[i]);
            fieldList.append(li);
        }
    };

    ChartJSUI.prototype.fillDatasets = function () {
        var i, len, fieldList, li,
            FORM = this.formInfo,
            fields = FORM.dataLink.datasets;

        this._table.find(".dataFieldList li").remove();
        fieldList = this._table.find(".dataFieldList");

        for (i = 0, len =  fields.length; i < len; i++) {
            li = $("<li>").append($("<span>").addClass("item").text(fields[i]));
            li.attr("_name", fields[i]);
            fieldList.append(li);
        }
    };


    ChartJSUI.prototype.setEvent = function() {
        var that = this;

        this._table.find(".itemList").sortable({
            update: function(e, ui) {
                that.fillFields();
                that.updateCheckDatasets();
                that.updateChart();
            },
            connectWith: that._table.find(".itemList"),
            items: 'li',
            placeholder: 'placeholder'
        });


        $(":input:radio[name=chartType]").checkboxradio({icon: false});
        $(":input:radio[name='chartType']").click(function() {
            var FORM = that.formInfo;
            FORM.type = $(this).attr("value");
            that.updateChart();
        });

        $("#labelField").selectmenu({
            change: function( event, ui ) {
                var FORM = that.formInfo;
                FORM.dataLink.labels = ui.item.value;
                that.updateChart();
            }
        });

        $("#eachColor").checkboxradio({icon: false});
        $("#eachColor").click(function() {
            var FORM = that.formInfo,
                eachColor = $(this).prop("checked");
            FORM.eachColor = eachColor;
            that.updateChart();
        });


        $("#smooth").checkboxradio({icon: false});
        $("#smooth").click(function() {
            var FORM = that.formInfo,
                smooth = $(this).prop("checked");
            FORM.smooth = smooth;
            that.updateChart();
        });

        $("#palette").selectmenu({
            change: function( event, ui ) {
                var FORM = that.formInfo;
                FORM.palette.index = ui.item.index;
                FORM.palette.colors = that.palettes[ui.item.index];
                that.updateChart();
            }
        });
    };

    ChartJSUI.prototype.updateCheckDatasets = function () {
        var datasets = [],
            FORM = this.formInfo;
        this._table.find(".dataFieldList li").each(function(index, obj) {
            var $_obj = $(obj),
                name = $_obj.attr("_name");
            datasets.push(name);
        });
        FORM.dataLink.datasets = datasets;
        this.fillDatasets();
    };

    ChartJSUI.prototype.updateChart = function () {
        var FORM = this.formInfo,
            formString = JSON.stringify(FORM),
            ctx = document.getElementById("canvasForChart").getContext("2d");

        if (this._oldFormString != formString) {
            if (this._chart != null) {
                this._chart.destroy();
            }

            if (FORM.dataLink == null
                || FORM.dataLink.labels == null
                || FORM.dataLink.datasets == null
                || FORM.dataLink.datasets.length == 0) {
                return;
            }

            this._chart = new Chart(ctx, {
                type: (FORM.type == "area") ? "line" : FORM.type,
                data: this.makeChartData(),
                options: FORM.options
            });

            this._oldFormString = formString;
        }
    };

    ChartJSUI.prototype.makeChartData = function() {
        var FORM = this.formInfo,
            DATA = this.data;
        var chartData = {
            labels: DATA[FORM.dataLink.labels],
            datasets: []
        };

        var colors_Back_Border = this.makeBack_BorderColor();

        FORM.dataLink.datasets.forEach(function (element, index) {
            chartData.datasets.push({
                label: element,
                fill: (FORM.type == "area" || FORM.type == "radar") ? true : false,
                backgroundColor: colors_Back_Border.backColor[index],
                borderColor: colors_Back_Border.borderColor[index],
                borderWidth: 1,
                data: DATA[element],
                lineTension: FORM.smooth ? 0.3 : 0
            });
        });
        return chartData;
    };

    ChartJSUI.prototype.makeBack_BorderColor = function() {
        var FORM = this.formInfo,
            DATA = this.data;
        var backColor = [],
            borderColor = [],
            datasetCount = FORM.dataLink.datasets.length,
            dataRowCount = DATA[Object.keys(DATA)[0]].length,
            colorCount = FORM.palette.colors.length,
            color = Chart.helpers.color,
            backColorForDataSet,
            borderColorForDataSet,
            i;

        var backColorAlpha = 0.6;

        if (FORM.eachColor == true &&
            (FORM.type == "bar" || FORM.type == "horizontalBar" || FORM.type == "doughnut" || FORM.type == "pie")) {
            backColorForDataSet = [];
            borderColorForDataSet = [];
            for (i = 0; i < dataRowCount; i++) {
                backColorForDataSet.push(color(FORM.palette.colors[i % colorCount]).alpha(backColorAlpha).rgbString());
                borderColorForDataSet.push(FORM.palette.colors[i % colorCount]);
            }

            for (i = 0; i < datasetCount; i++) {
                backColor.push(backColorForDataSet);
                borderColor.push(borderColorForDataSet);
            }
        } else {
            for (i = 0; i < datasetCount; i++) {
                backColor.push(color(FORM.palette.colors[i % colorCount]).alpha(backColorAlpha).rgbString());
                borderColor.push(FORM.palette.colors[i % colorCount]);
            }
        }
        return {"backColor": backColor, "borderColor": borderColor};
    };

    return ChartJSUI;
}();


$.fn.chartjsUI = function(data, formInfo) {
    setCSSForUI();
    var chartjsUI = new ChartJSUI(data, formInfo);
    this.append(chartjsUI.do());
    chartjsUI.setEvent();
    chartjsUI.updateChart();
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

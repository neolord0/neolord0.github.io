/**
 * Created by neolord on 2017. 7. 13..
 */

var makeAggregator = function() {
    var agg = {
        summarizers: {},
        groupSorters: {}
    };

    agg.summarizers["sum"] = function () {
        this._sum = 0;

        this.push = function(value) {
            this._sum += value;
        };
        this.value = function() {
            return this._sum;
        };
    };

    agg.summarizers["avg"] = function () {
        this._sum = 0;
        this._count = 0;

        this.push = function(value) {
            this._sum += value;
            this._count += 1;
        };
        this.value = function() {
            return this._sum / this._count;
        };
    };

    agg.summarizers["count"] = function () {
        this._count = 0;

        this.push = function(value) {
            this._count += 1;
        };
        this.value = function() {
            return this._count;
        };
    };

    agg.summarizers["max"] = function () {
        this._max = null;
        this.push = function (value) {
            this._max = value;
            this.push = function (value) {
                this._max = (value > this._max) ? value : this._max;
            };
        };
        this.value = function() {
            return this._max;
        };
    };

    agg.summarizers["min"] = function () {
        this._min = null;
        this.push = function (value) {
            this._min = value;
            this.push = function (value) {
                this._min = (value < this._min) ? value : this._min;
            };
        };
        this.value = function() {
            return this._min;
        };
    };

    agg.summarizers["var"] = function () {
        this._sum = 0;
        this._sumofpow2 = 0;
        this._count = 0;
        this.push = function(value) {
            this._sum += value;
            this._sumofpow2 += value * value;
            this._count += 1;
        };
        this.value = function () {
            return this._sumofpow2 -  this._sum * this._sum / this._count;
        };
        
    };

    agg.summarizers["stddev"] = function () {
        this._sum = 0;
        this._sumofpow2 = 0;
        this._count = 0;
        this.push = function(value) {
            this._sum += value;
            this._sumofpow2 += value * value;
            this._count += 1;
        };
        this.value = function () {
            var _var = this._sumofpow2 -  this._sum * this._sum / this._count;
            return Math.sqrt(_var);
        };
    };

    agg.groupSorters["AscendingByName"] = function(firstTotal) {
        var sortFunc = function (a, b) {
            var nameA, nameB;

            if (a.isSubTotal == true) {
                return (firstTotal == false) ? 1 : -1;
            }
            if (b.isSubTotal === true) {
                return (firstTotal == false) ? -1 : 1;
            }

            nameA = a.name;
            nameB = b.name;
            if (nameA > nameB) {
                return 1;
            } else if (nameA < nameB) {
                return -1;
            }
            return 0;
        };
        return sortFunc;
    };

    agg.groupSorters["DescendingByName"] = function(firstTotal) {
        var sortFunc = function (a, b) {
            var nameA, nameB;

            if (a.isSubTotal === true) {
                return (firstTotal == false) ? 1 : -1;
            }
            if (b.isSubTotal === true) {
                return (firstTotal == false) ? -1 : 1;
            }

            nameA = a.name;
            nameB = b.name;
            if (nameA > nameB) {
                return -1;
            } else if (nameA < nameB) {
                return 1;
            }
            return 0;
        };
        return sortFunc;
    };

    agg.groupSorters["AscendingByValue"] = function(firstTotal) {
        var sortFunc = function (a, b) {
            var valueA, valueB;

            if (a.isSubTotal == true) {
                return (firstTotal == false) ? 1 : -1;
            }
            if (b.isSubTotal === true) {
                return (firstTotal == false) ? -1 : 1;
            }
            valueA = a.total[0].value();
            valueB = b.total[0].value();
            if (valueA > valueB) {
                return 1;
            } else if (valueA < valueB) {
                return -1;
            }
            return 0;
        };
        return sortFunc;
    };

    agg.groupSorters["DescendingByValue"] = function(firstTotal) {
        var sortFunc = function (a, b) {
            var valueA, valueB;

            if (a.isSubTotal === true) {
                return (firstTotal == false) ? 1 : -1;
            }
            if (b.isSubTotal === true) {
                return (firstTotal == false) ? -1 : 1;
            }

            valueA = a.total[0].value();
            valueB = b.total[0].value();
            if (valueA > valueB) {
                return -1;
            } else if (valueA < valueB) {
                return 1;
            }

            return 0;
        };
        return sortFunc;
    };

    return agg;
};

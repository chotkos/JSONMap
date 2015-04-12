var cells = [];
var lands = [];
var waters = [];
var mapWidth = 35;
var mapHeight = 20;
var landToWater = 0.2;
var forestProportion = 0.2;

$(document).ready(function () {
    $("#widthNew").val(mapWidth);
    $("#heightNew").val(mapHeight);
    $("#wtgNew").val(landToWater);
    $("#forestsNew").val(forestProportion);

    generateMap(landToWater);
});

var generateNewMap = function () {
    $('#mapContainer').empty();
    mapWidth = parseInt($("#widthNew").val());
    mapHeight = parseInt($("#heightNew").val());
    landToWater = $("#wtgNew").val();
    forestProportion = $("#forestsNew").val();
    cells = [];
    lands = [];
    waters = [];
    generateMap();
};
var getJSON = function () {
    var result = lands.concat(waters);
    for (var i = 0; i < result.length; i++) {
        result[i].element = null;
    }
    download('jsonMap.json', JSON.stringify(result));
};

var prepareHTMLContent = function () {
    for (var i = 0; i < lands.length; i++) {
        lands[i].htmlContent = lands[i].element.html();
    }
    for (var i = 0; i < waters.length; i++) {
        waters[i].htmlContent = waters[i].element.html();
    }
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    pom.style.display = 'none';
    document.body.appendChild(pom);

    pom.click();

    document.body.removeChild(pom);
}

var generateMap = function () {
    $('#mapContainer').append("<table id='mapTable'></table>");
    mapHeight += 2;
    mapWidth += 2;
    for (var i = 0; i < mapHeight; i++) {
        $('#mapTable').append("<tr id='row" + i + "'></tr>");
        for (var l = 0; l < mapWidth; l++) {
            $('#row' + i).append("<td id='cell" + l + "x" + i + "' class='mapCell'></td>");
            var cell = {
                y: i,
                x: l,
                isGround: false,
                element: $("#cell" + l + "x" + i),
                type: null,
                numType: null,
            };
            if (Math.random() > landToWater) {
                $("#cell" + l + "x" + i).append("<div class='groundCell'></div>");
                cell.isGround = true;
            }
            cell.x = l;
            cell.y = i;
            cells.push(cell);
        }
    }
    //regroup
    for (var k = 0; k < cells.length; k++) {
        if (cells[k].isGround) {
            lands.push(cells[k]);
        } else {
            waters.push(cells[k]);
        }
    }

    //ground smoothing
    //Island remover
    for (var ki = 0; ki < lands.length; ki++)
        if (lands[ki].x > 0 &&
            lands[ki].x < mapWidth - 1 &&
            lands[ki].y > 0 &&
            lands[ki].y < mapHeight - 1)
            smoothGroundIsland(lands[ki]);
        //Lake remover
    for (var ki = 0; ki < waters.length; ki++)
        if (waters[ki].x > 0 &&
            waters[ki].x < mapWidth - 1 &&
            waters[ki].y > 0 &&
            waters[ki].y < mapHeight - 1)
            smoothGroundLake(waters[ki]);
        //Cornermaker
    for (var j = 0; j < lands.length; j++)
        if (lands[j].x > 0 &&
            lands[j].x < mapWidth - 1 &&
            lands[j].y > 0 &&
            lands[j].y < mapHeight - 1) smoothCorners(lands[j]);
        //SingleMaker
        //Singles
    for (var j = 0; j < lands.length; j++)
        if (lands[j].x > 0 &&
            lands[j].x < mapWidth - 1 &&
            lands[j].y > 0 &&
            lands[j].y < mapHeight - 1) smoothSingles(lands[j]);
        //surrounded
    for (var j = 0; j < lands.length; j++)
        if (lands[j].x > 0 &&
            lands[j].x < mapWidth - 1 &&
            lands[j].y > 0 &&
            lands[j].y < mapHeight - 1) smoothSurrounded(lands[j]);
        //Bridges
    for (var j = 0; j < lands.length; j++)
        if (lands[j].x > 0 &&
            lands[j].x < mapWidth - 1 &&
            lands[j].y > 0 &&
            lands[j].y < mapHeight - 1) smoothBridges(lands[j]);
        //Islands
    for (var j = 0; j < lands.length; j++)
        if (lands[j].x > 0 &&
            lands[j].x < mapWidth - 1 &&
            lands[j].y > 0 &&
            lands[j].y < mapHeight - 1) makeLonelyIsland(lands[j]);
        //Forests
    for (var j = 0; j < lands.length; j++)
        if (lands[j].x > 0 &&
            lands[j].x < mapWidth - 1 &&
            lands[j].y > 0 &&
            lands[j].y < mapHeight - 1) makeForests(lands[j]);

    removeFrame();
    prepareHTMLContent();
    mapHeight -= 2;
    mapWidth -= 2;
}
var findCellByCoords = function (x, y, collection) {
    for (var i = 0; i < collection.length; i++) {
        if (collection[i].x === x && collection[i].y === y) {
            return collection[i];
        }
    }
    var fake = {
        isLand: false
    };
    return fake;
};
var smoothGroundIsland = function (cell) {

    var isIsland = function (x, y) {
        var cellleft = findCellByCoords(x - 1, y, lands);
        var celltop = findCellByCoords(x, y - 1, lands);
        var celldown = findCellByCoords(x, y + 1, lands);
        var cellright = findCellByCoords(x + 1, y, lands);
        if ((cellleft.isGround === true) ||
            (celltop.isGround === true) ||
            (celldown.isGround === true) ||
            (cellright.isGround === true)) {
            return false;
        } else {
            return true;
        }
    }

    //remove small islands
    if (isIsland(cell.x, cell.y)) {
        cell.isGround = false;
        waters.push(cell);
        lands.splice(lands.indexOf(cell), 1);
        cell.element.empty();
    }
};
var smoothGroundLake = function (cell) {

    var isLake = function (x, y) {
        var cellleft = findCellByCoords(x - 1, y, lands);
        var celltop = findCellByCoords(x, y - 1, lands);
        var celldown = findCellByCoords(x, y + 1, lands);
        var cellright = findCellByCoords(x + 1, y, lands);
        if ((cellleft.isGround === true) &&
            (celltop.isGround === true) &&
            (celldown.isGround === true) &&
            (cellright.isGround === true)) {
            return true;
        } else {
            return false;
        }
    }

    //remove small islands
    if (isLake(cell.x, cell.y)) {
        cell.isGround = true;
        /*waters.push(cell);
        lands.splice(lands.indexOf(cell), 1);*/
        lands.push(cell);
        waters.splice(waters.indexOf(cell), 1);
        cell.element.append("<div class='groundCell'></div>");
    }
};
var smoothCorners = function (cell) {

    var makeItCorner = function (type, cell) {
        //cell.element.removeClass('groundCell');
        cell.element.empty();
        cell.element.append("<div class='groundCellCorner" + type + " partGroundCell'></div>");
        var newcCell = cell;
        newcCell.type = 'Corner';
        newcCell.numType = type;
        lands[lands.indexOf(cell)] = newcCell;
        //cell.element.addClass('groundCellCorner' + type);
    };

    if (findCellByCoords(cell.x, cell.y - 1, lands).isGround &&
        findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
        !findCellByCoords(cell.x - 1, cell.y, lands).isGround &&
        !findCellByCoords(cell.x, cell.y + 1, lands).isGround) {
        makeItCorner(2, cell);
    } else if (findCellByCoords(cell.x, cell.y - 1, lands).isGround &&
        findCellByCoords(cell.x - 1, cell.y, lands).isGround &&
        !findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
        !findCellByCoords(cell.x, cell.y + 1, lands).isGround) {
        makeItCorner(1, cell);
    } else if (findCellByCoords(cell.x, cell.y + 1, lands).isGround &&
        findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
        !findCellByCoords(cell.x - 1, cell.y, lands).isGround &&
        !findCellByCoords(cell.x, cell.y - 1, lands).isGround) {
        makeItCorner(3, cell);
    } else if (findCellByCoords(cell.x, cell.y + 1, lands).isGround &&
        findCellByCoords(cell.x - 1, cell.y, lands).isGround &&
        !findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
        !findCellByCoords(cell.x, cell.y - 1, lands).isGround) {
        makeItCorner(0, cell);
    }
};
var smoothSingles = function (cell) {
    var makeItSingle = function (type, cell) {
        cell.element.empty();
        cell.element.append("<div class='groundCellSingle" + type + " partGroundCell'></div>");
        var newcCell = cell;
        newcCell.type = 'Single';
        newcCell.numType = type;
        lands[lands.indexOf(cell)] = newcCell;
    }
    if (cell.type === null && cell.type === null) {
        if (!findCellByCoords(cell.x, cell.y - 1, lands).isGround &&
            !findCellByCoords(cell.x - 1, cell.y, lands).isGround &&
            !findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
            findCellByCoords(cell.x, cell.y + 1, lands).isGround) {
            makeItSingle(1, cell);
        } else if (!findCellByCoords(cell.x, cell.y + 1, lands).isGround &&
            !findCellByCoords(cell.x - 1, cell.y, lands).isGround &&
            !findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
            findCellByCoords(cell.x, cell.y - 1, lands).isGround) {
            makeItSingle(3, cell);
        } else if (!findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
            !findCellByCoords(cell.x, cell.y + 1, lands).isGround &&
            !findCellByCoords(cell.x, cell.y - 1, lands).isGround &&
            findCellByCoords(cell.x - 1, cell.y, lands).isGround) {
            makeItSingle(0, cell);
        } else if (!findCellByCoords(cell.x - 1, cell.y, lands).isGround &&
            !findCellByCoords(cell.x, cell.y + 1, lands).isGround &&
            !findCellByCoords(cell.x, cell.y - 1, lands).isGround &&
            findCellByCoords(cell.x + 1, cell.y, lands).isGround) {
            makeItSingle(2, cell);
        }
    }
}
var smoothSurrounded = function (cell) {
    var makeItSurrounded = function (type, cell) {
        cell.element.empty();
        cell.element.append("<div class='groundCellSurrounded" + type + " partGroundCell'></div>");
        var newcCell = cell;
        newcCell.type = 'Surrounded';
        newcCell.numType = type;
        lands[lands.indexOf(cell)] = newcCell;
    }
    if (cell.type === null && cell.type === null) {
        if (findCellByCoords(cell.x, cell.y - 1, lands).isGround &&
            findCellByCoords(cell.x - 1, cell.y, lands).isGround &&
            findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
            !findCellByCoords(cell.x, cell.y + 1, lands).isGround) {
            makeItSurrounded(1, cell);
        } else if (findCellByCoords(cell.x, cell.y + 1, lands).isGround &&
            findCellByCoords(cell.x - 1, cell.y, lands).isGround &&
            findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
            !findCellByCoords(cell.x, cell.y - 1, lands).isGround) {
            makeItSurrounded(3, cell);
        } else if (findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
            findCellByCoords(cell.x, cell.y + 1, lands).isGround &&
            findCellByCoords(cell.x, cell.y - 1, lands).isGround &&
            !findCellByCoords(cell.x - 1, cell.y, lands).isGround) {
            makeItSurrounded(0, cell);
        } else if (findCellByCoords(cell.x - 1, cell.y, lands).isGround &&
            findCellByCoords(cell.x, cell.y + 1, lands).isGround &&
            findCellByCoords(cell.x, cell.y - 1, lands).isGround &&
            !findCellByCoords(cell.x + 1, cell.y, lands).isGround) {
            makeItSurrounded(2, cell);
        }
    }
};
var smoothBridges = function (cell) {
    var makeItBridge = function (type, cell) {

        cell.element.empty();
        cell.element.append("<div class='groundCellBridge" + type + " partGroundCell'></div>");
        var newcCell = cell;
        newcCell.type = 'Bridge';
        newcCell.numType = type;
        lands[lands.indexOf(cell)] = newcCell;
    };
    if (cell.type === null && cell.type === null) {
        if (!findCellByCoords(cell.x, cell.y - 1, lands).isGround &&
            !findCellByCoords(cell.x, cell.y + 1, lands).isGround &&
            findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
            findCellByCoords(cell.x - 1, cell.y, lands).isGround) {
            makeItBridge(0, cell);
        } else if (findCellByCoords(cell.x, cell.y - 1, lands).isGround &&
            findCellByCoords(cell.x, cell.y + 1, lands).isGround &&
            !findCellByCoords(cell.x + 1, cell.y, lands).isGround &&
            !findCellByCoords(cell.x - 1, cell.y, lands).isGround) {
            makeItBridge(1, cell);
        }
    }
};
var makeLonelyIsland = function (cell) {
    var makeItLonelyIsland = function (cell) {
        cell.element.empty();
        cell.element.append("<div class='groundCellIsland partGroundCell'></div>");
        var newcCell = cell;
        newcCell.type = 'Island';
        newcCell.numType = null;
        lands[lands.indexOf(cell)] = newcCell;
    };

    var isIsland = function (x, y) {
        var cellleft = findCellByCoords(x - 1, y, lands);
        var celltop = findCellByCoords(x, y - 1, lands);
        var celldown = findCellByCoords(x, y + 1, lands);
        var cellright = findCellByCoords(x + 1, y, lands);
        if ((cellleft.isGround === true) ||
            (celltop.isGround === true) ||
            (celldown.isGround === true) ||
            (cellright.isGround === true)) {
            return false;
        } else {
            return true;
        }
    }
    if (isIsland(cell.x, cell.y)) {
        makeItLonelyIsland(cell);
    }
};
var makeForests = function (cell) {
    var makeItForest = function (cell, type) {
        //cell.element.empty();
        cell.element.append("<div class='forestCell" + type + " forestCell'></div>");
        var newcCell = cell;
        newcCell.decor = 'forest';
        newcCell.decorType = type;
        newcCell.numType = null;
        lands[lands.indexOf(cell)] = newcCell;
    }
    var r = Math.random();
    if (r < forestProportion && cell.type != 'Single') {

        r = Math.random();
        if (r < 0.25) {
            makeItForest(cell, 0);
        } else if (r < 0.5) {
            makeItForest(cell, 1);
        } else if (r < 0.75) {
            makeItForest(cell, 2);
        } else {
            makeItForest(cell, 3);
        }
    }

};
var removeFrame = function () {
    $('#row0').remove();
    $('#row' + (mapHeight - 1)).remove();
    for (var i = 1; i < mapHeight; i++) {
        $('#cell' + (mapWidth - 1) + "x" + i).remove();
        $('#cell' + 0 + "x" + i).remove();
    }
    var lands2 = [];
    for (var i = 0; i < lands.length; i++) {
        if (lands[i].x != 0 ||
            lands[i].y != 0 ||
            lands[i].x != mapWidth - 1 ||
            lands[i].y != mapHeight - 1) {
            lands2.push(lands[i]);
        }
    }
    lands = lands2;
    var waters2 = [];
    for (var i = 0; i < waters.length; i++) {
        if (waters[i].x != 0 ||
            waters[i].y != 0 ||
            waters[i].x != mapWidth - 1 ||
            waters[i].y != mapHeight - 1) {
            waters2.push(waters[i]);
        }
    }
    waters = waters2;
};

/**
 * Created by hattila on 2016.04.21..
 */

Hw.Srvc.Game = Hw.Srvc.Game || (function(){

    var _gridSize = 3;

    var _spacesCount = Math.pow(_gridSize,2);
    var _elementsCount = _spacesCount-1;

    var _holeCoords = [0, 0];

    var _elementTemp = '<div id="{id}" class="element" data-coords="[{i},{j}]"><div class="inner"><span>{content}</span></div></div>';

    var _elementMap = [];

    // var _lastMovedElementInScramble = null;
    var _lastMovedElementInScramble = {
        id : 'asdasdasd',
        coords : [1,2]
    };

    var init = function ()
    {
        _createField();

        _addClickHandlers();


        // for(var i = 0; i < 10; i++){
        //     scramble();
        // }

        // var tc = 0;
        // var t = setInterval(function(){
        //     scramble();
        //     tc++;
        //
        //     if(tc == 100){
        //         clearInterval(t);
        //     }
        //
        // },100);

    };

    var _createField = function ()
    {
        var $cont = $('#puzzle-container');

        var counter = 1;

        for(var i = 0; i < _gridSize; i++){
            for(var j = 0; j < _gridSize; j++){
                var ele = _elementTemp;
                ele = ele.replace('{i}',i.toString());
                ele = ele.replace('{j}',j.toString());


                if(counter <= _elementsCount){
                    ele = ele.replace('{id}','e' + counter.toString());
                    // ele = ele.replace('{content}',counter.toString());
                    ele = ele.replace('{content}','['+i+','+j+']');
                    counter++;
                }else{ // The Hole
                    ele = ele.replace('{id}','hole');
                    ele = ele.replace('{content}','');
                    _holeCoords = [i, j];
                }

                $cont.append(ele);
                _placeElement(ele);
                _setElementSizes(ele, [i,j]);
            }
        }
    };

    var _setElementSizes = function(ele, coords)
    {
        var id = $(ele).attr('id');

        $('#'+id).css({
            "width" : (100 / _gridSize) + '%',
            "height" : (100 / _gridSize) + '%',
            "background-position" : (coords[1] * 100/(_gridSize-1)) + '% ' + (coords[0] * 100/(_gridSize-1)) + '% '
        });

        _elementMap.push({
            id : id,
            coords : coords
        });
    };

    var _placeElement = function (ele)
    {
        var coords = $(ele).data('coords');
        var css = {
            "top": 0,
            "left": 0
        };

        if(coords[0] != 0){
            css.top = coords[0] * (100/_gridSize) + '%';
        }

        if(coords[1] != 0){
            css.left = coords[1] * (100/_gridSize) + '%';
        }

        $('#'+$(ele).attr('id')).css(css);

        // console.log(css);
    };

    var _addClickHandlers = function ()
    {
        $('div#puzzle-container').on('click', 'div.element', function(){
            var coords = $(this).data('coords');

            if(_isMovable(coords)){
                _switchElementWithTheHole($(this));
            } else {

            }

        });
    };

    var _isMovable = function (coords)
    {
        // console.log(coords + ' <--> ' + _holeCoords);

        if(coords[0] == _holeCoords[0] && (coords[1] + 1 == _holeCoords[1] || coords[1] - 1 == _holeCoords[1])){
            return true;
        }

        if(coords[1] == _holeCoords[1] && (coords[0] + 1 == _holeCoords[0] || coords[0] - 1 == _holeCoords[0])){
            return true;
        }

        return false;
    };

    var _switchElementWithTheHole = function (ele) {
        var coords = $(ele).data('coords');
        var tmp = _holeCoords;

        _holeCoords = coords;
        $('#hole').data('coords', _holeCoords);

        coords = tmp;
        $('#'+$(ele).attr('id')).data('coords', coords);

        _placeElement($('#'+$(ele).attr('id')));
        _placeElement($('#hole'));

        if(_refreshElementMapElementById($(ele).attr('id'), coords)){
            // console.log('refresh completed');
        }else{
            // console.log('refresh failed');
        }

    };

    var scramble = function() {
        // switch with hole
        // repeat N times

        var x = _holeCoords[0];
        var y = _holeCoords[1];

        // var minX = (x > 1) ? x-1 : 0;
        // var maxX = (x < _gridSize-1) ? x+1 : _gridSize-1;
        // var rndX = Math.floor(Math.random() * (maxX) ) + minX;
        // console.log(rndX);

        /**
         * find elements adjecent to the hole RND
         */
        var adjacentCoords = [];

        console.log(_lastMovedElementInScramble);

        if(x > 0){
            // adjacentCoords.push([x-1,y]); // up

            _pushCoordsIfItsNotTheLastScrambled(adjacentCoords, [x-1,y]);
        }
        if(y > 0){
            // adjacentCoords.push([x,y-1]); // left

            _pushCoordsIfItsNotTheLastScrambled(adjacentCoords, [x,y-1]);
        }
        if(y < _gridSize-1) {
            // adjacentCoords.push([x, y + 1]); // right

            _pushCoordsIfItsNotTheLastScrambled(adjacentCoords, [x,y+1]);
        }
        if(x < _gridSize-1){
            // adjacentCoords.push([x+1,y]); // bottom

            _pushCoordsIfItsNotTheLastScrambled(adjacentCoords, [x+1,y]);
        }

        var idx = Math.floor(Math.random() * adjacentCoords.length);

        console.log(adjacentCoords, adjacentCoords[idx]);

        // var winner = $('#puzzle-container div.element[data-coords="['+ adjacentCoords[idx][0]+ ','+adjacentCoords[idx][1]+']"]');

        var id = _getElementIdFromMapByCoords(adjacentCoords[idx]);
        // console.log(id);
        var winner = $('#' + id );

        _lastMovedElementInScramble.id = id;
        _lastMovedElementInScramble.coords = adjacentCoords[idx];

        // console.log(winner.children('div').children('span').text());

        _switchElementWithTheHole(winner);
    };

    var _pushCoordsIfItsNotTheLastScrambled = function(pushTo, pushThis) {

        // console.log(_lastMovedElementInScramble);

        if( _lastMovedElementInScramble !== null &&
            pushThis[0] == _lastMovedElementInScramble.coords[0] &&
            pushThis[1] == _lastMovedElementInScramble.coords[1]){

        }else{
            pushTo.push(pushThis);
        }
    };

    var _getElementIdFromMapByCoords = function(coords) {
        for(var i = 0; i < _elementMap.length; i++){

            // console.log(_elementMap[i].coords[0] + ' - ' + _elementMap[i].coords[1]);

            if(_elementMap[i].coords[0] == coords[0] && _elementMap[i].coords[1] == coords[1]){
                return _elementMap[i].id;
            }
        }
        return false;
    };

    var _refreshElementMapElementById = function(id, coords) {

        // console.log('refreshing id: ' + id + ', with coords: ' + coords);

        for(var i = 0; i < _elementMap.length; i++){
            if(_elementMap[i].id == id){
                _elementMap[i].coords = coords;
                return true;
            }
        }
        return false;
    };

    var getElementMap = function() {
        console.log(_elementMap);
    };
    var getLastMoved = function() {
        console.log(_lastMovedElementInScramble);
    };

    return {
        init: init,
        scramble: scramble,
        getElementMap: getElementMap,
        getLastMoved: getLastMoved
    }
})();
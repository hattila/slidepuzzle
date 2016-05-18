/**
 * Created by hattila on 2016.04.21..
 */

Hw.Srvc.Game = Hw.Srvc.Game || (function(){

    var _gridSize = 3;

    var _spacesCount = Math.pow(_gridSize,2);
    var _tilesCount = _spacesCount-1;

    var _holeCoords = [0, 0];

    var _tileTemp = '<div id="{id}" class="tile" data-coords="[{i},{j}]"><div class="inner"><span>{content}</span></div></div>';

    var _tileMap = [];

    // var _lastMovedTileInScramble = null;
    var _lastMovedTileInScramble = {
        id : 'asdasdasd',
        coords : [1,2]
    };

    var init = function ()
    {
        _createField();

        _addClickHandlersToTiles();


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

        $('#scramble').click(function(){
            scramble();
        });

    };

    /**
     * place every tile on it's initial location
     *
     * @private
     */
    var _createField = function ()
    {
        var $cont = $('#puzzle-container');

        var counter = 1;

        for(var i = 0; i < _gridSize; i++){
            for(var j = 0; j < _gridSize; j++){
                var ele = _tileTemp;
                ele = ele.replace('{i}',i.toString());
                ele = ele.replace('{j}',j.toString());


                if(counter <= _tilesCount){
                    ele = ele.replace('{id}','t' + counter.toString());
                    ele = ele.replace('{content}',counter.toString());
                    // ele = ele.replace('{content}','['+i+','+j+']');
                    counter++;
                }else{ // The Hole
                    ele = ele.replace('{id}','hole');
                    ele = ele.replace('{content}','');
                    _holeCoords = [i, j];
                }

                $cont.append(ele);
                _placeTile(ele);
                _setTileSizes(ele, [i,j]);
            }
        }
    };

    var _setTileSizes = function(ele, coords)
    {
        var id = $(ele).attr('id');

        $('#'+id).css({
            "width" : (100 / _gridSize) + '%',
            "height" : (100 / _gridSize) + '%',
            "background-position" : (coords[1] * 100/(_gridSize-1)) + '% ' + (coords[0] * 100/(_gridSize-1)) + '% '
        });

        _tileMap.push({
            id : id,
            coords : coords
        });
    };

    var _placeTile = function (ele)
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

    var _addClickHandlersToTiles = function ()
    {
        $('div#puzzle-container').on('click', 'div.tile', function(){
            var coords = $(this).data('coords');

            if(_isMovable(coords)){
                _switchTileWithTheHole($(this));
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

    var _switchTileWithTheHole = function (ele) {
        var coords = $(ele).data('coords');
        var tmp = _holeCoords;

        _holeCoords = coords;
        $('#hole').data('coords', _holeCoords);

        coords = tmp;
        $('#'+$(ele).attr('id')).data('coords', coords);

        _placeTile($('#'+$(ele).attr('id')));
        _placeTile($('#hole'));

        if(_refreshTileMapElementById($(ele).attr('id'), coords)){
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
         * find tiles adjecent to the hole RND
         */
        var adjacentCoords = [];

        console.log(_lastMovedTileInScramble);

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

        var id = _getTileIdFromMapByCoords(adjacentCoords[idx]);
        // console.log(id);
        var winner = $('#' + id );

        _lastMovedTileInScramble.id = id;
        _lastMovedTileInScramble.coords = adjacentCoords[idx];

        // console.log(winner.children('div').children('span').text());

        _switchTileWithTheHole(winner);
    };

    var _pushCoordsIfItsNotTheLastScrambled = function(pushTo, pushThis) {

        // console.log(_lastMovedTileInScramble);

        if( _lastMovedTileInScramble !== null &&
            pushThis[0] == _lastMovedTileInScramble.coords[0] &&
            pushThis[1] == _lastMovedTileInScramble.coords[1]){

        }else{
            pushTo.push(pushThis);
        }
    };

    var _getTileIdFromMapByCoords = function(coords) {
        for(var i = 0; i < _tileMap.length; i++){

            // console.log(_tileMap[i].coords[0] + ' - ' + _tileMap[i].coords[1]);

            if(_tileMap[i].coords[0] == coords[0] && _tileMap[i].coords[1] == coords[1]){
                return _tileMap[i].id;
            }
        }
        return false;
    };

    var _refreshTileMapElementById = function(id, coords) {

        // console.log('refreshing id: ' + id + ', with coords: ' + coords);

        for(var i = 0; i < _tileMap.length; i++){
            if(_tileMap[i].id == id){
                _tileMap[i].coords = coords;
                return true;
            }
        }
        return false;
    };

    var getTileMap = function() {
        console.log(_tileMap);
    };
    var getLastMoved = function() {
        console.log(_lastMovedTileInScramble);
    };

    return {
        init: init,
        scramble: scramble,
        getTileMap: getTileMap,
        getLastMoved: getLastMoved
    }
})();
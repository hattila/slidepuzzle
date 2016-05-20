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
    var _sampleTileMap = [];


    var _SCRAMBLE_COUNT = 100;
    var _SCRAMBLE_INTERVAL = 25; // speed of movement in ms, lower is faster

    var _lastHoleCoordsInScramble = null;

    var init = function ()
    {
        _createField();

        _addClickHandlersToTiles();

        $('#scramble').click(function(){
            scramble();
        });

        $.subscribe('/tile/moves', function(e, ele){
            if(_checkIfTileIsInTheCorrectPlace(ele) && _checkIfPuzzleIsComplete()){
                console.log('WIN');
            }
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
                    // ele = ele.replace('{content}', counter.toString() + '. ['+i+','+j+']');
                    counter++;
                }else{ // The Hole
                    ele = ele.replace('{id}','hole');
                    ele = ele.replace('{content}','');
                    _holeCoords = [i, j];
                }

                $cont.append(ele);
                _setTilePosition(ele);
                _setTileSizes(ele, [i,j]);
            }
        }

        /**
         * There is no Clone?
         *
         * http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object
         */
        // _sampleTileMap = _tileMap;
        _sampleTileMap = JSON.parse(JSON.stringify(_tileMap));
    };

    /**
     * Preset a Tile:
     * - set the background position
     * - set size.
     *
     * @param ele div.tile
     * @param coords array of coords
     * @private
     */
    var _setTileSizes = function(ele, coords)
    {
        var id = $(ele).attr('id');

        $('#'+id).css({
            "width" : (100 / _gridSize) + '%',
            "height" : (100 / _gridSize) + '%',
            "background-position" : (coords[1] * 100/(_gridSize-1)) + '% ' + (coords[0] * 100/(_gridSize-1)) + '% ',
            "font-size" : (1 + (10 / _gridSize))+'em'
        });

        _tileMap.push({
            id : id,
            coords : coords
        });
    };

    /**
     * Set the position of a Tile
     * Used to move the Tiles (css transition of position)
     *
     * @param ele div.tile
     * @private
     */
    var _setTilePosition = function (ele)
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

    var _switchTileWithTheHole = function (ele, movedByScrambling) {
        var movedByScrambling = movedByScrambling != undefined ? movedByScrambling : false;

        var coords = $(ele).data('coords');
        var tmp = _holeCoords;

        _holeCoords = coords;
        $('#hole').data('coords', _holeCoords);

        coords = tmp;
        $('#'+$(ele).attr('id')).data('coords', coords);

        _setTilePosition($('#'+$(ele).attr('id')));
        _setTilePosition($('#hole'));

        if(_refreshTileMapElementById($(ele).attr('id'), coords)){
            // console.log('refresh completed');
        }else{
            // console.log('refresh failed');
        }

        if(!movedByScrambling){
            $.publish('/tile/moves', ele);
        }

        // _checkIfTileIsInTheCorrectPlace(ele);
    };


    /**
     * find tiles adjacent to the hole RND
     *
     * @returns {*|jQuery|HTMLElement}
     * @private
     */
    var _getRandomMovableTile = function() {
        var x = _holeCoords[0];
        var y = _holeCoords[1];

        var adjacentCoords = [];

        if(x > 0){
            _pushCoordsIfItsNotTheLastScrambled(adjacentCoords, [x-1,y]); // up
        }

        if(y > 0){
            _pushCoordsIfItsNotTheLastScrambled(adjacentCoords, [x,y-1]); // left
        }

        if(y < _gridSize-1) {
            _pushCoordsIfItsNotTheLastScrambled(adjacentCoords, [x,y+1]); // right
        }

        if(x < _gridSize-1){
            _pushCoordsIfItsNotTheLastScrambled(adjacentCoords, [x+1,y]); // bottom
        }

        var idx = Math.floor(Math.random() * adjacentCoords.length);

        var id = _getTileIdFromMapByCoords(adjacentCoords[idx]);
        var winner = $('#' + id );

        _lastHoleCoordsInScramble = _holeCoords;

        // console.log(winner.children('div').children('span').text());
        // _switchTileWithTheHole(winner);

        return winner;
    };

    var scramble = function () {
        $('.tile').css({'transition': 'left 0.1s, top 0.1s'});

        var tc = 0;
        var t = setInterval(function(){
            _switchTileWithTheHole(_getRandomMovableTile(), true); // true says it's moved by scrambling
            tc++;
            if(tc == _SCRAMBLE_COUNT){
                clearInterval(t);
                $('.tile').css({'transition': 'left 0.2s, top 0.2s'});
                Hw.Srvc.Counter.resetCounter();
            }
        },_SCRAMBLE_INTERVAL);

    };

    /**
     * Check a possible sramble coords array whether it was the last position of the hole or not.
     * We should not include the last position in the possible tiles to prevent to seesaw effect.
     *
     * @param pushTo array of coords arrays
     * @param pushThis array of coords
     * @private
     */
    var _pushCoordsIfItsNotTheLastScrambled = function(pushTo, pushThis) {
        if( _lastHoleCoordsInScramble !== null &&
            pushThis[0] == _lastHoleCoordsInScramble[0] &&
            pushThis[1] == _lastHoleCoordsInScramble[1]){
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
        console.log(_tileMap, _sampleTileMap);
    };
    var getLastMoved = function() {
        console.log(_lastHoleCoordsInScramble);
    };


    /**
     * Win conditions
     * - every tile in the correct place?
     *
     * A, tile map is exactly the same as in the beginning.
     *  - check after every move? player move.
     *  - Don't check when scrambling
     *  - We can check the whole field only when the current tile is in the correct place!
     *
     * B, Calculate the completed image by the coords and placement of the tiles?
     *  - dafuq
     */

    /**
     * Compare the given Tiles coords to the one stored in the sample
     */
    var _checkIfTileIsInTheCorrectPlace = function (ele) {


        var id = $(ele).attr('id');
        var coords = $(ele).data('coords');

        // console.log('id: '+id+' ['+coords[0]+','+coords[1]+']');

        /**
         * Break, and continue in vanilla JS forEach?
         */
        // _sampleTileMap.forEach(function (e) {
        //
        //     if(e.id != id){
        //         return;
        //     }
        //
        //     if(e.coords[0] == coords[0] && e.coords[1] == coords[1]){}
        // });

        for(var i = 0; i < _sampleTileMap.length; i++){
            if(_sampleTileMap[i].id != id){
                continue;
            }

            // console.log('id: '+_sampleTileMap[i].id+' ['+_sampleTileMap[i].coords[0]+','+_sampleTileMap[i].coords[0]+']');

            if(_sampleTileMap[i].coords[0] == coords[0] && _sampleTileMap[i].coords[1] == coords[1]){
                return true;
            }
        }

        return false;
    };

    /**
     * Compare the _tileMap against the _sampleTileMap
     * - if they are exactly the same, it's a win
     */
    var _checkIfPuzzleIsComplete = function () {

        if(_sampleTileMap.length != _tileMap.length){
            throw new Error('sample and tile map is not the same length');
        }

        for(var i = 0; i < _sampleTileMap.length; i++){
            if( _sampleTileMap[i].id == _tileMap[i].id &&
                _sampleTileMap[i].coords[0] == _tileMap[i].coords[0] &&
                _sampleTileMap[i].coords[1] == _tileMap[i].coords[1]
            ){
                // it's all right
            }else{

                // console.log('First difference here: '+_sampleTileMap[i].id+' - '+_tileMap[i].id);
                // console.log('Sample : '+_sampleTileMap[i].coords[0]+' '+_sampleTileMap[i].coords[1]);
                // console.log('Tile : '+_tileMap[i].coords[0]+' '+_tileMap[i].coords[1]);

                return false;
            }

        }

        return true;
    };

    var _winAnimation = function () {
        
    };


    return {
        init: init,
        scramble: scramble,
        getTileMap: getTileMap,
        getLastMoved: getLastMoved
    }
})();
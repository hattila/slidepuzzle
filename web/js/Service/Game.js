/**
 * Created by hattila on 2016.04.21..
 */

Hw.Srvc.Game = Hw.Srvc.Game || (function(){

    var _gridSize = 3;

    var _spacesCount = Math.pow(_gridSize,2);
    var _elementsCount = _spacesCount-1;

    var _holeCoords = [0, 0];

    var _elementTemp = '<div id="{id}" class="element" data-coords="[{i},{j}]">{content}</div>';

    var init = function ()
    {
        _createField();

        _addClickHandlers();
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
                ele = ele.replace('{content}',counter.toString());

                if(counter <= _elementsCount){
                    ele = ele.replace('{id}','e' + counter.toString());
                    counter++;
                }else{ // The Hole
                    ele = ele.replace('{id}','hole');
                    _holeCoords = [i, j];
                }

                $cont.append(ele);
                _placeElement(ele);

            }
        }
    };

    var _placeElement = function (ele)
    {
        var coords = $(ele).data('coords');
        var css = {
            "top": 0,
            "left": 0
        };

        // if(coords[0] != 0){
            css.top = coords[0] * (100/_gridSize) + '%';
        // }

        // if(coords[1] != 0){
            css.left = coords[1] * (100/_gridSize) + '%';
        // }

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
        console.log(coords + ' <--> ' + _holeCoords);

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

    };

    return {
        init: init
    }
})();
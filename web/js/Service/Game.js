/**
 * Created by hattila on 2016.04.21..
 */

Hw.Srvc.Game = Hw.Srvc.Game || (function(){

    var _gridSize = 3;

    var _spacesCount = Math.pow(_gridSize,2);
    var _elementsCount = _spacesCount-1;

    var _elementTemp = '<div id="e{id}" class="element" data-coords="[{i},{j}]"></div>'

    var init = function ()
    {
        _createField();
    };

    var _createField = function ()
    {
        var $cont = $('#puzzle-container');

        var counter = 1;

        for(var i = 0; i < _gridSize; i++){
            for(var j = 0; j < _gridSize; j++){

                var ele = _elementTemp;
                ele = ele.replace('{id}',counter.toString());
                ele = ele.replace('{i}',i.toString());
                ele = ele.replace('{j}',j.toString());

                $cont.append(ele);

                _placeElement(ele);

                counter++;
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

        if(coords[0] != 0){
            css.top = coords[0] * (100/_gridSize) + '%';
        }

        if(coords[1] != 0){
            css.left = coords[1] * (100/_gridSize) + '%';
        }

        $('#'+$(ele).attr('id')).css(css);

        console.log(css);
    };

    var isMovable = function ()
    {

    };

    return {
        init: init
    }
})();
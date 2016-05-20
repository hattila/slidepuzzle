/**
 * Created by hattila on 2016.05.18..
 */

Hw.Srvc.Counter = Hw.Srvc.Counter || (function(){

    var _counter = 0;

    var init = function () {
        $.subscribe('/tile/moves', function(){
            _incMoves();
        });

        $.subscribe('/counter/changes', function(){
            _refreshCounter();
        });
    };

    var _incMoves = function () {
        _setCounter(_counter+1);
    };

    var _setCounter = function (counter) {
        _counter = counter;
        $.publish('/counter/changes');
    };

    var getCounter = function () {
        return _counter;
    };

    var _refreshCounter = function () {
        $('#moves-counter').html(_counter);
    };
        
    var resetCounter = function () {
        _setCounter(0); 
    };

    return {
        init: init,
        getCounter: getCounter,
        resetCounter: resetCounter
        
    }
})();
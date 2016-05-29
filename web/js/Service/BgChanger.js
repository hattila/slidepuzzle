/**
 * Created by hattila on 2016.05.19..
 */

Hw.Srvc.BgChanger = Hw.Srvc.BgChanger || (function(){

    var _bg = 0;
    var _bgs = [
        {
            name: 'Mountains',
            src: 'image/mountains_1600.jpg',
            thmbSrc: 'image/thmb/mountains_400.jpg'
        },{
            name: 'F0rest',
            src: 'image/forest_1600.png',
            thmbSrc: 'image/thmb/forest_400.png'
        },{
            name: 'Forest Patrol',
            src: 'image/forest-patrol-flat-1600.png',
            thmbSrc: 'image/thmb/forest-patrol-flat-400.png'
        },{
            name: 'DooM',
            src: 'image/doom_logo_1600.jpg',
            thmbSrc: 'image/thmb/doom_logo_400.jpg'
        }
    ];

    var _$cnt = $('#available-bgs');

    var _bgSelectionTemp = '<div class="bg float-left" data-src="{src}"><img src="{thmb_src}" alt="{name}"></div>';

    var init = function () {
        _showBgSelection();
        _addClickHandlers();
    };

    var _showBgSelection = function () {
        _$cnt.html(''); // destroy previous content

        _bgs.forEach(function (e, idx, arr) {
            var ct = _bgSelectionTemp;

            ct = ct.replace('{src}', e.src).replace('{thmb_src}', e.thmbSrc).replace('{name}', e.name);
            _$cnt.append(ct);
        });
    };
    
    var _addClickHandlers = function () {
        $.each(_$cnt.children('div.bg'),function(){
            $(this).click(function(){
                _changeTilesBackground($(this).data('src'));
            });
        });
    };

    var _changeTilesBackground = function (bg) {
        $('div.tile').css({"background-image": "url('"+bg+"')"});
        $('div.puzzle-outer div.bg').css({"background-image": "url('"+bg+"')"});
    };

    return {
        init: init
    }
})();
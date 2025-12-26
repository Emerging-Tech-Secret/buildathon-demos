RodapeCaixa = (function () {
    'use strict'
    const rodapeCaixa = {};

    rodapeCaixa.iniciar = function () {
        jQuery("#rodape").removeClass('oculto');
    };

    return rodapeCaixa;
})();
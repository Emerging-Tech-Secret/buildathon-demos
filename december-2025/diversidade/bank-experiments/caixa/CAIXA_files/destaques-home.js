DestaquesHome = (function () {
    'use strict'
    const destaquesHome = {};

    destaquesHome.iniciar = function () {
        registrarEventos();
        jQuery("#destaquesHome").removeClass('oculto');
    };

    const registrarEventos = function () {
        jQuery('.card-destaque').click(function (e) {
            window.location.href = jQuery(jQuery(e).get(0).currentTarget).attr('data-link');
        });
    };

    return destaquesHome;
})();
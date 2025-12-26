AcessoRapido = (function () {
    'use strict'
    const acessoRapido = {};

    acessoRapido.iniciar = function () {
        registrarEventos();
        jQuery(".color-acesso-rapido").removeClass('oculto');
    };

    const registrarEventos = function () {
        jQuery('.btn-acesso').click(function (e) {
            window.location.href = jQuery(this).find('a').prop('href');
        });       
    };

    return acessoRapido;
})();
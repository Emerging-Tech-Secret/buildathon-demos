SolucoesConglomerado = (function () {
    'use strict';
    const solucoesConglomerado = {};
    let resizeTimeout;

    solucoesConglomerado.iniciar = function () {
        montarSlides();
        registrarEventos();
    };

    const montarSlides = function () {
        jQuery('.carrossel-conglomerado').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            dots: true,
            arrows: true,
            centerMode: false,
            responsive: [
                {
                    breakpoint: 1160,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        centerPadding: '40px',
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        centerPadding: '80px',
                        slidesToShow: 1
                    }
                }
            ]
        });
        ajustarAlturaDosCards();
        jQuery(window).on('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                ajustarAlturaDosCards();
            }, 200);
        });
        jQuery(".solucoes-conglomerado").removeClass('oculto');
    };

    const ajustarAlturaDosCards = function () {
        let maxHeight = 0;

        jQuery('.item-solucao .card-body').each(function () {
            jQuery(this).css('height', 'auto');
            let cardHeight = jQuery(this).outerHeight();
            if (cardHeight > maxHeight) {
                maxHeight = cardHeight;
            }
        });

        jQuery('.item-solucao .card-body').each(function () {
            jQuery(this).height(maxHeight);
        });
    };

    const registrarEventos = function () { };

    return solucoesConglomerado;
})();
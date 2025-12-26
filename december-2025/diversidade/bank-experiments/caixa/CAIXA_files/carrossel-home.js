CarrosselHome = (function () {
    'use strict'
    const carrosselHome = {};
    let swiperDesktop;
    let swiperMobile;

    carrosselHome.iniciar = function () {
        montarSlides();
        registrarEventos();
    };

    const montarSlides = function () {
        swiperDesktop = new Swiper(".swiperDesktop", {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,
            autoplay: false,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
                renderBullet: function (index, className) {
                    var total = this.slides.length;
                    return '<button type="button" class="' + className + '" aria-label="' + (index + 1) + ' de ' + total + '"></button>';
                }
            },
            navigation: {
                prevEl: ".swiper-button-prev",
                nextEl: ".swiper-button-next",
            },
            a11y: {
                prevSlideMessage: 'Item anterior',
                nextSlideMessage: 'Próximo item'
            }
        });

        swiperMobile = new Swiper(".swiperMobile", {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,
            autoplay: false,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
                renderBullet: function (index, className) {
                    var total = this.slides.length;
                    return '<button type="button" class="' + className + '" aria-label="' + (index + 1) + ' de ' + total + '"></button>';
                }
            },
            navigation: {
                prevEl: ".swiper-button-prev",
                nextEl: ".swiper-button-next",
            },
            a11y: {
                prevSlideMessage: 'Item anterior',
                nextSlideMessage: 'Próximo item'
            }
        });

        if (swiperDesktop.slides.length > 1 || swiperMobile.slides.length > 1) {
            jQuery('.passadores-internos').css('display', 'flex');

            if (window.innerWidth >= 1160) {
                setTimeout(function () {
                    swiperDesktop.params.autoplay.delay = 10000;
                    swiperDesktop.autoplay.start();
                }, 500);                
            }
        }

        jQuery('.carrossel-home').removeClass('oculto');
    };

    const registrarEventos = function () {
        jQuery("#btnPlayPause").click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (swiperDesktop.autoplay.running) {
                swiperDesktop.autoplay.stop();
                jQuery('.icon-play-pause').removeClass('fa-circle-pause');
                jQuery('.icon-play-pause').addClass('fa-circle-play');
                jQuery('#btnPlayPause').attr('aria-label', 'Retomar carrossel');
            }
            else {
                swiperDesktop.autoplay.start();
                jQuery('.icon-play-pause').removeClass('fa-circle-play');
                jQuery('.icon-play-pause').addClass('fa-circle-pause');
                jQuery('#btnPlayPause').attr('aria-label', 'Pausar carrossel');
            }
        });
    };

    return carrosselHome;
})();
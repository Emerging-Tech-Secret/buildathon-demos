Cabecalho = (function () {
    'use strict'
    const cabecalho = {};

    cabecalho.iniciar = function () {
        var emEdicao = document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value;
        if (emEdicao === '1') {
            console.log("em Edicao");
            jQuery("#main-nav-novo").addClass("edicao");
            jQuery("#s4-workspace").prepend(jQuery("#main-nav-novo"));
        }

        jQuery(".header-hover").hover(function (e) {
            var headerLista = jQuery('#headerLista').children();
            var lastPopoverFixed = false;

            headerLista.children().each(function (index) {
                var classPopover = jQuery(headerLista.get(index)).attr('class');
                if (typeof classPopover === 'string') {
                    if (classPopover.includes('hover-popover')) {
                        jQuery(headerLista.get(index)).removeClass("hover-popover");
                        jQuery(headerLista.get(index)).find("button").attr('aria-expanded', false);
                        lastPopoverFixed = headerLista.get(index);
                    }
                }
            });

            cabecalho.lastPopoverFixed = lastPopoverFixed;

            if (jQuery(jQuery(jQuery(e.currentTarget).children()).get(1)).length > 0) {
                var leftPosition = jQuery(jQuery(jQuery(jQuery(e.currentTarget).children()).get(0)).find('i')).position().left;
                const id = jQuery(e.currentTarget).attr('id');

                if (jQuery(e.currentTarget).attr('id').includes('headerMenuHamburguer')) {
                    leftPosition = leftPosition - 9;
                } else {
                    leftPosition = leftPosition - 5;
                }

                document.getElementById(id).style.setProperty('--leftBeforePopover', leftPosition.toString() + 'px');
                jQuery("#" + id).find("button").attr('aria-expanded', true);
            }
        }, function (e) {
            const id = jQuery(e.currentTarget).attr('id');

            if (typeof cabecalho.lastPopoverFixed === 'object') {
                jQuery(cabecalho.lastPopoverFixed).addClass("hover-popover");
            }

            if (jQuery("#" + id).find("div.popover-header").css("visibility") !== "visible") {
                jQuery("#" + id).find("button").attr('aria-expanded', false);
            }
        });

        jQuery(".header-hover").click(function (e) {
            var openPopover = (!(jQuery(e.currentTarget).attr("class").includes("hover-popover")));
            var headerLista = jQuery('#headerLista').children();

            headerLista.children().each(function (index) {
                var classPopover = jQuery(headerLista.get(index)).attr('class');
                const botao = jQuery(headerLista.get(index)).find("button").first();

                if (typeof classPopover === 'string') {
                    if (classPopover.includes('hover-popover')) {
                        jQuery(headerLista.get(index)).removeClass("hover-popover");
                    }
                }

                if (jQuery(headerLista.get(index)).find("div.popover-header").css("visibility") !== "visible" && botao.attr('aria-expanded') === "true") {
                    botao.attr('aria-expanded', false);
                }
            });

            if (openPopover) {
                const botao = jQuery(e.currentTarget).find("button").first();

                jQuery(e.currentTarget).addClass("hover-popover");

                if (botao.attr('aria-expanded') === "false") {
                    botao.attr('aria-expanded', true);
                }
            }
        });

        //jQuery("#headerMenuHamburguerMobile").click(function () {
        //    if (jQuery("#headerMenuHamburguerMobile .border-conteudo-lista").attr("class").includes("on-click-mobile")) {
        //        jQuery("#headerMenuHamburguerMobile .border-conteudo-lista").removeClass("on-click-mobile");
        //        jQuery('#sidebarMobile').hide();
        //    } else {
        //        jQuery("#headerMenuHamburguerMobile .border-conteudo-lista").addClass("on-click-mobile");
        //        jQuery('#sidebarMobile').show();
        //    }
        //});

        jQuery("#abrirMenuHamburguer").click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (jQuery("#headerMenuHamburguerMobile .border-conteudo-lista").attr("class").includes("on-click-mobile")) {
                ocultarMenuMobile();
            }
            else {
                jQuery("#headerMenuHamburguerMobile .border-conteudo-lista").addClass("on-click-mobile");
                jQuery(this).attr('aria-expanded', true);
                jQuery(this).attr('aria-label', 'Clique para ocultar o menu');
                jQuery('#sidebarMobile').show();
                jQuery('#sidebarMobile').focus();
            }
        });

        const ocultarMenuMobile = function () {
            jQuery("#headerMenuHamburguerMobile .border-conteudo-lista").removeClass("on-click-mobile");
            jQuery('#abrirMenuHamburguer').attr('aria-expanded', false);
            jQuery('#abrirMenuHamburguer').attr('aria-label', 'Clique para exibir o menu');
            jQuery('#sidebarMobile').hide();
        }

        jQuery(".abrir-sidebar").click(function (e) {
            jQuery('#sidebarMobileLista').hide();
            const divSidebar = jQuery('#' + jQuery(jQuery(e).get(0).currentTarget).attr('id-sidebar'));
            divSidebar.show();
            divSidebar.find("button.btn-fechar-sidebar").focus();
        });

        jQuery(".fechar-sidebar").click(function (e) {
            jQuery('.conteudo-link-sidebar').hide();
            jQuery('#sidebarMobileLista').show();
            const idDivPai = jQuery(this).parents("div").attr("id");
            const botao = jQuery("li[id-sidebar=" + idDivPai + "]").find(".btn-abrir-sidebar").first();

            botao.focus();
            botao.attr('aria-expanded', false);
        });

        jQuery("#pesquisaHeader").on('keypress', function (e) {
            if (e.which === 13) {
                window.location.href = "/site/Paginas/Pesquisa.aspx?k=" + jQuery("#pesquisaHeader").val();
            }

            if (jQuery("#pesquisaHeader").val().length < 3) {
                jQuery(".autocomplete-header").hide();
            }
        });

        jQuery("#buttonPesquisaHeader").click(function () {
            window.location.href = "/site/Paginas/Pesquisa.aspx?k=" + jQuery("#pesquisaHeader").val();
        });

        jQuery("#pesquisaHeaderMobile").on('keypress', function (e) {
            if (e.which === 13) {
                window.location.href = "/site/Paginas/Pesquisa.aspx?k=" + jQuery("#pesquisaHeader").val();
            }

            if (jQuery("#pesquisaHeaderMobile").val().length < 3) {
                jQuery(".autocomplete-header").hide();
            }
        });

        jQuery("#buttonPesquisaHeaderMobile").click(function () {
            window.location.href = "/site/Paginas/Pesquisa.aspx?k=" + jQuery("#pesquisaHeaderMobile").val();
        });

        jQuery('#main-nav-novo').css('width', ((jQuery(window).width()) - ((Number(jQuery('#main-nav-novo').css('padding-left').replace('px', ''))) + (Number(jQuery('#main-nav-novo').css('padding-right').replace('px', ''))))).toString() + 'px');
        jQuery('.popover-header').css('width', ((jQuery(window).width()) - ((Number(jQuery('#main-nav-novo').css('padding-left').replace('px', ''))) + (Number(jQuery('#main-nav-novo').css('padding-right').replace('px', ''))))).toString() + 'px');
        jQuery('#footer.rodape-azul').css('margin-left', '-' + jQuery('#footer').css('padding-left'));
        jQuery('#footer .rodape-azul').css('margin-right', '-' + jQuery('#footer').css('padding-right'));
        jQuery('#footer .hotlinks').css('margin-left', '-' + jQuery('#footer').css('padding-left'));
        jQuery('#footer .hotlinks').css('margin-right', '-' + jQuery('#footer').css('padding-right'));

        jQuery(window).resize(function () {
            var width = jQuery(window).width();

            if (jQuery(window).width() > 1159) {
                //jQuery("#headerMenuHamburguerMobile .border-conteudo-lista").removeClass("on-click-mobile");
                //jQuery('#sidebarMobile').hide();
                ocultarMenuMobile();
            }

            jQuery('#main-nav-novo').css('width', ((jQuery(window).width()) - ((Number(jQuery('#main-nav-novo').css('padding-left').replace('px', ''))) + (Number(jQuery('#main-nav-novo').css('padding-right').replace('px', ''))))).toString() + 'px');
            jQuery('.popover-header').css('width', ((jQuery(window).width()) - ((Number(jQuery('#main-nav-novo').css('padding-left').replace('px', ''))) + (Number(jQuery('#main-nav-novo').css('padding-right').replace('px', ''))))).toString() + 'px');

            if ((width >= 1160) && (width < 1440)) {
                jQuery('.margem-lateral-home').css('padding-left', ((width - 1160) * 0.5));
                jQuery('.margem-lateral-home').css('padding-right', ((width - 1160) * 0.5));
            } else if (width >= 1440) {
                jQuery('.margem-lateral-home').css('padding-left', 140);
                jQuery('.margem-lateral-home').css('padding-right', 140);
            } else if (width < 1160) {
                jQuery('.margem-lateral-home').css('padding-left', 37);
                jQuery('.margem-lateral-home').css('padding-right', 37);
            }

            jQuery('#main-nav-novo').css('width', ((jQuery(window).width()) - ((Number(jQuery('#main-nav-novo').css('padding-left').replace('px', ''))) + (Number(jQuery('#main-nav-novo').css('padding-right').replace('px', ''))))).toString() + 'px');
            jQuery('.popover-header').css('width', ((jQuery(window).width()) - ((Number(jQuery('#main-nav-novo').css('padding-left').replace('px', ''))) + (Number(jQuery('#main-nav-novo').css('padding-right').replace('px', ''))))).toString() + 'px');
            jQuery('#footer.rodape-azul').css('margin-left', '-' + jQuery('#footer').css('padding-left'));
            jQuery('#footer .rodape-azul').css('margin-right', '-' + jQuery('#footer').css('padding-right'));
            jQuery('#footer .hotlinks').css('margin-left', '-' + jQuery('#footer').css('padding-left'));
            jQuery('#footer .hotlinks').css('margin-right', '-' + jQuery('#footer').css('padding-right'));
        });

        jQuery(document).click(function (event) {
            if (jQuery(event.target).parents().index(jQuery('.hover-popover')) == -1) {
                var headerLista = jQuery('#headerLista').children();
                headerLista.children().each(function (index) {
                    var classPopover = jQuery(headerLista.get(index)).attr('class');
                    if (typeof classPopover === 'string') {
                        if (classPopover.includes('hover-popover')) {
                            jQuery(headerLista.get(index)).removeClass("hover-popover");
                            jQuery(headerLista.get(index)).find("button").attr('aria-expanded', false);
                        }
                    }
                });
            }

            //if (jQuery(event.target).attr('id') == 'main-nav') {
            //    jQuery("#headerMenuHamburguerMobile .border-conteudo-lista").removeClass("on-click-mobile");
            //    jQuery('#sidebarMobile').hide();
            //} else if ((jQuery(event.target).parents().index(jQuery('.header-menu-hamburguer-mobile')) == -1) && (jQuery(event.target).parents().index(jQuery('.sidebar-mobile')) == -1) && (jQuery(event.target).parents().index(jQuery('.autocomplete-header')) == -1)) {
            //    jQuery("#headerMenuHamburguerMobile .border-conteudo-lista").removeClass("on-click-mobile");
            //    jQuery('#sidebarMobile').hide();
            //}

            if (jQuery(event.target).attr('id') == 'main-nav' || ((jQuery(event.target).parents().index(jQuery('.header-menu-hamburguer-mobile')) == -1) && (jQuery(event.target).parents().index(jQuery('.sidebar-mobile')) == -1))) {
                ocultarMenuMobile();
            }

            if (jQuery(event.target).parents().index(jQuery('.autocomplete-header')) == -1) {
                jQuery(".autocomplete-header").hide();
            }
        });
    };

    return cabecalho;
})();
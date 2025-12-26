BuscaCaixa = (function () {
    'use strict'
    const buscaCaixa = {};
    let mobileBoolean = 0;

    buscaCaixa.iniciar = function () {
        //codigo para verificar mobile
        const navegador = navigator.userAgent || navigator.vendor || window.opera;

        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(navegador) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navegador.substr(0, 4))) {
            mobileBoolean = 1
        }

        registrarEventos();
    };

    buscaCaixa.verTodosResultados = function () {
        if (jQuery("#pesquisaHeader").val() === '') {
            window.location.href = "/site/Paginas/pesquisa.aspx?k=" + jQuery("#pesquisaHeaderMobile").val();
        } else {
            window.location.href = "/site/Paginas/pesquisa.aspx?k=" + jQuery("#pesquisaHeader").val();
        }
    }

    const registrarEventos = function () {
        var autocompletador = jQuery("#pesquisaHeader").autocomplete({
            source: function (request, callback) {
                jQuery.ajax({
                    url: "/_api/search/query?querytext='" + encodeURIComponent(request.term) + "'&rowlimit=5&selectproperties='Title,Description,Path,HitHighlightedSummary'&QueryTemplatePropertiesUrl='spfile://webroot/queryparametertemplate.xml'&sourceid='40f080a5-da63-4dce-b33a-fdad0dc83d1c'",
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },
                    success: function (data) {
                        let arrayResultados = [];
                        let saida = "[";
                        let results = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                        let bestBetsResults = new Array();

                        for (var i = 0; i < data.d.query.SecondaryQueryResults.results.length; i++) {
                            if (data.d.query.SecondaryQueryResults.results[i].QueryId == "BestBet Query") {
                                bestBetsResults = data.d.query.SecondaryQueryResults.results[i].SpecialTermResults.Results.results;
                            }
                        }

                        for (var i = 0; i < bestBetsResults.length; i++) {
                            var bestBetsResult = bestBetsResults[i];

                            //se nao for celular e o valor para descricao nao estiver vazio, 
                            if (mobileBoolean == 0) {
                                saida += '{"label":"<strong>' + bestBetsResult.Title + '</strong><br />' + bestBetsResult.Description;
                            } else {
                                saida += '{"label":"<strong>' + bestBetsResult.Title + '</strong>';
                            }
                            saida += '","value":"' + bestBetsResult.Url + '"},';
                        }

                        for (var i = 0; i < results.length - bestBetsResults.length; i++) {
                            //se nao for celular e o valor para descricao nao estiver vazio, 
                            if (mobileBoolean == 0) {
                                //regra: se a keyword estiver no titulo ou na descricao, mostrar titulo e descricao, se nao, mostrar titulo e resumo da busca
                                //se a descricao estiver vazia e o titulo for igual a palavra chave, mostrar titulo e descricao mesmo que nula
                                if ((results[i].Cells.results[3].Value == null) && (results[i].Cells.results[2].Value.indexOf(request.term) != -1)) {
                                    saida += '{"label":"<strong>' + results[i].Cells.results[2].Value + '</strong><br />';
                                    //preciso checar se a descricao esta nula antes de ver se ela contem a keyword
                                } else if (results[i].Cells.results[3].Value != null) {
                                    //se a keyword estiver no titulo ou na descricao, mostrar titulo e descricao
                                    if ((results[i].Cells.results[2].Value.indexOf(request.term) != -1) || (results[i].Cells.results[3].Value.toLowerCase().indexOf(request.term.toLowerCase()) != -1)) {
                                        saida += '{"label":"<strong>' + results[i].Cells.results[2].Value + '</strong><br />' + results[i].Cells.results[3].Value;
                                        //se finalmente nao estiver em nenhum dos dois, mostrar resumo da busca
                                    } else {
                                        saida += '{"label":"<strong>' + results[i].Cells.results[2].Value + '</strong><br />' + ((results[i].Cells.results[5].Value == null) ? "" : JSON.stringify(results[i].Cells.results[5].Value).replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f").replace(/\"/g, ""));
                                    }
                                    //se nem o titulo nem a descricao tiverem a keyword, mostrar o resumo da busca
                                } else if (results[i].Cells.results[3].Value == null) {
                                    saida += '{"label":"<strong>' + results[i].Cells.results[2].Value + '</strong><br />' + ((results[i].Cells.results[5].Value == null) ? "" : JSON.stringify(results[i].Cells.results[5].Value).replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f").replace(/\"/g, ""));
                                }
                            } else {
                                saida += '{"label":"<strong>' + results[i].Cells.results[2].Value + '</strong>';
                            }
                            saida += '","value":"' + results[i].Cells.results[4].Value + '"},';
                        }

                        if (saida !== "[") {
                            saida = saida.substring(0, saida.length - 1) + "]";
                            saida = saida.replace(/\t/g, '').replace(/(\r\n|\n|\r)/gm, "");
                            arrayResultados = jQuery.parseJSON(saida);
                        }
                        else {
                            arrayResultados = [];
                        }

                        let quantidadeResultados = results.length + 1;
                        let alturaSugestoes = (quantidadeResultados * 83) + 83;

                        if (alturaSugestoes > 500) {
                            alturaSugestoes = 500
                        }

                        callback(arrayResultados);
                    }
                });
            },
            minLength: 3,
            select: function (event, ui) {
                if (event.keyCode == 13) {
                    buscaCaixa.verTodosResultados();
                } else {
                    window.location.href = ui.item.value;
                }
                return false;
            },
            focus: function (event, ui) {
                return false;
            },
            search: function (event, ui) {
                jQuery("#pesquisaHeader").attr("style", 'background: url("/Style%20Library/images/icon-ajax-loader.gif") no-repeat scroll right 35px center transparent;');
            },
            response: function (event, ui) {
                jQuery("#autocompleteHeader li").remove();
                jQuery("#pesquisaHeader").attr("style", '')
            },
            close: function (event, ui) {
                jQuery("#autocompleteHeader li").remove();
                jQuery("#pesquisaHeader").attr("style", '');
                jQuery(".ver-todos").remove();
                jQuery("#autocompleteHeader").hide();
            },
            appendTo: jQuery("#headerLista .search-box"),
            position: {
                my: "left top+30",
                at: "left top+30",
                of: "input#pesquisaHeader"
            },
            open: function (event, ui) {
                if (jQuery(".ver-todos").length == 0) {
                    jQuery("#autocompleteHeader").append('<li class="ver-todos" onclick="BuscaCaixa.verTodosResultados();"><strong>Ver todos os resultados &rsaquo;</strong></li>');
                }
            }
        });

        autocompletador.data("uiAutocomplete")._renderItem = function (ul, item) {
            return jQuery("<li />").data("item.autocomplete", item).append(item.label.replace('</strong>', '</strong> <p class="hide open-link-header">' + item.value.replace("http:", "https:").replace(".br//", ".br/") + '</p>')).appendTo(jQuery("#autocompleteHeader"));
        }

        autocompletador.data("uiAutocomplete")._resizeMenu = function () {
            jQuery("#autocompleteHeader").show();

            setTimeout(() => {
                jQuery("#autocompleteHeader li strong").click(function (e) {
                    window.location.href = jQuery(jQuery(e.target).parent().find('.open-link-header')).text().trim();
                    jQuery("#autocompleteHeader").hide();
                });
            }, 1500);

        }

        var autocompletadorMobile = jQuery("#pesquisaHeaderMobile").autocomplete({
            source: function (request, callback) {
                jQuery.ajax({
                    url: "/_api/search/query?querytext='" + encodeURIComponent(request.term) + "'&rowlimit=5&selectproperties='Title,Description,Path,HitHighlightedSummary'&QueryTemplatePropertiesUrl='spfile://webroot/queryparametertemplate.xml'&sourceid='40f080a5-da63-4dce-b33a-fdad0dc83d1c'",
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },
                    success: function (data) {
                        let arrayResultados = [];
                        let saida = "[";
                        let results = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                        let bestBetsResults = new Array();

                        for (var i = 0; i < data.d.query.SecondaryQueryResults.results.length; i++) {
                            if (data.d.query.SecondaryQueryResults.results[i].QueryId == "BestBet Query") {
                                bestBetsResults = data.d.query.SecondaryQueryResults.results[i].SpecialTermResults.Results.results;
                            }
                        }

                        for (var i = 0; i < bestBetsResults.length; i++) {
                            var bestBetsResult = bestBetsResults[i];

                            //se nao for celular e o valor para descricao nao estiver vazio, 
                            if (mobileBoolean == 0) {
                                saida += '{"label":"<strong>' + bestBetsResult.Title + '</strong><br />' + bestBetsResult.Description;
                            } else {
                                saida += '{"label":"<strong>' + bestBetsResult.Title + '</strong>';
                            }
                            saida += '","value":"' + bestBetsResult.Url + '"},';
                        }

                        for (var i = 0; i < results.length - bestBetsResults.length; i++) {
                            //se nao for celular e o valor para descricao nao estiver vazio, 
                            if (mobileBoolean == 0) {
                                //regra: se a keyword estiver no titulo ou na descricao, mostrar titulo e descricao, se nao, mostrar titulo e resumo da busca
                                //se a descricao estiver vazia e o titulo for igual a palavra chave, mostrar titulo e descricao mesmo que nula
                                if ((results[i].Cells.results[3].Value == null) && (results[i].Cells.results[2].Value.indexOf(request.term) != -1)) {
                                    saida += '{"label":"<strong>' + results[i].Cells.results[2].Value + '</strong><br />';
                                    //preciso checar se a descricao esta nula antes de ver se ela contem a keyword
                                } else if (results[i].Cells.results[3].Value != null) {
                                    //se a keyword estiver no titulo ou na descricao, mostrar titulo e descricao
                                    if ((results[i].Cells.results[2].Value.indexOf(request.term) != -1) || (results[i].Cells.results[3].Value.toLowerCase().indexOf(request.term.toLowerCase()) != -1)) {
                                        saida += '{"label":"<strong>' + results[i].Cells.results[2].Value + '</strong><br />' + results[i].Cells.results[3].Value;
                                        //se finalmente nao estiver em nenhum dos dois, mostrar resumo da busca
                                    } else {
                                        saida += '{"label":"<strong>' + results[i].Cells.results[2].Value + '</strong><br />' + ((results[i].Cells.results[5].Value == null) ? "" : JSON.stringify(results[i].Cells.results[5].Value).replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f").replace(/\"/g, ""));
                                    }
                                    //se nem o titulo nem a descricao tiverem a keyword, mostrar o resumo da busca
                                } else if (results[i].Cells.results[3].Value == null) {
                                    saida += '{"label":"<strong>' + results[i].Cells.results[2].Value + '</strong><br />' + ((results[i].Cells.results[5].Value == null) ? "" : JSON.stringify(results[i].Cells.results[5].Value).replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f").replace(/\"/g, ""));
                                }
                            } else {
                                saida += '{"label":"<strong>' + results[i].Cells.results[2].Value + '</strong>';
                            }
                            saida += '","value":"' + results[i].Cells.results[4].Value + '"},';
                        }

                        if (saida !== "[") {
                            saida = saida.substring(0, saida.length - 1) + "]";
                            saida = saida.replace(/\t/g, '').replace(/(\r\n|\n|\r)/gm, "");
                            arrayResultados = jQuery.parseJSON(saida);
                        }
                        else {
                            arrayResultados = [];
                        }

                        let quantidadeResultados = results.length + 1;
                        let alturaSugestoes = (quantidadeResultados * 83) + 83;

                        if (alturaSugestoes > 500) {
                            alturaSugestoes = 500
                        }

                        callback(arrayResultados);
                    }
                });
            },
            minLength: 3,
            select: function (event, ui) {
                if (event.keyCode == 13) {
                    buscaCaixa.verTodosResultados();
                } else {
                    window.location.href = ui.item.value;
                }
                return false;
            },
            focus: function (event, ui) {
                return false;
            },
            search: function (event, ui) {
                jQuery("#pesquisaHeaderMobile").attr("style", 'background: url("/Style%20Library/images/icon-ajax-loader.gif") no-repeat scroll right 35px center transparent;');
            },
            response: function (event, ui) {
                jQuery("#autocompleteHeaderMobile li").remove();
                jQuery("#pesquisaHeaderMobile").attr("style", '')
            },
            close: function (event, ui) {
                jQuery("#pesquisaHeaderMobile").attr("style", '');
                jQuery(".ver-todos").remove();
                jQuery("#autocompleteHeaderMobile li").remove();
                jQuery("#autocompleteHeaderMobile").hide();
            },
            appendTo: jQuery("#sidebarMobile .search-box"),
            position: {
                my: "left top+30",
                at: "left top+30",
                of: "input#pesquisaHeaderMobile"
            },
            open: function (event, ui) {
                if (jQuery(".ver-todos").length == 0) {
                    jQuery("#autocompleteHeaderMobile").append('<li class="ver-todos" onclick="BuscaCaixa.verTodosResultados();"><strong>Ver todos os resultados &rsaquo;</strong></li>');
                }
            }
        });

        autocompletadorMobile.data("uiAutocomplete")._renderItem = function (ul, item) {
            return jQuery("<li />").data("item.autocomplete", item).append(item.label.replace('</strong>', '</strong> <p class="hide open-link-header">' + item.value.replace("http:", "https:").replace(".br//", ".br/") + '</p>')).appendTo(jQuery("#autocompleteHeaderMobile"));
        }

        autocompletadorMobile.data("uiAutocomplete")._resizeMenu = function () {
            jQuery("#autocompleteHeaderMobile").show();

            setTimeout(() => {
                jQuery("#autocompleteHeaderMobile li strong").click(function (e) {
                    window.location.href = jQuery(jQuery(e.target).parent().find('.open-link-header')).text().trim();
                    jQuery("#autocompleteHeaderMobile").hide();
                });
            }, 1500);
        }
    }

    return buscaCaixa;
})();
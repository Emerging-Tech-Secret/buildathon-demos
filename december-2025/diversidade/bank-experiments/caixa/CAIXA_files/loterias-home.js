LoteriasHome = (function () {
    'use strict'
    const loteriasHome = {};

    loteriasHome.iniciar = function () {
        const modalidade = jQuery("#dropDownModalidades").val();
        const titulo = jQuery("#dropDownModalidades option:selected").text();
        loteriasHome.Loterias = JSON.parse(jQuery("input[id$='hdnLoterias']").val());
        registrarEventos();
        obterResultado(false, modalidade, titulo);

        jQuery("#loteriasHome").removeClass('oculto');
    };

    const exibirResultadoDiaDeSorte = function (loteria, resultado) {
        const classeModalidade = "diadesorte";
        let divDiaDeSorte = jQuery("<div id='selectDiaDeSorte' class='product product-selected'></div>");
        montarSecaoNomeModalidade(classeModalidade, resultado.DataProximoConcurso, divDiaDeSorte, true, loteria.Titulo, resultado.ValorEstimativaFormatado);
        montarSecaoResultado(classeModalidade, true, true, divDiaDeSorte, loteria, resultado);

        jQuery("#jogoSelecionadoHome").append(divDiaDeSorte);
    }

    const exibirResultadoDuplaSena = function (loteria, resultado) {
        const classeModalidade = "duplasena";
        let divDuplaSena = jQuery("<div id='selectDuplaSena' class='product product-selected'></div>");

        montarSecaoNomeModalidade(classeModalidade, resultado.DataProximoConcurso, divDuplaSena, true, loteria.Titulo, resultado.ValorEstimativaFormatado);
        montarSecaoResultado(classeModalidade, true, true, divDuplaSena, loteria, resultado);

        jQuery("#jogoSelecionadoHome").append(divDuplaSena);
    }

    const exibirResultadoFederal = function (loteria, resultado) {
        const classeModalidade = "federal";
        let divFederal = jQuery("<div id='selectFederal' class='product federal product-selected'></div>");

        montarSecaoNomeModalidade(classeModalidade, resultado.DataProximoConcurso, divFederal, false, loteria.Titulo, resultado.ValorEstimativaFormatado);
        montarSecaoResultado(classeModalidade, false, false, divFederal, loteria, resultado);

        jQuery("#jogoSelecionadoHome").append(divFederal);
    }

    const exibirResultadoLoteca = function (loteria, resultado) {
        const classeModalidade = "loteca";
        let divLoteca = jQuery("<div id='selectLoteca' class='product product-selected'></div>");

        montarSecaoNomeModalidade(classeModalidade, resultado.DataProximoConcurso, divLoteca, true, loteria.Titulo, resultado.ValorEstimativaFormatado);
        montarSecaoResultado(classeModalidade, true, true, divLoteca, loteria, resultado);

        jQuery("#jogoSelecionadoHome").append(divLoteca);
    }

    const exibirResultadoLotofacil = function (loteria, resultado) {
        const classeModalidade = "lotofacil";
        let divLotofacil = jQuery("<div id='selectLotofacil' class='product product-selected'></div>");

        montarSecaoNomeModalidade(classeModalidade, resultado.DataProximoConcurso, divLotofacil, true, loteria.Titulo, resultado.ValorEstimativaFormatado);
        montarSecaoResultado(classeModalidade, true, true, divLotofacil, loteria, resultado);

        jQuery("#jogoSelecionadoHome").append(divLotofacil);
    }

    const exibirResultadoLotomania = function (loteria, resultado) {
        const classeModalidade = "lotomania";
        let divLotomania = jQuery("<div id='selectLotomania' class='product product-selected'></div>");

        montarSecaoNomeModalidade(classeModalidade, resultado.DataProximoConcurso, divLotomania, true, loteria.Titulo, resultado.ValorEstimativaFormatado);
        montarSecaoResultado(classeModalidade, true, true, divLotomania, loteria, resultado);

        jQuery("#jogoSelecionadoHome").append(divLotomania);
    }

    const exibirResultadoMaisMilionaria = function (loteria, resultado) {
        const classeModalidade = "maismilionaria";
        let divMaisMilionaria = jQuery("<div id='selectMaisMilionaria' class='product product-selected'></div>");

        montarSecaoNomeModalidade(classeModalidade, resultado.DataProximoConcurso, divMaisMilionaria, true, loteria.Titulo, resultado.ValorEstimativaFormatado);
        montarSecaoResultado(classeModalidade, true, true, divMaisMilionaria, loteria, resultado);

        jQuery("#jogoSelecionadoHome").append(divMaisMilionaria);
    }

    const exibirResultadoMegaSena = function (loteria, resultado) {
        const classeModalidade = "megasena";        
        let divMegaSena = jQuery("<div id='selectMegaSena' class='product product-selected'></div>");

        montarSecaoNomeModalidade(classeModalidade, resultado.DataProximoConcurso, divMegaSena, true, loteria.Titulo, resultado.ValorEstimativaFormatado);
        montarSecaoResultado(classeModalidade, true, true, divMegaSena, loteria, resultado);

        jQuery("#jogoSelecionadoHome").append(divMegaSena);
    }

    const exibirResultadoQuina = function (loteria, resultado) {
        const classeModalidade = "quina";
        let divQuina = jQuery("<div id='selectQuina' class='product product-selected'></div>");

        montarSecaoNomeModalidade(classeModalidade, resultado.DataProximoConcurso, divQuina, true, loteria.Titulo, resultado.ValorEstimativaFormatado);
        montarSecaoResultado(classeModalidade, true, true, divQuina, loteria, resultado);

        jQuery("#jogoSelecionadoHome").append(divQuina);
    }

    const exibirResultadoSuperSete = function (loteria, resultado) {
        const classeModalidade = "supersete";
        let divSuperSete = jQuery("<div id='selectSuperSete' class='product product-selected'></div>");

        montarSecaoNomeModalidade(classeModalidade, resultado.DataProximoConcurso, divSuperSete, true, loteria.Titulo, resultado.ValorEstimativaFormatado);
        montarSecaoResultado(classeModalidade, true, true, divSuperSete, loteria, resultado);

        jQuery("#jogoSelecionadoHome").append(divSuperSete);
    }

    const exibirResultadoTimemania = function (loteria, resultado) {
        const classeModalidade = "timemania";
        let divTimemania = jQuery("<div id='selectTimemania' class='product product-selected'></div>");

        montarSecaoNomeModalidade(classeModalidade, resultado.DataProximoConcurso, divTimemania, true, loteria.Titulo, resultado.ValorEstimativaFormatado);
        montarSecaoResultado(classeModalidade, true, true, divTimemania, loteria, resultado);

        jQuery("#jogoSelecionadoHome").append(divTimemania);
    }

    const exibirResultado = function (modalidade, resultado) {        
        const loteria = loteriasHome.Loterias.filter(function (l) { return l.Modalidade === modalidade })[0];

        switch (modalidade) {
            case 'DIA_DE_SORTE':
                exibirResultadoDiaDeSorte(loteria, resultado);
                break;
            case 'DUPLA_SENA':
                exibirResultadoDuplaSena(loteria, resultado);
                break;
            case 'LOTERIA_FEDERAL':
                exibirResultadoFederal(loteria, resultado);
                break;
            case 'LOTECA':
                exibirResultadoLoteca(loteria, resultado);
                break;
            case 'LOTOFACIL':
                exibirResultadoLotofacil(loteria, resultado);
                break;
            case 'LOTOMANIA':
                exibirResultadoLotomania(loteria, resultado);
                break;
            case 'MAIS_MILIONARIA':
                exibirResultadoMaisMilionaria(loteria, resultado);
                break;
            case 'MEGA_SENA':
                exibirResultadoMegaSena(loteria, resultado);
                break;
            case 'QUINA':
                exibirResultadoQuina(loteria, resultado);
                break;
            case 'SUPER_SETE':
                exibirResultadoSuperSete(loteria, resultado);
                break;
            case 'TIMEMANIA':
                exibirResultadoTimemania(loteria, resultado);
                break;
        }
    }

    const montarTabelaResultadoFederal = function (resultado, elementoPai) {
        let tabelaFederal = jQuery("<table class='simple-table resultado-table three-column-table'></table>");
        let corpoTabela = jQuery("<tbody></tbody>");

        jQuery(resultado.Premios).each(function () {
            corpoTabela.append("<tr><td>" + this.Posicao + "º</td><td>" + this.Bilhete + "</td><td>" + this.ValorPremioFormatado + "</td></tr>");
        });

        tabelaFederal.append("<thead><tr><th>Destino</th><th>Bilhete</th><th>Valor do Prêmio (R$)</th></tr></thead>");
        tabelaFederal.append(corpoTabela);
        elementoPai.append("<p class='titulo-azul'>Prêmios Principais</p>");
        elementoPai.append("<p class='description'>Sorteio Realizado em " + resultado.LocalSorteio + "</p>");
        elementoPai.append(tabelaFederal);
    }

    const montarTabelaResultadoLoteca = function (resultado, elementoPai) {
        let tabelaLoteca = jQuery("<table class='table-d loteca loteca-mobile'></table>");

        jQuery(resultado.ListaResultadoEquipeEsportiva).each(function () {
            let corpoTabela = jQuery("<tbody></tbody>");
            let linhaCabecalho = jQuery("<tr class='titulo-jogo-loteca'></tr>");
            let linhaResultado = jQuery("<tr class='placar-jogo-loteca'></tr>");

            if (this.IcSorteioResultado === 1) {
                linhaCabecalho.append("<th>Jogo " + this.NuSequencial + " - <span style='background-color: #5AA2EB;'>Sorteio</span></th>");
            }
            else {
                linhaCabecalho.append("<th>Jogo " + this.NuSequencial + " - <span style='text-transform: capitalize;'>" + this.DiaSemana + "</span></th>");
            }

            if (this.NuGolEquipeUm > this.NuGolEquipeDois) {
                linhaResultado.append("<td class='selected'>" + this.NuGolEquipeUm + "</td>");
            }
            else {
                linhaResultado.append("<td>" + this.NuGolEquipeUm + "</td>");
            }

            if (this.SiglaUFUm) {
                linhaResultado.append("<td>" + this.NomeEquipeUm + "/" + this.SiglaUFUm + "</td>");
            }
            else {
                linhaResultado.append("<td>" + this.NomeEquipeUm + "</td>");
            }

            if (this.NuGolEquipeUm === this.NuGolEquipeDois) {
                linhaResultado.append("<td class='selected'>&nbsp;</td>");
            }
            else {
                linhaResultado.append("<td>&nbsp;</td>");
            }

            if (this.SiglaUFDois) {
                linhaResultado.append("<td>" + this.NomeEquipeDois + "/" + this.SiglaUFDois + "</td>");
            }
            else {
                linhaResultado.append("<td>" + this.NomeEquipeDois + "</td>");
            }

            if (this.NuGolEquipeDois > this.NuGolEquipeUm) {
                linhaResultado.append("<td class='selected'>" + this.NuGolEquipeDois + "</td>");
            }
            else {
                linhaResultado.append("<td>" + this.NuGolEquipeDois + "</td>");
            }

            corpoTabela.append(linhaCabecalho);
            corpoTabela.append(linhaResultado);
            tabelaLoteca.append(corpoTabela);
        });

        elementoPai.append(tabelaLoteca);
    }

    const montarSecaoEstimativaDePremio = function (classeDispositivo, classeModalidade, dataProximoConcurso, elementoPai, valorEstimativa) {
        let divEstimativa = jQuery("<div class='informativo-valor-estimado valor-estimado-" + classeDispositivo + "'></div>");

        if (dataProximoConcurso.length) {
            divEstimativa.append("<p class='texto-valor-estimado'>Estimativa de prêmio do próximo concurso. Sorteio em " + dataProximoConcurso + ":</p>");
        }
        else {
            divEstimativa.append("<p class='texto-valor-estimado'>Estimativa de prêmio do próximo concurso:</p>");
        }

        divEstimativa.append("<p class='valor-estimado valor-estimado-" + classeModalidade + "'>" + valorEstimativa + "</p>");
        elementoPai.append(divEstimativa);
    }

    const montarSecaoNomeModalidade = function (classeModalidade, dataProximoConcurso, elementoPai, exibirEstimativa, titulo, valorEstimativa){
        let divNomeModalidade = jQuery("<div class='product-column'></div>");
        divNomeModalidade.append("<p class='" + classeModalidade + " nome-loteria'>" + titulo.toUpperCase() + "</p>");

        if (exibirEstimativa) {
            montarSecaoEstimativaDePremio("desktop", classeModalidade, dataProximoConcurso, divNomeModalidade, valorEstimativa);
        }

        elementoPai.append(divNomeModalidade);
    }

    const montarSecaoNumeros = function (classeModalidade, elementoPai, nomeModalidade, dezenas, sorteio) {
        let contador = 1;
        let listaDezenas = jQuery("<ul></ul>");

        if (nomeModalidade === 'SUPER_SETE') {
            elementoPai.append("<p class='zeta'>Colunas</p>");
        }

        if (nomeModalidade === 'DUPLA_SENA') {
            elementoPai.append("<p class='titulo-azul'>" + sorteio + "º sorteio</p>");
        }

        if (nomeModalidade === 'MAIS_MILIONARIA' || nomeModalidade === 'LOTOFACIL' || nomeModalidade === 'QUINA'
            || nomeModalidade === 'LOTOMANIA' || nomeModalidade === 'TIMEMANIA') {
            listaDezenas.addClass("simple-container lista-dezenas " + classeModalidade);
        }
        else if (nomeModalidade === 'MEGA_SENA' || nomeModalidade === 'DUPLA_SENA' || nomeModalidade === 'DIA_DE_SORTE'
            || nomeModalidade === 'SUPER_SETE') {
            listaDezenas.addClass("resultado-loteria " + classeModalidade);
        }

        jQuery(dezenas).each(function () {
            if (nomeModalidade === 'SUPER_SETE') {
                listaDezenas.append("<li><div class='coluna'>" + contador + "</div><div class='dezena'>" + this + "</div></li>");
            }
            else {
                listaDezenas.append("<li class='dezena'>" + this + "</li>");
            }

            contador++;
        });

        elementoPai.append(listaDezenas);
    }

    const montarSecaoResultado = function (classeModalidade, exibirEstimativa, exibirGanhadores, elementoPai, loteria, resultado) {
        let divResultado = jQuery("<div class='product-column'></div>");

        if (resultado.NomeModalidade === 'LOTERIA_FEDERAL') {
            montarTabelaResultadoFederal(resultado, divResultado);
        }
        else if (resultado.NomeModalidade === 'LOTECA') {
            montarTabelaResultadoLoteca(resultado, divResultado);
        }         
        else {
            montarSecaoNumeros(classeModalidade, divResultado, resultado.NomeModalidade, resultado.Dezenas, '1');
        }

        if (resultado.NomeModalidade === 'DUPLA_SENA') {
            montarSecaoNumeros(classeModalidade, divResultado, resultado.NomeModalidade, resultado.DezenasSegundoSorteio, '2');
        }

        if (resultado.NomeModalidade === 'MAIS_MILIONARIA') {
            let secaoTrevos = jQuery("<p class='description'>Trevos sorteados:</p>");
            secaoTrevos.append("<img class='trevosResultado' src='/Style%20Library/images/trevo-" + resultado.TrevosSorteados[0] + ".png' alt='Imagem de um trevo com o número sorteado dentro, trevo sorteado: " + resultado.TrevosSorteados[0] + "'>");
            secaoTrevos.append("<img class='trevosResultado' src='/Style%20Library/images/trevo-" + resultado.TrevosSorteados[1] + ".png' alt='Imagem de um trevo com o número sorteado dentro, trevo sorteado: " + resultado.TrevosSorteados[1] + "'>");
                
            divResultado.append(secaoTrevos);
        }

        if (exibirGanhadores) {
            let secaoGanhadores = jQuery("<p class='zeta'></p>");
            let textoGanhadores = '';

            if (resultado.Acumulado && !resultado.ConcursoEspecial) {
                textoGanhadores = "ACUMULOU!";
            }
            else if (resultado.Ganhadores === 1) {
                textoGanhadores = "1 GANHADOR!";
            }
            else if (resultado.Ganhadores > 1) {
                textoGanhadores = resultado.Ganhadores.toString() + " GANHADORES!";
            }

            secaoGanhadores.append("<a href='" + loteria.Link + "' target='_blank' title='" + loteria.DescricaoLink + "'>" + textoGanhadores + "</a>");
            divResultado.append(secaoGanhadores);
        }

        if (resultado.NomeModalidade === 'DIA_DE_SORTE') {
            divResultado.append("<p class='description'>Mês de Sorte: <span class='description'>" + resultado.MesDaSorte + "</span></p>");
        }

        if (resultado.NomeModalidade === 'TIMEMANIA') {
            divResultado.append("<p class='description'>Time do coração: <span class='description'>" + resultado.TimeDoCoracao.toUpperCase() + "</span></p>");
        }

        divResultado.append("<p class='description'>Concurso " + resultado.Numero + " - " + resultado.Data + "</p>");

        if (exibirEstimativa) {
            montarSecaoEstimativaDePremio("desktop", classeModalidade, resultado.DataProximoConcurso, divResultado, resultado.ValorEstimativaFormatado);
        }

        divResultado.append("<p class='see-more'><i class='fa fa-caret-right' aria-hidden='true'></i><a href='" + loteria.Link + "' target='_blank' title='" + loteria.DescricaoLink + "'>" + loteria.TextoLink + "</a>");
        elementoPai.append(divResultado);
    }

    const obterResultado = function (exibirLoading, modalidade, titulo) {
        jQuery.ajax({
            type: "GET",
            dataType: "JSON",
            url: jQuery("#hdnURLApi").val() + "/loterias/" + modalidade,
            headers: {
                "Accept": "application/json"
            },
            beforeSend: function () {
                if (exibirLoading) {
                    jQuery("#loading").show();
                }
            },
            success: function (resultado) {
                jQuery(".msg-erro").hide();
                exibirResultado(modalidade, resultado);
                jQuery("#loading").hide();
            },
            error: function (erro) {
                jQuery("#loading").hide();
                jQuery("#jogoSelecionadoHome").append("<div class='product product-selected'><div style='margin-left: 15px;'>Erro ao buscar o resultado da " +  titulo + "</div></div>");
            }
        });
    }

    const registrarEventos = function () {
        jQuery('#dropDownModalidades').off('change').on('change', function () {
            jQuery("div.product-selected").remove();

            if (jQuery(this).val()) {
                obterResultado(true, jQuery(this).val(), jQuery("option:selected", this).text());
            }
        });
    }

    return loteriasHome;
})();
"use strict";

// Verifica e define variáveis globais opcionais como null se não estiverem definidas
if (!isValidVariable(window.detail_ga4)) {
  window.detail_ga4 = null;
}

if (!isValidVariable(window.product_name)) {
  window.product_name = null;
}

if (!isValidVariable(window.product_category)) {
  window.product_category = null;
}

if (!isValidVariable(window.product_channel)) {
  window.product_channel = null;
}

if (!isValidVariable(window.status_ga4)) {
  window.status_ga4 = null;
}

if (!isValidVariable(window.disableScreenview)) {
  window.disableScreenview = false;
}

if (!isValidVariable(window.pageNameGA4)) {
  window.pageNameGA4 = "";
}

if (!isValidVariable(window.custom_path)) {
  window.custom_path = "";
}

if (!isValidVariable(window.origin)) {
  window.origin = "";
}

if (!isValidVariable(window.proposal_id)) {
  window.proposal_id = null;
}

window.analyticsType = isITaggerWebView() ? 'analyticswebview' : 'analytics';

function validateItauDigitalAnalytics() {
  if (typeof ItauDigitalAnalytics === 'undefined') {
    console.warn("iTagger - A dependência ItauDigitalAnalytics não foi encontrada. É necessário instalar e configurar a SDK da RTDA. O iTagger será ignorado.");
    // Retorna para interromper a execução do script
    return false;
  }
  return true;
}

// Valida se as variáveis globais obrigatórias foram preenchidas

function validateGlobalVariables() {
  let missingVariables = [];

  // Primeira condição: validar se product_group, moment, product estão preenchidos
  const productGroupFilled = isValidVariable(window.product_group);
  const momentFilled = isValidVariable(window.moment);
  const productFilled = isValidVariable(window.product);

  if (productGroupFilled || momentFilled || productFilled) {
    // Se qualquer uma das variáveis estiver preenchida, todas são obrigatórias
    const requiredVariables = {
      product_group: productGroupFilled ? window.product_group : null,
      moment: momentFilled ? window.moment : null,
      product: productFilled ? window.product : null
    };
    missingVariables = missingVariables.concat(
      Object.entries(requiredVariables)
        .filter(([key, value]) => value === null)
        .map(([key]) => key)
    );
  } else {
    // Segunda condição: valida apenas se o pageNameGA4 está preenchido
    if (!isValidVariable(window.pageNameGA4)) {
      missingVariables.push('pageNameGA4');
    }
  }

  // Validação das outras variáveis que são sempre obrigatórias
  const alwaysRequiredVariables = {
    implementation_team: isValidVariable(window.implementation_team) ? window.implementation_team : null
  };

  // Variáveis obrigatórias apenas quando analyticsType é 'analytics'
  const conditionalVariables = window.analyticsType === 'analytics' ? {
    business: isValidVariable(window.business) ? window.business : null,
    business_channel: isValidVariable(window.business_channel) ? window.business_channel : null,
    environment: isValidVariable(window.environment) ? window.environment : null
  } : {};

  // Combina todas as variáveis para validação
  const globalVariables = { ...alwaysRequiredVariables, ...conditionalVariables };

  missingVariables = missingVariables.concat(
    Object.entries(globalVariables)
      .filter(([key, value]) => value === null)
      .map(([key]) => key)
  );

  if (missingVariables.length > 0) {
    console.warn(`iTagger - As seguintes variáveis globais não estão preenchidas: ${missingVariables.join(', ')}. Isso pode causar problemas com os disparos.`);
  }
}
// Função para verificar e tratar variáveis globais
function processGlobalVariables() {
  const variables = [
    'product_channel',
    'detail_ga4',
    'product_name',
    'product_category',
    'status_ga4',
    'implementation_team',
    'proposal_id'
  ];

  variables.forEach(variable => {
    if (isValidVariable(window[variable])) {
      window[variable] = SkewerCase(window[variable], false);
    }
  });
}

// Set Default Parameters for all events
// Business, businness_channel and environment

function setDefaultParameters() {
  if (window.analyticsType == "analyticswebview") {
    return;
  }

  var defaultParametersGA4 = {};

  ItauDigitalAnalytics.removeAllDefaultParameters();

  try {
    defaultParametersGA4 = {
      [window.analyticsType]: {
        parameters: {
          business: window.business,
          business_channel: window.business_channel,
          environment: window.environment,
          product_channel: isValidVariable(window.product_channel) ? window.product_channel : undefined,
          proposal_id: isValidVariable(window.proposal_id)
          ? window.proposal_id
          : undefined,
        },
      },
    };

    ItauDigitalAnalytics.setDefaultParameters(defaultParametersGA4);
  } catch (error) {
    console.error("iTagger - Erro ao definir parâmetros padrões:", error);
  }
}

// Função para definir o valor de custom_path
function setCustomPath() {
  // Verifica se as variáveis obrigatórias estão definidas
  if (isValidVariable(window.product_group) &&
      isValidVariable(window.moment) &&
      isValidVariable(window.product)) {
      
    // Concatena as variáveis em skewer-case usando a função SkewerCase
    let path = `/${SkewerCase(window.product_group, false)}/${SkewerCase(window.moment, false)}/${SkewerCase(window.product, false)}`;
    
    // Adiciona screen_name se estiver definido
    if (isValidVariable(window.screen_name)) {
      path += `/${SkewerCase(window.screen_name, false)}`;
    }
    // Define custom_path com o valor concatenado
    window.custom_path = path;
  } else {
    // Define custom_path com pageNameGA4 se as condições não forem atendidas
    window.custom_path = window.pageNameGA4;
  }
}

// Collect page load...
// GA 360 : rule      : pageLoad
// GA4    : event_name : screenView

function screenViewTrack() {
  const elemento = document.querySelector('[data-segment]');
  const segmento = elemento ? elemento.getAttribute('data-segment') : '';

  if (!window.disableScreenview) {
    // GA4
    try {
      ItauDigitalAnalytics.track({
        [window.analyticsType]: {
          event_name: "screen_view",
          parameters: {
            custom_path: window.custom_path
              .replace(/\-\-+/g, "-")
              .replace(/^-+/, "")
              .replace(/-+$/, ""),
            implementation_team: window.implementation_team,
            detail: isValidVariable(window.detail_ga4) ? "tp:" + window.detail_ga4 : undefined,
            product_name: isValidVariable(window.product_name) ? "nm:produto:" + window.product_name : undefined,
            product_category: isValidVariable(window.product_category) ? "ct:produto:" + window.product_category : undefined,
            product_channel: isValidVariable(window.product_channel) ? window.product_channel : undefined,
            proposal_id: isValidVariable(window.proposal_id)
            ? window.proposal_id
            : undefined,
            status: isValidVariable(window.status_ga4) ? "st:vocacao:" + window.status_ga4 : undefined,
            flow: window.business + ":" + segmento,
          },
        },
      });
    } catch (error) {
      console.error("iTagger - Erro ao disparar evento de screenview:", error);
      return [];
    }
  }
}

// Start iTagger
// Set default parameters, fire screenview events
// Gets all clickable elements and starts their processing

function initItagger() {
  try {
    window.analyticsType = isITaggerWebView() ? 'analyticswebview' : 'analytics';
    setCustomPath();
    validateGlobalVariables();
    processGlobalVariables();
    setDefaultParameters();
    screenViewTrack();

    const listIgnore = getListIgnore();
    const dataTagList = getClickList();
    const visualizationList = getVisualizationList();

    if (isHomeItau(null, null)) {
      try {
        getSpecificCarouselComponents();
      } catch (error) {
        console.error("iTagger Home Itau - Erro ao buscar elementos do carrosel", error);
      }
    }

    dataTagList.forEach((el) => {
      processElementClick(el, listIgnore);
    });

    if(visualizationList && visualizationList.length) {
      const visualizationListProcessed = visualizationList
        .map((el) => processElementVisualization(el, listIgnore)) // Mapeia cada elemento para o resultado da função
        .filter((result) => result !== null);

      initVisualizationObserver(visualizationListProcessed);
    }

  } catch (error) {
    console.error("iTagger - Erro ao inicializar o itagger:", error);
  }
}

// Gets the ignore list from content
// Returns a string array containing the IDs of sections to be ignored

function getListIgnore() {
  try {
    const values = document.getElementById("ignoreAnalytics");
    let listIgnore = [];
    if (values != null && values.textContent) {
      const dataJson = JSON.parse(values.textContent);
      listIgnore = dataJson.analyticsList
        ? dataJson.analyticsList.split(",")
        : [];

      listIgnore = listIgnore.map((element) => {
        return element.trim();
      });
    }
    return listIgnore;
  } catch (error) {
    console.error("iTagger - Erro ao buscar lista de componentes ignorados:", error);
    return [];
  }
}

// Gets the list of clicable elements on the screen
// [data-tag-link], [data-tag-richtext] a, button
// Returns an array of DOMElements

function getClickList() {
  return Array.from(
    document.querySelectorAll(
      "[data-tag-link], [data-tag-richtext] a, [data-tag-richtext] button"
    )
  );
}

// Gets the list of visualization elements on the screen
// [data-tag-visualization],
// Returns an array of DOMElements

function getVisualizationList() {
  return Array.from(
    document.querySelectorAll(
      "[data-tag-visualization]"
    )
  );
}

// Process each clicable dom element
// Validates if its ignored or incomplete
// Creates the listener for valid clickables elements

function processElementClick(el, listIgnore) {
  try {
    let closestSection = el.closest('[id*="section-"]');
    if (closestSection != null && listIgnore.indexOf("#" + closestSection.id) >= 0) {
      return;
    }

    let params = JSON.parse(el.dataset.tag ? el.dataset.tag : "{}");
    
    // Processa elementos de RichText
    if (!el.dataset.tag) {
      let richtextElement = el.closest("[data-tag-richtext]");
      if (richtextElement) {
        params.type = el.tagName === "A" ? "LNK" : "BTN";
        params.title = richtextElement.dataset.tagRichtextTitle
          ? richtextElement.dataset.tagRichtextTitle
          : undefined;
        params.text = el.textContent;
        params.component = "[data-component]";
      }
    }

    let component = getComponent(el, params);

    if (!component) {
      console.warn("iTagger - Elemento com data-component não encontrado. Tagueamento será ignorado no elemento: ", {
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        textContent: el.textContent
      });
      return; // Se o componente não for encontrado, interrompe o processamento
    }

    if (isHomeItau(["Cards Mosaic", "Image Window Card"], component)) {
      try {
        setImpressionEventsHome(el, component);
      } catch (error) {
        console.error("iTagger Home Itau - Erro ao definir eventos de impressão:", error);
      }
    }

    el.addEventListener("click", function () {
      handleElementClick(el, component, params);
    });
  } catch (error) {
    console.error("iTagger - Erro ao processar elemento clicável:", error);
  }
}

// Process each visualization dom element
// Validates if its ignored or incomplete
// Creates the listener for valid visualization elements

function processElementVisualization(el, listIgnore) {
  try {
    let closestSection = el.closest('[id*="section-"]');
    if (closestSection != null && listIgnore.indexOf("#" + closestSection.id) >= 0) {
      return;
    }

    let params = JSON.parse(el.dataset.tag ? el.dataset.tag : "{}");
    
    let component = getComponent(el, params);

    if (!component) {
      console.warn("iTagger - Elemento com data-component não encontrado. Tagueamento será ignorado no elemento: ", {
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        textContent: el.textContent
      });
      return; // Se o componente não for encontrado, interrompe o processamento
    }

    return el;
  } catch (error) {
    console.error("iTagger - Erro ao processar elemento clicável:", error);
  }
}

// Initializes the visualization observer
// Receives a list of visualization elements
//

function initVisualizationObserver(visualizationList) {

  // Configurações do IntersectionObserver
  const observerOptions = {
    root: null, // Use o viewport como root
    rootMargin: '0px',
    threshold: 0.5 // 50% do elemento visível
  };

  // Callback que será chamado quando a visibilidade dos elementos mudar
  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // O elemento está visível na tela
        handleElementVisualization(entry.target);

        // Remove o elemento do observer após ele ser chamado
        observer.unobserve(entry.target);
      }
    });
  };

  // Cria uma instância do IntersectionObserver
  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Observa cada elemento da lista
  visualizationList.forEach(element => {
    observer.observe(element);
  });
}

// Function fired on element Click
// Creates the JSON to be sent to Google
// Calls the Analytics SDK

function handleElementClick(el, component, params) {
  try {
    
    let title = getTitle(el, params, component);
    let text = getText(el, params);

    let clickedItemSkewer = getClickedItemSkewer(params.type, component, title, text);

    // Obtenha os parâmetros personalizados
    let customParams = getCustomParams(el);

    if (
      isHomeItau([
        "Cards Mosaic",
        "Image Window Card",
        "Card Rotating Showcase",
        "Main Banner Rotating"
      ], component)
    ) {
      if (isSpecificHomeComponents(component, el)) {
        try {
          clickTrack(el, component);
        } catch (error) {
          console.error("iTagger Home Itau - Erro ao trackear cliques:", error);
        }
      }
    } else {
      trackAnalytics("click", clickedItemSkewer, customParams);
    }
  } catch (error) {
    console.error("iTagger - Erro ao processar clique no elemento:", error);
  }
}

function handleElementVisualization(el) {
  try {
    const params = JSON.parse(el.dataset.tag ? el.dataset.tag : "{}");

    let visualizationItemSkewer = getClickedItemSkewer(
      processStringValues(el, params.type), 
      processStringValues(el, params.component),
      processStringValues(el, params.title),
      processStringValues(el, params.text));

    // Obtenha os parâmetros personalizados
    let customParams = getCustomParams(el);

    trackAnalytics("visualization", visualizationItemSkewer, customParams);

  } catch (error) {
    console.error("iTagger - Erro ao processar visualization no elemento:", error);
  }
}

function processStringValues(el, value) {
  try {
    if(isValidVariable(value)) {
      // Verifica e substitui [data-component] se necessário
      if (value.includes("[data-component]")) {
          value = value.replace(/\[data-component\]/g, getComponentGeneric(el));
      }

      // Verifica e substitui [data-tag-text-content] se necessário
      if (value.includes("[data-tag-content-text]")) {
        value = value.replace(/\[data-tag-content-text\]/g, getDataTagContentText(el));
      }

      // Verifica e substitui [data-tag-text-content] se necessário
      if (value.includes("[data-tag-text-content]")) {
          value = value.replace(/\[data-tag-text-content\]/g, getDataTagTextContent(el));
      }

      // Verifica e substitui [data-tag-fragment-title] se necessário
      if (value.includes("[data-tag-fragment-title]")) {
          value = value.replace(/\[data-tag-fragment-title\]/g, getDataTagFragmentTitle(el));
      }

      // Extrai todos os IDs do padrão [data-tag-id=InsiraIdAqui]
      const ids = extractAllIdsFromDataTag(value);

      // Substitui cada padrão pelo textContent correspondente
      ids.forEach(id => {
        const textContent = getTextContentById(id);
        if (textContent !== null) {
          value = value.replace(`[data-tag-id=${id}]`, textContent);
        }
      });

      return value; // Retorna a string processada
    } else {
      return null;
    }
  } catch (error) {
      console.error("iTagger - Erro ao processar detail:", error);
      return value; // Retorna a string original em caso de erro
  }
}

// Function to get an element's textContent by their ID
function getTextContentById(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`iTagger - Elemento com ID '${id}' não encontrado. Tagueamento pode conter erros.`);
    return null;
  }
  return element.textContent.trim();
}

// Função to extract the ID from the regex [data-tag-id=ID]
function extractIdFromDataTag(dataTag) {
  const regex = /\[data-tag-id=(.+?)\]/;
  const match = dataTag.match(regex);
  return match ? match[1] : null; // Retorna o ID ou null se não encontrado
}

// Function to extract all the IDS from the regex [data-tag-id=InsiraIdAqui]
function extractAllIdsFromDataTag(dataTag) {
  const regex = /\[data-tag-id=(.+?)\]/g;
  let match;
  const ids = [];
  while ((match = regex.exec(dataTag)) !== null) {
    ids.push(match[1]); // Adiciona o ID encontrado à lista
  }
  return ids;
}


// Gets the component info of an element
// Returns a string

function getComponent(el, params) {

  if (params.component === "[data-component]") {
    // Busca o elemento mais próximo com o atributo data-component
    let closestComponent = el.closest("[data-component]");
    if (closestComponent) {
      return closestComponent.dataset.component;
    } else {
      return null; // Componente pai não encontrado, valor nulo
    }
  } else {
    const id = extractIdFromDataTag(params.component);
    if (id) {
      const textContent = getTextContentById(id);
      return textContent !== null ? textContent : params.component; // Retorna o textContent ou params.component se não encontrado
    }

    return params.component;
  }
}

// Gets the component info of an element
// Returns a string

function getComponentGeneric(el) {

  let closestComponent = el.closest("[data-component]");
  if (closestComponent) {
    return closestComponent.dataset.component;
  } else {
    return "[data-component]"; // Componente pai não encontrado, valor default
  }
}


// Gets the title info of an element
// Returns a string

function getTitle(el, params, component) {
    if (params.title === undefined) {
      return false;
    } else if (params.title === "[data-tag-content-text]") {
      const closestElement = el.closest(params.title);
      if (closestElement) {
        const h3Element = closestElement.querySelector("h3");
        return h3Element ? h3Element.textContent : false;
      }
      return false;
    } else if (params.title === "[data-tag-fragment-title]") {
      const componentElement = el.closest("[data-component='" + component + "']");
      if (componentElement) {
        const titleElement = componentElement.querySelector(params.title);
        return titleElement ? titleElement.textContent : false;
      }
      return false;
    } else {
      // Verifica se params.title corresponde ao padrão [data-tag-id=InsiraIdAqui]
      const id = extractIdFromDataTag(params.title);
      if (id) {
        const textContent = getTextContentById(id);
        return textContent !== null ? textContent : params.title; // Retorna o textContent ou params.title se não encontrado
      }
      return params.title;
    }
}

// Gets the title info of an element
// Returns a string

function getDataTagContentText(el) {
  const closestElement = el.closest("[data-tag-content-text]");
  if (closestElement) {
    const h3Element = closestElement.querySelector("h3");
    return h3Element ? h3Element.textContent : "[data-tag-content-text]";
  }
  return "[data-tag-content-text]";
}

function getDataTagFragmentTitle(el) {
  const componentElement = el.closest("[data-component]");
    if (componentElement) {
      const titleElement = componentElement.querySelector("[data-tag-fragment-title]");
      return titleElement ? titleElement.textContent : "[data-tag-fragment-title]";
    }
    return "[data-tag-fragment-title]";
}

function getDataTagTextContent(el) {
  return el.textContent? el.textContent : "[data-tag-text-content]";
}

// Gets the text info of an element
// Returns a string

function getText(el, params) {
  if (params.text === undefined) {
    return false;
  } else if (params.text === "[data-tag-content-text]") {
    return el.closest(params.title).querySelectorAll("h3").length
      ? el.closest(params.title).querySelector("h3").textContent
      : false;
  } else if (params.text === "[data-tag-text-content]") {
    return el.textContent? el.textContent : params.text;
  } else {
    // Verifica se params.text corresponde ao padrão [data-tag-id=InsiraIdAqui]
    const id = extractIdFromDataTag(params.text);
    if (id) {
      const textContent = getTextContentById(id);
      return textContent !== null ? textContent : params.text; // Retorna o textContent ou params.text se não encontrado
    }
    return params.text;
  }
}

// Builds the detail string of the analytics using skewer case pattern
// Returns a string

function getClickedItemSkewer(type, component, title, text) {
  return SkewerCase(type, true) + (component ? ":" + SkewerCase(component, true) : "") + (title ? ":" + SkewerCase(title, true) : "") + (text ? ":" + SkewerCase(text, true) : "");
}

// Get Custom Params from data-tag-custom
// Returns a structure
function getCustomParams(el) {
  let customParams = {};

  // Verifica se o elemento possui o atributo data-tag-custom
  const dataTagCustom = el.getAttribute('data-tag-custom');
  if (dataTagCustom) {
    try {
      // Faz o parse do JSON contido no data-tag-custom
      const parsedData = JSON.parse(dataTagCustom);

      // Preenche o customParams com os dados do JSON
      for (let key in parsedData) {
        let value = parsedData[key];

        // Extrai todos os IDs do padrão [data-tag-id=InsiraIdAqui]
        const ids = extractAllIdsFromDataTag(value);

        // Substitui cada padrão pelo textContent correspondente
        ids.forEach(id => {
          const textContent = getTextContentById(id);
          if (textContent !== null) {
            value = value.replace(`[data-tag-id=${id}]`, textContent);
          }
        });

        // Converte o valor para skewer-case
        customParams[key] = SkewerCase(value, false);
      }
    } catch (error) {
      console.error("iTagger - Erro ao fazer parse do data-tag-custom:", error);
    }
  }

  return customParams;
}

// Receives the final string element to track
// Calls the analytics SDK

function trackAnalytics(event_type, clickedItemSkewer, customParams) {
  //GA4
  ItauDigitalAnalytics.track({
    [window.analyticsType]: {
      event_name: event_type,
      parameters: {
        detail: clickedItemSkewer,
        custom_path: window.custom_path,
        implementation_team: window.implementation_team,
        product_channel: window.product_channel ? window.product_channel : undefined,
        proposal_id: window.proposal_id
          ? window.proposal_id
          : undefined,
        ...customParams
      },
    },
  });
}

// Receives a string
// Removes non valid characters
// Returns clean string

function stripString(str, cleanString) {
  var wm = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ",
    nmw = "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr",
    newStr = "",
    found = false;

  for (var i = 0; i < str.length; i++) {
    found = false;

    for (var a = 0; a < wm.length; a++) {
      if (str.substr(i, 1) == wm.substr(a, 1)) {
        newStr += nmw.substr(a, 1);
        found = true;
        break;
      }
    }

    if (found == false) {
      newStr += str.substr(i, 1);
    }
  }

  if (cleanString) {
    return newStr.trim().replace(/[^\w\s]/gi, "");
  } else {
    return newStr.trim().replace(/[^\w\s:\-\/]/gi, "");
  }
}

// Receives a string
// Converts to pascal case pattern
// Returns a string

function PascalCase(str) {
  return str
    .split(":")
    .map(function (c) {
      c = stripString(c, true);
      return (
        c.charAt(0).toUpperCase() +
        c
          .replace(/\s(.)/g, function (a) {
            return a.toUpperCase();
          })
          .replace(/\s/g, "")
          .replace(/^(.)/, function (b) {
            return b.toLowerCase();
          })
          .slice(1)
      );
    })
    .join(":");
}

// Receives a string
// Converts to skewer case pattern
// Returns a string

function SkewerCase(str, cleanString) {
  return stripString(
    str.substring(0, 100).toLowerCase().replace(/_/g, '-'),
    cleanString
  ).replace(/\s+/gi, "-");
}

// Check if is home page from itau origin
// Also check for specific components

function isHomeItau(componentList, component) {
  if (window.origin !== "itau")
    return false;

  if (window.pageNameGA4 !== "/home")
    return false;

  if (componentList && componentList.length) {
    if (!componentList.includes(component))
      return false;
  }

  return true;
}

// Check if is home page from itau origin
// Also check for specific components

function isSpecificHomeComponents(component, el) {
  if (component !== "Card Rotating Showcase" && component !== "Main Banner Rotating" &&
    !hasISCampaign(el.closest('[id*="section"]'))) {
    return true;
  }
  return false;
}

// Check if script is inside a webview environment
// Changes structure sent to SDK

function isITaggerWebView() {
  if (isValidVariable(window.webviewMobile)) {
    return window.webviewMobile;
  } else {
    return false;
  }
}

// Função auxiliar para verificar se uma variável é válida
function isValidVariable(variable) {
  return typeof variable !== 'undefined' && variable !== '' && variable !== null;
}

// Cria um objeto que contém todas as funções
window.iTagger = {

  // External function for other scripts
  // Calls the track function of the analytics SDK
  track: function (analytics) {
    try {
      if (analytics) {
        ItauDigitalAnalytics.track({
          [window.analyticsType]: analytics
        });
      }
    } catch (error) {
      console.error("iTagger - Erro ao chamar iTagger.track:", error);
    }
  },

  // External function for other scripts
  // Calls the setUserProperties function of the analytics SDK
  setUserProperties: function (userProperties) {
    try {
      if (userProperties) {
        ItauDigitalAnalytics.setUserProperties({
          [window.analyticsType]: userProperties
        });
      }
    } catch (error) {
      console.error("iTagger - Erro ao chamar iTagger.setUserProperties:", error);
    }
  },

  // External function for other scripts
  // Calls the setDefaultParameters function of the analytics SDK
  setDefaultParameters: function (defaultParameters) {
    try {
      if (defaultParameters) {
        ItauDigitalAnalytics.setDefaultParameters({
          [window.analyticsType]: defaultParameters
        });
      }
    } catch (error) {
      console.error("iTagger - Erro ao chamar iTagger.setDefaultParameters:", error);
    }
  },

  // External function for other scripts
  // Calls the measurementTrack function of the analytics SDK
  measurementTrack: function (measurement) {
    try {
      if (measurement) {
        ItauDigitalAnalytics.measurementTrack({
          [window.analyticsType]: measurement
        });
      }
    } catch (error) {
      console.error("iTagger - Erro ao chamar iTagger.measurementTrack:", error);
    }
  }
};

document.addEventListener("DOMContentLoaded", function (DOM) {
  if(validateItauDigitalAnalytics()) {
    initItagger();
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
      validateGlobalVariables,
      setCustomPath,
      validateItauDigitalAnalytics,
      processGlobalVariables,
      SkewerCase,
      isValidVariable,
      setDefaultParameters,
      screenViewTrack,
      isValidVariable,
      initItagger,
      isITaggerWebView,
      getListIgnore,
      getClickList,
      getVisualizationList,
      isHomeItau,
      processElementClick,
      handleElementClick,
      processElementVisualization,
      handleElementVisualization,
      initVisualizationObserver,
      processStringValues,
      getComponentGeneric,
      getDataTagContentText,
      getDataTagTextContent,
      getDataTagFragmentTitle,
      extractIdFromDataTag,
      extractAllIdsFromDataTag,
      getComponent,
      getTitle,
      getText,
      getClickedItemSkewer,
      getCustomParams,
      trackAnalytics,
      stripString,
      PascalCase,
      isHomeItau,
      isSpecificHomeComponents,
      iTagger
  };
}
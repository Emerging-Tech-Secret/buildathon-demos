"use strict";

function setDefaultParametersForSpecificClicks(campaign) {
  var defaultParametersGA4 = {};

  let timestamp = Date.now().toString();

  defaultParametersGA4 = {
    analytics: {
      parameters: {
        business: business,
        business_channel: business_channel,
        environment: business_channel,
        h2o_click_campaign: campaign,
        h2o_click_timestamp: timestamp,
      },
    },
  };

  ItauDigitalAnalytics.setDefaultParameters(defaultParametersGA4);
}

function setImpressionEventsHome(el, component) {
	setTimeout(() => {
		try {
			if (!hasISCampaign(el.closest('[id*="section"]'))) {
				impressionTrack(el, component);
				executeWhenVisible(el, () => {
					viewabilityTrack(el, component);
				});
			}
		} catch (error) {
			console.error(error);
		}
	}, 500);
}

function impressionTrack(element, component) {
	const title = SkewerCase(getTitleHomeItau(element, component), true);
	const campaignId = "contentstack";
	const componentName = SkewerCase(component, true);

	ItauDigitalAnalytics.track({
		analytics: {
			event_name: "impression",
			parameters: {
				custom_path: custom_path,
				implementation_team: implementation_team,
				detail: `${campaignId}-${componentName}`,
				h2o_creative_name: `${campaignId}|${title}`,
				h2o_campaign_name: campaignId,
				h2o_campaign_id: campaignId,
			},
		},
	});
}

function carouselImpressionTrack(element, component, position, totalPositions) {
	const title = SkewerCase(
		(
			element.querySelector("h2") ||
			element.querySelector("h3") || { textContent: "" }
		).textContent,
		true
	);
	const campaignId = getCampaignId(element);
	const componentName = SkewerCase(component, true);

	ItauDigitalAnalytics.track({
		analytics: {
			event_name: "impression",
			parameters: {
				custom_path: custom_path,
				implementation_team: implementation_team,
				detail: `contentstack-${componentName}`,
				h2o_creative_name: `contentstack|${title}`,
				h2o_campaign_name: "contentstack",
				h2o_campaign_id: "contentstack",
				h2o_full_carousel: `${campaignId}:1|contentstack:2|contentstack:3|contentstack:4`,
				position: `${position}/${totalPositions}`,
			},
		},
	});
}

function viewabilityTrack(element, component) {
	const title = SkewerCase(getTitleHomeItau(element, component), true);
	const campaignId = "contentstack";
	const componentName = SkewerCase(component, true);

	ItauDigitalAnalytics.track({
		analytics: {
			event_name: "visualization",
			parameters: {
				custom_path: custom_path,
				implementation_team: implementation_team,
				detail: `${campaignId}-${componentName}`,
				h2o_creative_name: `${campaignId}|${title}`,
				h2o_campaign_name: campaignId,
				h2o_campaign_id: campaignId,
			},
		},
	});
}

function carouselViewabilityTrack(
	element,
	component,
	position,
	totalPositions
) {
	const title = SkewerCase(
		(
			element.querySelector("h2") ||
			element.querySelector("h3") || { textContent: "" }
		).textContent,
		true
	);
	const campaignId = getCampaignId(element);
	const componentName = SkewerCase(component, true);

	ItauDigitalAnalytics.track({
		analytics: {
			event_name: "visualization",
			parameters: {
				custom_path: custom_path,
				implementation_team: implementation_team,
				detail: `contentstack-${componentName}`,
				h2o_creative_name: `contentstack|${title}`,
				h2o_campaign_name: "contentstack",
				h2o_campaign_id: "contentstack",
				h2o_full_carousel: `${campaignId}:1|contentstack:2|contentstack:3|contentstack:4`,
				position: `${position}/${totalPositions}`,
			},
		},
	});
}

function clickTrack(element, component) {
	const title = SkewerCase(getTitleHomeItau(element, component), true);
	const campaignId = "contentstack";
	const componentName = SkewerCase(component, true);

	setDefaultParametersForSpecificClicks(campaignId);

	// GA4
	ItauDigitalAnalytics.track({
		analytics: {
			event_name: "click",
			parameters: {
				custom_path: custom_path,
				implementation_team: implementation_team,
				detail: `${campaignId}-${componentName}`,
				h2o_creative_name: `${campaignId}|${title}`,
				h2o_campaign_name: campaignId,
				h2o_campaign_id: campaignId,
			},
		},
	});
}

function carouselClickTrack(element, component, position, totalPositions) {

	const elementTitle = (
		element.querySelector("h2") ||
		element.querySelector("h3") || { textContent: "" }
	).textContent;
	const title = SkewerCase(elementTitle, true);
	const titlePascal = PascalCase(elementTitle);
	const campaignId = getCampaignId(element);
	const campaignIdOnClick = getCampaignId(element, "click");
	const componentName = SkewerCase(component, true);
	const elementLinkText = (element.querySelector("a") || { textContent: "" })
		.textContent;
	const elementLinkTextPascal = PascalCase(elementLinkText);


	setDefaultParametersForSpecificClicks(campaignIdOnClick);

	let events;
	if (component == "Main Banner Rotating") {
		events = {
			category: "Clique",
			action: `Clique:MainBannerRotating:Position${position}`,
			label: `BTN:MainBannerRotating:${titlePascal}:${elementLinkTextPascal}`,
			noInteraction: false,
		};
	} else {
		events = {
			category: "Clique",
			action: "objeto clicado",
			label: `LNK:CardRotatingShowcase:${titlePascal}`,
		};
	}

	// GA4
	ItauDigitalAnalytics.track({

		analytics: {
			event_name: "click",
			parameters: {
				custom_path: custom_path,
				implementation_team: implementation_team,
				detail: `contentstack-${componentName}`,
				h2o_creative_name: `contentstack|${title}`,
				h2o_campaign_name: "contentstack",
				h2o_campaign_id: "contentstack",
				h2o_full_carousel: `${campaignId}:1|contentstack:2|contentstack:3|contentstack:4`,
				position: `${position}/${totalPositions}`,
			},
		},
	});

}

function personalizationTrack(eventName, element, campaignId, promotionName) {
	const titleElement = element.querySelector("h2, h3") || { textContent: "" };
	const title = SkewerCase(titleElement.textContent, true);
	const titlePascal = PascalCase(titleElement.textContent);

	const componentElement = element.querySelector("[data-component]");
	const componentName = SkewerCase(componentElement.dataset.component, true);
	const componentNamePascal = PascalCase(componentElement.dataset.component);

	const linkElement = element.querySelector("a") || { textContent: "" };
	const elementLinkTextPascal = PascalCase(linkElement.textContent);

	let analyticsObjectGA4 = {
		analytics: {
			event_name: eventName,
			parameters: {
				custom_path: custom_path,
				implementation_team: implementation_team,
				detail: `personalization-${componentName}`,
				h2o_creative_name: `${promotionName}|${title}`,
				h2o_campaign_name: promotionName,
				h2o_campaign_id: campaignId,
			},
		},
	};

	if (eventName === "click") {
		setDefaultParametersForSpecificClicks(campaignId);

		// GA4
		ItauDigitalAnalytics.track(analyticsObjectGA4);

	} else {
		// GA4
		ItauDigitalAnalytics.track(analyticsObjectGA4);
	}
}

function personalizationCarouselTrack(
	eventName,
	element,
	position,
	totalPositions,
	campaignId,
	promotionName
) {
	const titleElement = element.querySelector("h2, h3") || { textContent: "" };
	const title = SkewerCase(titleElement.textContent, true);
	const titlePascal = PascalCase(titleElement.textContent);

	const componentElement = element.closest("[data-component]");
	const componentName = SkewerCase(componentElement.dataset.component, true);

	const linkElement = element.querySelector("a") || { textContent: "" };
	const elementLinkTextPascal = PascalCase(linkElement.textContent);

	let analyticsObjectGA4 = {
		analytics: {
			event_name: eventName,
			parameters: {
				custom_path: custom_path,
				implementation_team: implementation_team,
				detail: `personalization-${componentName}`,
				h2o_creative_name: `${promotionName}|${title}`,
				h2o_campaign_name: promotionName,
				h2o_campaign_id: campaignId,
				h2o_full_carousel: `${campaignId}:1|contentstack:2|contentstack:3|contentstack:4`,
				position: `${position}/${totalPositions}`,
			},
		},
	};

	if (eventName === "click") {
		setDefaultParametersForSpecificClicks(campaignId);

		// GA4
		ItauDigitalAnalytics.track(analyticsObjectGA4);
	} else {
		// GA4
		ItauDigitalAnalytics.track(analyticsObjectGA4);
	}

}

let observedElements = new Set();

function executeWhenVisible(targetElement, callback) {
	if (observedElements.has(targetElement)) {
		return;
	}

	let observerOptions = {
		root: null,
		rootMargin: "0px",
		threshold: 0.5,
	};

	let timer;

	function observerCallback(entries, observer) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				timer = setTimeout(() => {
					callback();
					observer.unobserve(targetElement);
				}, 1000);
			} else {
				clearTimeout(timer);
			}
		});
	}

	let observer = new IntersectionObserver(observerCallback, observerOptions);
	observer.observe(targetElement);
	observedElements.add(targetElement);
}

function getSpecificCarouselComponents() {
	try {
		getSlidesAndTrack(".mbr-slide[data-slide]", "Main Banner Rotating");
		getSlidesAndTrack(
			".card-rotating-showcase-slide-item",
			"Card Rotating Showcase"
		);
	} catch (error) {
		console.error(error);
	}
}

function getSlidesAndTrack(slideSelector, componentName) {
	const totalPositions = document.querySelectorAll(slideSelector).length;
	for (let i = 0; i < totalPositions; i++) {
		let slide = document.querySelectorAll(slideSelector)[i];
		setTimeout(() => {
			if (!hasISCampaign(slide)) {
				carouselImpressionTrack(slide, componentName, i + 1, totalPositions);
				executeWhenVisible(slide, () => {
					carouselViewabilityTrack(slide, componentName, i + 1, totalPositions);
				});
			}
			let slideButton = slide.querySelector("a");
			if (slideButton && !hasISCampaign(slideButton)) {
				slideButton.addEventListener("click", () => {
					carouselClickTrack(slide, componentName, i + 1, totalPositions);
				});
			}
		}, 500);
	}
}

function hasISCampaign(element) {
	return (
		!!element.querySelector("[data-evg-campaign-id]") ||
		!!element.closest("[data-evg-campaign-id]")
	);
}

function getCampaignId(element, eventName) {
	const section =
		eventName === "click"
			? element
			: element && element.closest('[id*="section"]');
	const id = section && section.querySelector("[data-evg-campaign-id]");

	return (id && id.dataset.evgCampaignId) || "contentstack";
}

function getTitleHomeItau(element, componentName) {
	let params = JSON.parse(element.dataset.tag);

	let title;
	if (params.title === "Undefined") {
		title = false;
	} else if (params.title === "[data-tag-content-text]") {
		title = this.closest(params.title).querySelectorAll("h3").length
			? this.closest(params.title).querySelector("h3").textContent
			: false;
	} else if (params.title === "[data-tag-fragment-title]") {
		title = this.closest(`[data-component='${componentName}']`).querySelector(
			params.title
		).textContent;
	} else {
		title = params.title;
	}
	return title;
} 
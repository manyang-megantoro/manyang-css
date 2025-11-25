
// New wizard logic for effect-map.json: relation[trigger][effect] = [models...], model HTML from model
document.addEventListener('DOMContentLoaded', function() {
	const triggerSelect = document.getElementById('trigger-select');
	const effectSelect = document.getElementById('effect-select');
	const modelSelect = document.getElementById('model-select');
	const preview = document.getElementById('demo-preview');
	const codeBlock = document.getElementById('effect-html-code');
	const copyBtn = document.getElementById('copy-code-btn');
	// Wizard step containers
	const stepTrigger = document.getElementById('wizard-step-trigger');
	const stepEffect = document.getElementById('wizard-step-effect');
	const stepModel = document.getElementById('wizard-step-model');
	// Wizard arrows
	const arrowTriggerRight = document.getElementById('arrow-trigger-right');
	const arrowEffectLeft = document.getElementById('arrow-effect-left');
	const arrowEffectRight = document.getElementById('arrow-effect-right');
	const arrowModelLeft = document.getElementById('arrow-model-left');
	const arrowModelRight = document.getElementById('arrow-model-right');


	let effectMap = {};
	let currentStep = 0; // 0: trigger, 1: effect, 2: model

	// Load both effect-map.json (core) and module-map.json (modules)
	Promise.all([
		fetch('effect-map.json').then(res => res.json()),
		fetch('module-map.json').then(res => res.ok ? res.json() : {relation:{},model:{}})
	]).then(([core, modules]) => {
		// Merge core and modules
		effectMap = { relation: { ...core.relation, ...modules.relation }, model: { ...core.model, ...modules.model } };
		populateTrigger();
		
		// Initialize Select2 after data is loaded, then show step
		initializeSelect2();
		showStep(0);
	});

		function populateTrigger() {
			triggerSelect.innerHTML = '';
			const placeholder = document.createElement('option');
			placeholder.value = '';
			placeholder.textContent = 'Select trigger';
			placeholder.disabled = true;
			placeholder.selected = true;
			triggerSelect.appendChild(placeholder);
			Object.keys(effectMap.relation).forEach(trigger => {
				const opt = document.createElement('option');
				opt.value = trigger;
				opt.textContent = trigger.charAt(0).toUpperCase() + trigger.slice(1);
				triggerSelect.appendChild(opt);
			});
			populateEffect();
		}
			function populateEffect() {
				const trigger = triggerSelect.value;
				effectSelect.innerHTML = '';
				const placeholder = document.createElement('option');
				placeholder.value = '';
				placeholder.textContent = 'Select effect';
				placeholder.disabled = true;
				placeholder.selected = true;
				effectSelect.appendChild(placeholder);
				
				if (!effectMap.relation[trigger] || !effectMap.relation[trigger].list) return;
				
				// Create optgroups for different effect categories
				const effectCategories = {
					'Flip': ['flip'],
					'Fade Effects': [
						'fade-in', 'fade-out', 'fade-partial', 'fade-up', 'fade-down', 
						'fade-left', 'fade-right', 'fade-grow', 'fade-shrink', 
						'fade-pulse', 'fade-glow', 'fade-blur', 'fade-saturate', 
						'fade-twist', 'fade-slide', 'fade-bounce'
					],
					'Transform': ['rotate', 'zoom'],
					'Special': ['special']
				};
				
				const availableEffects = Object.keys(effectMap.relation[trigger].list);
				
				// Create optgroups and add effects
				Object.entries(effectCategories).forEach(([groupName, effectsInGroup]) => {
					const effectsToShow = effectsInGroup.filter(effect => availableEffects.includes(effect));
					
					if (effectsToShow.length > 0) {
						const optgroup = document.createElement('optgroup');
						optgroup.label = groupName;
						
						effectsToShow.forEach(effect => {
							const opt = document.createElement('option');
							opt.value = effect;
							opt.textContent = effect.charAt(0).toUpperCase() + effect.slice(1).replace(/-/g, ' ');
							optgroup.appendChild(opt);
						});
						
						effectSelect.appendChild(optgroup);
					}
				});
				
				// Refresh Select2 dropdown after populating
				if (typeof $ !== 'undefined' && $('#effect-select').hasClass('select2-hidden-accessible')) {
					$('#effect-select').select2('destroy').select2({
						placeholder: 'Select effect',
						allowClear: false,
						width: '300px',
						minimumResultsForSearch: 3
					});
				}
				
				populateModel();
			}
			function populateModel() {
				const trigger = triggerSelect.value;
				const effect = effectSelect.value;
				modelSelect.innerHTML = '';
				const placeholder = document.createElement('option');
				placeholder.value = '';
				placeholder.textContent = 'Select model';
				placeholder.disabled = true;
				placeholder.selected = true;
				modelSelect.appendChild(placeholder);
				if (!effectMap.relation[trigger] || !effectMap.relation[trigger].list || !effectMap.relation[trigger].list[effect]) {
					return;
				}
				let effectObj = effectMap.relation[trigger].list[effect];
				let models = [];
				if (Array.isArray(effectObj)) {
					models = effectObj;
				} else if (typeof effectObj === 'object' && effectObj.models) {
					models = effectObj.models;
				}
				models.forEach(model => {
					// Always show all models, even if not in global model (for custom html)
					const opt = document.createElement('option');
					opt.value = model;
					opt.textContent = model.charAt(0).toUpperCase() + model.slice(1);
					modelSelect.appendChild(opt);
				});
				
				// Refresh Select2 dropdown after populating
				if (typeof $ !== 'undefined' && $('#model-select').hasClass('select2-hidden-accessible')) {
					$('#model-select').select2('destroy').select2({
						placeholder: 'Select model',
						allowClear: false,
						width: '300px',
						minimumResultsForSearch: Infinity
					});
				}
			}

	// Wizard navigation arrows (keep these for arrow clicks)
	arrowTriggerRight.addEventListener('click', function() {
		if (!triggerSelect.value) return;
		populateEffect();
		animateStep(0, 1);
	});
	
	// Disable vanilla select events - using Select2 events instead
	/* 
	triggerSelect.addEventListener('change', function() {
		if (!triggerSelect.value) return;
		populateEffect();
		animateStep(0, 1);
	});
	*/
	
	arrowEffectRight.addEventListener('click', function() {
		if (!effectSelect.value) return;
		if (shouldSkipModel()) {
			animateStep(1, 3, true);
		} else {
			populateModel();
			animateStep(1, 2);
		}
	});
	
	// Disable vanilla select events - using Select2 events instead
	/*
	effectSelect.addEventListener('change', function() {
		if (!effectSelect.value) return;
		if (shouldSkipModel()) {
			animateStep(1, 3, true);
		} else {
			populateModel();
			animateStep(1, 2);
		}
	});
	*/
	
	arrowModelRight.addEventListener('click', function() {
		if (!modelSelect.value) return;
		animateStep(2, 3, true);
	});
	
	// Disable vanilla select events - using Select2 events instead  
	/*
	modelSelect.addEventListener('change', function() {
		if (!modelSelect.value) return;
		animateStep(2, 3, true);
	});
	*/

	// Helper: should skip model step?
	function shouldSkipModel() {
		const trigger = triggerSelect.value;
		const effect = effectSelect.value;
				if (!effectMap.relation[trigger] || !effectMap.relation[trigger].list || !effectMap.relation[trigger].list[effect]) return true;
				let effectObj = effectMap.relation[trigger].list[effect];
				let models = [];
				if (Array.isArray(effectObj)) {
					models = effectObj;
				} else if (typeof effectObj === 'object' && effectObj.models) {
					models = effectObj.models;
				}
				return models.length === 0;
			}

	// Wizard navigation (only left arrows for back)
	arrowEffectLeft.addEventListener('click', function() {
		preview.classList.remove('active'); // Hide preview when going back
		animateStep(currentStep, 0);
	});
	arrowModelLeft.addEventListener('click', function() {
		preview.classList.remove('active'); // Hide preview when going back
		animateStep(currentStep, 1);
	});

	// Animate fade-out/fade-in between steps
		function animateStep(from, to, updatePrev) {
			const steps = [stepTrigger, stepEffect, stepModel, preview];
			const fromEl = steps[from];
			const toEl = steps[to];
			fromEl.classList.remove('fade-in');
			fromEl.classList.add('fade-out');
			setTimeout(() => {
				fromEl.classList.remove('active', 'fade-out');
				toEl.classList.add('active', 'fade-in');
				if (updatePrev) {
					updatePreview();
				}
				// Focus first input in new step
				if (to === 0) triggerSelect.focus();
				if (to === 1) effectSelect.focus();
				if (to === 2) modelSelect.focus();
				currentStep = to;

				// Keep current step active, don't auto-reset
				/* Commented out auto-reset behavior
				if (to === 3) {
					setTimeout(() => {
						// Reset selects to placeholder
						triggerSelect.selectedIndex = 0;
						effectSelect.innerHTML = '';
						const effectPlaceholder = document.createElement('option');
						effectPlaceholder.value = '';
						effectPlaceholder.textContent = 'Select effect';
						effectPlaceholder.disabled = true;
						effectPlaceholder.selected = true;
						effectSelect.appendChild(effectPlaceholder);
						modelSelect.innerHTML = '';
						const modelPlaceholder = document.createElement('option');
						modelPlaceholder.value = '';
						modelPlaceholder.textContent = 'Select model';
						modelPlaceholder.disabled = true;
						modelPlaceholder.selected = true;
						modelSelect.appendChild(modelPlaceholder);
						
						// Update Select2 after reset
						if (typeof $ !== 'undefined') {
							$('#trigger-select').val('').trigger('change.select2');
							$('#effect-select').val('').trigger('change.select2');
							$('#model-select').val('').trigger('change.select2');
						}
						
						// Show trigger step again, keep preview visible
						preview.classList.add('active');
						stepTrigger.classList.add('active', 'fade-in');
						currentStep = 0;
						triggerSelect.focus();
					}, 900);
				}
				*/
			}, 350);
		}

	// Show preview alongside model step (both visible)
	function showPreviewWithModel() {
		stepModel.classList.add('active');
		preview.classList.add('active');
		currentStep = 2; // Keep current step as model
	}

	// Show preview alongside effect step (when model is skipped)
	function showPreviewWithEffect() {
		stepEffect.classList.add('active');
		preview.classList.add('active');
		currentStep = 1; // Keep current step as effect
	}

	// Hide/show steps (initial only)
	function showStep(step) {
		currentStep = step;
		stepTrigger.classList.remove('active', 'fade-in', 'fade-out');
		stepEffect.classList.remove('active', 'fade-in', 'fade-out');
		stepModel.classList.remove('active', 'fade-in', 'fade-out');
		preview.classList.remove('active', 'fade-in', 'fade-out');
		if (step === 0) {
			stepTrigger.classList.add('active');
			triggerSelect.focus();
		} else if (step === 1) {
			stepEffect.classList.add('active');
			effectSelect.focus();
		} else if (step === 2) {
			stepModel.classList.add('active');
			modelSelect.focus();
		} else if (step === 3) {
			preview.classList.add('active');
		}
	}

			function updatePreview() {
				const trigger = triggerSelect.value;
				const effect = effectSelect.value;
				let model = modelSelect.value;
				
				// If model step is skipped, pick the first model that supports this effect
				let effectObj = effectMap.relation[trigger] && effectMap.relation[trigger].list && effectMap.relation[trigger].list[effect];
				let models = [];
				if (Array.isArray(effectObj)) {
					models = effectObj;
				} else if (typeof effectObj === 'object' && effectObj.models) {
					models = effectObj.models;
				}
				
				if ((!model || model === '') && models.length > 0) {
					model = models[0];
				}
				if (!trigger || !effect || !model) {
					preview.innerHTML = '<em>Please select all options.</em>';
					codeBlock.textContent = '';
					return;
				}
				// Get prefix from JSON structure
				let triggerPrefix = 'h';
				if (effectMap.relation[trigger] && effectMap.relation[trigger].prefix) {
					triggerPrefix = effectMap.relation[trigger].prefix;
				}
				// Determine if effectObj is custom (object with html/class)
				let html = '';
				let classMap = {};
				if (typeof effectObj === 'object' && !Array.isArray(effectObj)) {
					// If model in global model, use as usual
					if (effectMap.model[model]) {
						html = effectMap.model[model];
						// If class is object, replace {effectClass} etc
						if (effectObj.class && typeof effectObj.class === 'object') {
							classMap = effectObj.class;
						} else if (effectObj.class && typeof effectObj.class === 'string') {
							classMap = { effectClass: effectObj.class };
						} else {
							classMap = { effectClass: `manyang-${triggerPrefix}-${effect}` };
						}
					} else if (effectObj.html && effectObj.html[model]) {
						html = effectObj.html[model];
						if (effectObj.class && typeof effectObj.class === 'object') {
							classMap = effectObj.class;
						} else if (effectObj.class && typeof effectObj.class === 'string') {
							classMap = { effectClass: effectObj.class };
						} else {
							classMap = { effectClass: `manyang-${triggerPrefix}-${effect}` };
						}
					}
				} else {
					// Default: use global model and default class
					html = effectMap.model[model] || '';
					classMap = { effectClass: `manyang-${triggerPrefix}-${effect}` };
				}
				// Replace all {key} in html with classMap[key]
				if (html) {
					html = html.replace(/\{(\w+)\}/g, (m, key) => classMap[key] || '');
				}
				
				preview.innerHTML = html;
				// Pretty-print HTML for code block
				codeBlock.textContent = formatHtml(html);
				if(window.Prism){ Prism.highlightElement(codeBlock); }

				// Helper: pretty-print HTML string with indentation
				function formatHtml(html) {
					// Remove leading/trailing whitespace
					html = html.trim();
					// Insert line breaks between tags
					html = html.replace(/>(\s*)</g, '>$1\n<');
					// Split into lines
					const lines = html.split(/\n/);
					let indent = 0;
					const formatted = lines.map(line => {
						let trimmed = line.trim();
						if (trimmed.match(/^<\//)) indent--;
						let tabs = '  '.repeat(Math.max(indent, 0));
						let result = tabs + trimmed;
						if (trimmed.match(/^<[^!?/][^>]*[^/]?>/) && !trimmed.match(/<.*\/.*>/)) indent++;
						return result;
					});
					return formatted.join('\n');
				}
			}

	// Copy button functionality
	if(copyBtn && codeBlock){
		copyBtn.addEventListener('click', function(){
			var code = codeBlock.textContent;
			if(navigator.clipboard){
				navigator.clipboard.writeText(code).then(function(){
					copyBtn.textContent = 'Copied!';
					setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1200);
				});
			} else {
				var textarea = document.createElement('textarea');
				textarea.value = code;
				document.body.appendChild(textarea);
				textarea.select();
				try { document.execCommand('copy'); } catch(e){}
				document.body.removeChild(textarea);
				copyBtn.textContent = 'Copied!';
				setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1200);
			}
		});
	}
// End of DOMContentLoaded

	// Copy button functionality
	if(copyBtn && codeBlock){
		copyBtn.addEventListener('click', function(){
			var code = codeBlock.textContent;
			if(navigator.clipboard){
				navigator.clipboard.writeText(code).then(function(){
					copyBtn.textContent = 'Copied!';
					setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1200);
				});
			} else {
				var textarea = document.createElement('textarea');
				textarea.value = code;
				document.body.appendChild(textarea);
				textarea.select();
				try { document.execCommand('copy'); } catch(e){}
				document.body.removeChild(textarea);
				copyBtn.textContent = 'Copied!';
				setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1200);
			}
		});
	}
	
	// Initialize Select2 for all selectors
	function initializeSelect2() {
		// Wait for jQuery to be available
		if (typeof $ === 'undefined') {
			setTimeout(initializeSelect2, 100);
			return;
		}
		
		// Initialize Select2 for all effect selectors
		$('#trigger-select').select2({
			placeholder: 'Select trigger',
			allowClear: false,
			width: '300px',
			minimumResultsForSearch: 3 // Show search box when 3+ options
		});
		
		$('#effect-select').select2({
			placeholder: 'Select effect',
			allowClear: false,
			width: '300px',
			minimumResultsForSearch: 3
		});
		
		$('#model-select').select2({
			placeholder: 'Select model',
			allowClear: false,
			width: '300px',
			minimumResultsForSearch: Infinity // Hide search for model select
		});
		
		// Handle Select2 change events - using same logic as original
		$('#trigger-select').on('change', function() {
			if (!triggerSelect.value) return;
			populateEffect();
			animateStep(0, 1);
		});
		
		$('#effect-select').on('change', function() {
			if (!effectSelect.value) return;
			if (shouldSkipModel()) {
				updatePreview();
				showPreviewWithEffect(); // Show preview with effect step
			} else {
				populateModel();
				animateStep(1, 2);
			}
		});
		
		$('#model-select').on('change', function() {
			if (!modelSelect.value) return;
			updatePreview();
			// Show preview but keep model step active
			showPreviewWithModel();
		});
	}
	
});


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
	// No arrowModelRight - model is the last step


	let effectMap = {};
	let currentStep = 0; // 0: trigger, 1: effect, 2: model
	let selectedModifiers = {};

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
				
				// Handle both array format and object format with models
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

				// Model is the last step - no need for right arrow
				// Populate modifiers inline if available
				populateModifiersInline();
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
	
	arrowModelLeft.addEventListener('click', function() {
		animateStep(2, 1);
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
		
		// Handle both array format and object format with models
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
					// Insert message inside bg-preview container
					let bgPreview = preview.querySelector('.bg-preview');
					if (!bgPreview) {
						bgPreview = document.createElement('div');
						bgPreview.className = 'bg-preview';
						preview.appendChild(bgPreview);
					}
					bgPreview.innerHTML = '<em style="color: #f7c873;">Please select all options.</em>';
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
				
				// Insert HTML inside bg-preview container instead of replacing entire preview
				let bgPreview = preview.querySelector('.bg-preview');
				if (!bgPreview) {
					// Create bg-preview container if it doesn't exist
					bgPreview = document.createElement('div');
					bgPreview.className = 'bg-preview';
					preview.appendChild(bgPreview);
				}
				bgPreview.innerHTML = html;
				
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
			// Show modifiers inline and update preview
			populateModifiersInline();
		});
	}

	// Check if current effect has modifiers
	function hasModifiers() {
		const trigger = triggerSelect.value;
		const effect = effectSelect.value;
		
		console.log('hasModifiers check:', trigger, effect);
		
		if (!trigger || !effect) {
			console.log('hasModifiers: false - missing trigger or effect');
			return false;
		}
		
		const effectData = effectMap.relation[trigger]?.list?.[effect];
		console.log('effectData:', effectData);
		
		if (!effectData) {
			console.log('hasModifiers: false - no effectData');
			return false;
		}
		
		// Check if effect data has modifiers property (new format)
		if (effectData.modifiers) {
			console.log('hasModifiers: true - found modifiers in effect data');
			return true;
		}
		
		console.log('hasModifiers: false - no modifiers found');
		return false;
	}

	// Populate modifiers inline in model step
	function populateModifiersInline() {
		const trigger = triggerSelect.value;
		const effect = effectSelect.value;
		
		const container = document.getElementById('modifiers-container');
		container.innerHTML = '';
		container.classList.remove('visible');
		
		if (!trigger || !effect) return;
		
		// Get modifiers from effect data
		const effectData = effectMap.relation[trigger]?.list?.[effect];
		const modifiers = effectData?.modifiers;
		
		if (!modifiers) {
			console.log('No modifiers found for', trigger, effect);
			// No modifiers, just show preview with basic effect
			updatePreview();
			if (!preview.classList.contains('active')) {
				preview.classList.add('active', 'fade-in');
			}
			return;
		}
		
		console.log('Found modifiers:', modifiers);
		container.classList.add('visible');
		
		// Reset selectedModifiers
		selectedModifiers = {};
		
		// Create sliders for each modifier type
		Object.entries(modifiers).forEach(([modifierName, config]) => {
			console.log('Creating inline slider for:', modifierName, config);
			
			const group = document.createElement('div');
			group.className = 'modifier-group';
			
			const label = document.createElement('div');
			label.className = 'modifier-label';
			label.textContent = config.label || modifierName;
			
			const sliderContainer = document.createElement('div');
			sliderContainer.className = 'modifier-slider-container';
			
			const slider = document.createElement('input');
			slider.type = 'range';
			slider.className = 'modifier-slider';
			slider.min = 0;
			slider.max = config.options.length - 1;
			
			// Set default value
			let defaultIndex = config.options.length - 1; // Default to last option
			if (config.default) {
				const defaultIdx = config.options.findIndex(opt => opt.value === config.default);
				if (defaultIdx >= 0) defaultIndex = defaultIdx;
			}
			slider.value = defaultIndex;
			slider.setAttribute('data-modifier', modifierName);
			
			const valueDisplay = document.createElement('div');
			valueDisplay.className = 'modifier-value';
			valueDisplay.textContent = config.options[slider.value].label;
			
			// Create step indicators
			const stepsContainer = document.createElement('div');
			stepsContainer.className = 'modifier-steps';
			config.options.forEach((_, index) => {
				const step = document.createElement('div');
				step.className = 'modifier-step';
				if (index == slider.value) step.classList.add('active');
				stepsContainer.appendChild(step);
			});
			
			// Update value and steps on change - with real-time preview
			slider.addEventListener('input', function() {
				const value = parseInt(this.value);
				valueDisplay.textContent = config.options[value].label;
				selectedModifiers[modifierName] = config.options[value];
				
				console.log('Modifier changed:', modifierName, selectedModifiers[modifierName]);
				
				// Update step indicators
				stepsContainer.querySelectorAll('.modifier-step').forEach((step, index) => {
					step.classList.toggle('active', index == value);
				});
				
				// Real-time preview update
				updatePreviewWithModifiersRealTime();
			});
			
			// Initialize selected modifiers
			selectedModifiers[modifierName] = config.options[slider.value];
			
			sliderContainer.appendChild(slider);
			group.appendChild(label);
			group.appendChild(sliderContainer);
			group.appendChild(valueDisplay);
			group.appendChild(stepsContainer);
			container.appendChild(group);
		});
		
		// Initial preview update with default modifiers
		updatePreviewWithModifiersRealTime();
	}

	// Update preview with current modifiers - real time in model step
	function updatePreviewWithModifiersRealTime() {
		const trigger = triggerSelect.value;
		const effect = effectSelect.value;
		const model = modelSelect.value;
		
		if (!trigger || !effect || !model) return;
		
		// Get base HTML template
		const htmlTemplate = effectMap.model[model] || '<div class="demo-element">Element</div>';
		
		// Apply modifiers to model
		const modifierClasses = Object.values(selectedModifiers)
			.map(modifier => modifier.class)
			.filter(Boolean)
			.join(' ');
		
		const baseClass = `manyang-${effectMap.relation[trigger].prefix}-${effect}`;
		const fullClass = `${baseClass} ${modifierClasses}`.trim();
		
		console.log('updatePreviewWithModifiersRealTime:', {
			baseClass,
			modifierClasses,
			fullClass,
			selectedModifiers
		});
		
		const htmlWithClass = htmlTemplate.replace('{effectClass}', fullClass);
		
		// Insert HTML inside bg-preview container instead of replacing entire preview
		let bgPreview = preview.querySelector('.bg-preview');
		if (!bgPreview) {
			// Create bg-preview container if it doesn't exist
			bgPreview = document.createElement('div');
			bgPreview.className = 'bg-preview';
			preview.appendChild(bgPreview);
		}
		bgPreview.innerHTML = htmlWithClass;
		codeBlock.textContent = htmlWithClass;
		
		// Show preview alongside model step
		if (!preview.classList.contains('active')) {
			preview.classList.add('active', 'fade-in');
		}
	}

	// Update preview with current modifiers (deprecated - using real-time now)
	function updatePreviewWithModifiers() {
		// This function is no longer needed since we use real-time updates
		updatePreviewWithModifiersRealTime();
	}
	
});

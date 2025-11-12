
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

	fetch('effect-map.json')
		.then(res => res.json())
		.then(map => {
			effectMap = map;
			populateTrigger();
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
				Object.keys(effectMap.relation[trigger].list).forEach(effect => {
					const opt = document.createElement('option');
					opt.value = effect;
					opt.textContent = effect.charAt(0).toUpperCase() + effect.slice(1);
					effectSelect.appendChild(opt);
				});
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
				if (!effectMap.relation[trigger] || !effectMap.relation[trigger].list || !effectMap.relation[trigger].list[effect]) return;
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
			}

	// Wizard navigation
	arrowTriggerRight.addEventListener('click', function() {
		if (!triggerSelect.value) return;
		populateEffect();
		animateStep(0, 1);
	});
	triggerSelect.addEventListener('change', function() {
		if (!triggerSelect.value) return;
		populateEffect();
		animateStep(0, 1);
	});
	arrowEffectRight.addEventListener('click', function() {
		if (!effectSelect.value) return;
		if (shouldSkipModel()) {
			animateStep(1, 3, true);
		} else {
			populateModel();
			animateStep(1, 2);
		}
	});
	effectSelect.addEventListener('change', function() {
		if (!effectSelect.value) return;
		if (shouldSkipModel()) {
			animateStep(1, 3, true);
		} else {
			populateModel();
			animateStep(1, 2);
		}
	});
	arrowModelRight.addEventListener('click', function() {
		if (!modelSelect.value) return;
		animateStep(2, 3, true);
	});
	modelSelect.addEventListener('change', function() {
		if (!modelSelect.value) return;
		animateStep(2, 3, true);
	});

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
		animateStep(currentStep, 0);
	});
	arrowModelLeft.addEventListener('click', function() {
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
				if (updatePrev) updatePreview();
				// Focus first input in new step
				if (to === 0) triggerSelect.focus();
				if (to === 1) effectSelect.focus();
				if (to === 2) modelSelect.focus();
				currentStep = to;

				// If just showed preview, after a short delay, reset wizard to first step and keep preview visible
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
						// Show trigger step again, keep preview visible
						preview.classList.add('active');
						stepTrigger.classList.add('active', 'fade-in');
						currentStep = 0;
						triggerSelect.focus();
					}, 900);
				}
			}, 350);
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
});

// Fancy wizard-style selector UI for demo
document.addEventListener('DOMContentLoaded', function() {
	const triggerSelect = document.getElementById('trigger-select');
	const modelSelect = document.getElementById('model-select');
	const effectSelect = document.getElementById('effect-select');
	const preview = document.getElementById('demo-preview');
	const codeBlock = document.getElementById('effect-html-code');
	const copyBtn = document.getElementById('copy-code-btn');
	// Wizard step containers
	const stepTrigger = document.getElementById('wizard-step-trigger');
	const stepModel = document.getElementById('wizard-step-model');
	const stepEffect = document.getElementById('wizard-step-effect');
	// Wizard arrows
	const arrowTriggerRight = document.getElementById('arrow-trigger-right');
	const arrowModelLeft = document.getElementById('arrow-model-left');
	const arrowModelRight = document.getElementById('arrow-model-right');
	const arrowEffectLeft = document.getElementById('arrow-effect-left');
	const arrowEffectRight = document.getElementById('arrow-effect-right');

	// Model to HTML element mapping for preview
	const modelTemplates = {
		picture: {
			html: '<img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="Demo" class="{modelClass} {effectClass}">',
			class: 'manyang-img',
		},
		button: {
			html: '<button class="manyang-btn {effectClass}">Button</button>',
			class: 'manyang-btn',
		},
		text: {
			html: '<span class="manyang-text {effectClass}">Sample Text</span>',
			class: 'manyang-text',
		},
		icon: {
			html: '<i class="manyang-icon {effectClass}" aria-label="icon">★</i>',
			class: 'manyang-icon',
		}
	};

	let effectMap = {};
	let currentStep = 0; // 0: trigger, 1: model, 2: effect

	// Load effect mapping JSON
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
			Object.keys(effectMap).forEach(trigger => {
				const opt = document.createElement('option');
				opt.value = trigger;
				opt.textContent = trigger.charAt(0).toUpperCase() + trigger.slice(1);
				triggerSelect.appendChild(opt);
			});
			populateModel();
		}
		function populateModel() {
			const trigger = triggerSelect.value;
			modelSelect.innerHTML = '';
			const placeholder = document.createElement('option');
			placeholder.value = '';
			placeholder.textContent = 'Select model';
			placeholder.disabled = true;
			placeholder.selected = true;
			modelSelect.appendChild(placeholder);
			if (!effectMap[trigger]) return;
			Object.keys(effectMap[trigger]).forEach(model => {
				if (effectMap[trigger][model].length > 0) {
					const opt = document.createElement('option');
					opt.value = model;
					opt.textContent = model.charAt(0).toUpperCase() + model.slice(1);
					modelSelect.appendChild(opt);
				}
			});
			populateEffect();
		}
		function populateEffect() {
			const trigger = triggerSelect.value;
			const model = modelSelect.value;
			effectSelect.innerHTML = '';
			const placeholder = document.createElement('option');
			placeholder.value = '';
			placeholder.textContent = 'Select effect';
			placeholder.disabled = true;
			placeholder.selected = true;
			effectSelect.appendChild(placeholder);
			if (!effectMap[trigger] || !effectMap[trigger][model]) return;
			effectMap[trigger][model].forEach(effect => {
				const opt = document.createElement('option');
				opt.value = effect;
				opt.textContent = effect.charAt(0).toUpperCase() + effect.slice(1);
				effectSelect.appendChild(opt);
			});
		}

		// Wizard navigation (only left arrows for back)
		arrowModelLeft.addEventListener('click', function() {
			animateStep(currentStep, 0);
		});
		arrowEffectLeft.addEventListener('click', function() {
			animateStep(currentStep, 1);
		});

		// Remove right arrow click for forward navigation (auto-advance instead)

					// Allow both select and right arrow to advance, but only if not placeholder
					arrowTriggerRight.addEventListener('click', function() {
						if (!triggerSelect.value) return;
						populateModel();
						animateStep(0, 1);
					});
					triggerSelect.addEventListener('change', function() {
						if (!triggerSelect.value) return;
						populateModel();
						animateStep(0, 1);
					});
				arrowModelRight.addEventListener('click', function() {
					if (!modelSelect.value) return;
					populateEffect();
					animateStep(1, 2);
				});
				modelSelect.addEventListener('change', function() {
					if (!modelSelect.value) return;
					populateEffect();
					animateStep(1, 2);
				});
				arrowEffectRight.addEventListener('click', function() {
					if (!effectSelect.value) return;
					animateStep(2, 3, true);
				});
				effectSelect.addEventListener('change', function() {
					if (!effectSelect.value) return;
					animateStep(2, 3, true);
				});

		// Animate fade-out/fade-in between steps
			function animateStep(from, to, updatePrev) {
				const steps = [stepTrigger, stepModel, stepEffect, preview];
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
					if (to === 1) modelSelect.focus();
					if (to === 2) effectSelect.focus();
					currentStep = to;

					// If just showed preview, after a short delay, reset wizard to first step and keep preview visible
					if (to === 3) {
						setTimeout(() => {
							// Reset selects to placeholder
							triggerSelect.selectedIndex = 0;
							modelSelect.innerHTML = '';
							const modelPlaceholder = document.createElement('option');
							modelPlaceholder.value = '';
							modelPlaceholder.textContent = 'Select model';
							modelPlaceholder.disabled = true;
							modelPlaceholder.selected = true;
							modelSelect.appendChild(modelPlaceholder);
							effectSelect.innerHTML = '';
							const effectPlaceholder = document.createElement('option');
							effectPlaceholder.value = '';
							effectPlaceholder.textContent = 'Select effect';
							effectPlaceholder.disabled = true;
							effectPlaceholder.selected = true;
							effectSelect.appendChild(effectPlaceholder);
							// Show trigger step again, keep preview visible
							preview.classList.add('active');
							stepTrigger.classList.add('active', 'fade-in');
							currentStep = 0;
							triggerSelect.focus();
						}, 900); // Wait for preview fade-in and user to see it
					}
				}, 350);
			}

		// Hide/show steps (initial only)
		function showStep(step) {
			currentStep = step;
			stepTrigger.classList.remove('active', 'fade-in', 'fade-out');
			stepModel.classList.remove('active', 'fade-in', 'fade-out');
			stepEffect.classList.remove('active', 'fade-in', 'fade-out');
			preview.classList.remove('active', 'fade-in', 'fade-out');
			if (step === 0) {
				stepTrigger.classList.add('active');
				triggerSelect.focus();
			} else if (step === 1) {
				stepModel.classList.add('active');
				modelSelect.focus();
			} else if (step === 2) {
				stepEffect.classList.add('active');
				effectSelect.focus();
			} else if (step === 3) {
				preview.classList.add('active');
			}
		}

		// Remove old select change listeners (now handled above)

	function updatePreview() {
		const trigger = triggerSelect.value;
		const model = modelSelect.value;
		const effect = effectSelect.value;
		if (!trigger || !model || !effect) {
			preview.innerHTML = '<em>Please select all options.</em>';
			codeBlock.textContent = '';
			return;
		}
		const effectClass = `manyang-h-${effect}`;
		const modelClass = modelTemplates[model]?.class || '';
		const html = modelTemplates[model].html
			.replace('{modelClass}', modelClass)
			.replace('{effectClass}', effectClass);
		preview.innerHTML = html;
		codeBlock.textContent = html;
		if(window.Prism){ Prism.highlightElement(codeBlock); }
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
});

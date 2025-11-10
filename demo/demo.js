// Hook up selector to switch hover effect classes on the demo image
(function(){
	function onReady(fn){
		if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', fn); }
		else { fn(); }
	}

	onReady(function(){
		var img = document.getElementById('hover-demo-img');
		var select = document.getElementById('effect-select');
		if(!img || !select) return;

		var prefix = 'manyang-h-';
		var codeBlock = document.getElementById('effect-html-code');
		function setEffect(effectClass){
			// remove existing manyang-h-* classes
			img.className = img.className
				.split(/\s+/)
				.filter(function(c){ return !c.startsWith(prefix); })
				.join(' ')
				.trim();
			// add the chosen effect (convert hover-foo to manyang-h-foo)
			var newClass = '';
			if(effectClass){
				newClass = effectClass.replace(/^hover-/, 'manyang-h-');
				img.classList.add(newClass);
			}
			// update code block with syntax highlighting
			if(codeBlock){
				var html = '<img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&amp;fit=crop&amp;w=400&amp;q=80" alt="Demo" class="' + newClass + '">';
				codeBlock.textContent = html;
				if(window.Prism){ Prism.highlightElement(codeBlock); }
			}
		}

		// init based on current select value
		setEffect(select.value);

		// Copy button functionality
		var copyBtn = document.getElementById('copy-code-btn');
		if(copyBtn && codeBlock){
			copyBtn.addEventListener('click', function(){
				var code = codeBlock.textContent;
				if(navigator.clipboard){
					navigator.clipboard.writeText(code).then(function(){
						copyBtn.textContent = 'Copied!';
						setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1200);
					});
				} else {
					// fallback for old browsers
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

		// update on change
		select.addEventListener('change', function(e){
			setEffect(select.value);
		});
	});
})();
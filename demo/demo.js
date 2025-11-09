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
		function setEffect(effectClass){
			// remove existing manyang-h-* classes
			img.className = img.className
				.split(/\s+/)
				.filter(function(c){ return !c.startsWith(prefix); })
				.join(' ')
				.trim();
			// add the chosen effect (convert hover-foo to manyang-h-foo)
			if(effectClass){
				var newClass = effectClass.replace(/^hover-/, 'manyang-h-');
				img.classList.add(newClass);
			}
		}

		// init based on current select value
		setEffect(select.value);

		// update on change
		select.addEventListener('change', function(e){
			setEffect(select.value);
		});
	});
})();
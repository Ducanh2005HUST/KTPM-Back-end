document.addEventListener('DOMContentLoaded', function () {
	const userMenuButton = document.getElementById('userMenuButton');
	const userMenu = document.querySelector('.user-menu');
	const userDropdown = document.getElementById('userDropdown');

	if (!userMenuButton || !userMenu) return;

	function closeMenu() {
		userMenu.classList.remove('open');
		userMenuButton.setAttribute('aria-expanded', 'false');
	}

	function toggleMenu() {
		const isOpen = userMenu.classList.toggle('open');
		userMenuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
	}

	userMenuButton.addEventListener('click', function (e) {
		e.stopPropagation();
		toggleMenu();
	});

	// close on outside click
	document.addEventListener('click', function (e) {
		if (!userMenu.contains(e.target)) {
			closeMenu();
		}
	});

	// close on ESC
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') closeMenu();
	});
});

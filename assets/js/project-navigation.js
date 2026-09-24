(function () {
	'use strict';

	var work = document.getElementById('two');
	var categories = Array.from(work.querySelectorAll('.project-category'));
	if (!categories.length) return;

	var nav = document.createElement('nav');
	nav.className = 'project-nav';
	nav.setAttribute('aria-label', 'Page directory');
	var groups = [];
	var projects = [];
	var openGroup = null;
	var profile = document.getElementById('one');
	profile.tabIndex = -1;
	var profileItem = document.createElement('div');
	profileItem.className = 'profile-nav-item';
	var profileLink = document.createElement('a');
	profileLink.className = 'project-dot';
	profileLink.href = '#one';
	profileLink.setAttribute('aria-label', 'Personal Profile');
	var profileLabel = document.createElement('span');
	profileLabel.className = 'profile-nav-label';
	profileLabel.textContent = 'Personal Profile';
	profileLabel.setAttribute('aria-hidden', 'true');
	profileLink.appendChild(profileLabel);
	profileItem.appendChild(profileLink);
	nav.appendChild(profileItem);
	profileItem.addEventListener('pointerenter', closeMenu);
	profileLink.addEventListener('focusin', closeMenu);
	profileLink.addEventListener('click', function (event) {
		if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		if (location.hash !== '#one') history.pushState(null, '', '#one');
		selectProfile(true);
	});

	function selectProfile(scroll) {
		closeMenu();
		profileLink.classList.add('is-active');
		profileLink.setAttribute('aria-current', 'location');
		groups.forEach(function (group) { group.button.classList.toggle('is-active', false); });
		if (scroll) {
			profile.focus({ preventScroll: true });
			profile.scrollIntoView({
				behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
				block: 'start'
			});
		}
	}

	function closeMenu() {
		if (!openGroup) return;
		openGroup.panel.hidden = true;
		openGroup.button.setAttribute('aria-expanded', 'false');
		openGroup = null;
	}

	function openMenu(group) {
		if (openGroup === group) return;
		closeMenu();
		group.panel.hidden = false;
		group.button.setAttribute('aria-expanded', 'true');
		openGroup = group;
	}

	categories.forEach(function (category) {
		var title = category.querySelector('.category-heading').textContent.trim();
		var item = document.createElement('div');
		item.className = 'project-nav-group';
		var button = document.createElement('button');
		button.type = 'button';
		button.className = 'project-dot';
		button.setAttribute('aria-label', title);
		button.setAttribute('aria-expanded', 'false');
		button.setAttribute('aria-controls', category.id + '-topics');

		var panel = document.createElement('div');
		panel.className = 'project-topics';
		panel.id = category.id + '-topics';
		panel.hidden = true;
		var heading = document.createElement('p');
		heading.className = 'project-topics-title';
		heading.textContent = title;
		var list = document.createElement('ol');
		panel.append(heading, list);
		item.append(button, panel);
		nav.appendChild(item);
		var group = { category: category, button: button, panel: panel, item: item };
		groups.push(group);

		Array.from(category.querySelectorAll('.work-item')).forEach(function (article, index) {
			article.id = category.id + '-project-' + (index + 1);
			article.tabIndex = -1;
			var link = document.createElement('a');
			link.href = '#' + article.id;
			link.textContent = article.querySelector('h3').textContent.trim();
			var li = document.createElement('li');
			li.appendChild(link);
			list.appendChild(li);
			var project = { article: article, category: category, link: link };
			projects.push(project);
			link.addEventListener('click', function (event) {
				if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
				event.preventDefault();
				if (location.hash !== link.hash) history.pushState(null, '', link.hash);
				selectProject(project, true);
			});
		});

		if (!list.querySelector('a')) {
			list.hidden = true;
			var emptyMessage = document.createElement('p');
			emptyMessage.className = 'project-topics-empty';
			emptyMessage.textContent = 'No projects yet.';
			panel.appendChild(emptyMessage);
		}

		item.addEventListener('pointerenter', function (event) {
			if (event.pointerType !== 'touch') openMenu(group);
		});
		item.addEventListener('pointerleave', function () {
			if (openGroup === group && !item.contains(document.activeElement)) closeMenu();
		});
		item.addEventListener('focusin', function () { openMenu(group); });
		item.addEventListener('focusout', function (event) {
			if (openGroup === group && !item.contains(event.relatedTarget)) closeMenu();
		});
		button.addEventListener('click', function () { openMenu(group); });
		button.addEventListener('keydown', function (event) {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				openMenu(group);
				var firstTopic = list.querySelector('a');
				if (firstTopic) firstTopic.focus();
			}
		});
	});

	function selectProject(selected, scroll) {
		profileLink.classList.toggle('is-active', false);
		profileLink.removeAttribute('aria-current');
		projects.forEach(function (project) {
			var active = project === selected;
			project.article.hidden = !active;
			if (active) project.link.setAttribute('aria-current', 'true');
			else project.link.removeAttribute('aria-current');
		});
		groups.forEach(function (group) {
			var active = group.category === selected.category;
			group.category.hidden = !active;
			group.button.classList.toggle('is-active', active);
		});
		closeMenu();
		if (scroll) {
			selected.article.focus({ preventScroll: true });
			work.scrollIntoView({
				behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
				block: 'start'
			});
		}
	}

	function projectFromHash() {
		return projects.find(function (project) { return '#' + project.article.id === location.hash; });
	}

	document.getElementById('main').before(nav);
	work.classList.add('project-browser');
	selectProject(projectFromHash() || projects[0], false);
	if (location.hash === '#one') selectProfile(false);
	window.addEventListener('hashchange', function () {
		if (location.hash === '#one') {
			selectProfile(true);
			return;
		}
		var selected = projectFromHash();
		if (selected || !location.hash) selectProject(selected || projects[0], Boolean(selected));
	});
	document.addEventListener('click', function (event) {
		if (!nav.contains(event.target)) closeMenu();
	});
	nav.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && openGroup) {
			var button = openGroup.button;
			button.focus();
			closeMenu();
		}
	});
})();

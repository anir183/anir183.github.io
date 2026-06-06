let _spaNavigation = $state(false);

export function markSpaNavigation() {
	_spaNavigation = true;
}

export function isSpaNavigation() {
	return _spaNavigation;
}

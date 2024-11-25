miscCityElements_FloatingPlatform.prototype.tryDestroy = function(orig) {
	return function() {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			this.destroy();
			return true;
		}
		return orig.apply(this, arguments)
	}
} (miscCityElements_FloatingPlatform.prototype.tryDestroy)
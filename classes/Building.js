Building.prototype.onClick = function(orig) {
	return function() {
		let oldsp = this.info.specialInfo
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			this.info.specialInfo = []
		}
		orig.apply(this, arguments)
		this.info.specialInfo = oldsp
	}
} (Building.prototype.onClick)

Building.prototype.tryDestroy = function(orig) {
	return function(warnIfNot) {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			this.destroy();
			return true;
		}
		return orig.apply(this, arguments)
	}
} (Building.prototype.tryDestroy)

Building.prototype.destroy = function(orig) {
	return function() {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			Permanent.destroyingDisableMoveDown = true
		}
		return orig.apply(this, arguments)
	}
} (Building.prototype.destroy)
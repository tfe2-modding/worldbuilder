Permanent.prototype.createWindow = function(orig) {
	return function() {
		let ret = orig.apply(this, arguments)
		if (this.city.worldBuilder && this.city.worldBuilder.enabled && WorldBuilder.debugPanelEnabled) {
			this.city.worldBuilder.showDebugPanel(this)
		}
		return ret
	}
} (Permanent.prototype.createWindow)
progress_Unlocks.prototype.getUnlockState = function(orig) {
	return function(element) {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			return progress_UnlockState.Researched
		}
		return orig.apply(this, arguments)
	}
} (progress_Unlocks.prototype.getUnlockState)
WorldResource.prototype.onHover = function(orig) {
	return function() {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			Building.prototype.onHover.apply(this, arguments)
		} else orig.apply(this, arguments)
	}
} (WorldResource.prototype.onHover || (()=>{}))

WorldResource.prototype.onClick = function(orig) {
	return function() {
		if(this.city.worldBuilder && this.city.worldBuilder.enabled && (this.city.game.keyboard.down[46] || this.city.buildingMode == BuildingMode.Destroy || this.city.buildingMode == BuildingMode.DestroyLeavingHole)) {
			if(!this.city.progress.story.disableDestroy) {
				if(this.city.gui.windowRelatedTo == this) {
					this.city.gui.closeWindow();
				}
				this.destroy()
				this.city.game.audio.playSound(this.city.game.audio.buttonFailSound);
			} else {
				this.city.gui.showSimpleWindow(common_Localize.lo("no_destroy_allowed"),null,true);
			}
		} else return orig.apply(this, arguments)
	}
} (WorldResource.prototype.onClick)
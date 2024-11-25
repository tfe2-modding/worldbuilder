gui_CityGUI.prototype.addAllMaterialsInfo = function(orig) {
	return function() {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			try {
				this.city.worldBuilder.addEditableMaterialsInfo()
			} catch(e) {
				console.error(e)
				throw e
			}
		} else return orig.apply(this, arguments)
	}
} (gui_CityGUI.prototype.addAllMaterialsInfo)
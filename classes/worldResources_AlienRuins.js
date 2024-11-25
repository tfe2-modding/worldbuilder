worldResources_AlienRuins.prototype.createWindowAddBottomButtons = function(orig) {
	return function() {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,2)))
			this.city.gui.windowAddInfoText("Change Appearance")
			let alienRuinSprites = ["spr_alienruins", "spr_alienruins_2", "spr_alienruins_3"]
			for (let i = 0; i < alienRuinSprites.length; i++) {
				let sprite = alienRuinSprites[i]
				if (i%8 == 0) this.city.gui.windowSimpleButtonContainer = null
				let button = this.city.gui.windowAddSimpleButton(Resources.getTexture(sprite), ()=>{
					this.spriteName = sprite
					this.postLoad()
				})
				button.container.padding = { left : 1, right : 2, top : 1, bottom : -2}
				button.rect.width = 22
				button.rect.height = 22
			}
			this.city.gui.windowSimpleButtonContainer = null
			this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,2)))
			var destroyButton = null;
			var isConfirmButton = false;
			destroyButton = this.city.gui.windowAddBottomButtons([
				{
					text: common_Localize.lo("destroy"),
					action: () => {
						if(isConfirmButton) {
							this.city.gui.closeWindow();
							this.destroy();
						} else {
							destroyButton.setText(common_Localize.lo("really_destroy"));
							isConfirmButton = true;
						}
					}
				},
			])[0];
		} else return orig.apply(this, arguments)
	}
} (worldResources_AlienRuins.prototype.createWindowAddBottomButtons)
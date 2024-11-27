World.prototype.handleMouse = function(orig) {
	return function(mouse) {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			if(mouse.get_cityX() >= this.rect.x && mouse.get_cityX() < this.rect.x + this.rect.width && mouse.get_cityY() >= this.rect.y && mouse.get_cityY() < this.rect.y + this.rect.height) {
				let claim = mouse.claimMouse(this,null,false)
				if (claim._hx_index == 1) {
					this.city.game.audio.playSound(this.city.game.audio.buildingClickSound)
					this.createWindow()
				} else if (claim._hx_index == 0) {
					return true
				}
			}
		}
		return orig.apply(this, arguments)
	}
} (World.prototype.handleMouse)

World.prototype.createWindow = function() {
	if (this.window != null) {
		this.closeWindow()
	}
	this.city.gui.createWindow("world_editing_window")
	let info = WorldBuilder.worldsInfo.find(e=>e.appearance==this.appearance) || WorldBuilder.fallbackWorldType
	this.city.gui.windowAddTitleText(info.name)
	this.city.gui.windowAddInfoText(info.description)
	this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,2)))
	this.city.gui.windowAddInfoText("Citizens")
	this.city.gui.windowAddSimpleButton(null, ()=>this.removeCitizens(100), "[red]-100")
	this.city.gui.windowAddSimpleButton(null, ()=>this.removeCitizens(10), "[red]-10")
	this.city.gui.windowAddSimpleButton(null, ()=>this.removeCitizens(1), "[red]-1")
	this.city.gui.windowAddSimpleButton(null, ()=>this.removeCitizens(), "Clear All")
	this.city.gui.windowAddSimpleButton(null, ()=>this.spawnCitizens(1), "+1")
	this.city.gui.windowAddSimpleButton(null, ()=>this.spawnCitizens(10), "+10")
	this.city.gui.windowAddSimpleButton(null, ()=>this.spawnCitizens(100), "+100")
	this.city.gui.windowSimpleButtonContainer = null
	this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,2)))
	this.city.gui.windowAddInfoText("Decoration")
	for (let i = 0; i < Resources.decorationsInfo.length; i++) {
		let info = Resources.decorationsInfo[i]
		if (i%8 == 0) this.city.gui.windowSimpleButtonContainer = null
		let button = this.city.gui.windowAddSimpleButton(Resources.getTexture(info.textureName+"@0,0,20,20"), ()=>{
			for (let i = 0; i < this.decorations.length; i++) {
				if (info.textureName == "spr_removedecoration") {
					this.removeDecoration(i)
				} else {
					this.setDecoration(info.textureName, i)
				}
			}
		})
		button.container.padding = { left : 1, right : 2, top : 1, bottom : -2}
		button.rect.width = 22
		button.rect.height = 22
	}
	this.city.gui.windowSimpleButtonContainer = null
	this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,2)))
	this.city.gui.windowAddInfoText("Appearance")
	for (let i = 0; i < WorldBuilder.worldsInfo.length; i++) {
		let e = WorldBuilder.worldsInfo[i]
		if (i%5 == 0) this.city.gui.windowSimpleButtonContainer = null
		let button = this.city.gui.windowAddSimpleButton(graphics_WorldImage.makeWorldSprite(new random_SeedeableRandom(this.seed), 40, 20, e.appearance).sprite.texture, ()=>{
			this.appearance = e.appearance
			this.worldSprite.texture = graphics_WorldImage.makeWorldSprite(new random_SeedeableRandom(this.seed), this.rect.width, this.rect.height, e.appearance).sprite.texture
			this.createWindow()
		})
		button.container.padding = { left : 2, right : 3, top : 2, bottom : -1}
		button.rect.width = 44
		button.rect.height = 24
	}
	this.city.gui.windowSimpleButtonContainer = null
	gui_windowParts_FullSizeTextButton.create(this.city.gui, ()=>{
		let random = new random_SeedeableRandom()
		this.seed = random.seed
		this.worldSprite.texture = graphics_WorldImage.makeWorldSprite(new random_SeedeableRandom(this.seed), this.rect.width, this.rect.height, this.appearance).sprite.texture
		this.createWindow()
	}, this.city.gui.windowInner, ()=>"Randomize Shape", this.city.gui.innerWindowStage)
	this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,4)))
	this.city.gui.windowAddInfoText("Other")
	gui_windowParts_FullSizeTextButton.create(this.city.gui, ()=>{
		if (this.isUnbuildableFromAliens) {
			this.makeBuildableAliens()
		} else {
			this.setUnbuildableAliens()
		}
	}, this.city.gui.windowInner, ()=>this.isUnbuildableFromAliens ? "Disable Alien Protection" : "Enable Alien Protection", this.city.gui.innerWindowStage)
	this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,2)))
	gui_windowParts_FullSizeTextButton.create(this.city.gui, ()=>{
		this.isProtectedKey = !this.isProtectedKey
	}, this.city.gui.windowInner, ()=>this.isProtectedKey ? "Disable Secret Society Protection" : "Enable Secret Society Protection", this.city.gui.innerWindowStage)
	this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,6)))
	let selectedSprite = new gui_NinePatch(Resources.getTexture("spr_selectedbuilding"),10,this.rect.width + 2,this.rect.height + 2);
	selectedSprite.position.set(this.rect.x - 1,this.rect.y - 1);
	this.city.farForegroundStage.addChild(selectedSprite);
	this.city.gui.windowOnDestroy = () => {
		selectedSprite.destroy();
		selectedSprite = null;
	};
	var destroyButton = null;
	var isConfirmButton = false;
	destroyButton = this.city.gui.windowAddBottomButtons([{ text : common_Localize.lo("destroy"), action : () => {
		if(isConfirmButton) {
			this.city.gui.closeWindow();
			this.destroy();
		} else {
			destroyButton.setText(common_Localize.lo("really_destroy"));
			isConfirmButton = true;
		}
	}}])[0];
	if (WorldBuilder.debugPanelEnabled) {
		this.city.worldBuilder.showDebugPanel(this)
	}
}

World.prototype.spawnCitizens = function(number) {
	for (let i = 0; i < number; i++) {
		this.city.simulation.createCitizen(this,random_Random.getFloat(18,40));
	}
}

World.prototype.removeCitizens = function(number=Number.MAX_SAFE_INTEGER) {
	let removed = 0
	let i = this.city.simulation.citizens.length
	while (i > 0) {
		i--
		if (this.city.simulation.citizens[i].onWorld != this) continue
		this.city.simulation.citizens[i].tryRemove(true)
		removed++
		if (removed == number) break
	}
}

World.prototype.destroy = function() {
	if (this.worldGlow) this.worldGlow.destroy()
	this.cleanup()
	for (let i = 0; i < this.decorations.length; i++) {
		if (this.decorations[i]) this.decorations[i].destroy()
	}
	for (let x = 0; x < this.permanents.length; x++) {
		for (let y = 0; y < this.permanents[x].length; y++) {
			if (this.permanents[x][y] != null) this.permanents[x][y].destroy()
		}
	}
	let i = this.city.simulation.citizens.length
	while (i > 0) {
		i--
		if (this.city.simulation.citizens[i].onWorld == this) this.city.simulation.citizens[i].tryRemove(true)
	}
	this.city.worlds.splice(this.city.worlds.indexOf(this), 1)
	var bottomWorld = common_ArrayExtensions.whereMax(this.city.worlds,function(wrld) {
		return wrld.rect.height == 0;
	},function(wrld) {
		return wrld.rect.width;
	});
	bottomWorld.updateVerticalPositioningOfInvisibleWorld()
	if (this.city.simulation.winter) {
		let i = this.city.furtherForegroundStage.children.length
		while (i > 0) {
			i--
			let child = this.city.furtherForegroundStage.children[i]
			if (child.isSprite) {
				this.city.furtherForegroundStage.removeChildAt(i)
			}
		}
		this.city.simulation.winter.snow.hasCreated = false
	}
}

World.prototype.updateVerticalPositioningOfInvisibleWorld = function() {
	let max
	for (let i = 0; i < this.city.worlds.length; i++) {
		let world = this.city.worlds[i]
		if (this == world) continue
		if (max == null || max < world.rect.y + world.rect.height + 100) {
			max = world.rect.y + world.rect.height + 100
		}
	}
	while (max > this.rect.y) {
		this.rect.y += 20
		for (let x = 0; x < this.permanents.length; x++) {
			if (this.permanents[x].length > 0) this.permanents[x].splice(0, 0, null)
		}
	}
	downRoutine: while (max < this.rect.y) {
		for (let x = 0; x < this.permanents.length; x++) {
			if (this.permanents[x].length > 0) {
				if (this.permanents[x][0] != null) break downRoutine
			}
		}
		for (let x = 0; x < this.permanents.length; x++) {
			if (this.permanents[x].length > 0) this.permanents[x].splice(0, 1)
		}
		this.rect.y -= 20
	}
}
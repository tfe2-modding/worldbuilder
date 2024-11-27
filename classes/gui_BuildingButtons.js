gui_BuildingButtons.prototype.createBuildingCategoryButtons = function(orig) {
	return function() {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			let worldsButton
			let worldsList = WorldBuilder.worldsInfo
			let worldButtonList = worldsList.map(e=>{
				e.sprite = graphics_WorldImage.makeWorldSprite(new random_SeedeableRandom(0), 20, 20, e.appearance).sprite.texture
				return {
					name: e.name,
					description: e.description+"\nAlt+Click or Middle Click to pan the screen with this selected.",
					sprite: graphics_WorldImage.makeWorldSprite(new random_SeedeableRandom(), 100, 40, e.appearance).sprite.texture,
					onClick: ()=>{
						if (this.city.builder && this.city.builder.builderType._hx_index == BuilderType.Island._hx_index && this.city.builder.builderType.islandInfo == e) {
							this.city.builder.cancel()
						} else {
							this.city.builder = new Builder(this.city, this.city.builderStage, BuilderType.Island(e))
						}
					},
					isActive: ()=>{
						return this.city.builder && this.city.builder.builderType.islandInfo == e
					},
					buttonSprite: "spr_islandbutton",
				}
			})
			worldsButton = this.addCategoryDropdown("Islands", "Floating islands you can build on and your citizens stand on.", null, "spr_icon_island", ()=>{
				this.toggleCategoryDropdown("Worlds", worldsButton, worldButtonList)
			})
			let buildingsButton
			let categories = Array.from(Resources.buildingCategoriesInfo)
			categories.push({
				name: "None",
				displayName: "Uncategorized",
				description: "All buildings that cannot be found in a category.",
				image: "spr_icon_unknown",
				onClick: () => {
					this.closeCategoryDropdown()
					this.showCategoryDropdown(buildingsButton, Resources.buildingInfoArray
						.filter(b=>b.className != "CustomHouse" && (b.category == "None" || categories.findIndex(e=>e.name == b.category.split("_").pop()) == -1))
						.map(e=>this.addBuildingButton.bind(this, $hxClasses["buildings."+e.className], progress_UnlockState.Researched))
					)
				}
			})
			for (let i = 0; i < Resources.buildingInfoArray.length; i++) {
				let building = Resources.buildingInfoArray[i]
				if (building.category) {
					let c = building.category.split("_")
					if (c.length > 1) {
						let n = c.pop()
						if (categories.findIndex(e=>e.name==n) == -1) categories.push({
							name: n,
							displayName: building.name,
							description: building.description,
							image: $hxClasses["buildings."+building.className].spriteName + "@0,0,20,20"
						})
					}
				}
			}
			buildingsButton = this.addCategoryDropdown("Buildings", "Click to find a building", Resources.buildingInfoArray.map(e=>{
				if (e.className == "CustomHouse") {
					return this.createCustomBuildingButton.bind(this)
				} else {
					return this.addBuildingButton.bind(this, $hxClasses["buildings."+e.className], progress_UnlockState.Researched)
				}
			}), "spr_icon_buildings", ()=>{
				this.toggleCategoryDropdown("Building Categories", buildingsButton, [
					...categories.filter(e=>Resources.buildingInfoArray.findIndex(b=>b.category.split("_").pop() == e.name)>-1).map(e=>({
						name: e.displayName,
						description: e.description,
						sprite: Resources.getTexture(e.image),
						onClick: e.onClick || (()=>{
							this.closeCategoryDropdown()
							this.showCategoryDropdown(buildingsButton, Resources.buildingInfoArray.filter(b=>b.category.split("_").pop() == e.name).map(e=>this.addBuildingButton.bind(this, $hxClasses["buildings."+e.className], progress_UnlockState.Researched)))
						})
					})),
					this.createCustomBuildingButton.bind(this),
				])
			}, "Show all buildings", "Building Categories")
			let bridgesList = []
			for (let i = 0; i < Resources.bridgesInfo.length; i++) {
				let e = Resources.bridgesInfo[i]
				bridgesList.push(this.addBridgeButton.bind(this, e, progress_UnlockState.Researched, false))
			}
			bridgesList.push(this.addFloatingPlatformButton.bind(this))
			let bridgesButton = this.addCategoryDropdown("Bridges & Platforms", "Floating platforms and multiple types of bridges", null, "spr_icon_bridges", ()=>{
				this.toggleCategoryDropdown("Bridges & Platforms", bridgesButton, bridgesList)
			})
			let resourceList = []
			for (let i = 0; i < Resources.worldResourcesInfo.length; i++) {
				let e = Object.assign({}, Resources.worldResourcesInfo[i])
				if (!e.initialResources || e.initialResources <= 0) {
					let growable = Object.assign({}, e)
					let tryTextureName = growable.textureName.replace(/\@.+$/, "_grow@22,0,20,20")
					if (Resources.getTexture(tryTextureName.split("@")[0]).valid) growable.textureName = tryTextureName
					let grown = e
					grown.initialGrow = 100
					grown.description = "Place a fully-grown "+grown.name.toLowerCase()+"."
					resourceList.push(this.addWorldResourceButton.bind(this, growable))
					resourceList.push(this.addWorldResourceButton.bind(this, grown))
				} else {
					resourceList.push(this.addWorldResourceButton.bind(this, e))
				}
			}
			resourceList.push(this.addWorldResourceButton.bind(this, {
				className: "AlienRuins",
				name: common_Localize.lo("alien_ruins"),
				description: "Ancient ruins that can have valueable resources hidden in them.",
				textureName: "spr_alienruins_2"
			}))
			resourceList.push(this.addWorldResourceButton.bind(this, {
				className: "ComputerAlienRuins",
				name: "Computer Alien Ruins",
				description: "Ancient ruins that can have alien technology hidden in them.",
				textureName: "spr_alienruins_3"
			}))
			let worldResourcesButton
			worldResourcesButton = this.addCategoryDropdown("World Resources", common_Localize.lo("categories/Decoration & Nature.description"), null, "spr_nature", ()=>{
				this.toggleCategoryDropdown("World Resources", worldResourcesButton, resourceList)
			})
			let decorationList = Array.from(Resources.decorationsInfo).sort(a=>(a.textureName=="spr_removedecoration")*-2+1).map(e=>this.addDecorationButton.bind(this, e))
			let decorationsButton = this.addCategoryDropdown("Decorations", "Grass, flowers, snow, lanterns, and other ground decorations.", null, "spr_icon_decorations", ()=>{
				this.toggleCategoryDropdown("Decorations", decorationsButton, decorationList)
			})
			// this.addCategoryDropdown("Planets", "Planets and other floating sprites in the background.", null, "spr_icon_planets", ()=>{})
			let buildingModeButton
			function updateBuildingMode(city, actuallyUpdate) {
				if (actuallyUpdate) {
					let isMulti = city.buildingMode == BuildingMode.Drag || city.buildingMode == BuildingMode.DragReplace
					let isDelete = city.buildingMode == BuildingMode.Destroy || city.buildingMode == BuildingMode.DestroyLeavingHole
					let isSingle = !isMulti && !isDelete
					if (isSingle) {
						city.buildingMode = BuildingMode.DragReplace
					} else {
						city.buildingMode = BuildingMode.Replace
					}
				}
				let isMulti = city.buildingMode == BuildingMode.Drag || city.buildingMode == BuildingMode.DragReplace
				let isDelete = city.buildingMode == BuildingMode.Destroy || city.buildingMode == BuildingMode.DestroyLeavingHole
				let isSingle = !isMulti && !isDelete
				if (isSingle) {
					buildingModeButton.updateTexture(Resources.getTexture("spr_icon_buildingmode_replace"))
					buildingModeButton.onHover = ()=>{
						city.gui.tooltip.setText(buildingModeButton, common_Localize.lo("build_mode_replace_explanation"), common_Localize.lo("build_mode_replace"))
					}
				} else if (isDelete) {
					buildingModeButton.updateTexture(Resources.getTexture("spr_icon_buildingmode_destroy"))
					buildingModeButton.onHover = ()=>{
						city.gui.tooltip.setText(buildingModeButton, common_Localize.lo("build_mode_destroy_explanation"), common_Localize.lo("build_mode_destroy"))
					}
				} else if (isMulti) {
					buildingModeButton.updateTexture(Resources.getTexture("spr_icon_buildingmode_dragreplace"))
					buildingModeButton.onHover = ()=>{
						city.gui.tooltip.setText(buildingModeButton, common_Localize.lo("build_mode_multi_replace_explanation"), common_Localize.lo("build_mode_multi_replace"))
					}
				}
			}
			buildingModeButton = this.addCategoryDropdown(common_Localize.lo("build_mode_replace"), common_Localize.lo("build_mode_replace_explanation"), [
				{
					name: common_Localize.lo("build_mode_replace"),
					description: common_Localize.lo("build_mode_replace_explanation"),
					sprite: Resources.getTexture("spr_icon_buildingmode_replace"),
					onClick: (bm)=>{
						this.city.buildingMode = BuildingMode.Replace
						this.closeCategoryDropdown()
						updateBuildingMode(this.city, false)
					}
				},
				{
					name: common_Localize.lo("build_mode_multi_replace"),
					description: common_Localize.lo("build_mode_multi_replace_explanation"),
					sprite: Resources.getTexture("spr_icon_buildingmode_dragreplace"),
					onClick: (bm)=>{
						this.city.buildingMode = BuildingMode.DragReplace
						this.closeCategoryDropdown()
						updateBuildingMode(this.city, false)
					}
				},
				{
					name: common_Localize.lo("build_mode_destroy"),
					description: common_Localize.lo("build_mode_destroy_explanation"),
					sprite: Resources.getTexture("spr_icon_buildingmode_destroy"),
					onClick: (bm)=>{
						this.city.buildingMode = BuildingMode.Destroy
						this.closeCategoryDropdown()
						updateBuildingMode(this.city, false)
					}
				},
			], "spr_icon_buildingmode_replace", ()=>{
				updateBuildingMode(this.city, true)
			})
			updateBuildingMode(this.city, false)
			this.addManagementButtons();
			// this.addCategoryDropdown("Goals", "Edit scenario objectives and tasks.", null, "spr_icon_goals", ()=>{})
			this.addCategoryDropdown("Export", "Export this island configuration as a scenario.", null, "spr_icon_export", ()=>{
				this.city.worldBuilder.createExportWindow()
			}, null, ()=>this.city.gui.windowRelatedTo=="exportAsScenario")
		} else orig.call(this)
	}
} (gui_BuildingButtons.prototype.createBuildingCategoryButtons)

gui_BuildingButtons.prototype.showManagementOptions = function(orig) {
	return function(parentElement) {
		this.closeCategoryDropdown()
		let inviteCitizens = this.city.progress.story.storyInfo.useInviteCitizens
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) this.city.progress.story.storyInfo.useInviteCitizens = true
		orig.apply(this, arguments)
		this.city.progress.story.storyInfo.useInviteCitizens = inviteCitizens
	}
} (gui_BuildingButtons.prototype.showManagementOptions)

gui_BuildingButtons.prototype.showCategoryDropdown = function(buildingModeButton, allButtons) {
	this.buildingInCategoryButtons.padding.left = buildingModeButton.rect.x
	this.closeManagementOptions()
	for (let i = 0; i < allButtons.length; i++) {
		let bm = allButtons[i];
		if (typeof bm == "function") {
			bm()
			continue
		}
		this.makeSpaceForBuildingButton();
		let imgButton = new gui_ImageButton(this.gui,this.gui.stage,this.buildingInCategoryButtonsCol,()=>{
			if (bm.onClick) bm.onClick.apply(imgButton, bm)
		},bm.sprite,bm.isActive || (()=>false),() => {
			this.gui.tooltip.setText(imgButton,bm.description,bm.name)
		},bm.backSprite,bm.buttonSprite);
		this.buildingInCategoryButtonsCol.insertChild(imgButton,0);
	}
}

gui_BuildingButtons.prototype.toggleCategoryDropdown = function(name, buildingModeButton, allButtons) {
	if(this.shownCategory != name) {
		this.closeCategoryDropdown();
		this.showCategoryDropdown(buildingModeButton, allButtons);
		this.shownCategory = name;
	} else {
		this.closeCategoryDropdown();
	}
}

gui_BuildingButtons.prototype.addCategoryDropdown = function(name, description, allButtons, sprite, onClick=()=>{}, moredesc=description, morename=name) {
	var _gthis = this;
	var buildingModeButton;
	buildingModeButton = new gui_ImageButton(this.gui,this.gui.stage,this.categoryButtons,function() {
		onClick.apply(this, arguments)
	},Resources.getTexture(sprite),typeof morename == "function" ? morename : function() {
		return _gthis.shownCategory == morename;
	},function(){
		_gthis.gui.tooltip.setText(buildingModeButton,description,name);
	},null,"spr_transparentbutton");
	this.categoryButtons.addChild(buildingModeButton);
	if (allButtons) {
		var moreBuildingModesButton = new gui_ImageButton(this.gui,this.gui.stage,this.categoryButtons,this.toggleCategoryDropdown.bind(this, name, buildingModeButton, allButtons),Resources.getTexture("spr_morebuildingmodes_arrowup"),function() {
			return _gthis.shownCategory == name;
		},function() {
			_gthis.gui.tooltip.setText(moreBuildingModesButton,moredesc);
		},null,"spr_morebuildingmodebuttons");
		this.categoryButtons.addChild(moreBuildingModesButton);
	}
	if(this.shownCategory != "") {
		this.shownCategory = ""
	}
	return buildingModeButton
}

gui_BuildingButtons.prototype.closeCategoryDropdown = function() {
	for (let i = 0; i < this.buildingInCategoryButtons.children.length; i++) {
		this.buildingInCategoryButtons.children[i].clear()
	}
	this.buildingInCategoryButtons.clear();
	this.buildingInCategoryButtonsColAmount = 0
	this.buildingInCategoryButtonsCol = null
	this.shownCategory = "";
}
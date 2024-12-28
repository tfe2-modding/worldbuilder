class WorldBuilder {
	// tfe2 compat
	static __name__ = "WorldBuilder"
	// save version
	static version = 1
	// worldsInfo.json
	static worldsInfo = []
	// settings
	static debugPanelEnabled = false

	constructor(city) {
		this.city = city
		this.enabled = false
		this.materials = new Materials()
	}

	update(timeMod) {

	}
	// add the debug content to an existing window
	showDebugPanel(element) {
		this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,16)))
		this.city.gui.windowAddInfoText("Debug")
		this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,8)))
		let addContent = (o) => {
			for (const [k, v] of Object.entries(o)) {
				if (typeof v == "function") {
					gui_windowParts_FullSizeTextButton.create(this.city.gui, ()=>{
						v.call(element)
					}, this.city.gui.windowInner, ()=>{
						if (v.length > 0) return k+"(..."+v.length+"...)"
						return k+"()"
					}, this.city.gui.innerWindowStage)
					this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,2)))
				}
				if (typeof v == "boolean") {
					this.city.gui.windowAddInfoText(k+":")
					gui_CheckboxButton.createSettingButton(this.city.gui,this.city.gui.innerWindowStage,this.city.gui.windowInner,()=>{
						element[k] = !element[k]
					},()=>element[k],k)
					this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,2)))
				}
				if (typeof v == "number") {
					this.city.gui.windowAddInfoText(k+":")
					this.city.gui.windowInner.addChild(new gui_NumberSelectControl(this.city.gui,this.city.gui.innerWindowStage,this.city.gui.windowInner,null,()=>-1e308,()=>1e308,v,(v)=>{
						element[k] = v
					},()=>{
						let v = prompt("Please enter a number", element[k])
						if (v != null) return element[k] = parseFloat(v)
						else return element[k]
					},"Click to set the value directly",1,300))
					this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,2)))
				}
				if (typeof v == "string") {
					this.city.gui.windowAddInfoText(k+":")
					gui_windowParts_FullSizeTextButton.create(this.city.gui, ()=>{
						let v = prompt("Please enter a string", element[k])
						if (v != null) element[k] = v
					}, this.city.gui.windowInner, ()=>JSON.stringify(element[k]), this.city.gui.innerWindowStage)
					this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,2)))
				}
			}
			this.city.gui.windowInner.addChild(new gui_GUISpacing(this.city.gui.windowInner,new common_Point(2,16)))
		}
		addContent(element)
		let ancestors = element.ancestors || [element.__class__]
		for (let i = 0; i < ancestors.length; i++) {
			let ancestor = ancestors[i]
			this.city.gui.windowAddInfoText(ancestor.__name__)
			addContent(ancestor.prototype)
		}
		this.city.gui.setWindowPositioning(gui_WindowPosition.TopLeft)
	}
	// add gui_NumberSelectControls for all the resources based on MaterialsHelper.materialNames
	addEditableMaterialsInfo() {
		this.city.gui.materialsInfo = new gui_ContainerWithScrollbar(1000,this.city.game.rect.height,this.city.gui,this.city.gui.stage,this.city.gui.cityInfo,new common_Point(0,0),new common_FPoint(0,0),null,null,null,0);
		this.city.gui.materialsInfo.disableScrollbar = true;
		this.city.gui.materialsInfoInner = new gui_GUIContainer(this.city.gui,this.city.gui.stage,this.city.gui.cityInfo,new common_Point(0,0),new common_FPoint(0,0));
		this.city.gui.materialsInfo.setInnerContainer(this.city.gui.materialsInfoInner);
		this.city.gui.materialsInfoInner.direction = gui_GUIContainerDirection.Vertical;
		this.city.gui.cityInfo.addChild(this.city.gui.materialsInfo);
		let controls = []
		// they are only out of order because of knowledge being at the end. hopefully this never changes
		let materialNames = Array.from(MaterialsHelper.materialNames)
		materialNames.splice(3, 0, materialNames.splice(materialNames.length - 1 - MaterialsHelper.modMaterials.length, 1)[0])
		for (let i = 0; i < materialNames.length; i++) {
			let k = materialNames[i]
			if (k == "cacao" || k == "chocolate") continue
			let v = this.materials[k]
			let control = new gui_NumberSelectControl(this.city.gui,this.city.gui.stage,this.city.gui.materialsInfoInner,null,()=>0,()=>Number.MAX_SAFE_INTEGER,Math.floor(v),(v)=>{
				this.materials[k] = v
			},()=>{
				let v = prompt("Please enter a number", Math.floor(this.materials[k]))
				if (v != null) return parseInt(v)
				else return Math.floor(this.materials[k])
			},"Click to set value directly",1,31)
			let spriteContainer = new gui_ContainerHolder(control.numberButton.container,this.city.gui.stage,new PIXI.Sprite(Resources.getTexture("spr_resource_"+k.toLowerCase())))
			spriteContainer.padding = {left: -1, top: -1, right: 1, bottom: 1}
			control.numberButton.container.insertChild(spriteContainer,0);
			control.numberButton.buttonTextures = Resources.getTextures("spr_transparentbutton_info", 3)
			control.numberButton.buttonPatch.textureSets = []
			control.numberButton.buttonPatch.texture = control.numberButton.buttonTextures[0];
			control.numberButton.buttonPatch.updateTextures(false);
			control.numberButton.buttonPatch.texture = control.numberButton.buttonTextures[1];
			control.numberButton.buttonPatch.updateTextures(false);
			control.numberButton.buttonPatch.texture = control.numberButton.buttonTextures[2];
			control.numberButton.buttonPatch.updateTextures(false);
			control.numberButton.buttonPatch.setTextureSet(0);
			control.numberButton.container.updateSize = function(orig) {
				return function() {
					orig.apply(this)
					for (let i = 0; i < controls.length; i++) {
						let nb = controls[i].numberButton
						if (nb && nb.container && nb.container.minWidth < this.minWidth) nb.container.minWidth = this.minWidth
						orig.call(nb.container)
					}
				}
			} (gui_GUIContainer.prototype.updateSize)
			// todo: make a custom number update type instead of whatever the hell this is
			controls.push(control)
			this.city.gui.materialsInfoInner.addChild(control)
		}
		this.city.gui.materialsInfo.setScrollPosition(new common_Point(0,this.city.gui.materialsInfoScrollY));
	}
	// toggles WorldBuilder mode on or off
	setEnabled(enable) {
		if (this.enabled == enable) return
		this.enabled = enable
		if (this.enabled) {
			this.city.progress.sandbox.everPlayedWithUnlimitedResources = true
			common_Achievements.setEnabled(false)
			this.materials = this.city.materials.copy()
			for (let i = 0; i < MaterialsHelper.materialNames.length; i++) {
				let mat = MaterialsHelper.materialNames[i]
				this.city.materials[mat] = NaN
				if (this.city.progress.sandbox.unlimitedResources) {
					this.materials[mat] -= 10000000
				}
			}
			this.city.progress.story.disableDestroy = false
			this.city.gui.clearTutorial()
			this.city.postCreateBuilder = null
			if (this.city.builder) this.city.builder.fixBuilder()
			this.city.gui.cityInfo.removeChild(this.city.gui.materialsInfo, true)
			this.city.gui.addAllMaterialsInfo()
		} else {
			this.city.materials = this.materials.copy()
			if (this.city.progress.sandbox.unlimitedResources) {
				for (let i = 0; i < MaterialsHelper.materialNames.length; i++) {
					let mat = MaterialsHelper.materialNames[i]
					this.city.materials[mat] += 10000000
				}
			}
			if (this.city.builder && this.city.builder.builderType._hx_index == BuilderType.Island._hx_index) {
				this.city.builder.cancel()
			}
			this.city.gui.closeWindow()
			this.city.gui.cityInfo.removeChild(this.city.gui.materialsInfo, true)
			this.city.gui.addAllMaterialsInfo()
		}
		this.city.gui.refreshCategoryBuildingsShown()
		if (enable && !localStorage["dt:worldBuilder"]) {
			localStorage["dt:worldBuilder"] = true
			this.city.gui.showSimpleWindow(`This seems to be the first time you've opened the mod, so heres some basic explanation on how this mode is different than Unlimited resources:

	-  You can place and remove world resources like forests and rocks and even alien ruins by using the delete building mode.
	-  Most buildings do not follow their placement rules (you can put floating stuff wherever you want).
	-  All upgrades and buildings are unlocked, even seasonal ones and unused ones.
	-  You can place new islands wherever you want.
	-  Clicking on an island will allow you to edit basic properties about it, as well as delete it.
	-  You can edit the amount of materials you have in the lower right.

Something important worth noting is that this mod is very early in development, things might break. Please let me know if you run into any bugs while using it. Enjoy!`, "Welcome to WorldBuilder!")
			this.city.set_pauseGame(true)
			this.city.gui.pausedForWindow = true
		}
	}
	checkWorldlessBuildings() {
		let permanents = this.city.worlds[this.city.worlds.length-1].permanents
		for (let x = 0; x < permanents.length; x++) {
			if (permanents[x].length == 0) continue
			for (let y = 0; y < permanents[x].length; y++) {
				if (permanents[x][y] != null) return true
			}
		}
		return false
	}
	checkFloatingPlatforms() {
		return this.city.miscCityElements.allMiscElements.length > 0
	}
	checkForCustomBuildings() {
		for (let i = 0; i < this.city.worlds.length - 1; i++) {
			let permanents = this.city.worlds[i].permanents
			for (let x = 0; x < permanents.length; x++) {
				if (permanents[x].length == 0) continue
				for (let y = 0; y < permanents[x].length; y++) {
					let permanent = permanents[x][y]
					if (permanent == null) continue
					if (permanent.className == "buildings.CustomHouse") return true
					if (permanent.currentRecolor != null && permanent.currentRecolor != -1) return true
				}
			}
		}
		return false
	}
	verifyName(name, el) {
		const path = require("path")
		let illegal_names = ["CON", "PRN", "AUX", "NUL",
			"COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
			"LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"]
		if (name == "") {
			return "You must give your "+el.toLowerCase()+" a name"
		} else if (name.match(/[\/\\\:\*\?\"\<\>\|]/gm)) {
			return el+' name cannot contain the following characters: \ / : * ? " < > |'
		} else if (name == "." || name == "..") {
			return el+' name cannot be "." or ".."'
		} else if (name.endsWith(".")) {
			return el+' name cannot end with a period'
		} else if (illegal_names.includes(name.replace(path.extname(name), "").toUpperCase())) {
			return 'You know exactly what you are doing'
		}
	}
	createExportWindow() {
		let gui = this.city.gui
		gui.clearWindowStack()
		gui.addWindowToStack(this.createExportWindow.bind(this))
		gui.createWindow("exportAsScenario")
		gui.windowAddTitleText("Export Scenario")
		let exportWarning = false
		if (this.checkWorldlessBuildings()) {
			exportWarning = true
			gui.windowAddInfoText("There are buildings that are not on an island. Scenarios cannot contain buildings that are not part of an island.")
		}
		if (this.checkFloatingPlatforms()) {
			exportWarning = true
			gui.windowAddInfoText("There are floating platforms or bridges present in your city. Scenarios cannot contain these elements.")
		}
		if (this.checkForCustomBuildings()) {
			exportWarning = true
			gui.windowAddInfoText("There are custom houses or buildings with a custom color. Scenarios cannot contain these buildings.")
		}
		if (this.city.worlds.length <= 1) {
			exportWarning = true
			gui.windowAddInfoText("Scenarios must have at least 1 island.")
		}
		if (exportWarning) {
			gui.windowAddBottomButtons()
			return
		}
		gui.windowAddInfoText("This menu will export the current save file as a scenario.")
		gui.windowInner.addChild(new gui_GUISpacing(gui.windowInner,new common_Point(2,8)))
		let settings = {
			individualCitizens: false,
			flags: {
				disableDying: false,
				disableDestroy: false,
				happinessEnthusiasmLevel: 0,
				hiddenBoost: false,
				disableRocket: false,
			},
			lockPermanents: [],
			isFreePlay: false,
			lockAllPermanents: false,
			backgroundSprites: [],
			speedUpStartNights: false,
			useInviteCitizens: true,
		}

		let createSettingCheckbox = function(settings, key, text, description=false, invert=false) {
			let stage = gui.innerWindowStage
			let parent = gui.windowInner
			let isChecked = invert ? (()=>!settings[key]) : (()=>settings[key])
			var containerButton = new gui_CheckboxButton(gui,stage,parent,()=>settings[key] = !settings[key],isChecked);
			if (description) containerButton.onHover = ()=>gui.tooltip.setText(containerButton,description,text)
			var infoContainer = containerButton.container;
			infoContainer.padding.top = 3;
			infoContainer.padding.left = 3;
			infoContainer.padding.right = 3;
			infoContainer.padding.bottom = 1;
			infoContainer.fillSecondarySize = true;
			if(Main.isMobile) {
				infoContainer.padding.top += 2;
				infoContainer.padding.bottom += 2;
			}
			var checkboxTextures = Resources.getTextures("spr_checkbox",2);
			var spr = new PIXI.Sprite(checkboxTextures[1]);
			var spriteContainerHolder = new gui_ContainerHolder(infoContainer,gui.innerWindowStage,spr,{ left : 0, right : 3, top : 0, bottom : 0},function() {
				var checkboxTextures1 = checkboxTextures;
				var spriteContainerHolder = isChecked() ? 0 : 1;
				spr.texture = checkboxTextures1[spriteContainerHolder];
			});
			infoContainer.addChild(spriteContainerHolder);
			infoContainer.addChild(new gui_TextElement(infoContainer,gui.innerWindowStage,text));
			parent.addChild(containerButton);
			parent.addChild(new gui_GUISpacing(parent,new common_Point(2,2)))
		};

		gui.windowAddInfoText("General settings")
		createSettingCheckbox(settings, "isFreePlay", "Free play")
		createSettingCheckbox(settings, "useInviteCitizens", "Allow inviting citizens")
		createSettingCheckbox(settings, "individualCitizens", "Group citizens", "This will export citizens on each world as one randomized group rather than storing exact ages and positions.", true)
		createSettingCheckbox(settings, "speedUpStartNights", "Speed up start nights", "This will cause the first 3 nights to pass at a much quicker pace than normal.")
		gui.windowInner.addChild(new gui_GUISpacing(gui.windowInner,new common_Point(2,8)))

		gui.windowAddInfoText("Flags")
		createSettingCheckbox(settings.flags, "disableDying", "Disable citizens dying", "Citizens will live forever when this setting is enabled.")
		createSettingCheckbox(settings.flags, "disableDestroy", "Disable destroying buildings")
		createSettingCheckbox(settings.flags, "hiddenBoost", "Extra production boost", "Makes citizens work faster than normal.")
		createSettingCheckbox(settings.flags, "disableRocket", "Disable rocket", "Disables building the rocket entirely.")
		gui.windowInner.addChild(new gui_GUISpacing(gui.windowInner,new common_Point(2,8)))

		gui.windowAddBottomButtons([
			{
				text: "Export to File",
				action: ()=>{
					jsFunctions.saveAs(new Blob([this.exportAsScenario(settings)],{ type : "application/json" }),"Custom_Scenario_"+random_Random.getInt(111111,999999).toString()+".json");
					gui.closeWindow()
				}
			},
			{
				text: "Export to Mod",
				action: ()=>{
					if (Liquid.version >= 2.19) {
						Liquid.openModsMenu(gui, {
							showWorkshopMods: false,
							title: "Select a Mod",
							description: "Select a mod to export your custom scenario to.",
							showRestart: false,
							onSelect: modPath => {
								this.createNewScenarioWindow(modPath, settings)
							},
							bottomButtons: [
								{
									text: "Create a new mod...",
									action: () => {
										this.createNewModWindow((name, author)=>{
											let verif = this.verifyName(name, "Mod")
											if (verif) {
												gui.notify(verif, "Error", 200)
											} else {
												const path = require("path")
												const fs = require("fs")
												const modPath = path.join(_internalModHelpers.path, name)
												if (fs.existsSync(modPath)) {
													gui.notify("A mod already exists with that name", 'Error', 200)
													return
												}
												this.createNewScenarioWindow(modPath, settings, ()=>{
													fs.mkdirSync(modPath)
													fs.writeFileSync(path.join(modPath, "modInfo.json"), JSON.stringify({
														name: name,
														author: author,
													}, null, "\t"))
												})
											}
										})
									}
								}
							]
						})
					} else {
						gui.notify("Your installed copy of Liquid is out-of-date, so this feature does not work. Please update Liquid to version 2.19.", "Liquid is out-of-date.")
					}
				}
			}
		])
	}
	createNewScenarioWindow(modPath, settings={}, preSave=()=>{}) {
		let confirm
		let gui = this.city.gui
		const path = require("path")
		const fs = require("fs")
		this.createNameScenarioWindow((sname, description)=>{
			let verif = this.verifyName(sname, "Scenario")
			if (verif) {
				gui.notify(verif, "Error", 200)
				return
			}
			let didPreSave = false
			if (!fs.existsSync(path.join(modPath, "stories"))) {
				preSave()
				fs.mkdirSync(path.join(modPath, "stories"))
				didPreSave = true
			} else if (confirm != sname && fs.existsSync(path.join(modPath, "stories", sname+".json"))) {
				gui.notify("A scenario already exists with that name. If you would like to overwrite this scenario, please press Confirm again.", "Error", 200)
				confirm = sname
				return
			}
			if (!didPreSave) preSave()
			if (!fs.existsSync(path.join(modPath, "stories.json"))) {
				fs.writeFileSync(path.join(modPath, "stories.json"), "[]")
			}
			let stories = JSON.parse(fs.readFileSync(path.join(modPath, "stories.json")))
			let index = stories.findIndex(e=>e.link == sname+".json")
			if (index == -1) {
				index = stories.length
			}
			stories[index] = {
				link: sname+".json",
				name: sname,
				description: description,
				freePlay: settings.isFreePlay,
			}
			let scenario = this.exportAsScenario(settings)
			fs.writeFileSync(path.join(modPath, "stories.json"), JSON.stringify(stories, null, "\t"))
			fs.writeFileSync(path.join(modPath, "stories", sname+".json"), scenario)
			gui.closeWindow()
			gui.clearWindowStack()
			gui.createWindow()
			gui.windowAddTitleText("Success")
			gui.windowAddInfoText("Your mod has been created and your scenario has been exported to it. You will need to restart the game to test it. Would you like to do that now?")
			gui.windowAddBottomButtons([{
				text: "Restart",
				action: ()=>[
					chrome.runtime.reload()
				]
			}])
		})
	}
	createNewModWindow(onDone) {
		let name = ""
		let author
		let gui = this.city.gui
		gui.createWindow("name_your_mod")
		gui.windowAddTitleText("Create new mod")
		gui.windowAddInfoText("Mod Name:")
		var authorInput = new gui_TextInput(gui.windowInner,gui,this.city.game,"Author");
		var nameInput = new gui_TextInput(gui.windowInner,gui,this.city.game,"Mod Name");
		gui.windowInner.addChild(nameInput);
		nameInput.onInput = v=>{
			name = v
		};
		gui.windowInner.addChild(new gui_GUISpacing(gui.windowInner,new common_Point(2,4)))
		gui.windowAddInfoText("Author:")
		gui.windowInner.addChild(authorInput);
		authorInput.onInput = v=>{
			author = v
		};
		gui.windowInner.addChild(new gui_GUISpacing(gui.windowInner,new common_Point(2,4)))
		gui.windowAddBottomButtons([
			{
				text: "Next",
				action: ()=>onDone(name, author)
			},
		], "Cancel", ()=>{
			gui.clearWindowStack()
			gui.closeWindow()
		})
	}
	createNameScenarioWindow(onDone) {
		let name = ""
		let author
		let gui = this.city.gui
		gui.createWindow("name_your_scenario")
		gui.windowAddTitleText("Name your scenario")
		gui.windowAddInfoText("Scenario Name:")
		var authorInput = new gui_TextAreaInput(gui.windowInner,gui,this.city.game,"Description");
		var nameInput = new gui_TextInput(gui.windowInner,gui,this.city.game,"Scenario Name");
		gui.windowInner.addChild(nameInput);
		nameInput.onInput = v=>{
			name = v
		};
		gui.windowInner.addChild(new gui_GUISpacing(gui.windowInner,new common_Point(2,4)))
		gui.windowAddInfoText("Description:")
		gui.windowInner.addChild(authorInput);
		authorInput.onInput = v=>{
			author = v
		};
		gui.windowInner.addChild(new gui_GUISpacing(gui.windowInner,new common_Point(2,4)))
		gui.windowAddBottomButtons([
			{
				text: "Confirm",
				action: ()=>onDone(name, author)
			},
		], "Cancel", ()=>{
			gui.clearWindowStack()
			gui.closeWindow()
		})
	}
	exportAsScenario(settings) {
		let scenario = {}
		scenario.startGoal = "Start"
		scenario.goals = [{
			name: "Start",
			flags: settings.flags,
			text: "",
			title: "",
		}]
		scenario.viewYFromBottom = null
		scenario.worlds = []
		scenario.initialMaterials = {}
		scenario.lockPermanents = settings.lockPermanents
		scenario.isFreePlay = settings.isFreePlay
		scenario.lockAllPermanents = settings.lockAllPermanents
		scenario.backgroundSprites = settings.backgroundSprites
		scenario.speedUpStartNights = settings.speedUpStartNights
		scenario.useInviteCitizens = settings.useInviteCitizens
		let left = Infinity
		let right = -Infinity
		for (const [k, v] of Object.entries(this.materials)) {
			scenario.initialMaterials[k] = v
		}
		for (let i = 0; i < this.city.worlds.length - 1; i++) {
			let world = this.city.worlds[i]
			let y = world.rect.y + world.rect.height + 10
			if (scenario.viewYFromBottom == null || y > scenario.viewYFromBottom) {
				scenario.viewYFromBottom = y
			}
			let data = {
				rect: {
					x: world.rect.x,
					y: world.rect.y,
					width: world.rect.width,
					height: world.rect.height,
				},
				seed: world.seed,
				worldResources: [],
				buildingStacks: [],
				citizens: [],
				appearance: world.appearance,
				decorations: []
			}
			for (let x = 0; x < world.permanents.length; x++) {
				let buildingStack = []
				for (let y = 0; y < world.permanents[x].length; y++) {
					let permanent = world.permanents[x][y]
					if (permanent == null) continue
					if (permanent.isBuilding) {
						let className = permanent.className.replace("buildings.", "")
						if ((permanent.className == "buildings.LandedExplorationShip" || permanent.className == "buildings.FuturisticHome" || permanent.className == "buildings.Loft") && permanent.mirrored) {
							className += "_mirrored"
						}
						if (permanent.customize) {
							className += "*" + permanent.mirrored + "." + permanent.currentTexture
						}
						buildingStack[y] = className
					} else {
						data.worldResources.push({
							position: x,
							className: permanent.className.replace("worldResources.", "")
						})
					}
				}
				if (buildingStack.length > 0) {
					for (let i = 0; i < buildingStack.length; i++) {
						if (buildingStack[i] == null) buildingStack[i] = "NULL"
					}
					data.buildingStacks.push({
						position: x,
						classNames: buildingStack,
					})
				}
			}
			for (let i = 0; i < world.decorations.length; i++) {
				if (world.decorations[i] == null) continue
				data.decorations.push({
					position: i,
					spriteName: world.decorations[i].textureName,
				})
			}
			if (world.isProtectedKey) data.protectedKey = true
			if (world.isUnbuildableFromAliens) data.unbuildableAliens = true
			scenario.worlds.push(data)
			left = Math.min(left, world.rect.x)
			right = Math.max(right, world.rect.x + world.rect.width)
		}
		scenario.viewStartX = (left + right) / 2
		for (let i = 0; i < this.city.simulation.citizens.length; i++) {
			let citizen = this.city.simulation.citizens[i]
			if (citizen.onWorld) {
				let data = scenario.worlds[this.city.worlds.findIndex(e=>e==citizen.onWorld)]
				if (data) {
					let me = {
						amount: 1,
						ageRangeMin: citizen.get_age(),
						ageRangeMax: citizen.get_age(),
						minX: Math.floor(citizen.get_worldX()),
						maxX: Math.floor(citizen.get_worldX()),
					}
					if (settings.individualCitizens) {
						data.citizens.push(me)
					} else {
						if (data.citizens.length == 0) {
							data.citizens[0] = {
								ageRangeMin: Infinity,
								ageRangeMax: -Infinity,
								minX: Infinity,
								maxX: -Infinity,
								amount: 0,
							}
						}
						let dataCitizen = data.citizens[0]
						dataCitizen.ageRangeMin = Math.min(dataCitizen.ageRangeMin, me.ageRangeMin)
						dataCitizen.ageRangeMax = Math.max(dataCitizen.ageRangeMax, me.ageRangeMax)
						dataCitizen.minX = Math.min(dataCitizen.minX, me.minX)
						dataCitizen.maxX = Math.max(dataCitizen.maxX, me.maxX)
						dataCitizen.amount++
					}
				}
			}
		}
		return JSON.stringify(scenario, null, "\t")
	}
	preSave(queue) {
		if (this.enabled) {
			// we dont actually save anything here, we just swap out the materials to not be NaN to avoid saving NaN to the save file
			this.city.materials = this.materials.copy()
			if (this.city.progress.sandbox.unlimitedResources) {
				for (let i = 0; i < MaterialsHelper.materialNames.length; i++) {
					let mat = MaterialsHelper.materialNames[i]
					this.city.materials[mat] += 10000000
				}
			}
		}
	}
	preLoad(queue, version) {

	}
	save(queue) {
		queue.addBool(this.enabled)
		if (this.enabled) {
			// post save, replace materials with NaN so that placing certain things still works
			for (let i = 0; i < MaterialsHelper.materialNames.length; i++) {
				let mat = MaterialsHelper.materialNames[i]
				this.city.materials[mat] = NaN
			}
		}
	}
	load(queue, version) {
		this.setEnabled(queue.readBool())
	}
}

// this should be in a beforeCityCreate but that doesn't exist
ModTools[Object.hasOwnProperty(ModTools, "beforeCityCreate") ? "beforeCityCreate" : "onCityCreate"](function(city) {
	city.worldBuilder = new WorldBuilder(city)
	if (city.worlds[0] && city.worlds[0].seed == 1e309) {
		city.worlds[0].destroy()
		city.worldBuilder.setEnabled(true)
		city.cachedCityEdges = {minX: 0, maxX: 0, minY: 0, maxY: 20}
	}
})

ModTools.onCityUpdate(function(city, timeMod) {
	city.worldBuilder.update(timeMod)
})

ModTools.addSaveDataEarly("dt:worldbuilder", function(city, queue) {
	city.worldBuilder.preSave(queue)
}, function(city, queue, version) {
	city.worldBuilder.preLoad(queue, version)
}, WorldBuilder.version)

ModTools.addSaveData("dt:worldbuilder", function(city, queue) {
	city.worldBuilder.save(queue)
}, function(city, queue, version) {
	city.worldBuilder.load(queue, version)
}, WorldBuilder.version)

Liquid.addQuickActionButton(function(city) {
	city.worldBuilder.setEnabled(!city.worldBuilder.enabled)
}, "spr_icon_worldbuilder", -2, city => city.worldBuilder.enabled, city => city.gui.tooltip.setText(null, city.worldBuilder.enabled ? "Click to disable WorldBuilder." : "Click to enable WorldBuilder.\nNote: this will disable achievements.", "WorldBuilder: "+(city.worldBuilder.enabled ? "Enabled" : "Disabled")))

Liquid.addCheckboxSetting("Show Experimental Debug Panel", WorldBuilder.debugPanelEnabled, (v)=>{
	WorldBuilder.debugPanelEnabled = v
}, "debugPanel")

Liquid.onInfoFilesLoaded("worldsInfo.json", function(files) {
	WorldBuilder.fallbackWorldType = files.find(e=>!e.appearance)
	let duplicates = {}
	let i = files.length
	while (i > 0) {
		i--
		if (duplicates[files[i].appearance]) {
			files.splice(i, 1)
		} else {
			duplicates[files[i].appearance] = true
		}
	}
	WorldBuilder.worldsInfo = files
})
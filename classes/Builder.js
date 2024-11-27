BuilderType.Island = function(id) {
    let Island = function(islandInfo) {
        return {
			lastClaim: MouseState.None,
			start: new common_Point,
			end: new common_Point,
			previewSprite: null,
			islandInfo: islandInfo,
			sprite: islandInfo.sprite,
			seed: 0,
            _hx_index: id,
            __enum__: "BuilderType",
            toString: $estr,
			valid: true,
			lastClick: 0,
        }
    }
	Island._hx_index = id
	return Island
} (BuilderType.__constructs__.length)
BuilderType.__constructs__.push("Island")

Builder.prototype.showContinuousTooltip = function(orig) {
	return function() {
		if (this.sprite == Builder.prototype.sprite) {
			this.stage.removeChild(this.sprite)
			this.sprite = new PIXI.Sprite(this.builderType.sprite)
			this.sprite.alpha = 0
			this.stage.addChild(this.sprite)
		}
		return orig.apply(this, arguments)
	}
} (Builder.prototype.showContinuousTooltip)

Builder.prototype.sprite = Resources.makeSprite("spr_buildhereoutline")

Builder.prototype.canBuildBuilding = function(orig) {
	return function(world,xPos,yPos,buildingType,buildingInfo) {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			var thesePermanents = world.permanents[xPos];
			var isBuildingHere = yPos < thesePermanents.length && thesePermanents[yPos] != null && thesePermanents[yPos].isBuilding;
			var buildingHereIsOfSameTypeAndThatMakesItImpossibleToBuild = false;
			if(isBuildingHere) {
				buildingHereIsOfSameTypeAndThatMakesItImpossibleToBuild = js_Boot.getClass(thesePermanents[yPos]) == buildingType && (!js_Boot.__implements(thesePermanents[yPos],buildings_ICustomizableOnBuild) || thesePermanents[yPos].areSameCustomizations(this.decorationAppearance,this.mirrored,this.decorationAppearanceColor));
				if (buildingHereIsOfSameTypeAndThatMakesItImpossibleToBuild) return BuildPossibility.BuildingPositionImpossible;
			}
			let allowFloatingBuildings = true
			if (world.rect.height == 0 && !allowFloatingBuildings) return BuildPossibility.BuildingPositionImpossible
			var buildingXPos = world.rect.x + 20 * xPos;
			var buildingYPos = world.rect.y - 20 * (yPos + 1);
			for (let i = 0; i < this.city.worlds.length; i++) {
				let w = this.city.worlds[i]
				let buildingYPosIntersect = w.rect.y < world.rect.y ? Math.max(buildingYPos, w.rect.y) : buildingYPos
				if(w != world && w.mask != null) {
					if(w.rect.intersects(new common_Rectangle(buildingXPos,buildingYPosIntersect,20,20))) {
						if (w.mask[(buildingXPos - w.rect.x) / 20 | 0][(buildingYPosIntersect - w.rect.y) / 20 | 0]) {
							return BuildPossibility.BuildingPositionImpossible
						};
					}
				}
			}
			var deleteKeyPressed = this.city.game.keyboard.down[46];
			var shiftKeyPressed = this.city.game.keyboard.down[16];
			var mightDoBuildingAssociatedAction = !deleteKeyPressed && !shiftKeyPressed;
			return mightDoBuildingAssociatedAction ? BuildPossibility.BuildingOK : BuildPossibility.BuildingPositionImpossible
		} else {
			// temporary fix
			var thesePermanents = world.permanents[xPos];
			let maxPermanent = 0
			for (let i = 0; i < thesePermanents.length; i++) {
				if (thesePermanents[i] != null) maxPermanent = i+1
			}
			if (thesePermanents.size != maxPermanent) thesePermanents.splice(maxPermanent)
			return orig.apply(this, arguments)
		}
	}
} (Builder.prototype.canBuildBuilding)

Builder.prototype.buildingPrerequirementsValid = function(orig) {
	return function() {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			return true
		} else return orig.apply(this, arguments)
	}
} (Builder.prototype.buildingPrerequirementsValid)

Builder.prototype.tryBuildingAt = function(orig) {
	return function(world, xPos, yPos, buildingType, buildingInfo, mouse) {
		if (this.city.worldBuilder && this.city.worldBuilder.enabled) {
			var _gthis = this;
			var thesePermanents = world.permanents[xPos];
			this.sprite.alpha = 0.5;
			this.builderSecondaryHelpSprite.alpha = 1;
			this.sprite.tint = 16777215;
			if(this.decorationAppearanceColor >= 0) {
				this.sprite.tint = this.decorationAppearanceColor;
			}
			this.builderSecondaryHelpSprite.texture = null;
			var claim = MouseState.None;
			if(this.buildingModeCanDrag()) {
				claim = mouse.claimMouse(this,"",true,true,true);
				mouse.hasStrongClaim = true;
				mouse.strongClaimOnUpdate = null;
			} else {
				claim = mouse.claimMouse(this,"" + xPos + " " + yPos,false);
			}
			if(claim == MouseState.Confirmed) {
				var limitedUnlockNumber = this.city.progress.unlocks.getLimitedUnlockNumber(buildingType);
				if(!Config.hasPremium() && limitedUnlockNumber > 0) {
					var curNum = Lambda.count(this.city.permanents,function(pm) {
						return pm.is(_gthis.get_buildingToBuild());
					});
					if(curNum >= limitedUnlockNumber) {
						mobileSpecific_PremiumWall.showPremiumWall(this.city.gui,buildingInfo,this.city);
						return true;
					}
				}
				if(yPos < thesePermanents.length && thesePermanents[yPos] != null) {
					thesePermanents[yPos].destroyForReplacement();
				}
				var newBuilding = world.build(this.get_buildingToBuild(),xPos,yPos);
				if(buildingInfo.specialInfo.indexOf("as_multi_decor") != -1) {
					newBuilding.customize(this.decorationAppearance,this.mirrored);
				}
				if(buildingInfo.specialInfo.indexOf("as_multi_decor_anycolor") != -1 && this.decorationAppearanceColor >= 0) {
					newBuilding.customizeColor(this.decorationAppearanceColor);
				}
				if(buildingInfo.className == "CustomHouse") {
					newBuilding.properties = this.customHouseProperties;
				}
				this.city.game.audio.playSound(this.city.game.audio.buildSound);
				this.city.onBuildBuilding(false,true,newBuilding,this.get_buildingToBuild(),yPos,thesePermanents);
				this.fixBuilder(null,null);
				if(this.lastBuilt < 0 || this.lastBuilt > 60) {
					this.city.progress.unlocks.checkBuildRelatedUnlocks();
					this.city.saveToBrowserStorageSoon();
				} else {
					this.city.progress.unlocks.checkBuildRelatedUnlocksSoon();
				}
				if(this.city.windowRelatedOnBuildOrDestroy != null) {
					this.city.windowRelatedOnBuildOrDestroy();
				}
				this.lastBuilt = 0;
				return true;
			} else if(claim == MouseState.Active) {
				this.sprite.alpha = 0.8;
				return true;
			} else if(this.city.game.isMobile) {
				this.builderSecondaryHelpSprite.alpha = 0;
			}
			return false;
		} else return orig.apply(this, arguments)
	}
} (Builder.prototype.tryBuildingAt)

Builder.prototype.handleMouse = function(orig) {
	function rectOverlapsWorld(rect, world) {
		if (world.rect.intersects(rect)) {
			// check the world mask
			if (world.mask) for (let x = rect.x; x < rect.x + rect.width; x += 20) {
				let xline = world.mask[(x - world.rect.x) / 20 | 0]
				if (!xline) {
					continue
				}
				for (let y = rect.y; y < rect.y + rect.height; y += 20) {
					if (xline[(y - world.rect.y) / 20 | 0]) return true
				}
			}
		}
		// check the world permanents
		for (let x = 0; x < world.permanents.length; x++) {
			for (let y = 0; y < world.permanents[x].length; y++) {
				if (world.permanents[x][y] == null) continue
				let buildingX = world.rect.x + x * 20
				let buildingY = world.rect.y - y * 20 - 20
				if (rect.intersects(new common_Rectangle(buildingX, buildingY, 20, 20))) {
					return true
				}
			}
		}
		return false
	}
	function rectOverlapsCityElements(rect, city) {
		let elems = city.miscCityElements.allMiscElements
		for (let i = 0; i < elems.length; i++) {
			if (rect.intersects(elems[i].rect)) return true
		}
		return false
	}
	return function(mouse) {
		let ret = orig.apply(this, arguments)
		if (ret == true) return ret
		if (this.builderType._hx_index == BuilderType.Island._hx_index) {
			// island builder
			let islandInfo = this.builderType.islandInfo
			this.sprite.alpha = 0.5
			let spriteRect = new common_Rectangle(this.sprite.x, this.sprite.y, this.sprite.width, this.sprite.height)
			if (rectOverlapsCityElements(spriteRect, this.city)) {
				this.sprite.tint = 16744576
				this.sprite.alpha = 0.2
				if (this.builderType.lastClaim == MouseState.None) return false
			}
			for (let i = 0; i < this.city.worlds.length; i++) {
				let world = this.city.worlds[i]
				if (world.rect.intersects(spriteRect) && world.mask && world.mask[(this.sprite.x - world.rect.x) / 20 | 0][(this.sprite.y - world.rect.y) / 20 | 0]) {
					this.sprite.tint = 16744576
					this.sprite.alpha = 0.2
					if (this.builderType.lastClaim == MouseState.None) return false
				}
				if (this.sprite.x >= world.rect.x && this.sprite.x < world.rect.x + world.rect.width && this.sprite.y < world.rect.y) {
					if (world.permanents[(this.sprite.x - world.rect.x) / 20][(world.rect.y - this.sprite.y) / 20 - 1] != null) {
						this.sprite.tint = 16744576
						this.sprite.alpha = 0.2
						if (this.builderType.lastClaim == MouseState.None) return false
					}
				}
			}
			if (this.city.game.keyboard.down[18] && this.builderType.lastClaim == MouseState.None) {
				return false
			}
			let claim = mouse.claimMouse(this,"",true,true,true)
			mouse.hasStrongClaim = true;
			mouse.strongClaimOnUpdate = null;
			if (this.builderType.lastClaim != claim) {
				if (claim == MouseState.Confirmed) {
					this.city.game.audio.playSound(this.city.game.audio.decorateSound)
					let random = new random_SeedeableRandom()
					this.builderType.seed = random.seed
					this.builderType.valid = true
					this.builderType.previewSprite = graphics_WorldImage.makeWorldSprite(random, 20, 20, islandInfo.appearance).sprite
					this.builderType.previewSprite.alpha = 0.8
					this.builderType.previewSprite.tint = 16777215
					this.stage.addChild(this.builderType.previewSprite)
					this.builderType.previewSprite.position.set(this.sprite.x, this.sprite.y)
					this.builderType.start.x = this.sprite.x
					this.builderType.start.y = this.sprite.y
					this.builderType.end.x = this.sprite.x
					this.builderType.end.y = this.sprite.y
				} else {
					this.stage.removeChild(this.builderType.previewSprite)
					this.builderType.previewSprite = null
					if (this.builderType.valid) {
						this.city.game.audio.playSound(this.city.game.audio.buildSound)
						let city = this.city
						let world = new World(city.game, city, city.cityStage, city.cityMidStage, city.cityBgStage, new common_Rectangle(
							Math.min(this.builderType.start.x, this.builderType.end.x),
							Math.min(this.builderType.start.y, this.builderType.end.y),
							Math.abs(this.builderType.start.x - this.builderType.end.x) + 20,
							Math.abs(this.builderType.start.y - this.builderType.end.y) + 20,
						), this.builderType.seed, islandInfo.appearance)
						city.worlds.splice(-1, 0, world)
						if (islandInfo.decoration) for (let i = 0; i < world.decorations.length; i++) {
							world.setDecoration(islandInfo.decoration, i)
						}
						var bottomWorld = common_ArrayExtensions.whereMax(this.city.worlds,function(wrld) {
							return wrld.rect.height == 0;
						},function(wrld) {
							return wrld.rect.width;
						});
						let left = world.rect.x
						let right = world.rect.x + world.rect.width
						if(left < bottomWorld.rect.x) {
							bottomWorld.resizeInvisibleWorld(left,bottomWorld.rect.width + (bottomWorld.rect.x - left));
						}
						if(right >= bottomWorld.rect.x) {
							bottomWorld.resizeInvisibleWorld(bottomWorld.rect.x,right - bottomWorld.rect.x + 20);
						}
						bottomWorld.updateVerticalPositioningOfInvisibleWorld()
						this.city.connections.updateCityConnections();
						this.city.simulation.updatePathfinder(true);
					} else {
						this.city.game.audio.playSound(this.city.game.audio.buttonFailSound)
					}
				}
			}
			if (claim == MouseState.Confirmed) {
				if (this.builderType.end.x != this.sprite.x || this.builderType.end.y != this.sprite.y) {
					if (Date.now() - this.builderType.lastClick > 50) {
						this.builderType.lastClick = Date.now()
						this.city.game.audio.playSound(this.city.game.audio.changeVitalBuildingSound)
						this.city.game.audio.changeVitalBuildingSound.volume /= 2
					}
					this.builderType.end.x = this.sprite.x
					this.builderType.end.y = this.sprite.y
					let random = new random_SeedeableRandom(this.builderType.seed)
					let rect = new common_Rectangle(
						Math.min(this.builderType.start.x, this.builderType.end.x),
						Math.min(this.builderType.start.y, this.builderType.end.y),
						Math.abs(this.builderType.start.x - this.builderType.end.x) + 20,
						Math.abs(this.builderType.start.y - this.builderType.end.y) + 20,
					)
					let ws = graphics_WorldImage.makeWorldSprite(random, rect.width, rect.height, islandInfo.appearance)
					this.builderType.previewSprite.texture = ws.sprite.texture
					this.builderType.previewSprite.position.set(rect.x, rect.y)
					this.builderType.valid = true
					for (let i = 0; i < this.city.worlds.length; i++) {
						let world = this.city.worlds[i]
						if (rectOverlapsWorld(rect, world)) {
							this.builderType.previewSprite.alpha = 0.5
							this.builderType.previewSprite.tint = 16744576
							this.builderType.valid = false
							break
						}
					}
					if (rectOverlapsCityElements(rect, this.city)) {
						this.builderType.previewSprite.alpha = 0.5
						this.builderType.previewSprite.tint = 16744576
						this.builderType.valid = false
					}
					if (this.builderType.valid) {
						this.builderType.previewSprite.alpha = 0.8
						this.builderType.previewSprite.tint = 16777215
					}
				}
			}
			this.builderType.lastClaim = claim
			if (claim != MouseState.None) {
				this.sprite.alpha = 0
				return true
			}
		}
		return false
	}
} (Builder.prototype.handleMouse)
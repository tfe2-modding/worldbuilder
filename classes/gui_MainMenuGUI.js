gui_MainMenuGUI.createNewScenarioWindow = function(orig) {
	return function(game, gui, windowOnDestroy) {
		orig.apply(this, arguments)
		gui.windowAddTitleText(common_Localize.lo("new_city"))
		var containerButton = new gui_ContainerButton(gui,gui.innerWindowStage,gui.windowInner,()=>{
			game.createNewGameState("WB_BLANK")
		})
		var infoContainer = containerButton.container
		gui.windowInner.insertChild(containerButton, 0)
		infoContainer.padding = { top: 3, left: 3, right: 3, bottom: 1 }
		infoContainer.fillSecondarySize = true
		var subContainer = new gui_GUIContainer(gui,gui.innerWindowStage,infoContainer)
		subContainer.direction = gui_GUIContainerDirection.Vertical
		infoContainer.addChild(subContainer)
		subContainer.addChild(new gui_TextElement(subContainer,gui.innerWindowStage,"Blank WorldBuilder city",null,"Arial"))
		subContainer.addChild(new gui_TextElement(subContainer,gui.innerWindowStage,"An empty city without any worlds in it.",null,"Arial10"))
		containerButton.buttonPatch.updateSprites(true)
		gui.windowInner.insertChild(new gui_GUISpacing(gui.windowInner,new common_Point(2,8)), 1)
		gui.windowInner.insertChild(new gui_TextElement(gui.windowInner,gui.innerWindowStage,common_Localize.lo("start_scenario")+":",null,null,null,null,true), 2)
	}
} (gui_MainMenuGUI.createNewScenarioWindow)
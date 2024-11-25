var gui_TextAreaInput = $hxClasses["gui.TextAreaInput"] = function(parent,gui,game,placeholder,defaultText) {
	if(defaultText == null) {
		defaultText = "";
	}
	if(placeholder == null) {
		placeholder = "";
	}
	this.onInput = null;
	var _gthis = this;
	this.parent = parent;
	this.gui = gui;
	this.game = game;
	this.rect = new common_Rectangle(0,0,250,50);
	this.inputElement = window.document.createElement("textarea");
	this.inputElement.style.position = "absolute";
	this.inputElement.style.left = "10px";
	this.inputElement.style.top = "10px";
	this.inputElement.style.fontFamily = "Arial,sans-serif";
	this.inputElement.style.fontSize = "20px";
	this.inputElement.style.resize = "none"
	this.inputElement.value = defaultText;
	this.inputElement.placeholder = placeholder;
	window.document.body.appendChild(this.inputElement);
	this.inputElement.focus();
	game.keyboard.inputs.push(this.inputElement);
	this.inputElement.addEventListener("input",function() {
		if(_gthis.onInput != null) {
			_gthis.onInput(_gthis.inputElement.value);
		}
	});
};
gui_TextAreaInput.__name__ = "gui.TextInput";
gui_TextAreaInput.__interfaces__ = [gui_IGUIElement];
gui_TextAreaInput.__super__ = gui_TextInput
gui_TextAreaInput.prototype = gui_TextInput.prototype
ROT.Display.create = function(game, opts) {
	opts['fontFamily'] = '"droid sans mono", monospace';
	var display = new ROT.Display(opts);
	display.game = game;
	return display;
};

ROT.Display.prototype.setupEventHandlers = function() {
	var game = this.game;

	// directions for moving entities
	var keys = {
		37: 'left', // left arrow
		38: 'up', // up arrow
		39: 'right', // right arrow
		40: 'down', // down arrow
		65: 'left', // A
		68: 'right', // D
		72: 'left', // H
		74: 'down', // J
		75: 'up', // K
		76: 'right', // L
		81: 'funcPhone', // Q
		82: 'rest', // R
		83: 'down', // S
		87: 'up' // W
	};

	// contentEditable is required for canvas elements to detect keyboard events
	$(this.getContainer()).attr("contentEditable", "true");
	this.getContainer().addEventListener("keydown", function(e) {
		if (keys[e.keyCode]) {
			game.map.getPlayer().move(keys[e.keyCode], true);
		}
	});

	this.getContainer().addEventListener("click", function(e) {
		$(this).addClass('focus');
		$('.CodeMirror').removeClass('focus');

		$('#helpPane').hide();
        $('#menuPane').hide();
	});
};

// drawObject takes care of looking up an object's symbol and color
// according to name (NOT according to the actual object literal!)
ROT.Display.prototype.drawObject = function (map, x, y, object, bgColor) {
	var symbol = map.getObjectDefinition(object).symbol;
	var color = map.getObjectDefinition(object).color || "#fff";

	if (!bgColor) {
		bgColor = "#000";
	}

	this.draw(x, y, symbol, color, bgColor);
};

ROT.Display.prototype.drawAll = function(map) {
	var game = this.game;

	// draw static objects
	for (var x = 0; x < game.dimensions.width; x++) {
		for (var y = 0; y < game.dimensions.height; y++) {
			this.drawObject(map, x, y + this.offset, map.getGrid()[x][y].type, map.getGrid()[x][y].bgColor);
		}
	}

	// draw dynamic objects
	for (var i = 0; i < map.getDynamicObjects().length; i++) {
		var obj = map.getDynamicObjects()[i];
		this.drawObject(map, obj.getX(), obj.getY() + this.offset, obj.getType(), map.getGrid()[obj.getX()][obj.getY()].bgColor);
	}

	// draw player
	if (map.getPlayer()) { map.getPlayer().draw(this.offset); }
};

ROT.Display.prototype.fadeOut = function (map, callback, i) {
	var display = this;
	var game = map.game;
	var command = "> load " + game.levelFileNames[game.currentLevel - 1];

	if (i <= - map.getHeight()) {
		if (callback) { callback(); }
	} else {
		if (typeof i === 'undefined') { i = 0; }
		this.offset = i;
		this.clear();
		this.drawAll(map);
		this.drawText(0, i + map.getHeight() + 1, command);
		setTimeout(function () {
			display.fadeOut(map, callback, i-1);
		}, 100);
	}
};

ROT.Display.prototype.fadeIn = function (map, callback, i) {
	var display = this;
	var game = map.game;
	var command = "> run " + game.levelFileNames[game.currentLevel - 1];

	if (i < 0) {
		if (callback) { callback(); }
	} else {
		if (typeof i === 'undefined') { i = map.getHeight(); }
		this.offset = i;
		this.clear();
		this.drawAll(map);
		this.drawText(0, i - 2, command);
		setTimeout(function () {
			display.fadeIn(map, callback, i-1);
		}, 100);
	}
};

ROT.Display.prototype.write = function(text) {
	this.clear();
	this.drawText(0, 0, text);
}

ROT.Display.prototype.focus = function() {
	$('#screen').show();
	$(this.getContainer()).attr('tabindex', '0').click().focus();
};

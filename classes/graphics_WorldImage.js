graphics_WorldImage.makeWorldSprite = function(random,width,height,appearance) {
	var val = height - 10;
	var belowWorldHeight = val < 0 ? 0 : val > 12 ? 12 : val;
	var worldHeight = height - belowWorldHeight;
	var info = WorldBuilder.worldsInfo.find(e=>e.appearance == appearance) || WorldBuilder.fallbackWorldType
	var outlineColor = common_ColorExtensions.toHexInt(thx_color_Rgbxa.toRgb(thx_color_Color.parse(info.outlineColor)));
	var fillColor = common_ColorExtensions.toHexInt(thx_color_Rgbxa.toRgb(thx_color_Color.parse(info.fillColor)));
	var minimumYMax = Math.floor(worldHeight * info.minimumYMax);
	var maximumYMin = Math.floor(worldHeight * info.maximumYMin);
	var minimumYMin = Math.floor(worldHeight * info.minimumYMin);
	var spriteCanvas = window.document.createElement("canvas");
	spriteCanvas.width = width;
	spriteCanvas.height = height;
	var ctx = spriteCanvas.getContext("2d");
	var worldSpriteData = ctx.createImageData(width,height);
	var _g = [];
	var _g1 = 0;
	var _g2 = width / 20 | 0;
	while(_g1 < _g2) {
		var x = _g1++;
		var _g3 = [];
		var _g4 = 0;
		var _g5 = height / 20 | 0;
		while(_g4 < _g5) {
			var y = _g4++;
			_g3.push(false);
		}
		_g.push(_g3);
	}
	var collisionMask = _g;
	var outlinePoints = [{ x : 0, y : 0}];
	var pixelsFromSide = Math.min(worldHeight / 4 + random.getInt(-5,6),width / 3) | 0;
	var numberOfOtherOutlinePoints = Math.max(1,Math.floor((width - pixelsFromSide * 2) / (random.getInt(25,35) + width / 40))) | 0;
	var xchange = Math.floor((width - pixelsFromSide * 2) / numberOfOtherOutlinePoints);
	var xx = pixelsFromSide + ((width - pixelsFromSide * 2 - xchange * (numberOfOtherOutlinePoints - 0.5)) / 2 | 0);
	var _g = 0;
	var _g1 = numberOfOtherOutlinePoints;
	while(_g < _g1) {
		var i = _g++;
		outlinePoints.push({ x : xx + random.getInt(-6,7), y : random.getInt(minimumYMax,worldHeight)});
		if(i != numberOfOtherOutlinePoints - 1) {
			outlinePoints.push({ x : xx + (xchange / 2 | 0) + random.getInt(-6,7), y : random.getInt(minimumYMin,maximumYMin)});
		}
		xx += xchange;
	}
	outlinePoints.push({ x : width - 1, y : 0});
	var fillPixel = function(x,y) {
		var dataPos = 4 * (width * y + x);
		worldSpriteData.data[dataPos] = fillColor >> 16 & 255;
		worldSpriteData.data[dataPos + 1] = fillColor >> 8 & 255;
		worldSpriteData.data[dataPos + 2] = fillColor & 255;
		worldSpriteData.data[dataPos + 3] = 255;
		collisionMask[x / 20 | 0][y / 20 | 0] = true;
	};
	var powfactor1 = info.powfactor1;
	var powfactor2 = info.powfactor2;
	var powChangeFactor = info.powChangeFactor;
	var currentOutlinePoint = 0;
	var addPowFactor = 0.0;
	var _g = 0;
	var _g1 = width;
	while(_g < _g1) {
		var i = _g++;
		var maxAddPowFactorXChange = powChangeFactor / (Math.abs(outlinePoints[currentOutlinePoint + 1].y - outlinePoints[currentOutlinePoint].y) + 5);
		var val = addPowFactor + random.getFloat(-maxAddPowFactorXChange,maxAddPowFactorXChange);
		addPowFactor = val < -0.2 ? -0.2 : val > 0.2 ? 0.2 : val;
		if(i > outlinePoints[currentOutlinePoint + 1].x) {
			if(outlinePoints[currentOutlinePoint + 1].y > outlinePoints[currentOutlinePoint].y) {
				var numberOfEarthParts = random.getInt(info.minEarthParts,info.maxEarthParts);
				var distBetweenEarthParts = random.getInt(info.minEarthPartsDistance,info.maxEarthPartsDistance);
				var _g2 = 0;
				var _g3 = numberOfEarthParts;
				while(_g2 < _g3) {
					var op = _g2++;
					var bx = random.getInt(-2,3) + i - (numberOfEarthParts - 1) * distBetweenEarthParts + (distBetweenEarthParts * 2 * op | 0);
					var by = outlinePoints[currentOutlinePoint + 1].y + random.getInt(3);
					var fromX = bx - 1;
					var toX = bx;
					var _g4 = by + 2;
					var _g5 = by + 11;
					while(_g4 < _g5) {
						var y = _g4++;
						if(y <= by + 5) {
							fromX -= random.getInt(y < by + 5 ? 3 : 2);
							toX += random.getInt(y < by + 5 ? 3 : 2);
						} else {
							var val1 = fromX + random.getInt(y > by + 6 ? 3 : 2);
							fromX = toX < val1 ? toX : val1;
							var val11 = toX - random.getInt(y > by + 6 ? 3 : 2);
							toX = fromX > val11 ? fromX : val11;
						}
						if(y == by + 2 && toX - fromX == 1) {
							++toX;
						}
						if(y == by + 3 && toX - fromX == 2) {
							--fromX;
						}
						var _g6 = fromX;
						var _g7 = toX;
						while(_g6 < _g7) {
							var x = _g6++;
							if(x >= 0 && x < width && y + 2 < height) {
								fillPixel(x,y);
							}
						}
					}
				}
			}
			++currentOutlinePoint;
		}
		var pnt = outlinePoints[currentOutlinePoint];
		var nextPnt = outlinePoints[currentOutlinePoint + 1];
		var interpolate = (i - pnt.x) / (nextPnt.x - pnt.x);
		if(nextPnt.y < pnt.y) {
			interpolate = Math.pow(interpolate,powfactor1 - interpolate * powfactor2 + addPowFactor);
		} else {
			interpolate = 1 - Math.pow(1 - interpolate,powfactor1 - (1 - interpolate) * powfactor2 - addPowFactor);
		}
		var val12 = Math.floor(interpolate * (nextPnt.y - pnt.y) + pnt.y);
		var val2 = worldHeight - 1;
		var bottomPixel = val2 < val12 ? val2 : val12;
		var _g8 = 0;
		var _g9 = bottomPixel + 1;
		while(_g8 < _g9) {
			var j = _g8++;
			fillPixel(i,j);
		}
	}
	var _g = 0;
	var _g1 = worldSpriteData.data.length / 4 | 0;
	while(_g < _g1) {
		var i = _g++;
		var x = i % width;
		var y = Math.floor(i / width);
		if(worldSpriteData.data[i * 4 + 3] == 255 && (x == 0 || y == 0 || x == width - 1 || y == height - 1 || worldSpriteData.data[i * 4 - 1] == 0 || worldSpriteData.data[i * 4 + 7] == 0 || worldSpriteData.data[((y - 1) * width + x) * 4 + 3] == 0 || worldSpriteData.data[((y + 1) * width + x) * 4 + 3] == 0)) {
			worldSpriteData.data[i * 4] = outlineColor >> 16 & 255;
			worldSpriteData.data[i * 4 + 1] = outlineColor >> 8 & 255;
			worldSpriteData.data[i * 4 + 2] = outlineColor & 255;
		}
	}
	ctx.putImageData(worldSpriteData,0,0);
	return { sprite : new PIXI.Sprite(PIXI.Texture.from(spriteCanvas)), mask : collisionMask};
};
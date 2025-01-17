import { Tag } from 'curvature/base/Tag';
import { Mixin } from 'curvature/base/Mixin';
import { Bindable } from 'curvature/base/Bindable';
import { EventTargetMixin } from 'curvature/mixin/EventTargetMixin';

import { Elicit } from './Elicit';

export class TileMap extends Mixin.with(EventTargetMixin)
{
	constructor(args, parent)
	{
		super();

		this.preloaders = new Map;

		this.meta = new Map;

		this.heightMask      = null;
		this.tileImages      = new Map;
		this.tileNumberCache = new Map;
		this.tileSetCache    = new Map;
		this.tileCache       = new Map;
		this.heightMasks     = new Map;
		this.heightMaskCache = new Map;
		this.prefixed        = new Map;
		this.mapDirectory    = '/map';

		this.tileLayers  = [];

		this.destructibleLayers = [];
		this.collisionLayers = [];
		this.objectLayers = [];

		// this.mapVars = new Map;

		const url = args.mapUrl;

		this.mapData = null;
		this.mapUrl  = url;

		this.maps = new Map;

		this.replacements = new Map;
		this.loaded = new Map;
		this.emptyCache = new Map;
		this.solidCache = new Map;

		if(String(url).substr(-4) === 'json')
		{
			const elicit = new Elicit(url);

			elicit.addEventListener('progress', event => {
				const {received, length, done} = event.detail;

				const type = 'map';

				this.dispatchEvent(new CustomEvent(
					'level-progress', { detail: {length, received, done, url}}
				));
			});

			this.ready = elicit.stream()
			.then(response => response.json())
			.then(tilemapData => {

				this.maps.set(tilemapData, [0, 0]);

				this.mapData = tilemapData;

				if(tilemapData && tilemapData.properties)
				{
					for(const property of tilemapData.properties)
					{
						const name = property.name.replace(/-/g, '_');

						this.meta.set(name, property.value);
					}
				}

				this.desparseLayers(tilemapData);

				this.loadLayers(tilemapData);

				return this.loadTilesets(tilemapData);
			});
		}
		else if(String(url).substr(-3) === 'png')
		{
			this.ready = this.fromImage(url, 32);
		}

		Object.preventExtensions(this);
	}

	desparseLayers(tilemapData)
	{
		// console.time('desparse');

		for(const layer of tilemapData.layers)
		{
			if(layer.type !== 'tilelayer' || !layer.sparsed || layer.data)
			{
				continue;
			}

			const desparsed = layer.data = Object.create(null);

			while(layer.sparsed.length)
			{
				const tileNo = Number(layer.sparsed.pop());
				const tileId = Number(layer.sparsed.pop());

				if(!tileNo)
				{
					console.log({tileId, tileNo});
				}

				desparsed[tileId] = tileNo;
			}
		}
	}

	preloadMap(url)
	{
		if(this.preloaders.has(url))
		{
			return this.preloaders.get(url);
		}

		const elicit = new Elicit(url);

		// elicit.addEventListener('progress', event => {
			// const {received, length, done} = event.detail;
			// const type = 'map';
			// this.dispatchEvent(new CustomEvent(
			// 	'level-progress', {detail: {length, received, done, url}}
			// ));
		// });

		const res = elicit.stream().then(response => response.json());

		this.preloaders.set(url, res);

		return res;
	}

	append(url, xOffset, yOffset, maxObjectId = 0)
	{
		return this.preloadMap(url).then(data => {
			const width    = this.mapData.width;
			const overlap  = -width + xOffset;
			const newWidth = width + data.width + overlap;

			const height    = this.mapData.height;
			const newHeight = Math.max(height, height + data.height + -Math.round(yOffset/32));

			this.maps.set(data, [xOffset, yOffset]);

			this.resize(newWidth, height);

			this.desparseLayers(data);

			let lastGid = 0;

			for(const tileset of this.mapData.tilesets)
			{
				lastGid += tileset.tilecount;
			}

			for(const tileset of data.tilesets)
			{
				tileset.firstgid += lastGid;
			}

			for(const newLayer of data.layers)
			{
				const newData = Object.create(null);
				const sizeOffset = this.mapData.width - newLayer.width;

				const offset = xOffset + yOffset * this.mapData.width;

				if(!newLayer.data)
				{
					continue;
				}

				for(let i of Object.keys(newLayer.data))
				{
					const tileId = Number(i);
					const tileNo = Number(newLayer.data[i]);

					const row = Math.floor(tileId / newLayer.width);

					delete newLayer.data[i];

					newData[row * sizeOffset + offset + tileId] = tileNo + lastGid;
				}

				Object.assign(newLayer.data, newData);

				for(const existingLayer of this.mapData.layers)
				{
					if(newLayer.name !== existingLayer.name)
					{
						continue;
					}

					Object.assign(existingLayer.data, newLayer.data);

					existingLayer.layer.setMeta(newLayer, maxObjectId);
				}
			}

			for(const newTileset of data.tilesets)
			{
				this.mapData.tilesets.push(newTileset);
			}

			this.tileNumberCache.clear();

			return this.loadTilesets(data).then(() => {

				return {defs: this.getObjectDefs(data, lastGid), data};

			});
		});
	}

	resize(newWidth, newHeight, tileLayers = this.tileLayers)
	{
		const mapData = this.mapData;

		const originalWidth  = mapData.width;
		const originalHeight = mapData.height;

		mapData.width  = newWidth;
		mapData.height = newHeight;

		const offset = newWidth - originalWidth;

		for(const layer of tileLayers)
		{
			const newData = Object.create(null);

			for(const [i, tileNo] of Object.entries(layer.data))
			{
				const tileId = Number(i);
				const row = Math.floor(tileId / originalWidth);

				newData[row * offset + tileId] = tileNo;
			}

			layer.data = newData;
		}

		this.tileNumberCache.clear();
	}

	offset(xOffset, yOffset, tileLayers = this.tileLayers)
	{
		const offset = xOffset + yOffset * this.mapData.width;

		for(const layer of tileLayers)
		{
			const newData = Object.create(null);

			for(const [i, tileNo] of Object.entries(layer.data))
			{
				const tileId = Number(i);

				newData[offset + tileId] = tileNo;
			}

			layer.data = newData;
		}

		this.tileNumberCache.clear();
	}

	loadTilesets(mapData)
	{
		const setHeightMasks = [];
		const imageProgress  = new Map;
		const imageSize      = new Map;

		this.emptyCache.clear();
		this.solidCache.clear();

		for(const tileset of mapData.tilesets)
		{
			const image = new Image;

			this.tileImages.set(tileset, image);

			if(!this.prefixed.has(tileset))
			{
				this.prefixed.set(tileset, String(this.mapDirectory + '/' + tileset.image).replace(/\/\/+/g, '/'));
			}

			const imageUrl = this.prefixed.get(tileset);

			tileset.original = tileset.image = imageUrl;

			const fetchImage = new Elicit(imageUrl);

			fetchImage.addEventListener('progress', event => {
				const {received, length, done} = event.detail;

				imageProgress.set(fetchImage, received);
				imageSize.set(fetchImage, length);

				const imagesProgress = [...imageProgress.values()]
				.reduce((a, b) => Number(a)+Number(b));

				const imagesLength = [...imageSize.values()]
				.reduce((a, b) => Number(a)+Number(b));

				const imagesDone = imagesProgress / imagesLength;

				this.dispatchEvent(new CustomEvent(
					'texture-progress', { detail: {
						length:imagesLength
						, received:imagesProgress
						, done:imagesDone
						, url:imageUrl
					}}
				));
			});

			const heightMask = fetchImage.objectUrl().then(url => new Promise(accept => {

				tileset.cachedImage = url;

				image.addEventListener('load', event => {

					if(!this.replacements.has(imageUrl))
					{
						this.replacements.set(imageUrl, url);
					}

					this.loaded.set(imageUrl, url);

					const heightMask = document.createElement('canvas');

					heightMask.width  = image.width;
					heightMask.height = image.height;

					heightMask.getContext('2d').drawImage(
						image, 0, 0, image.width, image.height
					);

					this.heightMasks.set(tileset, heightMask.getContext('2d').getImageData(0, 0, heightMask.width, heightMask.height));

					accept(heightMask);

				}, {once:true});

				image.src = url;
			}));

			setHeightMasks.push(heightMask);
		}

		return Promise.all(setHeightMasks);
	}

	loadLayers(tilemapData)
	{
		const layerGroup = Object.create(null);

		const layers = tilemapData.layers || [];

		tilemapData.layers.forEach((layer,index) => {
			layer.offsetX        = false;
			layer.offsetY        = false;
			layer.offsetXChanged = false;
			layer.offsetYChanged = false;
			layer.destroyed      = false;
			layer.layer          = null;
			layer.index          = null;
			Object.preventExtensions(layer);
		});

		this.objectLayers = tilemapData.layers.filter(l => l.type === 'objectLayers');
		this.tileLayers   = tilemapData.layers.filter(l => l.type === 'tilelayer');

		this.tileLayers.forEach((layer, index) => layer.index = index);

		// layerGroup.objectLayers = this.objectLayers;
		layerGroup.tileLayers = this.tileLayers;

		this.collisionLayers = this.tileLayers.filter(l => {

			if(!l.name.match(/^Collision\s\d+/))
			{
				return false;
			}

			return true;
		})

		this.destructibleLayers = this.tileLayers.filter(l => {

			if(!l.name.match(/^Destructible\s\d+/))
			{
				return false;
			}

			return true;
		});

		layerGroup.destructibleLayers = this.destructibleLayers;
		layerGroup.collisionLayers    = this.collisionLayers;
	}

	coordsToTile(x, y, layerId)
	{
		const blockSize = this.blockSize;

		let offsetX = 0;
		let offsetY = 0;

		if(this.tileLayers[layerId])
		{
			offsetX = this.tileLayers[layerId].offsetX ?? 0;
			offsetY = this.tileLayers[layerId].offsetY ?? 0;
		}

		return [
			Math.floor( (x-offsetX) / blockSize )
			, Math.floor( (y-offsetY) / blockSize )
		];
	}

	getTileNumber(x, y, layerId = 0)
	{
		// const tileKey = x + ',' + y + ',' + layerId;
		// const cached  = this.tileNumberCache.get(tileKey);

		// if(cached !== undefined)
		// {
		// 	return cached;
		// }

		const tileLayers = this.tileLayers;

		if(!tileLayers[layerId])
		{
			// this.tileNumberCache.set(tileKey, false);
			return false;
		}

		const mapData = this.mapData;
		const mapWidth = mapData.width;
		const mapHeight = mapData.height;

		if(x >= mapWidth || x < 0)
		{
			if(x < 0 || !this.meta.get('wrapX'))
			{
				if(layerId !== 0)
				{
					// this.tileNumberCache.set(tileKey, false);
					return false;
				}

				// this.tileNumberCache.set(tileKey, 1);

				return 1;
			}
			else
			{
				if(x < 0 && x % mapWidth !== 0)
				{
					y++;
				}

				x = x % mapWidth;
			}
		}

		if(y >= mapHeight || y < 0)
		{
			if(y < 0 || !this.meta.get('wrapY'))
			{
				if(layerId !== 0)
				{
					// this.tileNumberCache.set(tileKey, false);

					return false;
				}

				// this.tileNumberCache.set(tileKey, 1);

				return 1;
			}
			else
			{
				y = y % mapHeight;
			}
		}

		const tileIndex = (y * mapWidth) + x;

		if(tileIndex in tileLayers[layerId].data)
		{
			const layer = tileLayers[layerId];
			const tile  = layer.data[tileIndex];

			const tileNumber = tile > 0 ? tile - 1 : 0;

			if(this.checkEmpty(tileNumber))
			{
				// this.tileNumberCache.set(tileKey, false);
				return false;
			}

			// this.tileNumberCache.set(tileKey, tileNumber);

			return tileNumber;
		}

		// this.tileNumberCache.set(tileKey, false);

		return false;
	}

	getObjectDefs(mapData = this.mapData, startGid = 0)
	{
		if(!mapData)
		{
			return;
		}

		return mapData.layers
			.filter(layer => layer.type === 'objectgroup')
			.map(layer => layer.objects)
			.flat()
			.map(o => {if(typeof o.gid !== 'undefined') {o.gid += startGid;} return o;});
	}

	getTile(tileNumber)
	{
		const cached = this.tileCache.get(tileNumber);

		if(cached !== undefined)
		{
			if(this.replacements.has(cached[3]))
			{
				cached[2] = this.replacements.get(cached[3]);
			}
			else if(this.loaded.has(cached[3]))
			{
				cached[2] = this.loaded.get(cached[3]);
			}

			return cached;
		}

		const blockSize = this.blockSize;

		let x   = 0;
		let y   = 0;
		let src = '';
		let original = '';

		const tileset = this.getTileset(tileNumber);
		const image   = this.tileImages.get(tileset);

		if(tileset && !tileset.meta && tileset.properties)
		{
			tileset.meta = Object.create(null);

			for(const property of tileset.properties)
			{
				tileset.meta[ property.name ] = property.value;
			}
		}

		if(tileNumber)
		{
			const localTileNumber = tileNumber + -tileset.firstgid + 1;

			const blocksWide = Math.ceil(image.width / blockSize);

			x = localTileNumber % blocksWide;
			y = Math.floor(localTileNumber/blocksWide);
			src = tileset.image;
			original = tileset.original;
		}

		const result = [x,y,src,original,tileset];

		Object.preventExtensions(result);

		this.tileCache.set(tileNumber, result);

		return result;
	}

	getSolid(xInput, yInput, layerInput = 0)
	{
		xInput = Math.trunc(xInput);
		yInput = Math.trunc(yInput);

		let offsetX = 0;
		let offsetY = 0;

		let tileNumber;
		let checkLayers;

		if(!(layerInput instanceof Map))
		{
			checkLayers = new Map;
			checkLayers.set(this.tileLayers[0], true);
			checkLayers.set(this.tileLayers[layerInput], true);
		}
		else
		{
			checkLayers = layerInput;
		}

		for(const [layer, willCheck] of checkLayers)
		{
			if(!willCheck || !layer)
			{
				continue;
			}

			const layerId = layer.index;

			if(this.tileLayers[layerId])
			{
				offsetX = this.tileLayers[layerId].offsetX ?? 0;
				offsetY = this.tileLayers[layerId].offsetY ?? 0;
			}

			tileNumber = this.getTileNumber(
				Math.floor( (xInput - offsetX) / this.blockSize )
				, Math.floor( (yInput - offsetY) / this.blockSize )
				, layerId
			);

			const solidLayerCount = this.collisionLayers.length;

			if(layerId <= 3)
			{
				if(tileNumber === 0)
				{
					continue;
				}

				if(tileNumber === 1)
				{
					return this.tileLayers[layerId];
				}
			}

			const tileSet   = this.getTileset(tileNumber);
			const mapData   = this.mapData;
			const blockSize = mapData.tilewidth;

			const tileCoords = this.getTile(tileNumber);

			const tilePosX = tileCoords[0] * blockSize;
			const tilePosY = tileCoords[1] * blockSize;

			const x = (Number(xInput) % blockSize);
			const y = (Number(yInput) % blockSize);

			const xPixel = tilePosX + x;
			const yPixel = tilePosY + y;

			const heightMask = this.heightMasks.get(tileSet);

			const iPixel = (xPixel + yPixel * heightMask.width) * 4;

			if(heightMask.data[iPixel + 3] === 255)
			{
				return this.tileLayers[layerId];
			}
		}
	}

	getColor(xInput, yInput, layerInput)
	{
		let offsetX = 0;
		let offsetY = 0;

		if(this.tileLayers[layerInput])
		{
			offsetX = this.tileLayers[layerInput].offsetX ?? 0;
			offsetY = this.tileLayers[layerInput].offsetY ?? 0;
		}

		const tileNumber  = this.getTileNumber(
			Math.floor( (xInput - offsetX) / this.blockSize )
			, Math.floor( (yInput - offsetY) / this.blockSize )
			, layerInput
		);

		const tileSet   = this.getTileset(tileNumber);
		const mapData   = this.mapData;
		const blockSize = mapData.tilewidth;

		const tileCoords = this.getTile(tileNumber);
		const tilePos = [tileCoords[0] * blockSize, tileCoords[1] * blockSize];

		const x = (Number(xInput) % blockSize);
		const y = (Number(yInput) % blockSize);

		const xPixel = tilePos[0] + x;
		const yPixel = tilePos[1] + y;

		const heightMask = this.heightMasks.get(tileSet);

		const iPixel = (xPixel + yPixel * heightMask.width) * 4;

		return (heightMask.data[iPixel + 0] << 24)
		+ (heightMask.data[iPixel + 1] << 16)
		+ (heightMask.data[iPixel + 2] << 8)
		+ (heightMask.data[iPixel + 3] << 0)
	}

	checkEmpty(tileNumber)
	{
		if(this.emptyCache.has(tileNumber))
		{
			return this.emptyCache.get(tileNumber);
		}

		const tile = this.getTile(tileNumber);

		const tileSet   = this.getTileset(tileNumber);
		const mapData   = this.mapData;
		const blockSize = mapData.tilewidth;

		const tileCoords = this.getTile(tileNumber);
		const tilePos = [tileCoords[0] * blockSize, tileCoords[1] * blockSize];

		for(let x = 0; x < blockSize; x++)
		for(let y = 0; y < blockSize; y++)
		{
			const xPixel = tilePos[0] + x;
			const yPixel = tilePos[1] + y;

			const heightMask = this.heightMasks.get(tileSet);

			const iPixel = (xPixel + yPixel * heightMask.width) * 4;

			if(heightMask.data[iPixel + 3] > 0)
			{
				this.emptyCache.set(tileNumber, false);
				return false;
			}
		}

		this.emptyCache.set(tileNumber, true);
		return true;
	}

	checkFull(tileNumber)
	{
		if(this.solidCache.has(tileNumber))
		{
			return this.solidCache.get(tileNumber);
		}

		const tile = this.getTile(tileNumber);

		const tileSet   = this.getTileset(tileNumber);
		const mapData   = this.mapData;
		const blockSize = mapData.tilewidth;

		const tileCoords = this.getTile(tileNumber);
		const tilePos = [tileCoords[0] * blockSize, tileCoords[1] * blockSize];

		for(let x = 0; x < blockSize; x++)
		for(let y = 0; y < blockSize; y++)
		{
			const xPixel = tilePos[0] + x;
			const yPixel = tilePos[1] + y;

			const heightMask = this.heightMasks.get(tileSet);

			const iPixel = (xPixel + yPixel * heightMask.width) * 4;

			if(heightMask.data[iPixel + 3] < 255)
			{
				this.solidCache.set(tileNumber, false);
				return false;
			}
		}

		this.solidCache.set(tileNumber, true);
		return true;
	}

	getTileset(tileNumber)
	{
		tileNumber = Number(tileNumber);

		const cache = this.tileSetCache;

		if(cache.has(tileNumber))
		{
			const cached = cache.get(tileNumber);

			if(this.replacements.has(cached.original))
			{
				cached.image = this.replacements.get(cached.original);
			}

			return cached;
		}

		if(!this.mapData)
		{
			return;
		}

		for(const i in this.mapData.tilesets)
		{
			const tileset = this.mapData.tilesets[i];

			if(tileNumber + 1 >= tileset.firstgid)
			{
				const nextTileset = this.mapData.tilesets[Number(i) + 1];

				if(nextTileset)
				{
					if(tileNumber + 1 < nextTileset.firstgid)
					{
						cache.set(tileNumber, tileset);

						if(this.replacements.has(tileset.original))
						{
							tileset.image = this.replacements.get(tileset.original);
						}

						return tileset;
					}
				}
				else
				{
					cache.set(tileNumber, tileset);

					if(this.replacements.has(tileset.original))
					{
						tileset.image = this.replacements.get(tileset.original);
					}

					return tileset;
				}
			}
		}
	}

	unreplace()
	{
		this.replacements.clear();
		this.tileCache.clear();
	}

	reset()
	{
		this.tileSetCache.clear();
		this.replacements.clear();
		this.tileCache.clear();

		for(let i = 0; i < this.tileLayers.length; i++)
		{
			const layer = this.tileLayers[i];

			layer.destroyed = false;
		}

		for(const tileset of this.mapData.tilesets)
		{
			tileset.image = tileset.original;
		}

		this.loadTilesets(this.mapData);
	}

	castRay(startX, startY, angle, maxDistance = 320, layerId = 0)
	{
		const checkLayers = (layerId instanceof Map)
			? new Map([...layerId.entries()].filter(x => x[1]))
			// : new Map([[this.tileLayers[0], true], [this.tileLayers[layerId], true]]);
			: new Map();
		const xOffDir = new Map;
		const yOffDir = new Map;

		if(!(layerId instanceof Map))
		for(const layer of this.tileLayers)
		{
			if(!layer.layer || !layer.layer.meta || !layer.layer.meta.solid)
			{
				continue;
			}

			if(layer.layer.meta.switchable && layer.index !== layerId)
			{
				continue;
			}

			// if(layer.layer.meta.platform)
			// {
			// 	if(angle < 0 || angle > Math.PI)
			// 	{
			// 		continue;
			// 	}
			// }

			checkLayers.set(layer, true);

			xOffDir.set(layer.index, Math.sign(layer.layer.args.offsetX));
			yOffDir.set(layer.index, Math.sign(layer.layer.args.offsetY));
		}

		// startX = Math.trunc(startX);
		// startY = Math.trunc(startY);

		maxDistance = Math.ceil(maxDistance);

		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		const endX = startX + (Math.abs(cos) > Number.EPSILON ? cos : 0) * maxDistance;
		const endY = startY + (Math.abs(sin) > Number.EPSILON ? sin : 0) * maxDistance;

		const bs = this.blockSize;

		const dx = endX - startX;
		const dy = endY - startY;

		const ox = Math.sign(dx);
		const oy = Math.sign(dy);

		const sx = dx ? Math.hypot(1, (dy / dx)) : 0;
		const sy = dy ? Math.hypot(1, (dx / dy)) : 0;

		let currentDistance = 0;

		if(this.getSolid(startX, startY, layerId))
		{
			return [startX, startY];
		}

		let initMode;

		const txy = this.coordsToTile(startX, startY, layerId) || this.coordsToTile(startX, startY, 0);

		for(const [layer, willCheck] of checkLayers)
		{
			if(!willCheck)
			{
				continue;
			}

			if(initMode = this.getTileNumber(txy[0], txy[1], layer.index))
			{
				break;
			}
		}

		let modeX = initMode;
		let modeY = initMode;

		let oldModeX = false;
		let oldModeY = false;

		let bf = initMode ? 1 : 1;

		const ax = ox > 0 ? (bs - startX % bs) : ((startX % bs) + 1);
		const ay = oy > 0 ? (bs - startY % bs) : ((startY % bs) + 1);

		let checkX = initMode ? 0 : ax;
		let checkY = initMode ? 0 : ay;

		let rayX = checkX * sx * ox;
		let rayY = checkY * sy * oy;

		const magX = Math.abs(rayX);
		const magY = Math.abs(rayY);

		const pa = new Set;
		const pb = new Set;

		const solidsX = new Set;
		const solidsY = new Set;

		window.logPoints && console.time('rayCast');

		let iterations = 0;

		while(Math.abs(currentDistance) < maxDistance && !solidsX.size && !solidsY.size)
		{
			if(ox && (!oy || Math.abs(rayX) < Math.abs(rayY)))
			{
				const mag = Math.abs(rayX);

				let px = (startX + mag * Math.cos(angle));
				let py = (startY + mag * Math.sin(angle));

				if(ox > 0 && px % 1 > 0.99999) px = Math.round(px);
				if(oy > 0 && py % 1 > 0.99999) py = Math.round(py);
				if(ox < 0 && px % 1 < 0.00001) px = Math.round(px);
				if(oy < 0 && py % 1 < 0.00001) py = Math.round(py);

				const [tx, ty] = this.coordsToTile(px, py, layerId);
				oldModeX = modeX;

				for(const [layer, willCheck] of checkLayers)
				{
					const layerId = layer.index;

					if(!willCheck)
					{
						continue;
					}

					if(modeX = this.getTileNumber(tx, ty, layerId))
					{
						break;
					}

					if(!modeX && (xOffDir.has(layerId) || yOffDir.has(layerId)))
					{
						if(modeX = this.getTileNumber(tx + -xOffDir.get(layerId), ty, layerId))
						{
							break;
						}

						if(modeX = this.getTileNumber(tx, ty + -yOffDir.get(layerId), layerId))
						{
							break;
						}

						if(modeX = this.getTileNumber(tx + -xOffDir.get(layerId), ty + -yOffDir.get(layerId), layerId))
						{
							break;
						}
					}
				}

				bf = modeX ? 1:bs;

				if(!modeX && oldModeX)
				{
					bf = ox < 0
						? ((startX + -checkX + 1) % bs)
						: (bs - ((startX + checkX) % bs));
				}

				window.logPoints && pa.add([px, py, `rayX tile-${tx}-${ty} mode-${modeX} bf-${bf} layer-${layerId} `]);

				// for(const layerId of checkLayers)
				// {
				// }
				if(this.getSolid(px, py, checkLayers))
				{
					solidsX.add([px, py]);
					break;
				}

				currentDistance = Math.abs(rayX);
				checkX += bf;
				rayX = checkX * sx * ox;
			}
			else
			{
				const mag = Math.abs(rayY);

				let px = (startX + mag * Math.cos(angle));
				let py = (startY + mag * Math.sin(angle));

				if(ox > 0 && px % 1 > 0.99999) px = Math.round(px);
				if(ox < 0 && px % 1 < 0.00001) px = Math.round(px);
				if(oy > 0 && py % 1 > 0.99999) py = Math.round(py);
				if(oy < 0 && py % 1 < 0.00001) py = Math.round(py);

				const [tx, ty] = this.coordsToTile(px, py, layerId);
				oldModeY = modeY;

				for(const [layer, willCheck] of checkLayers)
				{
					const layerId = layer.index;

					if(!willCheck)
					{
						continue;
					}

					if(modeY = this.getTileNumber(tx, ty, layerId))
					{
						break;
					}

					if(!modeY && (xOffDir.has(layerId) || yOffDir.has(layerId)))
					{
						if(modeY = this.getTileNumber(tx, ty + -yOffDir.get(layerId), layerId))
						{
							break;
						}

						if(modeY = this.getTileNumber(tx + -xOffDir.get(layerId), ty, layerId))
						{
							break;
						}

						if(modeY = this.getTileNumber(tx + -xOffDir.get(layerId), ty + -yOffDir.get(layerId), layerId))
						{
							break;
						}
					}
				}

				bf = modeY ? 1:bs;

				if(!modeY && oldModeY)
				{
					bf = oy < 0
						? ((startY + -checkY + 1) % bs)
						: (bs - ((startY + checkY) % bs));
				}

				window.logPoints && pb.add([px, py, `rayY tile-${tx}-${ty} mode-${modeY} bf-${bf} layer-${layerId} `]);

				// for(const layerId of checkLayers)
				// {
				// 	if(this.getSolid(px, py, layerId))
				// 	{
				// 		solidsY.add([px, py]);
				// 		break;
				// 	}
				// }
				if(this.getSolid(px, py, checkLayers))
				{
					solidsY.add([px, py]);
					break;
				}

				currentDistance = Math.abs(rayY);
				checkY += bf;
				rayY = checkY * sy * oy;
			}

			iterations++;
		}

		const points = [...solidsX, ...solidsY];
		const distSquares = points.map(s => (s[0] - startX) ** 2 + (s[1] - startY) ** 2);
		const minDistSq   = Math.min(...distSquares);
		const nearest     = points[ distSquares.indexOf(minDistSq) ];

		if(nearest)
		{
			if(ox > 0 && nearest[0] % 1 > 0.99999) nearest[0] = Math.round(nearest[0]);
			if(ox < 0 && nearest[0] % 1 < 0.00001) nearest[0] = Math.round(nearest[0]);
			if(oy > 0 && nearest[1] % 1 > 0.99999) nearest[1] = Math.round(nearest[1]);
			if(oy < 0 && nearest[1] % 1 < 0.00001) nearest[1] = Math.round(nearest[1]);
		}

		window.logPoints && console.timeEnd('rayCast');
		window.logPoints && console.log({iterations});

		if(window.logPoints)
		{
			window.logPoints(startX, startY, 'start');
			window.logPoints(endX, endY, 'end');

			[...pa].map(p => window.logPoints(p[0],p[1],p[2]));
			[...pb].map(p => window.logPoints(p[0],p[1],p[2]));

			// [...solidsX].map(p => window.logPoints(p[0],p[1],p[2]));
			// [...solidsY].map(p => window.logPoints(p[0],p[1],p[2]));

			nearest && window.logPoints(nearest[0], nearest[1], 'nearest');
		}

		if(Math.sqrt(minDistSq) > maxDistance)
		{
			return;
		}

		return nearest;
	}

	getCollisionMap()
	{
		const collisionMap = new Map;

		for(const layer of this.tileLayers)
		{
			let solid = false;

			if(layer.name.substr(0, 9) === 'Collision')
			{
				solid = true;
			}
			else if(layer.name.substr(0, 6) === 'Moving')
			{
				solid = true;
			}

			collisionMap.set(layer, solid);
		}

		return collisionMap;
	}

	negSafeMod(a,b)
	{
	    if(a >= 0) return a % b;
	    return (b + a % b) % b;
	}

	get blockSize()
	{
		return this.mapData.tilewidth;
	}

	fromImage(url, blockSize)
	{
		return new Promise(accept => {
			const image = new Image;

			image.addEventListener('load', event => {

				// const heightMask = new Tag('<canvas>');

				// heightMask.width  = image.width;
				// heightMask.height = image.height;

				const tilecount   = Math.floor((image.width * image.height) / 32**2);

				const tileset = {
					columns:     Math.floor(image.width / blockSize),
					firstgid:    1,
					image:       url.substr(4),
					original:    url.substr(4),
					imageheight: image.height,
					imagewidth:  image.width,
					margin:      0,
					name:        "image-map",
					spacing:     0,
					tileheight:  blockSize,
					tilewidth:   blockSize,
					tilecount
				};

				const layer = {
					"data": Object.assign(Object.create(null), [...Array(tilecount)].map((_,k) => k)),
					"width":Math.floor(image.width / blockSize),
					"height": Math.floor(image.height / blockSize),
					"id":1,
					"name":"Tile Layer 1",
					"opacity":1,
					"properties":[{
						"name":"solid",
						"type":"bool",
						"value":true
					}],
					"type":"tilelayer",
					"visible":true,
					"x":0,
					"y":0
				};

				const mapData = {
					tilewidth: blockSize
					, tileheight: blockSize
					, layers:[layer]
					, tilesets:[tileset]
					, width:Math.floor(image.width / blockSize)
					, height: Math.floor(image.height / blockSize)
				};

				this.mapData = mapData;

				console.log(mapData);

				this.loadLayers(mapData);

				this.loadTilesets(mapData).then(accept);

				// this.tileImages.set(tileset, image);

				// console.log(tileset, layer);

				// heightMask.getContext('2d').drawImage(
				// 	image, 0, 0, image.width, image.height
				// );

				// this.heightMasks.set(tileset, heightMask.getContext('2d').getImageData(0, 0, heightMask.width, heightMask.height));

				// new Elicit(url).objectUrl().then(url => tileset.image = tileset.cachedImage = url);


			}, {once:true});

			image.src = url;

		})
	}
}

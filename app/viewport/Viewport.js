import { Bag  } from 'curvature/base/Bag';
import { Tag  } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

import { Keyboard } from 'curvature/input/Keyboard';

import { Actor   } from '../actor/Actor';
import { PointActor } from '../actor/PointActor';
import { TileMap } from '../tileMap/TileMap';

import { CharacterString } from '../ui/CharacterString';

import { PointDump } from '../debug/PointDump';

export class Viewport extends View
{
	template  = require('./viewport.html');

	constructor(args,parent)
	{
		super(args,parent)
		// this.hud = new Hud
		this.sprites = new Bag;
		this.tileMap = new TileMap;
		this.world   = null;

		this.args.status = new CharacterString({value:'', scale: 2});

		this.args.labelX = new CharacterString({value:'x pos: '});
		this.args.labelY = new CharacterString({value:'y pos: '});

		this.args.labelGround = new CharacterString({value:'Ground: '});
		this.args.labelGSpeed = new CharacterString({value:'G speed: '});
		this.args.labelXSpeed = new CharacterString({value:'X speed: '});
		this.args.labelYSpeed = new CharacterString({value:'Y speed: '});
		this.args.labelMode   = new CharacterString({value:'Mode: '});
		this.args.labelAngle  = new CharacterString({value:'Angle: '});

		this.args.xPos   = new CharacterString({value:0});
		this.args.yPos   = new CharacterString({value:0});
		this.args.gSpeed = new CharacterString({value:0});
		this.args.ground = new CharacterString({value:''});
		this.args.xSpeed = new CharacterString({value:0});
		this.args.ySpeed = new CharacterString({value:0});
		this.args.mode   = new CharacterString({value:0});
		this.args.angle  = new CharacterString({value:0});

		this.args.blockSize = 32;
		this.args.willStick = true;
		this.args.stayStuck = true;

		// this.args.height = 600;
		// this.args.width  = 800;

		// this.args.width  = 32*16.5;
		// this.args.height = 32*12.5;

		this.args.width  = 32 * 9.5;
		this.args.height = 32 * 7.5;

		this.args.x = 0;
		this.args.y = 0;


		this.args.offsetX = 0;
		this.args.offsetY = 0;

		this.blocksXY = {};

		this.args.scale = 2;
		this.args.animation = '';

		const actor = new PointActor;

		actor.viewport = this;

		this.args.actors = [ actor ];

		this.blocks = new Bag;

		this.args.blocks = this.blocks.list;

		this.args.bindTo('willStick', v => {
			if(v)
			{
				this.args.stayStuck = true;
			}

		});

		this.args.bindTo('stayStuck', v => {
			if(!v)
			{
				this.args.willStick = false;
			}
		});

		this.listen(window, 'gamepadconnected', event => this.padConnected(event));
	}

	onAttached(event)
	{
		this.update();

		this.args.paused = true;

		this.args.status.args.hide = 'hide';

		this.onTimeout(600, () => {
			this.args.animation = 'opening';
			this.tags.viewport.focus();

			this.onTimeout(200, () => {
				this.args.animation = 'opening2';
				this.tags.viewport.focus();

				this.onTimeout(1800, () => {
					this.args.animation = 'closing';
					this.tags.viewport.focus();

					this.args.status.args.value = ' Click to enable keyboard controls. ';
					this.args.status.args.hide = '';

					this.onTimeout(220, () => {
						this.args.animation = 'closed';
						this.tags.viewport.focus();

					});

					this.onTimeout(250, () => {
						this.args.paused = false;
					});
				});
			});
		});

		this.listen(document.body, 'click', event => {

			if(event.target !== document.body)
			{
				return;
			}

			this.tags.viewport.focus()
		});

		this.args.scale = this.args.scale || 1;

		const keyboard = Keyboard.get();

		keyboard.listening = true

		keyboard.focusElement = this.tags.viewport.node;
	}

	update()
	{
		if(this.args.paused)
		{
			this.tags.frame.style({
				'--scale': this.args.scale
				, '--width': this.args.width
			});

			return;
		}

		this.args.actors[0].willStick = !!this.args.willStick;
		this.args.actors[0].stayStuck = !!this.args.stayStuck;

		if(Keyboard.get().getKey(' ') > 0)
		{
			this.args.actors[0].jump();
		}

		if(Keyboard.get().getKey('Shift') > 0)
		{
			this.args.actors[0].running  = false;
			this.args.actors[0].crawling = true;
		}
		else if(Keyboard.get().getKey('Control') > 0)
		{
			this.args.actors[0].running  = true;
			this.args.actors[0].crawling = false;
		}
		else
		{
			this.args.actors[0].running  = false;
			this.args.actors[0].crawling = false;
		}

		if(Keyboard.get().getKey('ArrowLeft') > 0 || Keyboard.get().getKey('a') > 0)
		{
			this.args.actors[0].xAxis = -1;
		}
		else if(Keyboard.get().getKey('ArrowRight') > 0 || Keyboard.get().getKey('d') > 0)
		{
			this.args.actors[0].xAxis = 1;
		}
		else
		{
			this.args.actors[0].xAxis = 0;
		}

		if(this.gamepad)
		{
			const gamepads = navigator.getGamepads();

			for(let i = 0; i < gamepads.length; i++)
			{
				const gamepad = gamepads.item(i);

				if(!gamepad)
				{
					continue;
				}

				if(gamepad.axes[0] && Math.abs(gamepad.axes[0]) > 0.3)
				{
					this.args.actors[0].xAxis = gamepad.axes[0] > 0 ? 1 : -1;
				}
				else
				{
					this.args.actors[0].xAxis = 0;
				}

				if(gamepad.buttons[14].pressed)
				{
					this.args.actors[0].xAxis = -1;
				}
				else if(gamepad.buttons[15].pressed)
				{
					this.args.actors[0].xAxis = 1;
				}

				if(gamepad.buttons[5].pressed)
				{
					this.args.actors[0].running  = false;
					this.args.actors[0].crawling = true;
				}
				else if(gamepad.buttons[1].pressed || gamepad.buttons[4].pressed)
				{
					this.args.actors[0].running  = true;
					this.args.actors[0].crawling = false;
				}
				else
				{
					this.args.actors[0].running  = false;
					this.args.actors[0].crawling = false;
				}

				if(gamepad.buttons[0].pressed)
				{
					this.args.actors[0].jump();
				}
			}
		}

		for(const i in this.args.actors)
		{
			this.args.actors[i].update();
		}

		const angle = this.args.actors[0].angle;

		this.args.x = -this.args.actors[0].x + this.args.width  / 2;
		this.args.y = -this.args.actors[0].y + this.args.height / 2;

		if(this.args.x > 0)
		{
			this.args.x = 0;
		}

		if(this.args.y > 0)
		{
			this.args.y = 0;
		}

		const maxPanX = -this.args.width  + (this.tileMap.mapData.width  * 32);
		const maxPanY = -this.args.height + (this.tileMap.mapData.height * 32);

		if(this.args.x < -maxPanX)
		{
			this.args.x = -maxPanX;
		}

		if(this.args.y < -maxPanY)
		{
			this.args.y = -maxPanY;
		}

		const blocksWide = Math.ceil((this.args.width  / this.args.blockSize));
		const blocksHigh = Math.ceil((this.args.height / this.args.blockSize));

		for(var i = -1; i <= blocksWide + 1; i++)
		{
			for(var j = -1; j <= blocksHigh + 1; j++)
			{
				if(!this.blocksXY[i])
				{
					this.blocksXY[i] = {};
				}

				if(!this.blocksXY[i][j])
				{
					this.blocksXY[i][j] = new Tag('<div>');
				}

				let block = this.blocksXY[i][j];

				const blockId = this.tileMap.getTileNumber(
					this.args.offsetX
						+ i
						- Math.ceil(this.args.x / this.args.blockSize)
						+ 0
					, this.args.offsetY
						+ j
						- Math.ceil(this.args.y / this.args.blockSize)
						+ 0
				);

				// block.innerText = blockId || '';

				const tileXY = this.tileMap.getTile(blockId);

				if(!this.blocks.has(block))
				{
					block.style({
						width: this.args.blockSize + 'px'
						, height: this.args.blockSize + 'px'
					});

					const transX = this.args.blockSize * i
						+ (this.args.offsetX * this.args.blockSize)
						% this.args.blockSize;

					const transY = this.args.blockSize * j
						+ (this.args.offsetY * this.args.blockSize)
						% this.args.blockSize;

					block.style({
						transform: `translate(${transX}px, ${transY}px)`
						, 'background-image': 'url(/Sonic/testTiles2.png)'
						, 'background-position': -1*(tileXY[0]*this.args.blockSize)
							+ 'px '
							+ -1*(tileXY[1]*this.args.blockSize)
							+ 'px'
						, position: 'absolute'
						, left: 0
						, top: 0
					});

					this.blocks.add(block);
				}

				block.style({
					'background-position': -1*(tileXY[0]*this.args.blockSize)
						+ 'px '
						+ -1*(tileXY[1]*this.args.blockSize)
						+ 'px'
				});
			}
		}

		this.tags.viewport.style({
			'--x': Math.round(this.args.x)
			, '--y': Math.round(this.args.y)
			, '--xMod': Math.round(this.args.x % this.args.blockSize)
			, '--yMod': Math.round(this.args.y % this.args.blockSize)
			, '--width': this.args.width
			, '--height': this.args.height
		});

		this.tags.frame.style({
			'--scale': this.args.scale
			, '--width': this.args.width
		});

		this.args.xPos.args.value   = Math.floor(this.args.actors[0].x);
		this.args.yPos.args.value   = Math.floor(this.args.actors[0].y);
		this.args.ground.args.value = this.args.actors[0].args.landed;
		this.args.gSpeed.args.value = this.args.actors[0].args.gSpeed;
		this.args.xSpeed.args.value = Math.floor(this.args.actors[0].args.xSpeed);
		this.args.ySpeed.args.value = Math.floor(this.args.actors[0].args.ySpeed);
		this.args.angle.args.value  = Math.floor((this.args.actors[0].args.angle) * 1000) / 1000;

		const modes = ['FLOOR', 'L-WALL', 'CEILING', 'R-WALL'];

		this.args.mode.args.value = modes[Math.floor(this.args.actors[0].args.mode)] || Math.floor(this.args.actors[0].args.mode);
	}

	screenBox()
	{
		return [
			this.camera.x   - Math.floor(this.width/2)
			, this.camera.y - Math.floor(this.height/2)
			, this.camera.x + Math.ceil(this.width/2)
			, this.camera.y + Math.ceil(this.height/2)
		];
	}

	padConnected(event)
	{
		this.gamepad = event.gamepad;
	}
}

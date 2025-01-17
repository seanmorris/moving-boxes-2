import { PointActor } from './PointActor';

import { Platformer } from '../behavior/Platformer';

import { Sfx } from '../audio/Sfx';

import { Tag } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

import { Twist } from '../effects/Twist';
import { Pinch } from '../effects/Pinch';

import { Png } from '../sprite/Png';

import { Ring } from './Ring';
import { Spring } from './Spring';

import { FireSheild }     from '../powerups/FireSheild';
import { BubbleSheild }   from '../powerups/BubbleSheild';
import { ElectricSheild } from '../powerups/ElectricSheild';

import { GrindingRegion } from '../region/GrindingRegion';

import { Marker } from './Marker';

import { SkidDust } from '../behavior/SkidDust';
import { SuperForm } from '../behavior/SuperForm';
import { EmeraldHalo } from '../behavior/EmeraldHalo';

import { Color } from '../lib/Color';

import { Router } from 'curvature/base/Router';

const MODE_FLOOR   = 0;
const MODE_LEFT    = 1;
const MODE_CEILING = 2;
const MODE_RIGHT   = 3;

export class Sonic extends PointActor
{
	png = new Png('/Sonic/sonic.png');

	constructor(...args)
	{
		super(...args);

		window.sonic = this;

		this.behaviors.add(new SkidDust);
		this.behaviors.add(new SuperForm);
		this.behaviors.add(new EmeraldHalo);

		this.args.canonical = 'Sonic';

		this.args.type = 'actor-sonic actor-item';

		this.accelNormal = 0.12;
		this.accelSuper  = 0.24;

		this.markers = new Set;

		this.springing = false;

		this.args.boltCount = 0;

		this.args.accel     = this.accelNormal;
		this.args.decel     = 0.40;

		this.gSpeedMaxNormal = 18;
		this.gSpeedMaxSuper  = 20;
		this.gSpeedMaxHyper  = 23;

		this.jumpForceNormal = 11;
		this.jumpForceSuper  = 13;
		this.jumpForceHyper  = 15;

		this.args.gSpeedMax = this.gSpeedMaxNormal;
		this.args.jumpForce = this.jumpForceNormal;
		this.args.gravity   = 0.5;

		this.args.width  = 16;
		this.args.height = 40;

		this.args.normalHeight  = 40;
		this.args.rollingHeight = 28;

		this.sparks = new Set();

		this.spindashCharge = 0;
		this.dropDashCharge = 0;

		this.willStick = false;
		this.stayStuck = false;

		this.lightDashed = true;
		this.dashed = false;

		this.airControlCard = View.from(require('../cards/sonic-air-controls.html'));
		this.controlCard    = View.from(require('../cards/sonic-controls.html'));

		this.moveCard = View.from(require('../cards/basic-moves.html'));

		this.args.spriteSheet = this.spriteSheet = '/Sonic/sonic.png';

		this.hyperSheet = 0;

		this.costumes = {
			Santiago: {h: -30, s: 1.5,  v: 1.25},
			Sequel:   {h: -10, s: 1.5,  v: 1.25},
			White:    {h: 0,   s: 0,    v: 1.25},
			RedHot:   {h: 115, s: 1.75, v: 1.00},
			Brown:    {h: 125, s: 1.15, v: 0.50},
		};

		this.args.bindTo('falling', v => {

			if(v)
			{
				return;
			}

			if(this.willStick && (this.args.mode === 1 || this.args.mode === 3))
			{
				this.args.wallSticking = true;
				this.onNextFrame(()=>{
					this.dashed = false;
				});
			}
			else
			{
				this.onNextFrame(()=>{
					this.args.wallSticking = false;
				});
			}
		});

		this.transformTime = 0;

		this.args.minRingsSuper = 50;
		this.args.minRingsHyper = 75;
	}

	shiftColor(color, h, s, v)
	{
		const c = new Color(color);

		return c.rotate(h, s, v);
	}

	onRendered(event)
	{
		super.onRendered(event);

		const superColors = {
			'8080e0': 'e0e080',
			'6060c0': 'e0e000',
			'4040a0': 'e0e001',
			'202080': 'a0a000',
		};

		const hyperColorsRed = {
			'8080e0': 'fcfcfc',
			'6060c0': 'fcfcfc',
			'4040a0': 'fcd8d8',
			'202080': 'fcb4b4',
		};

		const hyperColorsPurple = {
			'8080e0': 'fcfcfc',
			'6060c0': 'fcfcfc',
			'4040a0': 'fcd8fc',
			'202080': 'd8b4d8',
		};

		const hyperColorsCyan = {
			'8080e0': 'd8fcfc',
			'6060c0': 'fcfcfc',
			'4040a0': 'b4d8fc',
			'202080': '90b4fc',
		};

		const hyperColorsBlue = {
			'8080e0': 'd8d8ff',
			'6060c0': 'b4b4d8',
			'4040a0': 'a4a4d8',
			'202080': '6c6cb4',
		};

		const hyperColorsGreen = {
			'8080e0': 'd8fcfc',
			'6060c0': 'd8fcd8',
			'4040a0': 'b4fcb4',
			'202080': '00fc24',
		};

		const hyperColorsYellow = {
			'8080e0': 'd8fcfc',
			'6060c0': 'd8fcb4',
			'4040a0': 'd8fc48',
			'202080': 'd8d800',
		};

		const hyperColorsWhite = {
			'8080e0': 'ffffff',
			'6060c0': 'fcfcfc',
			'4040a0': 'd8d8d8',
			'202080': 'b4b4b4',
		};

		// const rH = 180;
		// const rS = 1;
		// const rV = 1;

		// const rH2 = 0;
		// const rS2 = 1;
		// const rV2 = 1;

		this.rotatedSpriteSheet = this.spriteSheet;

		const updateSprite = () => {

			let h = Number(this.viewport.customColor.h ?? 0);
			let s = Number(this.viewport.customColor.s ?? 1);
			let v = Number(this.viewport.customColor.v ?? 1);

			this.rotateMainColor(h,s,v);

			// this.args.spriteSheet = this.args.rotatedSpriteSheet;

			this.box.node.style.setProperty('--sprite-sheet', `url(${this.args.rotatedSpriteSheet})`);
		};

		const debindH = this.viewport.customColor.bindTo('h', updateSprite, {wait:0});
		const debindS = this.viewport.customColor.bindTo('s', updateSprite, {wait:0});
		const debindV = this.viewport.customColor.bindTo('v', updateSprite, {wait:0});

		this.onRemove(debindH);
		this.onRemove(debindS);
		this.onRemove(debindV);

		if(this.viewport.args.networked)
		{
			if(this.args.netplayer)
			{
				const costume = 'Santiago';

				Object.assign(this.viewport.customColor, this.costumes[costume]);
			}
			else
			{
				const costume = 'Sequel';

				Object.assign(this.viewport.customColor, this.costumes[costume]);
			}
		}
		else if(this.viewport.args.mainPallet && this.costumes[this.viewport.args.mainPallet])
		{
			Object.assign(this.viewport.customColor, this.costumes[this.viewport.args.mainPallet]);
		}

		if(!this.superSpriteSheetLoader)
		{
			this.superSpriteSheetLoader = this.png.ready.then(()=>{
				const newPng = this.png.recolor(superColors);
				this.superSpriteSheet = newPng.toUrl();
			});
		}

		if(!this.hyperSpriteSheetLoader)
		{
			this.hyperSpriteSheetLoader = this.png.ready.then(() => this.hyperSpriteSheets = [
				this.png.recolor(hyperColorsRed).toUrl()
				, this.png.recolor(hyperColorsCyan).toUrl()
				, this.png.recolor(hyperColorsPurple).toUrl()
				, this.png.recolor(hyperColorsWhite).toUrl()
				, this.png.recolor(hyperColorsGreen).toUrl()
				, this.png.recolor(hyperColorsBlue).toUrl()
				, this.png.recolor(hyperColorsYellow).toUrl()
			]);
		}

		if(!this.arm)
		{
			this.arm = new Tag(`<div class = "rear-arm">`);
			this.box.appendChild(this.arm.node);
		}

		if(!this.swoosh)
		{
			this.swoosh = new Tag(`<div class = "double-spin">`);
			this.box.appendChild(this.swoosh.node);
		}

		this.autoAttr.get(this.box)['data-doublespin'] = 'doubleSpin';

	}

	updateStart()
	{
		if(this.args.grinding && this.args.falling && this.args.ySpeed > 0)
		{
			this.args.animation = 'airdash';
			this.args.grinding = false;
		}

		super.updateStart();

		if(this.args.dead)
		{
			this.args.animation = 'dead';
			return;
		}
	}

	updateEnd()
	{
		// if(this.args.animation === 'transform')
		// {
		// 	this.transformTime++;
		// }
		// else if(this.transformTime > 0)
		// {
		// 	this.transformTime = 0;
		// }

		if(!this.args.falling && this.pinchFilterBg)
		{
			this.pinch(0, 0);
		}

		super.updateEnd();
	}

	update()
	{
		if(this.args.falling && this.isHyper && this.dashed && this.yAxis < -0.5)
		{
			this.args.ySpeed -= 0.6;
		}

		if((!this.args.falling && this.groundTime > 3) || (this.args.falling && this.fallTime > 90))
		{
			this.args.trickRamp = false
			this.args.twistRamp = false
		}

		if(this.args.dead)
		{
			this.args.animation = 'dead';
			super.update();
			return;
		}

		if(this.isSuper)
		{
			const tick = this.isHyper ? 30 : 60;

			if(this.viewport.args.frameId % tick === 0)
			{
				if(this.args.rings < 2)
				{
					this.isHyper = false;
					this.setProfile();
				}

				if(this.args.rings > 0)
				{
					this.args.rings--;
				}
				else
				{
					this.isSuper = false;
					this.isHyper = false;
					this.setProfile();
				}
			}
		}

		this.args.isSuper = this.isSuper;
		this.args.isHyper = this.isHyper;

		if(this.isHyper)
		{
			if(this.viewport.args.frameId % 45 === 0)
			{
				this.args.spriteSheet = this.hyperSpriteSheets[ this.hyperSheet++ ];

				if(this.hyperSheet >= this.hyperSpriteSheets.length)
				{
					this.hyperSheet = 0;
				}
			}
		}

		if(this.args.falling)
		{
			if(this.args.wallSticking && !this.dashed)
			{
				if(this.args.mode === 1)
				{
					this.args.direction = -1;
					this.args.facing = 'left';
				}
				else if(this.args.mode === 3)
				{
					this.args.direction = 1;
					this.args.facing = 'right';
				}

				this.args.animation = 'wall-dropping-start';

				this.onTimeout(150, () => {
					if(this.args.falling && this.args.wallDropping)
					{
						this.args.animation = 'wall-dropping';
					}
				});

				this.args.wallDropping = true;

				this.args.groundAngle = 0;

				this.args.ignore = 30;
			}

			if(this.args.wallDropping)
			{
				this.args.groundAngle = 0;
			}

			if(this.args.animation === 'hanging' && this.args.ySpeed > -3)
			{
				this.args.animation = 'wall-dropping';
			}

			this.args.wallSticking = false;
		}
		else
		{
			this.args.wallDropping = false;
			this.swing = false;

			if(this.springing)
			{
				this.args.groundAngle = 0;
			}

			this.springing = false;

			this.args.doubleSpin = this.dashed = false;

			if(this.args.mode % 2 === 0)
			{
				this.args.wallSticking = false;
			}

			if(!this.args.wallSticking)
			{
				this.willStick = false;
			}

			// this.pincherBg.args.scale = 0;
		}

		if(this.lightDashingCoolDown > 0)
		{
			this.lightDashingCoolDown--;
		}

		if(this.dashTimer > 0)
		{
			this.dashTimer--;
		}

		const falling = this.args.falling;

		if(falling)
		{
			this.args.cameraBias = 0;
		}

		if(this.args.wallSticking)
		{
			this.args.animation = 'wall-stick';

			let slip = 3;

			if(this.yAxis < 0)
			{
				this.args.animation = 'wall-stick-brake';
				this.stayStuck = true;
				slip = 0;
			}
			else if(this.yAxis > 0)
			{
				slip = 6;
			}

			if(this.args.modeTime < 15)
			{
				slip = 0;
			}

			if(this.args.mode === 1)
			{
				this.args.facing = 'left';
				this.args.direction = 1;

				if(Math.abs(this.args.gSpeed) < slip)
				{
					this.args.gSpeed += 1;
				}
				else
				{
					this.args.gSpeed = slip;
				}
			}
			else if(this.args.mode === 3)
			{
				this.args.facing = 'right';
				this.args.direction = -1;

				if(Math.abs(this.args.gSpeed) < slip)
				{
					this.args.gSpeed -= 1;
				}
				else
				{
					this.args.gSpeed = -slip;
				}
			}

			const radius = Math.ceil(this.args.width / 2);
			const direction = Math.sign(this.args.gSpeed);

			const headPoint = this.rotatePoint(radius * -direction, this.args.height);

			if(this.getMapSolidAt(this.x + headPoint[0], this.y + headPoint[1]))
			{
				this.bMap('doJump', 0);
			}
		}
		else if(this.lightDashing)
		{
			const direction = Math.sign(this.args.xSpeed) || Math.sign(this.args.gSpeed);

			if(direction < 0)
			{
				this.args.animation = 'lightdash-back';
			}
			else if(direction > 0)
			{
				this.args.animation = 'lightdash';
			}

			if(falling)
			{
				this.args.direction = Math.sign(this.args.xSpeed) || this.args.direction;

				this.args.mode = MODE_FLOOR;
			}
		}
		else if(!falling)
		{
			const maxSpeedNormal  = this.gSpeedMaxNormal / (this.isSuper ? 2 : 1);
			const friction = this.getLocalFriction();
			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed) / friction ** 2;
			const maxSpeed  = this.args.gSpeedMax;

			this.dashed = false;
			this.lightDashed = false;
			this.lightDashReward = null;

			this.args.height = this.args.normalHeight;

			if(this.spindashCharge)
			{
				if(this.spindashCharge < 1)
				{
					this.spindashCharge = 0;
				}
				else
				{
					this.args.animation = 'spindash';

					this.spindashCharge -= 0.2;

					if(this.dashDust)
					{
						this.dashDust.style({'--dashCharge': this.spindashCharge});
					}

					let dashCharge = this.spindashCharge / 20;

					if(dashCharge > 1)
					{
						dashCharge = 1;
					}

					this.twist(120 * dashCharge * this.args.direction);
				}
			}
			else if(!this.args.rolling)
			{
				this.args.crouching = false;

				if(friction > 0.5 && Math.sign(direction) && Math.sign(gSpeed) && Math.sign(gSpeed) !== Math.sign(direction) && !this.args.antiSkid)
				{
					this.args.animation = 'skidding';
				}
				else if(this.args.moving && speed > maxSpeedNormal * 0.75)
				{
					if(this.xAxis || friction >= 0.5)
					{
						if(this.isSuper && this.args.moving && speed > maxSpeedNormal * 1.85)
						{
							this.args.animation = 'super-run';
						}
						else if(this.args.moving && speed > maxSpeedNormal * 2.25)
						{
							this.args.animation = 'running-4';
						}
						else if(this.args.moving && speed > maxSpeedNormal * 1.75)
						{
							this.args.animation = 'running-3';
						}
						else if(this.args.moving && speed > maxSpeedNormal * 1.25)
						{
							this.args.animation = 'running-2';
						}
						else
						{
							this.args.animation = 'running';
						}
					}
					else if(Math.abs(this.args.gSpeed) > 3.5)
					{
						this.args.animation = 'sliding';
					}
					else
					{
						this.args.animation = 'standing';
					}
				}
				else if(this.args.moving && this.args.gSpeed)
				{
					if(this.xAxis || friction > 0.5)
					{
						this.args.animation = 'walking';
					}
					else if(Math.abs(this.args.gSpeed) > 3.5)
					{
						this.args.animation = 'sliding';
					}
					else
					{
						this.args.animation = 'standing';
					}
				}
				else if(this.xAxis && friction === 0)
				{
					this.args.animation = 'running';
					this.args.facing = this.xAxis === -1 ? 'left' : 'right';
				}
				else if(this.args.moving && this.args.gSpeed)
				{
					this.args.pushing = Math.sign(this.args.gSpeed);
				}
				else
				{
					if(this.yAxis > 0.5 && !this.args.ignore && !this.carrying.size && !this.spindashCharge)
					{
						this.args.animation = 'crouching';

						this.args.crouching = true;

						this.args.lookTime--;

						if(this.args.lookTime < -45)
						{
							this.args.cameraBias = -0.5;
						}
					}
					else if(this.yAxis && this.yAxis < -0.5 && !this.args.ignore)
					{
						this.args.animation = 'looking-up';

						this.args.lookTime++;

						if(this.args.lookTime > 45)
						{
							this.args.cameraBias = 0.25;
						}
					}
					else
					{
						const fieldType = this.viewport.meta['fieldType'];

						if(this.args.teeter)
						{
							this.args.animation = 'teeter';

							if(this.args.teeter === -1)
							{
								this.args.animation = 'teeter--1';
							}

							if(this.args.teeter === 2)
							{
								this.args.animation = 'teeter-2';
							}
						}
						else if(fieldType === 'garden' || fieldType === 'adventure')
						{
							this.args.animation = 'standing';
						}
						else if(this.idleTime > 60*300)
						{
							this.args.animation = 'idle-3';
						}
						else if(this.idleTime > 250)
						{
							this.args.animation = 'idle-2';
						}
						else if(this.idleTime > 200)
						{
							this.args.animation = 'idle';
						}
						else
						{
							this.args.animation = 'standing';
						}

						this.args.cameraBias = 0;
						this.args.lookTime = 0;
					}
				}
			}

			if(!this.spindashCharge && this.dashDust)
			{
				this.dashDust.remove();

				this.dashDust = null;
			}

			if(this.dropDashCharge)
			{
				this.args.animation = 'spindash';
				this.args.rolling = true;
			}
		}
		else if(!this.dashed)
		{
			this.args.height = this.args.rollingHeight;

			if(this.args.jumping)
			{
				this.args.animation = 'jumping';
			}
			else if(!this.args.xSpeed && !this.args.ySpeed)
			{
				// this.box.setAttribute('data-animation', 'airdash');
			}
		}
		else if(falling && !this.args.jumping && this.isSuper && this.args.ySpeed > 0)
		{
			this.args.animation = 'dropping';

			this.onTimeout(150, () => {
				if(this.args.falling)
				{
					this.args.animation = 'dropping';
				}
			});
		}

		if(falling && this.args.animation === 'standing')
		{
			this.args.animation = 'walking';
		}

		if(this.args.animation === 'skidding' && this.fallTime > 16)
		{
			if(Math.abs(this.args.groundAngle) > Math.PI/2)
			{
				this.args.animation = 'walking';
			}
			else
			{
				this.args.animation = 'skidding-falling';
			}
		}

		if(this.args.hangingFrom)
		{
			this.args.animation = 'hanging';
		}
		else if(this.swing)
		{
			this.args.animation = 'jumping';
		}

		if(this.args.rolling)
		{
			if(this.args.animation !== 'spindash')
			{
				this.args.animation = 'rolling';
			}
			else
			{
				this.viewport.onFrameOut(14, () => this.args.animation = 'rolling');
				this.args.animation = 'spindash';
			}
		}

		if(this.skidding && !this.args.rolling && !this.args.falling && !this.spindashCharge)
		{
			this.args.xOff = 8 * -this.args.direction;
			this.args.yOff = 32;

			let warp = -this.args.gSpeed * 22;

			if(Math.abs(warp) > 256)
			{
				warp = 256 * Math.sign(warp);
			}

			this.twist(warp);
		}
		else if(!this.spindashCharge)
		{
			this.twister && (this.twister.args.scale = 0);
		}

		if(this.args.standingOn && this.args.standingOn.isVehicle)
		{
			this.args.animation = this.args.standingOn.ridingAnimation || 'standing';
		}

		if(this.viewport.args.frameId % 2 === 0)
		if(this.viewport.args.frameId % this.viewport.settings.frameSkip === 0)
		{
			if(this.args.grinding && !this.args.falling)
			{
				// `<div class = "particle-sparks">`

				const sparkTag = document.createElement('div');
				sparkTag.classList.add('particle-sparks');
				const sparkParticle = new Tag(sparkTag);

				// `<div class = "envelope-sparks">`
				const envelopeTag = document.createElement('div');
				envelopeTag.classList.add('envelope-sparks');
				const sparkEnvelope = new Tag(envelopeTag);

				sparkEnvelope.appendChild(sparkParticle.node);

				const sparkPoint = this.rotatePoint(
					-this.args.gSpeed * 1.75 * this.args.direction
					, 8
				);

				const flip = Math.sign(this.args.gSpeed);

				sparkEnvelope.style({
					'--x': sparkPoint[0] + this.args.x
					, '--y': sparkPoint[1] + this.args.y + Math.random() * -3
					, 'z-index': 0
					, 'animation-delay': (-Math.random()*0.25) + 's'
					, '--xMomentum': Math.max(Math.abs(this.args.gSpeed), 4) * flip
					, '--flip': flip
					, '--angle': this.realAngle
					, opacity: Math.random() * 2
				});

				sparkEnvelope.particle = sparkParticle;

				this.viewport.particles.add(sparkEnvelope);

				this.sparks.add(sparkEnvelope);

				const viewport = this.viewport;

				this.viewport.onFrameOut(30, () => {
					viewport.particles.remove(sparkEnvelope);
					this.sparks.delete(sparkEnvelope);
				});
			}
		}

		if(this.pincherBg)
		{
			this.pincherBg.args.scale *= 0.85;
			// this.pincherFg.args.scale *= 0.875;

			if(Math.abs(this.pincherBg.args.scale) < 0.1)
			{
				// this.pincherBg.args.scale = 0;
				// this.pincherFg.args.scale = 0;
			}
		}
		else
		{
			// this.pinch(0, 0);
		}

		if(!this.twister)
		{
			this.twist(0);
		}

		if(this.args.grinding)
		{
			this.args.rolling = false;

			if(this.yAxis > 0.5)
			{
				this.args.animation = 'grinding-crouching';
			}
			else
			{
				this.args.animation = 'grinding';
			}
		}

		super.update();

		if(!this.yAxis && this.spindashCharge)
		{
			this.spindash();
		}

		if(this.args.falling && this.springing && this.args.ySpeed >= 0)
		{
			this.args.groundAngle = 0;
			this.args.animation = 'dropping-start';
			this.springing = false;

			this.onTimeout(150, () => {
				if(!this.args.falling || this.args.animation !== 'dropping-start')
				{
					return;
				}

				this.args.animation = 'dropping';
			});
		}

		if(this.args.boltDash)
		{
			// this.dimmer = this.dimmer || new Tag('<div class = "particle particle-dimmer">');

			const boltParticle = new Tag('<div class = "particle particle-bolt">');

			const speed = this.args.falling
				? this.args.airSpeed
				: this.args.gSpeed;

			const boltPoint = this.rotatePoint(
				(speed < 0 ? 8 : -8)
				, this.args.falling
					? (this.dashed ? (speed < 0 ? 28 : 32) : 14)
					: 28
			);

			// this.dimmer.style({
			// 	'--x': this.args.x + boltPoint[0]
			// 	, '--y': this.args.y + boltPoint[1]
			// });

			this.args.boltCount++;

			const direction = Math.sign(this.args.gSpeed || this.args.xSpeed);

			boltParticle.attr({'data-direction': direction});

			boltParticle.style({
				'--x': this.args.x + boltPoint[0]
				, '--y': this.args.y + boltPoint[1]
				, '--index': this.args.boltCount
				, '--direction': direction
				, '--mod': this.viewport.args.frameId % 4
				, '--wipe': Math.abs(speed)
				, '--angle': this.args.falling
					? this.args.airAngle
					: this.realAngle
				, '--dashCharge': 0
			});


			this.viewport.particles.add(boltParticle);

			if(Math.abs(speed) < 20 && this.args.falling)
			{
				this.args.boltDash = false;
			}

			// this.viewport.particles.add(this.dimmer);

			this.viewport.onFrameOut(30, () => {
				this.viewport.particles.remove(boltParticle);
			});
		}

		if([...this.regions].filter(r => r.isWater).length
			&& !this.bMap('checkBelow', this.args.x, this.args.y + 16).get(Platformer)
			&& this.args.falling
			&& this.dashed
		){
			if(this.yAxis < 0)
			{
				this.args.xSpeed = this.args.xSpeed* 0.95;
				this.args.ySpeed -= Math.abs(this.args.xSpeed) * 0.05;
			}

			if(this.yAxis > 0)
			{
				this.args.xSpeed += Math.abs(this.args.ySpeed) * 0.05 * Math.sign(this.args.xSpeed);
				this.args.ySpeed = this.args.ySpeed* 0.95;
			}
		}

		if(this.viewport.args.frameId % this.viewport.settings.frameSkip === 0)
		{
			if(this.args.grinding && !this.args.falling && this.args.gSpeed)
			{
				for(const spark of this.sparks)
				{
					const sparkPoint = this.rotatePoint(
						1.75 * this.args.direction
						, 8
					);

					spark.style({
						opacity: Math.random() * 2
						, '--x': sparkPoint[0] + this.x
						, '--y': sparkPoint[1] + this.y
					});
				}
			}
		}

		if(Math.abs(this.ySpeedLast) > 16)
		{
			const landingFrames = Math.min(8, this.ySpeedLast / 3) * (this.args.rolling ? 0.5 : 1);

			if(this.groundTime && this.groundTime > 2 && this.groundTime < landingFrames && this.ySpeedLast)
			{
				this.args.animation = 'landing';
			}
		}

		if(this.args.sliding)
		{
			this.args.animation = 'sliding';
		}

		if(this.args.trickRamp)
		{
			this.args.animation = 'adventure-pose';
		}

		if(this.args.twistRamp)
		{
			this.

			args.animation = 'side-flip';
		}
	}

	readInput()
	{
		if(!this.lightDashing)
		{
			super.readInput();
		}
	}

	airDash(direction)
	{
		if(this.args.stuck || this.carrying.size)
		{
			return;
		}

		if(this.dashed || (this.args.ignore && this.args.ignore !== -2))
		{
			return;
		}

		let dashSpeed = direction * ((this.isSuper || this.isHyper) ? 13 : 8);

		if(this.args.wallSticking)
		{
			this.args.x += dashSpeed;

			dashSpeed = direction * ((this.isSuper || this.isHyper) ? 18 : 9);
		}

		this.args.mode = 0;
		this.args.float = 2;

		this.args.rolling = false;
		this.args.height = this.args.normalHeight;

		if(this.args.xSpeed && Math.sign(this.args.xSpeed) !== Math.sign(direction))
		{
			dashSpeed = direction * Math.abs(dashSpeed);
			this.args.float  = 4;
			this.args.xSpeed = 0;
		}

		this.args.falling = true;

		if(this.args.mercy)
		{
			dashSpeed *= 0.75;
		}

		const finalSpeed = this.args.xSpeed + dashSpeed;

		// if(Math.abs(finalSpeed) > Math.abs(space))
		// {
		// 	dashSpeed = space * Math.sign(finalSpeed);
		// }

		this.args.animation = 'rolling';

		this.viewport.onFrameOut(3, () => this.args.animation = 'airdash');

		this.args.xSpeed = finalSpeed;
		this.args.ySpeed = 0;
		this.args.gSpeed = 0;

		this.dashTimer = 0;

		this.dashed = true;

		this.args.mode = 0;
		this.args.groundAngle = 0;
	}

	command_0()
	{
		if(!this.args.falling && this.args.crouching && !this.args.rolling && this.yAxis)
		{
			this.spindashCharge += 10;

			let dashCharge = this.spindashCharge / 20;

			if(dashCharge > 1)
			{
				dashCharge = 1;
			}

			this.args.xOff = 5 * -this.args.direction;
			this.args.yOff = 32;

			this.twist(120 * dashCharge * this.args.direction);

			if(!this.dashDust)
			{
				this.showDashDust();
			}
			else if(this.dashDust)
			{
				this.dashDust.style({'--dashCharge': this.spindashCharge});
			}

			this.willJump = false;

			return;
		}

		this.dropDashCharge = 0;

		if(this.args.jumping
			&& !this.args.wasHanging
			&& !this.dashed
			&& (!this.args.doubleSpin || this.args.doubleSpin === 2)
			&& (!this.args.currentSheild || this.args.currentSheild.type === 'normal' || this.args.currentSheild.type === 'super')
		){

			if(this.args.mercy < 120)
			{
				this.args.mercy = 0;
			}

			this.args.doubleSpin = true;
			this.args.xOff  = 0;
			this.args.yOff  = 32;

			// this.viewport.onFrameOut(15, () => this.args.doubleSpin = false);

			this.viewport.onFrameOut(5, () => this.pinch(-600, 50));

			const marker = new Marker({x:this.args.x,y:this.args.y});

			marker.owner = this;

			this.markers.add(marker);

			this.viewport.spawn.add({object:marker});

			const debindX = this.args.bindTo('x', (v,k) => marker.args[k] = v);
			const debindY = this.args.bindTo('y', (v,k) => marker.args[k] = v + 18);

			this.viewport.onFrameOut(25, () => {
				this.viewport.actors.remove(marker);
				debindX();
				debindY();
			});

		}

		super.command_0();
	}

	command_4()
	{
		if(this.args.ignore)
		{
			return;
		}

		if(this.args.falling)
		{
			this.airDash(-1);

			this.willStick = 2;
			this.stayStuck = true;
		}
	}

	hold_4(button)
	{
		if(this.args.ignore)
		{
			return;
		}

		if(this.args.jumping || this.dashed)
		{
			this.dropDashCharge = 0;

			this.willStick = 2;
			this.stayStuck = true;
		}
	}

	release_4()
	{
		this.onNextFrame(() => {
			this.willStick = false;
			this.stayStuck = false;
		});

		if(this.args.wallSticking && !this.dashed)
		{
			this.args.falling = true;

			if(this.args.ySpeed > 128)
			{
				// this.args.ySpeed = this.args.ySpeed / 4;
			}
			else
			{
				this.args.ySpeed = 0;
			}

			const mode = this.args.mode;

			this.airDash(mode === 1 ? 1 : -1);

			this.args.facing = mode === 1 ? 'left' : 'right';

			this.args.mode = 0;

			this.dashed = true;
		}
	}

	command_5()
	{
		if(this.args.ignore)
		{
			return;
		}

		if(this.args.falling)
		{
			this.airDash(1);

			this.willStick = 2;
			this.stayStuck = true;
		}
	}

	hold_5(button)
	{
		if(this.args.ignore)
		{
			return;
		}

		if(this.args.jumping || this.dashed && this.args.mode !== 2)
		{
			this.dropDashCharge = 0;

			this.willStick = 2;
			this.stayStuck = true;
		}
	}

	release_5()
	{
		this.onNextFrame(() => {
			this.willStick = false;
			this.stayStuck = false;
		});

		if(this.args.wallSticking && !this.dashed)
		{
			this.args.falling = true;
			this.args.ySpeed  = 0;

			const mode = this.args.mode;

			this.airDash(mode === 1 ? 1 : -1);

			this.args.facing = mode === 1 ? 'left' : 'right';

			this.args.mode = 0;

			this.dashed = true;
		}
	}

	command_1()
	{
		if(this.args.ignore)
		{
			return;
		}

		if(this.args.wallSticking)
		{
			this.args.x += this.args.width / 2 * (this.args.mode === 1 ? 1 : -1);
			this.bMap('doJump', 0);
		}

		if(this.args.gSpeed
			&& !this.args.falling
			&& !this.args.rolling
			&& Math.sign(this.args.gSpeed) === this.args.direction
		){
			this.args.rolling = true;

			const standOrRecheck = () => {

				const backOfHead =[this.args.width/2, this.args.height+4]

				// const actualBackOfHead = this.rotatePoint(...backOfHead);

				const solid = this.getMapSolidAt(this.x - backOfHead[0], this.y - backOfHead[1]);

				if(solid)
				{
					this.viewport.onFrameOut(10, standOrRecheck);

					this.args.gSpeed = this.args.gSpeed || this.args.direction * 4 || 4;
					this.args.rolling = true;

					return;
				}

				this.args.rolling = false;

			};

			this.viewport.onFrameOut(20, standOrRecheck);
		}
	}

	release_1() // spindash
	{
		this.dropDashCharge = 0;

		if(!this.spindashCharge)
		{
			return;
		}

		if(!this.yAxis)
		{
			this.args.crouching = false;
		}
	}

	spindash()
	{
		if(this.spindashCharge < 5 && (this.args.modeTime < 45 || this.args.skidding))
		{
			this.spindashCharge = 15;
		}

		const direction = this.args.facing === 'left' ? -1:1;
		let   dashPower = this.spindashCharge / 40;

		if(dashPower > 1)
		{
			dashPower = 1;
		}

		this.args.rolling = true;

		const dashBoost = dashPower * 32;

		this.castRayQuick(
			dashBoost * Math.sign(direction)
			, [Math.PI,0,0][1 + Math.sign(direction)]
			, [0, this.args.height/2]
		);

		if(Math.sign(direction) !== Math.sign(this.args.gSpeed))
		{
			this.args.gSpeed = dashBoost * Math.sign(direction);
		}
		else
		{
			this.args.gSpeed += dashBoost * Math.sign(direction);
		}

		this.args.ignore = 1;
		this.args.rolling = true;

		this.spindashCharge = 0;

		if(this.dashDust)
		{
			this.dashDust.remove();
		}
	}

	hold_1(button) // spindash
	{
		if(this.args.mercy)
		{
			return;
		}

		if(this.carrying.size)
		{
			return;
		}

		// if(this.skidding)
		// {
		// 	return;
		// }

		this.yAxis = this.yAxis || 1;

		if(this.args.ignore || this.args.rolling)
		{
			return;
		}

		if(this.args.jumping)
		{
			if(this.dropDashCharge < 15)
			{
				this.dropDashCharge++;

				return;
			}
		}

		if(this.args.modeTime === 0)
		{
			return;
		}

		if(this.dropDashCharge)
		{
			return;
		}

		if(this.args.falling || this.willJump || (this.args.gSpeed && !this.skidding))
		{
			if(!this.skidding)
			{
				this.spindashCharge = 0;
			}
			return;
		}

		if(!this.spindashCharge && button.time > 6)
		{
			return;
		}

		this.args.ignore = 1;

		let dashCharge = this.spindashCharge / 20;

		if(dashCharge > 1)
		{
			dashCharge = 1;
		}

		this.spindashCharge = this.spindashCharge || 1;

		if(this.yAxis > 0.5)
		{
			this.spindashCharge = this.spindashCharge || 10;
		}

		this.args.crouching = true;

		if(!this.dashDust)
		{
			this.showDashDust();
		}
		else if(this.dashDust)
		{
			this.dashDust.style({'--dashCharge': this.spindashCharge});
		}

		this.spindashCharge++;

		this.args.xOff = 5 * -this.args.direction;
		this.args.yOff = 32;

		this.twist(120 * dashCharge * this.args.direction);

		this.args.animation = 'spindash';

		if(this.args.direction < 0)
		{
			this.args.facing = 'left';
		}
		else if(this.args.direction > 0)
		{
			this.args.facing = 'right';
		}
	}

	showDashDust()
	{
		const viewport = this.viewport;

		const dustParticle = new Tag('<div class = "particle-spindash-dust">');

		const dustPoint = this.rotatePoint(0, 0);

		dustParticle.style({
			'--x': dustPoint[0] + this.args.x
			, '--y': dustPoint[1] + this.args.y
			, '--direction': this.args.direction
			, '--dashCharge': this.spindashCharge
		});

		dustParticle.setAttribute('data-facing', this.args.facing);

		viewport.particles.add(dustParticle);

		this.dashDust = dustParticle;
	}

	hold_2()
	{
		if(this.args.stuck || !this.args.falling)
		{
			return;
		}

		if(this.lightDashing)
		{
			return;
		}

		if(this.lightDashingCoolDown > 0)
		{
			return;
		}

		const ring = this.findDashableRing(48);

		if(ring)
		{
			this.lightDash(ring);

			this.lightDashingCoolDown = 9;

			return;
		}
	}

	command_2()
	{
		if(this.viewport.collisions.has(this))
		{
			const objects = this.viewport.collisions.get(this);

			for(const object of objects.keys())
			{
				if(this.carrying.size && !this.carrying.has(object))
				{
					continue;
				}

				if(typeof object.lift === 'function')
				{
					object.lift(this);
				}
			}
		}

		this.onNextFrame(() => {

			const speed = this.args.falling
				? this.args.airSpeed
				: this.args.gSpeed;

			if(this.isSuper
				&& !this.lightDashing
				&& !this.args.boltDash
				&& Math.abs(speed) > 6
			){
				const xSpeed = this.args.xSpeed;
				const ySpeed = this.args.ySpeed;
				const gSpeed = this.args.gSpeed;

				if(!this.args.falling)
				{
					this.args.gSpeed *= 3;
					this.args.gSpeed = Math.max(-128, Math.min(this.args.gSpeed, 128));

				}
				else
				{
					this.args.xSpeed = Math.max(-64, Math.min(this.args.xSpeed, 64));
					this.args.ySpeed = Math.max(-64, Math.min(this.args.ySpeed, 64));

					this.args.float = 5;

					this.args.xSpeed *= 5;
					this.args.ySpeed *= 5;
				}

				this.args.boltCount = 0;
				this.args.boltDash  = true;

				Sfx.play('LIGTNING_STRIKE');

				this.args.opacity = 0;

				this.viewport.onFrameOut(35, () => {
					this.args.opacity = 1;

					this.args.boltDash = false;

					this.args.xSpeed = this.args.xSpeed ? xSpeed : 0;
					this.args.ySpeed = this.args.ySpeed ? ySpeed : 0;
					this.args.gSpeed = this.args.gSpeed ? gSpeed : 0;

					// this.dimmer && this.viewport.particles.remove(this.dimmer);

					// this.dimmer = false;
				});
			}
		});
	}

	release_2()
	{
		if(!this.args.boltDash)
		{
			return;
		}

		this.args.opacity = 1;

		this.args.boltDash = false;

		this.args.xSpeed /= 2;
		this.args.ySpeed /= 2;
		this.args.gSpeed /= 3;

		// this.dimmer && this.viewport.particles.remove(this.dimmer);

		// this.dimmer = false;
	}

	command_3()
	{}

	setProfile()
	{
		if(this.isHyper)
		{
			this.args.spriteSheet = this.superSpriteSheet;

			this.args.gSpeedMax = this.gSpeedMaxHyper;
			this.args.jumpForce = this.jumpForceHyper;
			this.args.accel     = this.accelSuper;
		}
		else if(this.isSuper)
		{
			this.args.spriteSheet = this.superSpriteSheet;

			this.args.gSpeedMax = this.gSpeedMaxSuper;
			this.args.jumpForce = this.jumpForceSuper;
			this.args.accel     = this.accelSuper;
		}
		else
		{
			this.args.spriteSheet = this.rotatedSpriteSheet;

			this.args.gSpeedMax = this.gSpeedMaxNormal;
			this.args.jumpForce = this.jumpForceNormal;
			this.args.accel     = this.accelNormal;
		}
	}

	findNearestRing()
	{
		return this.findDashableRing(64);
	}

	findDashableRing(maxDist = 128)
	{
		const findRing = actor => {

			if(!(actor instanceof Ring))
			{
				return false;
			}

			const direction = Math.sign(this.args.xSpeed);

			if(direction > 0 && actor.x < this.x)
			{
				return false;
			}

			if(direction < 0 && actor.x > this.x)
			{
				return false;
			}

			return true;
		};

		const ring = this.findNearestActor(findRing, maxDist);

		if(!ring)
		{
			return;
		}

		const nextRing = ring.findNearestActor(findRing, maxDist);

		if(!nextRing)
		{
			return;
		}

		const firstAngle  = Math.atan2(this.y - ring.y, this.x - ring.x);
		const secondAngle = Math.atan2(ring.y - nextRing.y, ring.x - nextRing.x);

		if(Math.abs(firstAngle - secondAngle) > Math.PI / 2)
		{
			return;
		}

		return ring;
	}

	lightDash(ring)
	{
		if(!this.args.falling)
		{
			this.lightDashing = false;
			return false;
		}

		if(this.args.popChain.length)
		{
			if(!this.lightDashReward)
			{
				this.lightDashReward = {label: 'lightdash', points:10, multiplier:1};

				this.args.popChain.push(this.lightDashReward);
			}
			else
			{
				this.lightDashReward.points += 10;
			}
		}

		this.lightDashed = true;

		let currentAngle;

		this.spindashCharge = 0;

		let angle = Math.atan2(ring.y - this.y + 8, ring.x - this.x);

		currentAngle = this.args.groundAngle;

		const angleDiff = Math.abs(currentAngle - angle);

		let dashSpeed = this.distanceFrom(ring) * 4 * ((Math.PI / 2) / angleDiff);

		const maxDash = 55;

		if(dashSpeed > maxDash)
		{
			dashSpeed = maxDash;
		}

		// const space = this.bMap('scanForward', dashSpeed, 0.5).get(Platformer);

		// if(space && dashSpeed > space)
		// {
		// 	dashSpeed = space;
		// }

		const direction = Math.sign(this.args.xSpeed) || Math.sign(this.args.gSpeed);

		if(this.args.direction < 0)
		{
			this.args.animation = 'lightdash-back';
		}
		else if(this.args.direction > 0)
		{
			this.args.animation = 'lightdash';
		}

		const breakGroundAngle = Math.PI / 4;

		// this.args.airAngle  = angle;

		this.lightDashing = true;

		this.args.xSpeed  = dashSpeed * Math.cos(angle) * 0.5;
		this.args.ySpeed  = dashSpeed * Math.sin(angle) * 0.5;

		this.lightDashTimeout();
	}

	collect(pickup)
	{
		super.collect(pickup);

		if(pickup instanceof Ring)
		{
			if(this.lightDashing)
			{
				const ring = this.findNearestActor(actor => actor instanceof Ring, 128);

				if(ring)
				{
					// this.args.x = pickup.args.x;
					// this.args.y = pickup.args.y;

					this.lightDash(ring);
				}
				else
				{
					this.lightDashing = false;
					this.args.float   = 0;
				}
			}
		}
	}

	lightDashTimeout()
	{
		if(this.clearLightDash)
		{
			this.clearLightDash();

			this.clearLightDash = false;
		}

		this.clearLightDash = this.viewport.onFrameOut(9, () => {
			this.lightDashing   = false;
			this.args.float     = 0;
		});
	}

	setCameraMode()
	{
		if(!this.args.falling && this.regions)
		{
			for(const region of this.regions)
			{
				if(region.args.perspective)
				{
					this.args.cameraMode = 'perspective';
					return;
				}
			}
		}

		if(this.args.boltDash)
		{
			this.args.cameraMode = 'draggable'
		}
		else if(this.args.wallSticking)
		{
			if(this.args.cameraMode !== 'panning' && (this.args.cameraMode !== 'popping' || Math.abs(this.args.ySpeed) < Math.abs(this.args.xSpeed)))
			{
				this.args.cameraMode = 'aerial';
			}
		}
		else
		{
			super.setCameraMode();
		}
	}

	startle(other)
	{
		super.startle(other);

		this.onNextFrame(() => this.args.animation = 'startle');
	}

	die()
	{
		super.die();

		this.onNextFrame(() => this.args.animation = 'dead');

		this.pinch(0,0);
		this.twist(0);

		Sfx.play('PLAYER_DAMAGED');
	}

	loseRings(count, age)
	{
		super.loseRings(count, age);

		Sfx.play('RINGS_SCATTERED');
	}

	collideA(other)
	{
		if(other instanceof Spring)
		{
			this.onNextFrame(()=>{
				if(!this.args.falling)
				{
					return;
				}
				this.springing = true;
				this.args.animation = 'springdash'
			});
		}

		if(other.pop && this.isHyper)
		{
			other.pop(this);
		}
	}

	get solid() { return false; }
	get canRoll() { return !this.args.wallSticking; }
	get isEffect() { return false; }
	get controllable() { return !this.args.npc; }

	get facePoint() {

		if(this.args.wallSticking)
		{
			return this.rotatePoint(0,-5);
		}

		return super.facePoint;
	}

	crossRegionBoundary(region, entered)
	{
		if(region instanceof GrindingRegion)
		{
			if(!entered)
			{
				for(const r of this.regions)
				{
					if(r !== region && r instanceof GrindingRegion)
					{
						return;
					}
				}

				if(this.args.wasGrinding && this.args.falling)
				{
					this.args.animation = 'springdash';
				}
				else
				{
					this.args.grinding = false;
				}
			}
		}

		super.crossRegionBoundary(region, entered);
	}

	rotateMainColor(rH = 0, rS = 1, rV = 1)
	{
		const rotatedColors = {
			'8080e0': new Color('8080e0').rotate(rH, rS, rV).toString(),
			'6060c0': new Color('6060c0').rotate(rH, rS, rV).toString(),
			'4040a0': new Color('4040a0').rotate(rH, rS, rV).toString(),
			'202080': new Color('202080').rotate(rH, rS, rV).toString(),
		};

		this.png.ready.then(()=>{
			const newPng = this.png.recolor(rotatedColors);
			this.args.rotatedSpriteSheet = this.rotatedSpriteSheet = this.args.spriteSheet = this.spriteSheet = newPng.toUrl();
		});
	}
}

import { Mixin } from 'curvature/base/Mixin';
import { Tag } from 'curvature/base/Tag';

import { Flickie } from './Flickie';

import { PointActor } from './PointActor';

import { SkidDust } from '../behavior/SkidDust';
import { CanPop } from '../mixin/CanPop';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';

import { ElectricSheild } from '../powerups/ElectricSheild';

export class Bubbles extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-bubbles';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 32;
		this.args.height    = 32;

		this.willStick = false;
		this.stayStuck = false;

		this.args.float  = -1;
		this.args.static = true;

		this.aiming = false;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.shield = new ElectricSheild

		if(this.args.electric)
		{
			this.inventory.add(this.shield);

			this.args.currentSheild = this.shield;
		}

		this.autoAttr.get(this.box)['data-gold'] = 'gold';
		this.autoAttr.get(this.box)['data-fade'] = 'fade';

		this.chain = new Tag('<div class = "bubbles-flame">');

		this.sprite.appendChild(this.chain.node);
	}

	update()
	{
		if(!this.viewport || !this.viewport.controlActor)
		{
			return;
		}

		if(this.args.gold && !this.args.fading)
		{
			if(Math.abs(this.viewport.controlActor.x - this.x) < 256
				&& Math.abs(this.viewport.controlActor.y - this.y) < 128
			){
				this.args.fading = true;

				const viewport = this.viewport;

				viewport.onFrameOut(25, () => this.args.fade = true);

				viewport.onFrameOut(55, () => viewport.actors.remove(this));
			}
		}

		const frameId = this.viewport.args.frameId - this.viewport.args.startFrameId;

		if(this.viewport && this.args.electric && frameId % 100 === 0)
		{
			this.args.currentSheild = this.args.currentSheild ? null : this.shield;
		}

		// this.args.ySpeed = this.yAxis;

		if(this.box)
		{
			this.box.setAttribute('data-animation', 'standing');
		}

		this.args.falling = true;
		this.args.flying  = true;

		super.update();
	}

	hold_1()
	{
		this.aiming = true;
	}

	release_1()
	{
		this.aiming = false;
	}

	effect(other)
	{
		super.effect(other);

		// this.viewport.spawn.add({object:new Flickie({
		// 	x: this.args.x,
		// 	y: this.args.y,
		// })});
	}

	get solid() { return false; }
	get isEffect() { return false; }
	// get controllable() { return true; }
}

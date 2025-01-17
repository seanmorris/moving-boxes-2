import { Region } from "./Region";

import { Ring } from "../actor/Ring";
import { MarbleBlock } from "../actor/MarbleBlock";

import { Tag } from 'curvature/base/Tag';
import { Bindable } from 'curvature/base/Bindable';

export class LavaRegion extends Region
{
	isWater = true;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-lava';

		this.args.gravity = 0.5;
		this.args.drag    = 0.85;
		this.args.density = 15;
		this.skimSpeed    = Infinity;
	}

	update()
	{
		if(!this.filterWrapper && this.tags.sprite)
		{
			this.filterWrapper = new Tag('<div class = "region-filter-wrapper">');
			this.colorWrapper  = new Tag('<div class = "region-color-wrapper">');

			this.filter = new Tag('<div class = "region-filter">');
			this.color  = new Tag('<div class = "region-color">');

			this.filterWrapper.appendChild(this.filter.node);
			this.colorWrapper.appendChild(this.color.node);

			this.tags.sprite.appendChild(this.filterWrapper.node);
			this.tags.sprite.appendChild(this.colorWrapper.node);
		}

		if(!this.originalHeight)
		{
			this.originalHeight = this.args.height;
		}

		super.update();
	}

	updateActor(other)
	{
		if(other instanceof Ring)
		{
			other.args.ySpeed = -Math.abs(other.args.ySpeed || -6);

			return;
		}

		if(other.noClip)
		{
			return;
		}

		if(!other.controllable && !(other instanceof Ring))
		{
			return;
		}

		if(other.y < this.y + -this.args.height + 8)
		{
			return;
		}

		if(other.args.ySpeed < 0 || other.args.ignore)
		{
			return;
		}

		if(other.args.mercy || other.immune(this, 'fire'))
		{
			return;
		}

		other.damage(this, 'fire');
	}

	collideA(other, type)
	{
		if(other.noClip)
		{
			return;
		}

		if(other instanceof MarbleBlock)
		{
			return false;
		}

		if(other.args.standingOn && other.args.standingOn !== Bindable.make(this))
		{
			return false;
		}

		super.collideA(other, type);

		if(other.args.mercy || other.immune(this, 'fire'))
		{
			return true;
		}

		// // other.args.ySpeed = Math.min(-8, -(other.args.ySpeed || other.ySpeedLast) * 1.1);
		// // other.args.xSpeed = (other.args.xSpeed || other.xSpeedLast || other.args.gSpeed) * -1.1;
		// // other.args.falling = true;

		// // other.args.y = this.y + -this.args.height + -32;

		other.damage(this, 'fire');

		return true;
	}

	get solid() { return true; }
	get isEffect() { return true; }
}

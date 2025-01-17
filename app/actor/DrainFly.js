// import { Follower } from './Follower';
import { PointActor } from './PointActor';
import { Platformer } from '../behavior/Platformer';
import { Mixin } from 'curvature/base/Mixin';
import { CanPop } from '../mixin/CanPop';

export class DrainFly extends Mixin.from(PointActor, CanPop)
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-drainfly';

		this.args.width  = 16;
		this.args.height = 16;

		this.args.float = -1;
		this.args.gravity = 0;

		this.args.phase = 'idle';
	}

	update()
	{
		if(!this.viewport || !this.viewport.actorIsOnScreen(this))
		{
			return;
		}

		const viewport = this.viewport;

		super.update();

		const mainChar = viewport.controlActor;

		if(!mainChar)
		{
			this.args.phase = 'idle';
			return;
		}

		switch(this.args.phase)
		{
			case 'idle':
				this.args.alertTo = this.y - 64;

				if(mainChar.x + -this.x > -128)
				{
					this.args.phase = 'alert';
				}

				break;

			case 'alert':
				if(this.y > this.args.alertTo)
				{
					this.args.ySpeed--;
				}
				else
				{
					this.args.phase = 'attacking';
					this.args.y     = this.args.alertTo;

					this.args.ySpeed = 0;
				}
				break;

			case 'attacking': {

				const drawX = Math.sign(mainChar.args.x + -this.args.x) || 0;
				const drawY = Math.sign(mainChar.args.y + -this.args.y + -24) || 0;

				this.args.xSpeed += drawX * 0.2 - (Math.random()/10) || 0;
				this.args.ySpeed += drawY * 0.5 - (Math.random()/10) || 0;

				if(Math.abs(this.args.xSpeed) > 6)
				{
					this.args.xSpeed = 4 * drawX;
				}

				if(Math.abs(this.args.ySpeed) > 8)
				{
					this.args.ySpeed = 4 * drawY;
				}

				if(this.bMap('checkBelow', this.x, this.y).get(Platformer))
				{
					this.args.falling = true;
					this.args.ySpeed = -1;
					this.args.y -= 1;
				}

				break;
			}

		}

		// if(!this.args.ySpeed)
		// {
		// 	this.args.y -= 2;
		// }

		this.args.facing = this.args.xSpeed > 0 ? 'left' : 'right';

		this.args.float   = -1;
	}

	get solid() {return false}
	get rotateLock() {return true}
}

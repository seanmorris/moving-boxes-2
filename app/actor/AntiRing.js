import { PointActor } from './PointActor';

import { Sfx } from '../audio/Sfx';

export class AntiRing extends PointActor
{
	template = `<div class  = "point-actor [[type]]">
		<div class = "sprite" cv-ref = "sprite"></div>
	</div>`;

	float = -1

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-anti-ring';

		this.args.width   = 15;
		this.args.height  = 15;
		this.args.static  = this.args.static  ?? true;
		this.args.dropped = this.args.dropped ?? true;
		this.args.gone    = false;
		this.args.gravity = 0.40;
		this.args.delay   = this.args.delay ?? 48;
	}

	update()
	{
		if(!this.viewport)
		{
			return;
		}

		const currentFrame = this.viewport.args.frameId;
		const startFrame = this.startFrame;

		const age = (currentFrame - startFrame);

		if(this.args.noClip)
		{
			this.noClip = true;
		}
		else if(!this.args.decoration)
		{
			if(this.args.ySpeed < 0)
			{
				this.noClip = true;
			}
			else if(!this.attract)
			{
				this.noClip = false;
			}
		}
		else
		{
			this.noClip = true;
		}

		if(this.args.decoration)
		{
			this.args.type = 'actor-item actor-anti-ring decoration';
			this.args.gravity = 0.36;
		}

		if(this.dropped)
		{
			this.args.type = 'actor-item actor-anti-ring dropped';

			this.args.height = 14;
		}

		const viewport = this.viewport;

		if(this.dropped && this.viewport && !this.viewport.actorIsOnScreen(this, 256))
		{
			viewport.onFrameOut(15, () => {
				viewport.actors.remove(this);
			});
		}

		if(this.args.reward && this.args.gone)
		{
			viewport.onFrameOut(15, () => {
				viewport.actors.remove(this);
			});
		}

		super.update();

		if(this.args.reward)
		{
			return;
		}

		if(this.getMapSolidAt(this.x + this.args.xSpeed * this.args.direction, this.y + -8))
		{
			this.args.xSpeed *= -1;
		}

		if((this.dropped || this.scattered) && (!this.args.falling || !this.args.ySpeed))
		{
			this.args.xSpeed = this.args.xSpeed || this.xSpeedLast || (Math.random() - 0.5);
			this.args.ySpeed = Math.min(-Math.abs(this.args.ySpeed || this.ySpeedLast || 0) * 0.75, -5);
			this.args.gSpeed = 0;
			this.args.x += this.args.xSpeed;
			this.args.y += this.args.ySpeed;
			this.args.falling = true;
			this.args.groundAngle = 0;
		}
	}

	callCollideHandler(other)
	{
		if(other instanceof AntiRing)
		{
			return false;
		}

		return super.callCollideHandler(other);
	}

	collideA(other)
	{
		if(other instanceof this.constructor)
		{
			return;
		}

		if(!this.viewport || this.args.gone || this.args.ignore)
		{
			return false;
		}

		if(!other.controllable && !other.occupant && !other.args.owner)
		{
			return false;
		}

		const age = this.viewport.args.frameId - this.startFrame;

		if(this.dropped && age < this.args.delay)
		{
			return false;
		}

		super.collideA(other);

		if(other.args.owner)
		{
			other = other.args.owner;
		}

		if(other.occupant)
		{
			other = other.occupant;
		}


		if(other.controllable)
		{
			other.args.rings -= 1;
		}

		this.args.gone = true;

		this.viewport.auras.delete(this);

		// this.args.xSpeed = 0;
		// this.args.ySpeed = 0;
		this.args.static = true;
		this.args.float  = -1;

		this.args.type = 'actor-item actor-anti-ring collected';

		this.args.xSpeed = 0;
		this.args.ySpeed = 0;

		if(this.viewport.args.audio)
		{
			Sfx.play('SPIKE_DAMAGE');
		}

		this.viewport.onFrameOut(5, () => {
			this.args.type = 'actor-item actor-anti-ring collected gone'
		});

		const x = this.x;
		const y = this.y;

		const viewport = this.viewport;

		this.viewport.onFrameOut(1200, () => {
			this.restore = true;
		});

		if(other.collect)
		{
			this.onNextFrame(()=> {
				other.collect(this);
			});
		}

		// this.args.xSpeed = 0;
		// this.args.ySpeed = 0;
	}

	wakeUp()
	{
		if(this.def && this.restore)
		{
			this.args.x = this.def.get('x');
			this.args.y = this.def.get('y');
			// this.args.float = -1;

			this.args.gone = this.restore = false;
			this.args.type = 'actor-item actor-anti-ring'
		}
	}

	get solid() { return false; }
	get rotateLock() { return true; }

}

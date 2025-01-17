import { PointActor } from './PointActor';

export class Follower extends PointActor
{
	noClip = 1;

	constructor(args, parent)
	{
		super(args, parent);

		this.args.isGhost = true;

		this.args.type = 'actor-item actor-follower';

		this.args.float = -1;

		this.args.width  = 16;
		this.args.height = 16;

		this.stopSwapZ = 0;

		this.args.z = -1;
	}

	update()
	{
		super.update();

		if(this.stopSwapZ > 0)
		{
			this.stopSwapZ--;
		}

		this.args.standingOn = false;

		const host = this.viewport.controlActor;

		if(!host)
		{
			return;
		}

		this.args.falling = true;
		this.args.float   = -1;

		const force = Math.random();
		let   fudge = Math.random();

		const xDiff = host.x + -this.x;
		const yDiff = host.y + -this.y;

		const angle = Math.atan2(yDiff, xDiff);
		const distance = Math.hypot(yDiff, xDiff);

		const maxDistance = 256;
		const minDistance = 64;

		let minSpeed = 1;

		const airSpeed = Math.max(
			Math.abs(host.args.gSpeed)
			, Math.abs(host.args.xSpeed)
			, Math.abs(host.args.ySpeed)
			, minSpeed
		) * 1.1;

		const xSpeedRelativeOriginal = this.args.xSpeed - (host.args.xSpeed || host.args.gSpeed);

		let maxSpeed = airSpeed + 3;

		let facing = null;

		if(distance < minDistance)
		{
			if(Math.abs(this.args.xSpeed) < minSpeed)
			{
				this.args.xSpeed = minSpeed * Math.sign(-0.5 + Math.random());
			}

			if(Math.abs(this.args.ySpeed) < minSpeed)
			{
				this.args.ySpeed = minSpeed * Math.sign(-0.5 + Math.random());
			}
		}
		else if(distance >= maxDistance)
		{
			this.args.x = Math.floor(host.x - Math.cos(angle) * maxDistance);
			this.args.y = Math.floor(host.y - Math.sin(angle) * maxDistance);

			this.args.xSpeed = xDiff / 60 + (host.args.xSpeed || host.args.gSpeed);
			this.args.ySpeed = 0;

			this.viewport.setColCell(this);

			if(this.x > host.x)
			{
				facing = 'left';
			}
			else
			{
				facing = 'right';
			}

			maxSpeed *= 4;
		}
		else
		{

		}

		const xDir = Math.sign(xDiff);
		const yDir = Math.sign(yDiff);

		const xSame = Math.sign(this.args.xSpeed) === xDir;
		const ySame = this.args.ySpeed && Math.sign(this.args.ySpeed) === yDir;

		const xMag = Math.max(force) * 0.35 * (xSame ? 0.85 : 0.55);
		const yMag = Math.max(force) * 0.10 * (xSame ? 0.75 : 1.50);

		if(!xSame || Math.abs(this.args.xSpeed) < maxSpeed)
		{
			const step = xMag * xDir * fudge;

			// if(!this.swapZ && this.args.xSpeed && Math.sign(this.args.xSpeed) !== Math.sign(step))
			// {
			// 	this.swapZ = this.viewport.onFrameOut(1, () => {

			// 		this.swapZ = false;
			// 	})
			// }

			let xSpeed = this.args.xSpeed + step;

			if(Math.abs(this.args.xSpeed) > maxSpeed)
			{
				xSpeed = maxSpeed * Math.sign(this.args.xSpeed);
			}

			this.args.xSpeed = xSpeed;

			if(distance >= maxDistance)
			{
				const xSpeed = host.args.xSpeed || host.args.gSpeed;
				const ySpeed = host.args.ySpeed;

				if(facing)
				{
					this.args.xSpeed = xDiff / 90 + xSpeed;
					this.args.ySpeed = yDiff / 90 + ySpeed;
				}
			}
		}

		if(!facing && this.args.xSpeed < 0)
		{
			facing = 'left';
		}
		else if(!facing)
		{
			facing = 'right';
		}

		if(!ySame || Math.abs(this.args.ySpeed) < maxSpeed)
		{
			let ySpeed = this.args.ySpeed + yMag * yDir;

			if(Math.abs(this.args.ySpeed) > maxSpeed)
			{
				ySpeed = maxSpeed * Math.sign(this.args.ySpeed);
			}

			this.args.ySpeed = ySpeed;
		}

		if(Math.sign(xSpeedRelativeOriginal)
			&& Math.sign(host.args.xSpeed || host.args.gSpeed) !== Math.sign(xSpeedRelativeOriginal)
			&& this.stopSwapZ === 0
		){
			if(Math.abs(this.x - host.x) > minDistance || Math.abs(this.y - host.y) > minDistance)
			{
				this.args.z = this.args.z > -1000 ? -100000 : 100000;

				this.stopSwapZ = 30;
			}
		}

		if(facing)
		{
			this.args.facing = facing;
		}
	}

	updateEnd()
	{
		const host = this.viewport.controlActor;

		if(!host)
		{
			return;
		}

		let minSpeed = 1;

		const airSpeed = Math.max(
			Math.abs(host.args.gSpeed)
			, Math.abs(host.args.xSpeed)
			, Math.abs(host.args.ySpeed)
			, minSpeed
		) * 1.1;

		super.updateEnd(host);

		if(this.args.ySpeed > 0)
		{
			if(this.args.ySpeed <= 0 || airSpeed < 1.5)
			{
				return;
			}

			if(this.box)
			{
				this.box.classList.remove('ascending');
			}
		}
		else if(this.box)
		{
			this.box.classList.add('ascending');
		}
	}

	get solid() { return false; }
	// get isGhost() { return true; }
}

import { PointActor } from './PointActor';

export class SpitFire extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type   = 'actor-item actor-spitfire';
		this.args.width  = 99;
		this.args.height = 32;
		this.args.float  = -1;

		this.age = 0;
	}

	update()
	{
		if(this.age > 45)
		{
			this.viewport.actors.remove(this);
			this.remove();
			return;
		}

		this.age++;

		super.update();
	}

	collideA(other)
	{
		if(this.age < 10)
		{
			return;
		}

		if(this.args.owner && !this.args.owner.args.gone)
		{
			other.controllable && other.damage(this, 'fire');
		}
	}
}
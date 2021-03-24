import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';
import { BrokenMonitor } from '../actor/BrokenMonitor';

export class Monitor extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-monitor';

		this.args.width  = 32;
		this.args.height = 32;

		this.args.gone = false;
	}

	attached()
	{
		this.screen = new Tag(`<div class = "monitor-screen">`);

		this.sprite.appendChild(this.screen.node)
	}

	update()
	{
		super.update();

		if(!this.viewport)
		{
			return;
		}

		if(this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/object-destroyed.wav');
			this.sample.volume = 0.6 + (Math.random() * -0.3);
		}
	}

	collideA(other, type)
	{
		super.collideA(other, type);

		if(type !== 2
			&& ((other.public.ySpeed > 0 && other.y < this.y) || other.public.rolling)
			&& (!this.public.falling || this.public.float === -1)
			&& !this.public.gone
			&& this.viewport
		){
			this.pop(other);
			return;
		}

		if((type === 1 || type === 3)
			&& (Math.abs(other.args.xSpeed) > 15 || Math.abs(other.args.gSpeed) > 15 || other instanceof Projectile)
			&& !this.public.gone
			&& this.viewport
		){
			this.pop(other)
			return;
		}
	}

	pop(other)
	{
		const viewport = this.viewport;

		if(!viewport || this.public.gone)
		{
			return;
		}

		const explosion = new Tag('<div class = "particle-explosion">');

		explosion.style({'--x': this.x, '--y': this.y-16});

		viewport.particles.add(explosion);

		setTimeout(() => viewport.particles.remove(explosion), 512);

		setTimeout(() => this.screen.remove(), 1024);

		this.args.gone = true;

		this.box.setAttribute('data-animation', 'broken');

		if(other.occupant)
		{
			other = other.occupant;
		}

		if(other.args.owner)
		{
			other = other.args.owner;
		}

		if(other.controllable)
		{
			this.effect(other);
		}

		if(viewport.args.audio && this.sample)
		{
			this.sample.play();
		}

		const ySpeed = other.args.ySpeed;

		if(other.args.falling)
		{
			this.onNextFrame(() => other.args.ySpeed = -ySpeed);
		}

		if(this.args.falling && other.args.falling)
		{
			this.onNextFrame(() => other.args.xSpeed = -other.args.xSpeed );
		}
	}

	effect()
	{}

	get canStick() { return false; }
	get solid() { return false; }
}


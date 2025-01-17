import { Region } from "./Region";
import { Sfx } from '../audio/Sfx';
import { Tag } from 'curvature/base/Tag';

export class ExplodingRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-exploding';
	}

	updateActor(actor)
	{
		if(!this.args.active)
		{
			return;
		}

		if(actor.controllable)
		{
			return;
		}

		if(actor.break)
		{
			actor.break();

			if(!this.viewport.actorIsOnScreen(actor))
			{
				this.viewport.actors.remove(actor);
			}
		}

		if(actor.pop)
		{
			actor.pop();

			if(!this.viewport.actorIsOnScreen(actor))
			{
				this.viewport.actors.remove(actor);
			}
		}
	}

	update()
	{
		super.update();

		const viewport = this.viewport;

		if(!viewport)
		{
			return;
		}

		if(!this.args.active)
		{
			if(this.args.target && viewport.actorsById[ this.args.target ])
			{
				const target = viewport.actorsById[ this.args.target ];

				viewport.auras.delete(target);
			}

			viewport.auras.delete(this);

			return;
		}

		if(!viewport)
		{
			return;
		}

		if(Math.random() > 0.85)
		{
			Sfx.play('BOSS_DAMAGED');
		 }

		for(let i = 0; i < 1; i++)
		{
			const explosionTag = document.createElement('div');
			explosionTag.classList.add('particle-explosion');
			const explosion = new Tag(explosionTag);
			const xOff = this.args.width * Math.random();
			const yOff = this.args.height * Math.random();

			const left   = Math.max(this.x, -this.viewport.args.x);
			const bottom = Math.max(this.y, -this.viewport.args.y);
			const right  = Math.min(this.x + this.args.width, -this.viewport.args.x + this.viewport.args.width);
			const top    = Math.min(this.y - this.args.height, -this.viewport.args.y - this.viewport.args.height/2);

			const xRange = right - left;
			const yRange = bottom - top;

			explosion.style({'--x': left + xRange * Math.random(), '--y': top + yRange * Math.random()});

			viewport.particles.add(explosion);

			setTimeout(() => viewport.particles.remove(explosion), 512);
		}

	}

	activate()
	{
		Sfx.play('BOSS_DAMAGED');

		this.args.active = true;

		this.viewport.onFrameOut(250, () => this.args.active = false)

		if(this.args.target && this.viewport.actorsById[ this.args.target ])
		{
			this.viewport.onFrameOut(60, () => {
				const target = this.viewport.actorsById[ this.args.target ];

				this.viewport.auras.add(target);

				target.activate(other, this);
			});
		}
	}
}

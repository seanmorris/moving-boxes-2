import { PointActor } from './PointActor';

import { Sfx } from '../audio/Sfx';
import { Analytic } from '../lib/Analytic';

export class Emerald extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-emerald emerald-' + (this.args.color || 'white');

		this.args.width  = 12;
		this.args.height = 12;
	}

	// update()
	// {
	// 	super.update();

	// 	const viewport = this.viewport;

	// 	if(!viewport)
	// 	{
	// 		return;
	// 	}
	// }

	collideA(other)
	{
		super.collideA(other);

		if(this.args.gone || !other.controllable)
		{
			return;
		}

		this.args.type = 'actor-item actor-emerald collected emerald-'  + (this.args.color || 'white');

		if(!this.args.gone)
		{
			Sfx.play('EMERALD_COLLECTED');

			this.args.type = 'actor-item actor-emerald collected gone emerald-' + (this.args.color || 'white');

			if(other.args.owner)
			{
				other.args.owner.args.emeralds += 1;
			}
			else if(other.occupant)
			{
				other.occupant.args.emeralds += 1;
			}
			else
			{
				other.args.emeralds += 1;
			}

			if(!this.viewport.args.emeralds.includes(this.args.color))
			{
				this.viewport.args.emeralds.push(this.args.color);
			}

			const save = viewport.currentSave;

			if(!save.emeralds.includes(this.args.color))
			{
				save.emeralds.push(this.args.color)
			}

			this.viewport.args.inventory.push({
				points: 10000
				, tallyIcon: `/Sonic/emerald-${this.args.color}-mini.png`
				, id:   this.oid
			});

			save.save();

			Analytic.report({
				eventCategory: 'chaos-emerald',
				eventAction: 'collected',
				eventLabel: `${this.viewport.args.actName}::${this.args.color}::${this.args.id}`
			});

			this.viewport.actors.remove( this );
			this.remove();
		}

		this.args.gone = true;
	}

	get solid() { return false; }
	get effect() { return true; }
}

import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';
import { Sfx } from '../audio/Sfx';
import { Analytic } from '../lib/Analytic';

export class Emblem extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 32;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-emblem';
		this.args.float  = -1;
		this.args.static = true;
		this.collected   = false;
		this.args.character = this.args.character ?? 'sonic';
	}

	onRendered(event)
	{
		if(!this.viewport)
		{
			return super.onRendered(event);
		}

		const zoneState = this.viewport.getZoneState();

		if(zoneState && zoneState.emblems && zoneState.emblems.includes(this.oid))
		{
			if(!this.viewport.replay)
			{
				this.args.type = 'actor-item actor-emblem actor-emblem-collected';
				this.collected = true;
			}
		}

		super.onRendered(event)

		this.autoAttr.get(this.box)['data-character'] = 'character';
	}

	collideA(other)
	{
		if(!other.controllable || this.gone)
		{
			return;
		}

		const viewport = this.viewport;

		const zoneState = viewport.getZoneState();

		other.args.emblemsCurrent.push(this);

		if(!this.collected)
		{
			other.args.emblems.push(this);
			zoneState.emblems.push(this.oid);
			this.args.type = 'actor-item actor-emblem actor-emblem-gone';
		}
		else
		{
			this.args.type = 'actor-item actor-emblem actor-emblem-gone actor-emblem-collected';
		}

		const scoreNode = document.createElement('div');
		scoreNode.classList.add('particle-score');
		const scoreTag = new Tag(scoreNode);

		scoreTag.style({'--x': this.args.x, '--y': this.args.y-16});

		let points;

		switch(other.args.emblemsCurrent && other.args.emblemsCurrent.length)
		{
			case 1:
				scoreNode.classList.add('score-100');
				points = 100;
				break;
			case 2:
				scoreNode.classList.add('score-200');
				points = 200;
				break;
			case 3:
				scoreNode.classList.add('score-500');
				points = 500;
				break;
			case 4:
				scoreNode.classList.add('score-1000');
				points = 1000;
				break;
			case 5:
				scoreNode.classList.add('score-10000');
				points = 10000;
				break;
		}

		viewport.particles.add(scoreTag);

		setTimeout(() => viewport.particles.remove(scoreTag), 768);

		other.args.score += points;

		this.gone = true;

		viewport.onFrameOut(20, () => viewport.actors.remove(this));

		this.viewport.args.inventory.push({
			tallyIcon: '/custom/hud-emblem.png'
			, points: 1000
			, id:   this.oid
		});

		viewport.currentSave.save();

		if(this.viewport.args.audio)
		{
			Sfx.play('EMBLEM_COLLECTED');
		}

		if(typeof ga === 'function')
		{
			Analytic.report({
				eventCategory: 'emblem',
				eventAction: 'collected',
				eventLabel: `${this.viewport.args.actName}::${this.oid}`
			});
		}
	}
}

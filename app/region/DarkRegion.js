import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

export class DarkRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-shade region-dark';

		this.paths = new Map;
		this.actors = new Set;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.basePath = `M 0 0
    					L 0 ${32 * 17 + 1}
    					L ${32 * 17} ${32 * 17 + 1}
    					L ${32 * 17} 0
    					Z`;

    	this.mask = View.from(`<svg style = "position:absolute; width: calc(100vw + 2px); height: calc(100vh + 2px); top: -1px; left: -1px">
			<defs>
				<clipPath id = "mask-${this.args.id}" clipPathUnits="userSpaceOnUse">
					<path data-lights />
				</clipPath>
			</defs>
		<svg>`);

		this.mask.render(this.tags.sprite);

		this.path = this.mask.findTag('path[data-lights]');

		this.path.attr({d: `${this.basePath} ${this.lightPath}`});

		this.tags.sprite.style({'--maskImage': `url(#mask-${this.args.id})`});
	}

	update()
	{
		super.update();

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
	}

	updateEnd()
	{
		super.updateEnd();

		for(const actor of this.actors)
		{
			const lightSize = 128;

			const topBoundry  = -this.viewport.args.y - (this.args.y - this.args.height);

			const x = actor.x + actor.viewport.args.x;
			const y = actor.y + actor.viewport.args.y - actor.args.height * 0.5 + (topBoundry < 0 ? topBoundry : 0);

			if(!actor.args.polygon)
			{
				continue;
				this.paths.set(
					actor,
					`M ${x} ${y + lightSize * 0.5}
					 A ${lightSize * 0.5} ${lightSize * 0.5}, 0, 1 1, ${x} ${y + -lightSize * 0.5}
					 A ${lightSize * 0.5} ${lightSize * 0.5}, 0, 0 1, ${x} ${y + lightSize * 0.5}
	        		 Z`
				);
			}
			else
			{
				const polygon  = Object.assign([], actor.args.polygon);

				const first = polygon.shift();

				const polyPath = polygon.map(p => `L ${x + p.x} ${y + p.y}`).join(' ');

				this.paths.set(
					actor,
					`M ${x + first.x} ${y + first.y}
					 ${polyPath}
					 Z`
				);
			}

		}

		this.path.attr({d: this.basePath + ' ' + [...this.paths.values()].join(' ')});

		this.actors.clear();
		this.paths.clear();
	}

	updateActor(actor)
	{
		if(!actor.controllable)
		{
			// return;
		}

		this.actors.add(actor);
	}

	get solid() { return false; }
	get isEffect() { return true; }
}

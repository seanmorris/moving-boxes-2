import { CharacterString } from '../ui/CharacterString';
import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';

import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class ShadeRegion extends Region
{
	currentFilter = -1;

	filters = [
		'western'
		, 'heat'
		, 'hydro'
		, 'lava'
		, 'black-hole'
		, 'normal'
	];

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-shade';
	}

	onRendered()
	{
		super.onRendered();

		this.actorFilterWrapper = new Tag('<div class = "region-filter-wrapper">');
		this.actorColorWrapper  = new Tag('<div class = "region-color-wrapper">');

		this.filterWrapper = new Tag('<div class = "region-filter-wrapper">');
		this.colorWrapper  = new Tag('<div class = "region-color-wrapper">');

		this.actorFilter = new Tag('<div class = "region-filter">');
		this.actorColor  = new Tag('<div class = "region-color">');

		this.filter = new Tag('<div class = "region-filter">');
		this.color  = new Tag('<div class = "region-color">');

		this.filterWrapper.appendChild(this.filter.node);
		this.colorWrapper.appendChild(this.color.node);

		// this.actorFilterWrapper.appendChild(this.actorFilter.node);
		// this.actorColorWrapper.appendChild(this.actorColor.node);

		// this.actorLayer = new Tag('<div class = "actor-layer">');

		// this.actorLayer.appendChild(this.actorFilterWrapper.node);
		// this.actorLayer.appendChild(this.actorColorWrapper.node);

		// this.mainElem.appendChild(this.actorLayer.node);

		this.tags.sprite.appendChild(this.filterWrapper.node);
		this.tags.sprite.appendChild(this.colorWrapper.node);

		this.text = new CharacterString({value:''});

		this.text.render(this.tags.sprite);

		this.cylinder = new Cylinder({
			id:'shade-cylinder'
			, width: this.args.width
			, height: this.args.height
		});

		this.cylinder.render(this.tags.sprite);

		this.pinch = new Pinch({
			id:'shade-pinch'
			, width: this.args.width
			, height: this.args.height
			, scale: 150
		});

		this.pinch.render(this.tags.sprite);

		// this.args.bindTo('scale', v => {
		// 	this.pinch.args.scale = v;
		// 	this.cylinder.args.scale = v;
		// });

		if(this.args.filter)
		{
			this.filters = [this.args.filter];
		}

		this.rotateFilter();
	}

	update()
	{
		super.update();

		this.args.scale = 175 - Math.abs(Math.sin(Date.now() / 200) * 25)

		if(!this.switch && this.args.switch)
		{
			this.switch = this.viewport.actorsById[ this.args.switch ]

			if(this.switch)
			{
				this.switch.args.bindTo('active', v => {
					if(v)
					{
						this.rotateFilter();
					}
				});
			}
		}

	}

	rotateFilter()
	{
		if(this.mainElem && this.args.filter)
		{
			this.mainElem.classList.remove(this.args.filter);
		}

		if(this.mainElem)
		{
			this.args.filter = this.filters[ this.currentFilter++ ];

			if(this.currentFilter >= this.filters.length)
			{
				this.currentFilter = 0;
			}

			this.args.filter && this.mainElem.classList.add(this.args.filter);

			if(this.args.filter)
			{
				this.text.remove();

				this.text = new CharacterString({value:`${this.currentFilter}: ${this.args.filter}`});

				this.text.render(this.tags.sprite);
			}

		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}

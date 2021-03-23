import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';

// import { ElasticOut } from 'curvature/animate/ease/ElasticOut';

export class MainMenu extends Card
{
	template = require('./main-menu.html');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.cardName = 'main-menu';

		const unavailable = 'unavailable';

		this.args.items = {
			'Single Player': {
				available: 'available'
				, callback: () => this.remove()
			}
			, 'Direct Connect': {
				available: 'unavailable'
				, children: {

					'Generate Request Token': {

						available: 'unavailable'
						, children: {a: {}, b: {}, c: {}}

					}

					, 'Input Request Token': { available: 'unavailable' }
				}
			}
			, 'Connect To Server': { available: 'unavailable' }
		};

		this.currentItem = null;

		this.selector = 'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])';

		this.onRemove(() => parent.focus());

		this.bgm = new Audio('/Sonic/s3k-competition.mp3');

		this.bgm.volume = 0.5;

		this.onRemove(() => this.bgm.pause());

		this.bgm.loop = true;
	}

	onRendered()
	{
		const debind = this.parent.args.bindTo('audio', (v) => {
			v ? this.onTimeout(500, () => this.bgm.play()) : this.bgm.pause();
		});

		this.onRemove(debind);

		if(!this.tags.bound)
		{
			return;
		}

		const bounds = this.tags.bound;

		const elements = [...bounds.querySelectorAll(this.selector)];

		this.listen(elements, 'focus', event => this.currentItem = event.target);

		this.listen(elements, 'blur', event => event.target.classList.remove('focused'));

		this.args.warp = new Pinch({
			id:'menu-warp'
			, scale:  64
		});
	}

	onAttached()
	{
		const next = this.findNext(this.currentItem, this.tags.bound.node);

		if(next)
		{
			this.focus(next);
		}
	}

	findNext(current, bounds, reverse = false)
	{
		const elements = bounds.querySelectorAll(this.selector);

		if(!elements.length)
		{
			return;
		}

		let found = false;
		let first = null;
		let last  = null;

		for(const element of elements)
		{
			if(!first)
			{
				if(!current && !reverse)
				{
					return element;
				}

				first = element;
			}

			if(!reverse && found)
			{
				return element;
			}

			if(element === current)
			{
				if(reverse && last)
				{
					return last;
				}

				found = true;
			}

			last = element;
		}

		if(reverse)
		{
			return last;
		}

		return this.findNext(undefined, bounds, reverse);
	}

	focus(element)
	{
		if(element)
		{
			element.classList.add('focused');
			element.focus();
		}

		if(this.currentItem && this.currentItem !== element)
		{
			this.blur(this.currentItem);
		}

		this.currentItem = element;
	}

	blur(element)
	{
		element.classList.remove('focused');
		element.blur();
	}

	input(controller)
	{
		if(!this.tags.bound)
		{
			return;
		}

		this.args.warp.args.dx = (controller.axes[2] ? controller.axes[2].magnitude : 0) * 32;
		this.args.warp.args.dy = (controller.axes[3] ? controller.axes[3].magnitude : 0) * 32;

		let next;

		if(controller.buttons[12] && controller.buttons[12].time === 1)
		{
			next = this.findNext(this.currentItem, this.tags.bound.node, true);

		}
		else if(controller.buttons[13] && controller.buttons[13].time === 1)
		{
			next = this.findNext(this.currentItem, this.tags.bound.node);

			this.focus(next);
		}
		else if(controller.buttons[14] && controller.buttons[14].time === 1)
		{
			this.args.last = 'LEFT';
		}
		else if(controller.buttons[15] && controller.buttons[15].time === 1)
		{
			this.args.last = 'RIGHT';
		}

		if(controller.buttons[0] && controller.buttons[0].time === 1)
		{
			this.currentItem && this.currentItem.click()

			this.args.last = 'A';
		}
		else if(controller.buttons[1] && controller.buttons[1].time === 1)
		{
			this.args.last = 'B';
		}

		next && this.onNextFrame(()=> this.focus(next));
	}

	run(item)
	{
		item.callback && item.callback();

		if(item.children)
		{
			const prev = this.args.items;
			const back = {callback: () => this.args.items = prev};

			this.args.items = item.children;

			this.args.items['back'] = this.args.items['back'] || back;
		}
	}
}

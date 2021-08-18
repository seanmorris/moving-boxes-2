import { Card } from './Card';

export class WebkitCard extends Card
{
	template = require('./webkit-card.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'webkit-card';
		this.args.text     = ``;
	}

	play(event)
	{
		this.onTimeout(1500, () => this.args.animation = 'spindash-charge');
		this.onTimeout(3000, () => this.args.animation = 'spindash');

		return super.play(event);
	}
}

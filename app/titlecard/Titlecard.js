import { View } from 'curvature/base/View';

export class Titlecard extends View
{
	template = require('./titlecard.html');

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.firstLine  = args.firstLine  || 'First Line';
		this.args.secondLine = args.secondLine || 'Second Line';
		this.args.creditLine = args.creditLine || 'Credit Line';
		this.args.actNumber  = args.actNumber  || 1;

		this.args.animation  = 'start';
	}

	play(event)
	{
		return new Promise(accept => {

			const finishPlaying = (event) => {
				let timeAcc = 500;

				this.onTimeout(timeAcc, () => this.args.animation = '');

				timeAcc += 750;

				this.onTimeout(timeAcc, () => this.args.animation = 'opening');

				timeAcc += 750;

				this.onTimeout(timeAcc, () => this.args.animation = 'opening2');

				this.onTimeout(timeAcc + 500, () => {
					accept([ new Promise(acceptDone => this.onTimeout(timeAcc, acceptDone)) ]);
				});

				timeAcc += 1000;

				this.onTimeout(timeAcc, () => this.args.animation = 'closing');

				timeAcc += 250;

				this.onTimeout(timeAcc, () => this.args.animation = 'closed');
			}

			if(!this.args.waitFor)
			{
				finishPlaying();
			}
			else
			{
				this.args.waitFor.finally(finishPlaying);
			}
		});
	}
}


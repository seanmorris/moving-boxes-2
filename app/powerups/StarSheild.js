import { Sheild } from './Sheild';
import { Bgm } from '../audio/Bgm';
import { Tag } from 'curvature/base/Tag';

export class StarSheild extends Sheild
{
	type     = 'star';
	protect  = true;
	template = `<div class = "sheild star-sheild">
		<div class = "star-sheild-stars"></div>
	</div>`;

	frame = 0;

	recycle = [];

	// constructor(...args)
	// {
	// 	super(...args);


	// }

	acquire(host)
	{
		const viewport = host.viewport;

		if(!viewport)
		{
			return;
		}

		const previous = host.args.currentSheild;

		const invertDamage = event => {

			event.preventDefault();

			const other = event.detail.other;

			other && other.pop && other.pop(host);

		};

		host.addEventListener('damage', invertDamage);

		viewport.onFrameOut(1560, () => {

			Bgm.stop('STAR_SHIELD');

			host.inventory.remove(this);

			host.removeEventListener('damage', invertDamage);

			host.args.currentSheild = previous;

			this.debindPaused && this.debindPaused();

			delete this.debindPaused;

		});

		host.onRemove(() => Bgm.stop('STAR_SHIELD'));

		Bgm.play('STAR_SHIELD', {interlude:true});

		if(!viewport.args.audio)
		{
			Bgm.pause();
		}
	}

	immune()
	{
		return true;
	}

	drop(host)
	{
		console.log(this, host);

		this.debindPaused && this.debindPaused();

		delete this.debindPaused;
	}

	update(host)
	{
		const viewport = host.viewport;

		if(!viewport)
		{
			return;
		}

		const particle = this.recycle.length
			? this.recycle.shift()
			: new Tag(document.createElement('div'));

		particle.node.classList.add('particle-stars');

		const point = host.rotatePoint(0, (host.args.height / 2));

		const dashed = host.dashed || host.args.animation === 'springdash';

		let yOffset = -3;

		if(host.args.rolling)
		{
			yOffset = 3;
		}

		if(dashed)
		{
			yOffset = -16;
		}

		particle.style({
			'--frame':   this.frame++
			, '--x':     point[0] + host.x + -3 + host.args.xSpeed
			, '--y':     point[1] + host.y + host.args.ySpeed + yOffset
			, 'z-index': -1
			, opacity: Math.random() * 2
		});

		particle.preserve = true;

		viewport.particles.add(particle);

		viewport.onFrameOut(10,() => {
			viewport.particles.remove(particle);
			this.recycle.push(particle);
		});
	}
}

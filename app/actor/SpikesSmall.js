import { Tag } from 'curvature/base/Tag';
import { Sfx } from '../audio/Sfx';

import { PointActor } from './PointActor';
import { Spikes } from './Spikes';

export class SpikesSmall extends Spikes
{
	static fromDef(objDef)
	{

		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = 10;
		obj.args.x = obj.originalX = objDef.x + Math.floor(objDef.width / 2);

		return obj;
	}

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-spikes actor-spikes-small';

		this.args.width  = args.width || 32;
		this.args.height = 10;

		this.args.pointing = this.args.pointing || 0;

		this.hazard = true;

		if(this.args.width < 16)
		{
			this.args.narrow = true;
		}
	}

	update()
	{
		super.update();

		const breakSplit = 4;

		if(this.sprite && !this.graphic)
		{
			this.graphic = new Tag(
				`<svg style  = "--breakSplit: ${breakSplit};" data-narrow = "${this.args.narrow}">
				<defs>
					<pattern
						id     = "spikes-${this._id}"
						width  = "${16 / this.args.width}"
						height = "1"
						x      = "0"
						y      = "0"
					>
						<image href = "/Sonic/spikes-small-single.png">
					</pattern>
				</defs>
				<rect fill = "url(#spikes-${this._id})"></rect>
				<rect fill = "url(#spikes-${this._id})"></rect>
			</svg>`);

			this.sprite.appendChild(this.graphic.node);
		}
	}

	collideA(other, type)
	{
		if(this.args.broken || other instanceof Spikes || other.args.static)
		{
			return false;
		}

		if(other.isVehicle)
		{
			this.args.broken  = true;
			this.args.gravity = 0.40;

			other.halt(10);

			const minSpace = 8 + (other.args.width + this.args.width) / 2;

			other.args.x = this.x + -minSpace * Math.sign(this.x - other.x);

			this.args.type = 'actor-item actor-spikes actor-spikes-small actor-spikes-breaking';

			this.viewport.onFrameOut(7, () => {
				this.args.falling = true;

				this.args.xSpeed  = other.args.hSpeed * 0.25 + 1 * Math.random() ** 2;
				this.args.ySpeed  = -5 + -5 * Math.random() ** 2;

				this.args.type = 'actor-item actor-spikes actor-spikes-small actor-spikes-broken';

				Sfx.play('BLOCK_DESTROYED');
			});

			this.args.float = 8;
			this.noClip     = true;


			return false;
		}

		return super.collideA(other, type);
	}

	activate()
	{
		this.args.float = 0;
		this.noClip = true;
	}

	get solid() {return !this.args.broken && !this.noClip;}
}

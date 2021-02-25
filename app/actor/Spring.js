import { PointActor } from './PointActor';
import { Region } from './Region';

export class Spring extends PointActor
{
	template = `<div
		class = "point-actor actor-item [[type]] [[collType]]"
		style = "
			display:[[display]];
			--angle:[[angle]];
			--airAngle:[[airAngle]];
			--ground-angle:[[groundAngle]];
			--height:[[height]];
			--width:[[width]];
			--x:[[x]];
			--y:[[y]];
		"
		data-colliding = "[[colliding]]"
		data-falling   = "[[falling]]"
		data-facing    = "[[facing]]"
		data-angle     = "[[angle|rad2deg]]"
		data-mode      = "[[mode]]"
	>
		<div
			data-color = "[[color]]"
			data-type  = "[[base]]"
			class      = "spring-pad"
			style = "--color:[[color]]deg"
		></div>
		<div class = "sprite"></div>
	</div>`;

	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.angle = Number(obj.args.angle);

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-spring';

		this.args.width  = this.args.width  || 32;
		this.args.height = this.args.height || 32;

		this.args.color  = this.args.color || 0;

		this.args.float  = -1;
	}

	update()
	{
		super.update();

		if(this.viewport && this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/spring-activated.wav');
			this.sample.volume = 0.25 + (Math.random() * 0.1);
		}
	}

	collideA(other)
	{
		super.collideA(other);

		if(other instanceof Region)
		{
			return;
		}

		this.sample.play();
		this.sample.volume = 0.2 + (Math.random() / 4);

		this.onTimeout(64, () => {
			const rounded = this.roundAngle(this.args.angle, 8, true);
			other.impulse(this.args.power, rounded);
			this.onNextFrame(()=>{
				this.args.direction = Math.sign(this.public.gSpeed);
			});
		});
	}

	get canStick() { return false; }
	get solid() { return false; }
}


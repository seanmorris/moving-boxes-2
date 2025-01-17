import { Tag } from 'curvature/base/Tag';
import { PointActor } from '../actor/PointActor';

export class Region extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		obj.args.x = obj.originalX = -0 + Math.floor(objDef.x);
		obj.args.y = obj.originalY = -0 + Math.floor(objDef.y);

		obj.args.static = true;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region';

		this.args.width  = this.args.width  || 32;
		this.args.height = this.args.height || 32;

		this.args.density = 0;
		this.args.gravity = 1;
		this.args.drag    = 1;

		this.skimSpeed = Infinity;

		this.args.float = -1;

		this.isRegion = true;

		this.skimmers = new WeakSet;
	}

	onRendered()
	{
		this.mainElem = new Tag(this.tags.sprite.parentNode);

		super.onRendered();
	}

	skim(actor)
	{
		this.skimmers.add(actor);
	}

	updateStart()
	{
		this.skimmers = new WeakSet;

		super.updateStart();
	}

	update()
	{
		if(!this.viewport)
		{
			return;
		}

		if(!this.focus && this.args.focus)
		{
			this.focus = this.viewport.actorsById[ this.args.focus ];
		}

		super.update();

		if(this.viewport.args.frameId % this.viewport.settings.frameSkip === 0)
		{
			const topBoundry  = -this.viewport.args.y - (this.args.y - this.args.height);
			const leftBoundry = -this.viewport.args.x - this.args.x;

			this.mainElem && this.mainElem.style({
				'--viewportWidth':    this.viewport.args.width  + 'px'
				, '--viewportHeight': this.viewport.args.height + 'px'
				, '--leftBoundry':    (leftBoundry) + 'px'
				, '--topBoundry':     (topBoundry) + 'px'
				, '--vpX':            (this.viewport.args.x) + 'px'
				, '--vpY':            (this.viewport.args.y) + 'px'
				, '--color':          this.args.color ?? 'rgba(0,128,255,0.33)'
			});
		}
	}

	updateActor(other)
	{

	}

	get solid() { return false; }
	get isEffect() { return true; }

	enter(other){}
	leave(other){}
}

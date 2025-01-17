import { PointActor } from './PointActor';

export class RollingSign extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.width  = 20;
		this.args.height = this.args.height ?? 80;
		this.args.type   = 'actor-item actor-rolling-sign';
	}

	get solid() { return false; }
}

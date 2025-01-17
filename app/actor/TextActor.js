import { PointActor } from './PointActor';
import { CharacterString } from '../ui/CharacterString';

export class TextActor extends PointActor
{
	float = -1;

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.type  = 'actor-item actor-text-actor';
		this.args.float = -1;
		this.args.static = true;

		this.text = new CharacterString({value:''});

		// this.args.x = args.x - 48;

		this.args.bindTo('content', v => {
			this.text.args.value = v;
			this.text.args.color = args.color;
			this.args.width  = v ? v.length * 18 : 0;
			this.args.height = 18;
		});
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.sprite = this.findTag('div.sprite');

		this.text.render(this.sprite);
	}

	get solid() { return false; }
	get isEffect() { return true; }
}

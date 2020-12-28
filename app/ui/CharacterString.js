import { View } from 'curvature/base/View';

export class CharacterString extends View
{
	template =
		`<div class = "hud-character-string" cv-each = "chars:char:c" style = "--scale:[[scale]]"><span
				class = "hud-character"
				data-type   = "[[char.type]]"
				data-value  = "[[char.pos]]"
				data-cardin = "[[c]]"
				style       = "--value:[[char.pos]];"
			>[[char.original]]</span></div>`;

	constructor(...args)
	{
		super(...args);

		this.args.chars = [];

		this.args.scale = this.args.scale || 1;

		this.args.bindTo('value', v => {

			const chars = String(v).split('').map((pos,i) => {

				let original = pos;

				let type = 'number';

				if(pos === ' ' || Number(pos) != pos)
				{
					switch(pos)
					{
						case '-':
							pos  = 11;
							type = 'number';
							break;

						case ':':
							pos  = 10;
							type = 'number';
							break;

						case '.':
							pos  = 12;
							type = 'number';
							break;

						case ' ':
							pos  = 13;
							type = 'number';
							break;

						default:
							pos  = String(pos).toLowerCase().charCodeAt(0) - 97;
							type = 'letter';
							break;
					}
				}

				if(this.args.chars[i])
				{
					this.args.chars[i].original = original;
					this.args.chars[i].type     = type;
					this.args.chars[i].pos      = pos;

					return this.args.chars[i];
				}

				return {pos, type, original};
			});

			Object.assign(this.args.chars, chars);

			this.args.chars.splice(chars.length);

		});
	}
}

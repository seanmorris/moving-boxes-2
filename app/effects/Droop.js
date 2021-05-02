import { View } from 'curvature/base/View';
import { Tag  } from 'curvature/base/Tag';

export class Droop extends View
{
	static memoMaps = new Map;

	template = require('./droop.svg');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.scale = this.args.scale || 0;
		this.args.id    = this.args.id    || 'droop';

		this.args.width  = (args.width  || 64) * 2;
		this.args.height = (args.height || 64);

		this.args.intensity = 1.0;
	}

	static generateMap(width, height)
	{
		const memoKey = `${width}::${height}`;
		const memoMap = this.memoMaps;

		if(memoMap.has(memoKey))
		{
			return Promise.resolve(memoMap.get(memoKey));
		}

		const displacer = new Tag(`<canvas width = "${width}" height = "${height}">`);

		const context = displacer.getContext('2d');

		context.imageSmoothingEnabled = false;

		const image  = context.getImageData(0, 0, width, height);
		const pixels = image.data;

		for(let i = 0; i < pixels.length; i += 4)
		{
			let r,g,b,a,c,d = 0;

			const w = i / 4;

			const y = Math.floor(w / width);
			const x = (w % width);

			const ux = x / width;
			const uy = y / height;

			const ox = x - (width / 2);
			const oy = y - (height / 2);

			const p = Math.sqrt(ox**2+oy**2);

			const ss = Math.min(width, height);

			const s = (ss / 2);

			if(p < s)
			{
				c = (1 - p / s) ** 2;
				d = (1 - p / s) ** 2;
			}
			else
			{
				c = 0;
				d = 0;
			}


			r = 128; //+ (ox * 4) * c;
			g = 255;
			b = 0;
			a = Math.round(255 * ((Math.cos((ux-0.5) * 2 * Math.PI) * 0.5) + 0.5));

			pixels[i + 0] = r ?? 128;
			pixels[i + 1] = g ?? 128;
			pixels[i + 2] = b ?? 128;
			pixels[i + 3] = a ?? 255;
		}

		context.putImageData(image, 0, 0);

		return new Promise(accept => {
			displacer.toBlob(png => {
				const blob = URL.createObjectURL(png, 'image/png');
				memoMap.set(memoKey, blob)
				accept(blob);
			});
		});
	}

	onRendered()
	{
		this.constructor.generateMap(this.args.width, this.args.height).then(image => {

			this.args.blob = image;

		});
	}

	get name()
	{
		return `${this.args.id}`;
		// return `filter_${this.args.id}`;
	}
}
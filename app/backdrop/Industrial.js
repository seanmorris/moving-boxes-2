import { Backdrop } from './Backdrop';
import { Tag } from 'curvature/base/Tag'

export class Industrial extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'industrial';

		this.args.sunrise = 0;

		this.args.bindTo('sunrise', (v) => {
			this.nodes[1] && this.nodes[1].style.setProperty('--sunrise', v);
		});

		this.args.strips = [
			{
				autoscroll: 0.7
				, parallax: 0.055
				, url:      '/Sonic/backdrop/labrynth-industrial/0.png'
				, height:   24
			}
			, {
				autoscroll: 0.65
				, parallax: 0.050
				, url:      '/Sonic/backdrop/labrynth-industrial/1.png'
				, height:   24
			}
			, {
				autoscroll: 0.60
				, parallax: 0.045
				, url:      '/Sonic/backdrop/labrynth-industrial/0.png'
				, height:   24
			}
			, {
				autoscroll: 0.55
				, parallax: 0.040
				, url:      '/Sonic/backdrop/labrynth-industrial/1.png'
				, height:   24
			}
			, {
				autoscroll: 0.50
				, parallax: 0.035
				, url:      '/Sonic/backdrop/labrynth-industrial/0.png'
				, height:   24
			}
			, {
				autoscroll: 0.40
				, parallax: 0.030
				, url:      '/Sonic/backdrop/labrynth-industrial/1.png'
				, height:   24
			}
			, {
				autoscroll: 0.35
				, parallax: 0.025
				, url:      '/Sonic/backdrop/labrynth-industrial/0.png'
				, height:   24
			}
			, {
				autoscroll: 0.30
				, parallax: 0.020
				, url:      '/Sonic/backdrop/labrynth-industrial/1.png'
				, height:   24
			}
			, {
				autoscroll: 0.25
				, parallax: 0.015
				, url:      '/Sonic/backdrop/labrynth-industrial/2.png'
				, height:   24
			}
			, {
				autoscroll: 0.20
				, parallax: 0.010
				, url:      '/Sonic/backdrop/labrynth-industrial/3.png'
				, height:   24
			}
			, {
				autoscroll: 0
				, parallax: 0.02
				, url:      '/Sonic/backdrop/labrynth-industrial/4-dist.png'
				, height:   70
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/labrynth-industrial/4.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/labrynth-industrial/flame-0.png'
				, height:   1
				, interval: 1
				, timeout:  0
				, frame:    0
				, frames:   [
					'/Sonic/backdrop/labrynth-industrial/flame-0a.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-1.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-1.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-3.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-3.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-3.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-4.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-4.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-5.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-6.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-6.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-6.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-0.png'
				]
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/labrynth-industrial/flame-0.png'
				, height:   1
				, interval: 1
				, timeout:  0
				, frame:    0
				, frames:   [
					  '/Sonic/backdrop/labrynth-industrial/flame-b-0a.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-1.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-1.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-3.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-3.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-3.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-4.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-4.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-5.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-6.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-6.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-6.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-b-0.png'
				]
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/labrynth-industrial/flame-0.png'
				, height:   1
				, interval: 1
				, timeout:  0
				, frame:    0
				, frames:   [
					'/Sonic/backdrop/labrynth-industrial/flame-c-0a.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-1.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-1.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-2.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-3.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-3.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-3.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-4.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-4.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-5.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-6.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-0.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-6.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-6.png'
					, '/Sonic/backdrop/labrynth-industrial/flame-c-0.png'
				]
			}
			, {
				autoscroll: 0
				, parallax: 0.125
				, url:      '/Sonic/backdrop/labrynth-industrial/5-bw-small.png'
				, height:   10
			}
			, {
				autoscroll: 0
				, parallax: 0.15
				, url:      '/Sonic/backdrop/labrynth-industrial/5-bw-small.png'
				, height:   10
			}
			, {
				autoscroll: 0
				, parallax: 0.275
				, url:      '/Sonic/backdrop/labrynth-industrial/5-dim.png'
				, height:   50
			}
			, {
				autoscroll: 0
				, parallax: 0.275
				, url:      '/Sonic/backdrop/labrynth-industrial/5-pink-lights.png'
				, height:   1
				, interval: 20
				, timeout:  0
				, frame:    0
				, frames:   [
					'/Sonic/backdrop/labrynth-industrial/5-lights-0.png',
					'/Sonic/backdrop/labrynth-industrial/5-lights-0.png',
					'/Sonic/backdrop/labrynth-industrial/5-lights-1.png',
					'/Sonic/backdrop/labrynth-industrial/5-lights-1.png',
					'/Sonic/backdrop/labrynth-industrial/5-lights-2.png',
					'/Sonic/backdrop/labrynth-industrial/5-lights-2.png',
				]
			}
			, {
				autoscroll: 0
				, parallax: 0.275
				, url:      '/Sonic/backdrop/labrynth-industrial/5-signals-0.png'
				, height:   1
				, interval: 10
				, timeout:  0
				, frame:    0
				, frames:   [
					'/Sonic/backdrop/labrynth-industrial/5-signals-0.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-1.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-1.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-1.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-1.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-0.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-2.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-2.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-2.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-2.png',
				]
			}
			, {
				autoscroll: 0
				, parallax: 0.35
				, url:      '/Sonic/backdrop/labrynth-industrial/5.png'
				, height:   40
			}
			, {
				autoscroll: 0
				, parallax: 0.35
				, url:      '/Sonic/backdrop/labrynth-industrial/5-pink-lights.png'
				, height:   1
				// , interval: 100
				// , timeout:  0
				// , frame:    0
				// , frames:   [
				// 	'/Sonic/backdrop/labrynth-industrial/5-lights-0.png',
				// 	'/Sonic/backdrop/labrynth-industrial/5-lights-1.png'
				// ]
			}
			, {
				autoscroll: 0
				, parallax: 0.35
				, url:      '/Sonic/backdrop/labrynth-industrial/5-signals-0.png'
				, height:   1
				, interval: 20
				, timeout:  0
				, frame:    0
				, frames:   [
					'/Sonic/backdrop/labrynth-industrial/5-signals-0.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-2.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-2.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-2.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-2.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-0.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-1.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-1.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-1.png',
					'/Sonic/backdrop/labrynth-industrial/5-signals-1.png',
				]
			}
			, {
				autoscroll: 0
				, parallax: 0.4
				, url:      '/Sonic/backdrop/labrynth-industrial/6-half.png'
				, height:   88
			}
		];
	}
}

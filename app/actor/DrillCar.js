import { Vehicle } from './Vehicle';

import { Tag } from 'curvature/base/Tag';

export class DrillCar extends Vehicle
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-drill-car';

		this.args.width  = 64;
		this.args.height = 48;

		this.removeTimer = null;

		this.args.gSpeedMax = 20;
		this.args.decel     = 0.30;
		this.args.accel     = 0.75;

		this.args.seatHeight = 34;

		this.args.skidTraction = 0.95;

		this.dustCount = 0;

		this.args.particleScale = 2;
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');
		this.backSprite = new Tag('<div class = "sprite-back sprite">');

		this.drill = new Tag('<div class = "drill-car-drill">');

		this.seat = new Tag('<div class = "drill-car-seat">');
		this.windsheild = new Tag('<div class = "drill-car-windsheild">');

		this.copterCap = new Tag('<div class = "drill-car-copter-cap">');
		this.copterBladeA = new Tag('<div class = "drill-car-copter-blade-a">');
		this.copterBladeB = new Tag('<div class = "drill-car-copter-blade-b">');

		this.frontWheelA = new Tag('<div class = "drill-car-tire drill-car-tire-front-a">');
		this.frontWheelB = new Tag('<div class = "drill-car-tire drill-car-tire-front-b">');

		this.backWheelA = new Tag('<div class = "drill-car-tire drill-car-tire-back-a">');
		this.backWheelB = new Tag('<div class = "drill-car-tire drill-car-tire-back-b">');

		this.sprite.appendChild(this.drill.node);
		this.backSprite.appendChild(this.copterCap.node);

		this.backSprite.appendChild(this.copterBladeA.node);
		this.backSprite.appendChild(this.copterBladeB.node);

		this.sprite.appendChild(this.windsheild.node);
		this.backSprite.appendChild(this.seat.node);

		this.sprite.appendChild(this.frontWheelA.node);
		this.backSprite.appendChild(this.frontWheelB.node);

		this.sprite.appendChild(this.backWheelA.node);
		this.backSprite.appendChild(this.backWheelB.node);

		this.box.appendChild(this.backSprite.node);
	}

	update()
	{
		const falling = this.args.falling;

		if(this.viewport.args.audio && !this.flyingSound)
		{
			this.flyingSound = new Audio('/Sonic/drill-car-copter.wav');

			this.flyingSound.volume = 0.35 + (Math.random() * -0.2);
			this.flyingSound.loop   = true;
		}

		if(this.flyingSound)
		{
			if(!this.flyingSound.paused)
			{
				this.flyingSound.volume = 0.25 + (Math.random() * -0.2);
			}

			if(this.flyingSound.currentTime > 0.2)
			{
				this.flyingSound.currentTime = 0.0;
			}
		}

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
			this.flyingSound && this.flyingSound.pause();

			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(this.dustCount > 0)
			{
				this.dustCount--;
			}

			if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'skidding');

				const viewport = this.viewport;

				const particleA = new Tag('<div class = "particle-dust">');

				const pointA = this.rotatePoint(this.args.gSpeed, 0);

				particleA.style({
					'--x': pointA[0] + this.x
					, '--y': pointA[1] + this.y
					, 'z-index': 0
					, opacity: Math.random() * 2
				});

				const particleB = new Tag('<div class = "particle-dust">');

				const pointB = this.rotatePoint(this.args.gSpeed + (40 * this.args.direction), 0);

				particleB.style({
					'--x': pointB[0] + this.x
					, '--y': pointB[1] + this.y
					, 'z-index': 0
					, opacity: Math.random() * 2
				});

				viewport.particles.add(particleA);
				viewport.particles.add(particleB);

				setTimeout(() => {
					viewport.particles.remove(particleA);
					viewport.particles.remove(particleB);
				}, 350);
			}
			else if(this.args.moving && speed > maxSpeed * 0.75)
			{
				this.box.setAttribute('data-animation', 'running');
			}
			else if(this.args.moving && speed)
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			else
			{
				this.box.setAttribute('data-animation', 'standing');
			}
		}
		else if(this.args.flying)
		{
			this.box.setAttribute('data-animation', 'flying');
		}
		else if(this.args.falling)
		{
			this.flyingSound && this.flyingSound.pause();
			this.box.setAttribute('data-animation', 'jumping');
		}

		if(this.args.copterCoolDown == 0)
		{
			if(this.args.ySpeed > 5)
			{
				this.flyingSound && this.flyingSound.pause();
		 		this.args.flying = false;
			}
		}
		else if(this.args.copterCoolDown > 0)
		{
			this.args.copterCoolDown--;
		}

		super.update();
	}

	command_0()
	{
		if(!this.args.falling)
		{
			this.args.copterCoolDown = 15;

			super.command_0();

			return;
		}

		if(this.args.copterCoolDown > 0)
		{
			return;
		}

		if(this.args.ySpeed > 1)
		{
			if(!this.args.flying)
			{
				this.flyingSound && this.flyingSound.play();
			}

			this.args.flying = true;

			if(this.args.copterCoolDown == 0)
			{
				this.args.copterCoolDown = 7;
			}

			this.args.ySpeed = -1;
			this.args.float  = 8;
		}
	}

	sleep()
	{
		this.flyingSound && this.flyingSound.pause();
	}

	get solid() { return true; }
}

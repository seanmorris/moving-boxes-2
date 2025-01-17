import { Bindable } from 'curvature/base/Bindable';
import { Bag  }     from 'curvature/base/Bag';
import { Tag  }     from 'curvature/base/Tag';
import { Uuid }     from 'curvature/base/Uuid';
import { View }     from 'curvature/base/View';
import { Router }   from 'curvature/base/Router';
import { Keyboard } from 'curvature/input/Keyboard';
import { Sequence } from 'curvature/input/Sequence';
import { Elicit }   from 'curvature/net/Elicit';

import { QuadCell } from '../QuadCell';
import { Countdown } from '../timer/Countdown';

import { Bgm } from '../audio/Bgm';
import { Sfx } from '../audio/Sfx';

import { TileMap }  from '../tileMap/TileMap';

import { Titlecard } from '../titlecard/Titlecard';

import { Particle3d } from '../particle/Particle3d';

import { MarbleGarden as Backdrop } from '../backdrop/MarbleGarden';
import { ProtoLabrynth } from  '../backdrop/ProtoLabrynth';
import { MysticCave } from  '../backdrop/MysticCave';

import { Series }   from '../intro/Series';
import { Card }     from '../intro/Card';

import { TitleScreenCard } from '../intro/TitleScreenCard';
import { ThankYouCard } from    '../intro/ThankYouCard';
import { LoadingCard } from '../intro/LoadingCard';
import { BootCard } from    '../intro/BootCard';
import { DebianCard } from '../intro/DebianCard';
import { WebkitCard } from '../intro/WebkitCard';
import { GamepadCard } from '../intro/GamepadCard';
import { NewgroundsCard } from '../intro/NewgroundsCard';

import { WarningCard } from '../intro/WarningCard';
import { SaneCard } from '../intro/SaneCard';
import { NoWayCard } from '../intro/NoWayCard';
import { SeanCard } from    '../intro/SeanCard';

import { PauseMenu } from   '../Menu/PauseMenu.js';
import { MainMenu } from    '../Menu/MainMenu.js';

import { LayerSwitch } from '../actor/LayerSwitch';
import { Region } from '../region/Region';

import { CharacterString } from '../ui/CharacterString';
import { HudFrame } from '../ui/HudFrame';

import { Layer } from './Layer';
import { Plot } from './Plot';

import { Controller } from '../controller/Controller';

import { BackdropPalette } from '../BackdropPalette';
import { ObjectPalette } from '../ObjectPalette';
import { ScriptPalette } from '../ScriptPalette';

import { ClickSwitch } from '../ui/ClickSwitch';

import { Console as Terminal } from 'subspace-console/Console';

import { Input as InputTask } from '../console/task/Input';
import { Impulse as ImpulseTask } from '../console/task/Impulse';
import { Mark as MarkTask } from '../console/task/Mark';
import { Settings as SettingsTask } from '../console/task/Settings';
import { Move as MoveTask } from '../console/task/Move';
import { Pos as PosTask } from '../console/task/Pos';
import { Spawn as SpawnTask } from '../console/task/Spawn';
import { Chao as ChaoTask } from '../console/task/Chao';

import { Socket } from 'subspace-client/Socket';

import { RtcClient } from '../network/RtcClient';
import { RtcServer } from '../network/RtcServer';

import { Classifier } from '../Classifier';

import { ChatBox } from '../network/ChatBox';

import { PlatformActor as PlatformActor } from '../actor/Platformer';

import { Sonic } from '../actor/Sonic';
import { Tails } from '../actor/Tails';
import { Knuckles } from '../actor/Knuckles';
import { Seymour } from '../actor/Seymour';
import { Chalmers } from '../actor/Chalmers';

import { SaveDatabase } from '../save/SaveDatabase';
import { Save } from '../save/Save';

import { TraceDatabase } from '../trace/TraceDatabase';
import { Trace } from '../trace/Trace';

import { ReplayDatabase } from '../replay/ReplayDatabase';
import { Replay } from '../replay/Replay';

import { Platformer } from '../behavior/Platformer';
import { Matrix } from 'matrix-api/Matrix';

import { GamepadConfig } from '../controller/GamepadConfig';

import { TallyBoard } from '../tally/TallyBoard';
import { Emblem } from '../actor/Emblem';
import { Analytic } from '../lib/Analytic';

const ActorPointCache = Symbol('actor-point-cache');
const ColCellNear = Symbol('collision-cells-near');
const ColCells = Symbol('collision-cells');
const ColCell = Symbol('collision-cell');
const Run = Symbol('run');

export class Viewport extends View
{
	secretsFound = new Set;
	template     = require('./viewport.html');

	constructor(args = {},parent)
	{
		args[ Bindable.NoGetters ] = true;

		super(args,parent);

		this.listen(window, 'error', event => this.handleUncaughtException(event));

		window.viewport = this;

		this.listen(window, 'focus', event => {
			if(this.focusDelay)
			{
				this.focusDelay();
			}
			this.focusDelay = this.onFrameOut(45, () => this.args.focusMe.args.hide = 'hide hidden');
			this.args.focusMe.args.hide = 'hide';
			this.onFrameOut(60, () => {
				if(this.args.focusMe.args.hide)
				{
					this.args.focusMe.args.hide = 'hide hidden';
				}
			})
			this.args.windowFocused = 'window-focused'
		});

		this.listen(window, 'blur',  event => {
			if(this.focusDelay)
			{
				this.focusDelay();
			}
			if(this.gamepad)
			{
				this.args.focusMe.args.hide = 'hide hidden';
				return;
			}
			this.focusDelay = this.onFrameOut(1, () => this.args.focusMe.args.hide = '');
			this.args.focusMe.args.hide = 'hide';
			this.args.windowFocused = 'window-blurred'
		});

		this.args.windowFocused = document.hasFocus() ? 'window-focused' : 'window-blurred';

		this[ Bindable.NoGetters ] = true;

		Router.listen(this, { '': () => '' });

		this.args.agent = 'unknown';

		if(String(navigator.userAgent).match('Chrome'))
		{
			this.args.agent = 'chrome';
		}
		else if(String(navigator.userAgent).match('Firefox'))
		{
			this.args.agent = 'firefox';
		}

		this.args.screenEffects = new Bag;

		this.meta = {};

		this.customColor = Bindable.make({h: 0, s: 1, v: 1});

		// this.args.bindTo('emblems', console.trace);

		this.args.combo = [];

		this.args.invert = '';

		// this.args.plot = new Plot;

		this.args.publishTime = 0;

		this.netId = String(new Uuid);

		// this.subspaceConnect();

		this.netPlayers = new Map;

		this.args.controlCardShown = new Set;

		this.bytesReceived = 0;

		this.args.mainPallet = '';
		this.args.customColor = {
			h: 0, s: 1, v: 1,
		}

		this.args.inventory = [];

		this.loadSaves().then(saves => {
			if(saves.length)
			{
				this.currentSave = Save.from(saves[0]);
			}
			else
			{
				this.currentSave = new Save;
			}
		});

		this.characters = {
			'Sonic':      Sonic
			, 'Tails':    Tails
			, 'Knuckles': Knuckles
			, 'platformer': PlatformActor
		};

		this.objectPalette = ObjectPalette;
		this.scriptPalette = ScriptPalette;

		this.zoneScript = null;

		this.timers = new Map;

		this.args.paused = false;
		this.args.freeze = false;

		this.quadCell = null;

		this.visible = new Set;

		this.callIntervals = new Map;
		this.callFrames    = new Map;
		this.callRenderedFrames = new Map;
		this.willDetach    = new Map;
		this.backdrops     = new Map;
		this.checkpoints   = new Map;
		this.zeroFrame     = false;
		this.spawnedDefs   = new Map;
		this.defsByMap     = new Map;
		this.actorsByMap   = new Map;

		// this.actorPointCache = new Map;

		this.args.replayQuickExit = false;
		this.args.replayBanners = true;

		this.maxObjectId = 0;
		this.maxGid = 0;

		this.args.loadingMap = false;

		this.maps = new Map;

		this.server = null;
		this.client = null;

		this.args.networked = false;

		this.args.tallyBoard = null;

		this.args.mouse = 'moved';

		this.settings = Bindable.make({
			audio: true
			, blur: true
			, smoothing: false
			, displace: true
			, scaling: true
			, rumble: true
			, showHud: true
			, shortcuts: true
			, showFps: true
			, debugOsd: false
			, outline: 1
			, frameSkip: 1
			, musicVol: 50
			, sfxVol: 75
			, username: 'player'
			, graphicsLevel: 'High'
			, matrixUrl:  'https://matrix.org/_matrix'
			, matrixRoom: '!hJzXrccruagKGXTFUQ:matrix.org'
			, iceServer1: 'stun:stun1.l.google.com:19302'
			, iceServer2: 'stun:stun2.l.google.com:19302'
		});

		this.defaults = Object.assign({}, this.settings);

		this.args.shakeX = 0;
		this.args.shakeY = 0;

		this.args.level = '';

		let mapUrl = '';

		const inputMapUrl = Router.query.map;

		let noMenu = false;

		if(inputMapUrl && inputMapUrl.match(/^\w/))
		{
			mapUrl = '/map/' + inputMapUrl;

			noMenu = true;
		}

		this.args.startFrameId = 0;
		this.args.actStartFrameId = 0;
		this.args.lastFrameId = -1;

		if(mapUrl)
		{
			this.loadMap({mapUrl}).catch(error => {

				console.warn(error);

				this.args.titlecard = new Series({cards:[new NoWayCard({
					errorString: `Cannot load map "${inputMapUrl}"!`
					, timeout:   -1
				})]}, this);

				this.args.titlecard.play();

			});
		}

		this.sprites = new Bag;
		this.world   = null;

		let noIntro = Router.query.nointro;

		const cards = [];

		if(noMenu)
		{
			noIntro = true;
		}

		if(!noIntro)
		{
			cards.push(...this.introCards());
		}
		else
		{
			cards.push(new MainMenu({timeout: -1}, this));
		}

		this.args.titlecard = new Series({cards}, this);

		if(!mapUrl)
		{
			this.args.titlecard.play();
		}

		this.args.noIntro = noIntro ? 'no-intro' : '';

		// const debugKeys = [
		// 	'ArrowUp'
		// 	, 'ArrowUp'
		// 	, 'ArrowDown'
		// 	, 'ArrowDown'
		// 	, 'ArrowUp'
		// 	, 'ArrowUp'
		// 	, 'ArrowUp'
		// 	, 'ArrowUp'
		// ];

		const debugKeys = [
			'Button12'
			, 'Button12'
			, 'Button13'
			, 'Button13'
			, 'Button12'
			, 'Button12'
			, 'Button12'
			, 'Button12'
		];

		const debugSeq = new Sequence({ keys: debugKeys, timing: 750 });

		// const konamiKeys = [
		// 	'ArrowUp'
		// 	, 'ArrowUp'
		// 	, 'ArrowDown'
		// 	, 'ArrowDown'
		// 	, 'ArrowLeft'
		// 	, 'ArrowRight'
		// 	, 'ArrowLeft'
		// 	, 'ArrowRight'
		// 	, 'KeyB'
		// 	, 'KeyA'
		// 	, 'Enter'
		// ];

		const konamiKeysA = [
			'Button12'
			, 'Button12'
			, 'Button13'
			, 'Button13'

			, 'Button14'
			, 'Button15'
			, 'Button14'
			, 'Button15'

			, 'Button1201'
			, 'Button14'
			, 'Button1200'
		];

		const konamiKeysB = [
			'Button12'
			, 'Button12'
			, 'Button13'
			, 'Button13'

			, 'Button14'
			, 'Button15'
			, 'Button14'
			, 'Button15'

			, 'Button1201'
			, 'Button1200'
			, 'Button1209'
		];

		const konamiSeqA = new Sequence({ keys: konamiKeysA, timing: 750 });
		const konamiSeqB = new Sequence({ keys: konamiKeysB, timing: 750 });

		this.konamiSeqA = konamiSeqA;
		this.konamiSeqB = konamiSeqB;
		this.debugSeq = debugSeq;

		const gravityKeys = [
			'KeyS'
			, 'KeyV'
			, 'KeyG'
			, 'KeyR'
			, 'KeyA'
			, 'KeyV'
		];

		const gravitySeq = new Sequence({ keys: gravityKeys, timing: 750 });

		this.sequences = [debugSeq, konamiSeqA, konamiSeqB, gravitySeq];

		this.args.debugEnabled  = Router.query.debugEnabled;
		this.args.debugEditMode = false;

		this.args.debugObjectCursor = 0;

		this.args.debugObjectName = new CharacterString({value:''});

		this.debugBank = {};
		this.args.interacted = false;

		debugSeq.addEventListener('complete', event => {

			if(this.args.debugEnabled)
			{
				return;
			}

			this.args.debugEnabled = true;

			console.log('Debug variable set.');
			this.args.topLine.args.value = '';
			this.args.topLine.args.hide = 'hide hidden';

			this.onTimeout(1, ()=>{
				this.args.topLine.args.value = ' Debug variable set! ';
				this.args.topLine.args.hide = '';
			});

			this.onTimeout(1500, ()=>{
				this.args.topLine.args.hide = 'hide';
			});

			this.onTimeout(1750, ()=>{
				this.args.topLine.args.hide = 'hide hidden';
			});
		});

		// konamiSeq.addEventListener('advance', event => {
		// 	console.log(event);
		// });

		// konamiSeqA.addEventListener('cancel', event => {
		// 	console.log(event);
		// 	console.log(this.controlActor.controller);
		// });

		const konamiComplete = event => {
			if(this.args.masterCheat)
			{
				return;
			}

			this.args.masterCheat = true;

			this.args.topLine.args.value = '';
			this.args.topLine.args.hide = 'hide hidden';

			this.onTimeout(1, ()=>{
				this.args.topLine.args.value = ' Master cheat detected. ';
				this.args.topLine.args.hide = '';
			});

			console.log('Master cheat detected.');

			this.args.paused = false;

			this.onTimeout(1500, ()=>{
				this.args.topLine.args.value = '';
				this.args.status.args.hide = 'hide';
			});

			this.onTimeout(1750, ()=>{
				this.args.topLine.args.hide = 'hide hidden';
			});
		};

		konamiSeqA.addEventListener('complete', konamiComplete);
		konamiSeqB.addEventListener('complete', konamiComplete);

		gravitySeq.addEventListener('complete', event => {
			if(!this.controlActor)
			{
				return;
			}

			this.controlActor.gravityCheat = !this.controlActor.gravityCheat;

			this.args.topLine.args.value = '';
			this.args.topLine.args.hide = 'hide hidden';

			this.onTimeout(1, ()=>{
				this.args.topLine.args.value = ` Gravity cheat ${this.controlActor.gravityCheat?'on':'off'}. `;
				this.args.topLine.args.hide = '';
			});

			this.onTimeout(1500, ()=>{
				this.args.topLine.args.value = '';
				this.args.status.args.hide = 'hide';
			});

			this.onTimeout(1750, ()=>{
				this.args.topLine.args.hide = 'hide hidden';
			});

			if(this.controlActor.gravityCheat)
			{
				this.controlActor.args.gravity *= 0.5;
			}
			else
			{
				this.controlActor.args.gravity *= 2;
			}

		});

		this.args.pauseMenu = new PauseMenu({}, this);

		this.particleObserver = new IntersectionObserver((entries, observer) => {
			for(const entry of entries)
			{
				if(entry.intersectionRation === 0)
				{
					entry.target.style.display = 'none';

					entry.target.remove();
				}
				else
				{
					delete entry.target.style.display;
				}
			}
		}, {
			threshold: 0
		});

		this.particles = new Bag((i,s,a) => {
			if(a === Bag.ITEM_ADDED)
			{
				i.node && this.particleObserver.observe(i.node);
				i.node && this.tags.particles.appendChild(i.node);
			}
			else if(a === Bag.ITEM_REMOVED)
			{
				if(i.preserve)
				{
					i.node.remove();
				}
				else
				{
					i.remove();
				}
			}
		});

		this[Run] = 0;

		this.effects = new Bag;

		this.maxCameraBound = 64;
		this.cameraBound = 64;

		this.args.particles = this.particles.list;
		this.args.effects   = this.effects.list;

		this.args.maxFps = 69;

		this.args.currentActor = '';

		this.args.xMouse = 0;
		this.args.YMouse = 0;

		this.args.xMouseOffset = 0;
		this.args.YMouseOffset = 0;

		this.mouseState = {position: [0,0], buttons: []};

		this.args.xOffset = 0.5;
		this.args.yOffset = 0.5;

		this.args.xOffsetTarget = 0.5;
		this.args.yOffsetTarget = 0.75;

		this.args.topLine = new CharacterString({value:''});
		this.args.status  = new CharacterString({value:''});
		this.args.focusMe = new CharacterString({value:''});

		this.args.topLine.args.hide = 'hide hidden';
		this.args.status.args.hide  = 'hide hidden';
		this.args.focusMe.args.hide = 'hide hidden';

		this.args.labelChar = new CharacterString({value:'Char: '});

		this.args.labelX = new CharacterString({value:'x pos: '});
		this.args.labelY = new CharacterString({value:'y pos: '});

		this.args.demoIndicator = null;

		this.args.labelGround = new CharacterString({value:'Grounded: '});
		this.args.labelCamera = new CharacterString({value:'Camera: '});
		this.args.labelAngle  = new CharacterString({value:'Gnd theta: '});
		this.args.labelGSpeed = new CharacterString({value:'Gnd spd: '});
		this.args.labelXSpeed = new CharacterString({value:'X air spd: '});
		this.args.labelYSpeed = new CharacterString({value:'Y air spd: '});
		this.args.labelLayer  = new CharacterString({value:'Layer: '});
		this.args.labelMode   = new CharacterString({value:'Mode: '});
		this.args.labelActors = new CharacterString({value:'Actors: '});
		this.args.labelRegions = new CharacterString({value:'Regions: '});
		this.args.labelFrame  = new CharacterString({value:'Frame ID: '});
		this.args.labelIgnore = new CharacterString({value:'Ignore: '});
		this.args.labelFps    = new CharacterString({value:'FPS: '});

		this.args.labelAirAngle  = new CharacterString({value:'Air theta: '});

		this.args.char   = new CharacterString({value:'...'});

		this.args.xPos   = new CharacterString({value:0});
		this.args.yPos   = new CharacterString({value:0});
		this.args.layer  = new CharacterString({value:0});
		this.args.gSpeed = new CharacterString({value:0, high: 199, med: 99, low: 49});
		this.args.ground = new CharacterString({value:''});
		this.args.xSpeed = new CharacterString({value:0});
		this.args.ySpeed = new CharacterString({value:0});
		this.args.mode   = new CharacterString({value:0});
		this.args.angle  = new CharacterString({value:0});
		this.args.ignore = new CharacterString({value:0});
		this.args.actorCount = new CharacterString({value:0});
		this.args.regionCount = new CharacterString({value:0});

		this.args.xPerspective = 0;

		this.args.cameraMode = new CharacterString({value:0});

		this.args.airAngle   = new CharacterString({value:0});

		this.args.nowPlaying = new CharacterString({value:'Now playing'});
		this.args.trackName  = new CharacterString({value:''});
		this.args.hideNowPlaying = 'hide-now-playing'
		this.args.hiddenNowPlaying = 'hidden-now-playing'

		Sfx.addEventListener('play', event => {
			if(!this.args.audio)
			{
				event.preventDefault();
			}
		});

		Bgm.addEventListener('play', event => {

			this.bgm = this.meta.bgm;

			if(!this.args.audio)
			{
				event.preventDefault();
				this.args.hideNowPlaying = 'hide-now-playing';
				this.onFrameOut(60, () => {
					if(this.args.hideNowPlaying)
					this.args.hiddenNowPlaying = 'hidden-now-playing'
				});
				return;
			}

			if(!event.detail)
			{
				this.args.trackName.args.value = '';
				this.args.audioComment = '';
				this.args.hideNowPlaying = 'hide-now-playing';
				this.args.hiddenNowPlaying = 'hidden-now-playing';
				return;
			}
			else
			{
				this.args.trackName.args.value = event.detail.TIT2 + ' by ' + event.detail.TPE1;
				this.args.audioComment = event.detail.COMM;
				const secret = Math.random();
				this.args.secretIcon = secret > 0.99 ? 100
					: (secret > 0.9 ? 10 : '0');
			}

			if(this.args.trackName.args.value)
			{
				let played = Promise.resolve();

				if(this.args.zonecard)
				{
					played = this.args.zonecard.played
				}

				played.then(() => {

					if(!this.args.started)
					{
						return;
					}

					this.args.hiddenNowPlaying = '';

					this.onFrameOut(60, () => this.args.hideNowPlaying = '');

					if(!this.timers.has(Bgm))
					{
						this.timers.set(Bgm, new Countdown(600, () => {
							this.args.hideNowPlaying = 'hide-now-playing'
						}));
					}
					else
					{
						this.timers.get(Bgm).extendTo(600);
					}
				});
			}
		});

		Bgm.addEventListener('stop', event => {});
		Bgm.addEventListener('pause', event => {});
		Bgm.addEventListener('unpause', event => {
			this.args.audio || event.preventDefault();
		});

		this.args.fpsSprite = new CharacterString({value:0});
		this.args.frame     = new CharacterString({value:0});

		this.args.scoreLabel = new CharacterString({value:'SCORE:',  color: 'yellow'});
		this.args.timerLabel = new CharacterString({value:'TIME: ',  color: 'yellow'});
		this.args.ringLabel  = new CharacterString({value:'RINGS: ', color: 'yellow'});

		this.args.actClearLabel = new CharacterString({value:'', color: 'yellow'});
		this.args.dialogLines   = [];

		this.args.perfectBonusLabel = new CharacterString({value:'PERFECT BONUS: ', color: 'yellow'});
		this.args.perfectBonus      = new CharacterString({value: 0});

		this.args.speedBonusLabel   = new CharacterString({value:'SPEED BONUS: ', color: 'yellow'});
		this.args.speedBonus        = new CharacterString({value: 0});

		this.args.skidBonusLabel    = new CharacterString({value:'SKID BONUS: ', color: 'yellow'});
		this.args.skidBonus         = new CharacterString({value: 0});

		this.args.ringBonusLabel    = new CharacterString({value:'RING BONUS: ', color: 'yellow'});
		this.args.ringBonus         = new CharacterString({value: 0});

		this.args.timeBonusLabel    = new CharacterString({value:'TIME BONUS: ', color: 'yellow'});
		this.args.timeBonus         = new CharacterString({value: 0});

		this.args.airBonusLabel     = new CharacterString({value:'AIR TIME: ', color: 'yellow'});
		this.args.airBonus          = new CharacterString({value: '0%'});

		this.args.totalBonusLabel   = new CharacterString({value:'TOTAL: ', color: 'yellow'});
		this.args.totalBonus        = new CharacterString({value: 0});

		this.args.rings = new CharacterString({value:0});
		this.args.score = new CharacterString({value:0});
		this.args.timer = new CharacterString({value:'00:00'});

		this.args.prompt = new CharacterString({value:''});

		this.args.ntsc = 'ntsc';

		this.args.frameId = -1;

		this.settings.bindTo('scaling',  v => this.fitScale(false), {wait:0});

		this.settings.bindTo('graphicsLevel',  v => {
			switch(v)
			{
				case 'High':
					this.settings.displace = true;
					this.settings.scaling  = true;
					this.settings.blur     = true;
					break;
				case 'Medium':
					this.settings.scaling  = true;
					this.settings.displace = true;
					this.settings.blur     = false;
					break;
				case 'Low':
					this.settings.scaling  = true;
					this.settings.displace = false;
					this.settings.blur     = false;
					break;
				case 'Very Low':
					this.settings.displace = false;
					this.settings.scaling  = false;
					this.settings.blur     = false;
					break;
			}

			if(this.args.agent === 'firefox')
			{
				this.settings.displace = false;
				this.settings.blur     = false;
			}
		});

		if(this.args.agent === 'firefox')
		{
			this.settings.displace = false;
			this.settings.blur     = false;
		}

		this.settings.bindTo('displace',  v => this.args.displacement = v ? 'on' : 'off');
		this.settings.bindTo('outline',   v => this.args.outline   = v);
		this.settings.bindTo('debugOsd',  v => this.args.debugOsd  = v);
		this.settings.bindTo('showHud',   v => this.args.showHud   = v);
		this.settings.bindTo('shortcuts', v => this.args.shortcuts = v);
		this.settings.bindTo('showFps',   v => this.args.showFps   = v);
		this.settings.bindTo('smoothing', v => this.args.smoothing = v);

		this.settings.bindTo('musicVol',  v => Bgm.setVolume(v / 100));
		this.settings.bindTo('sfxVol',  v => Sfx.setVolume(v / 100));

		this.args.emeralds = [
			// 'green'
			// , 'cyan'
			// , 'white'
			// , 'orangered'
			// , 'yellow'
			// , 'purple'
		];

		for(const setting in this.settings)
		{
			const val = localStorage.getItem('sonic-3000-setting-v0.0.0=' + setting);

			try
			{
				this.settings[setting] = JSON.parse(val) ?? this.settings[setting];
			}
			catch(e)
			{
				console.warn(e);
			}
		}

		this.settings.bindTo((v,k)=>{

			localStorage.setItem('sonic-3000-setting-v0.0.0=' + k, JSON.stringify(v));

		});

		const urlChar = Router.query.char
		? (String(Router.query.char)
			.substr(0,1).toUpperCase()
		+ String(Router.query.char)
			.substr(1))
		: false;

		this.args.selectedChar = this.args.selectedChar || urlChar || 'Sonic';

		this.args.blockSize = 32;

		this.args.populated = false;

		this.args.willStick = false;
		this.args.stayStuck = false;

		this.args.willStick = true;
		this.args.stayStuck = true;

		this.args.scale  = 1;
		this.args.tileScale = 1;

		this.args.width  = 32 * 16;
		this.args.height = 32 * 9;

		this.args.bindTo('tileScale', v => {

			const x = 16;
			const y = 9;

			this.args.width  = 32 * x * v;
			this.args.height = 32 * y * v;

			if(this.args.layers)
			for(const layer of this.args.layers)
			{
				layer.args.width  = 32 * x * v;
				layer.args.height = 32 * y * v;
			}

			if(this.args.fgLayers)
			for(const layer of this.args.fgLayers)
			{
				layer.args.width  = 32 * x * v;
				layer.args.height = 32 * y * v;
			}

			this.fitScale();

		}, {wait:1});

		// if(Router.query.tinyScale)
		// {
		// 	this.args.width  = 32 * 8;
		// 	this.args.height = 32 * 4.5;
		// 	this.args.scale  = 4;
		// }

		// if(Router.query.noScale)
		// {
		// 	this.args.width  = 32 * 14 * 2;
		// 	this.args.height = 32 * 8  * 2;
		// 	this.args.scale  = 2;
		// }

		// if(Router.query.bigScale)
		// {
		// 	this.args.width  = 32 * 60;
		// 	this.args.height = 32 * 34;
		// 	this.args.scale  = 1;
		// }

		this.collisionCache = new Map;
		this.collisions = new Map;

		this.args.x = this.args.x || 0;
		this.args.y = this.args.y || 0;

		this.args.xDelta = this.args.x || 0;
		this.args.yDelta = this.args.y || 0;

		this.args.yDeltaDecay = 0;

		// this.args.bindTo(['x','y'], (v, k, t) => isNaN(v) && console.trace(k, v));
		// this.args.bindTo(['xOffset', 'xOffsetTarget'], (v, k, t) => isNaN(v) && console.trace(k, v));

		this.args.fgLayers = [];
		this.args.layers   = [];

		this.args.animation = '';

		this.regions = new Set;
		this.spawn   = new Set;
		this.auras   = new Set;
		this.recent  = new Set;

		this.actorsByName = {};
		this.actorsById   = {};

		window.actors = this.actorsById;

		this.playable = new Set;

		this.actors = new Bag((i,s,a) => {
			if(a == Bag.ITEM_ADDED)
			{
				i.viewport = this;

				// this.quadCell.insert(i, i.args);
				// this.quadCell.insert(i, {x: i.args.x - i.args.width / 2, y: i.args.y});
				// this.quadCell.insert(i, {x: i.args.x + i.args.width / 2, y: i.args.y});

				this.setColCell(i);

				if(i instanceof Region)
				{
					this.regions.add(i);
				}

				if(i.controllable)
				{
					this.playable.add(i);
				}

				this.actorsByName[i.args.name] = i;
				this.actorsById[i.args.id]     = i;

				this.objectDb.add(i);

				i.onSpawned && i.onSpawned(this);
			}
			else if(a == Bag.ITEM_REMOVED)
			{
				i.viewport = null;

				this.playable.delete(i);

				if(i instanceof Region)
				{
					this.regions.delete(i);
				}

				delete this.actorsByName[i.args.name];
				delete this.actorsById[i.args.name];
				delete this.actorsById[i.args.id];

				for(const [,actors] of this.actorsByMap)
				{
					delete actors[i.oid];
				}

				this.recent.delete(i);
				this.auras.delete(i);

				this.updateStarted.delete(i);
				this.updateEnded.delete(i);
				this.updated.delete(i);

				// this.quadCell.remove(i);
				this.objectDb.remove(i);

				// console.log(i, i[ColCell].has(i), i[ColCell]);

				const cell = this.getColCell(i);

				if(i[ColCell])
				{
					i[ColCell].delete(i);
				}

				if(i[ColCells])
				{
					i[ColCells].forEach(c => c.delete(i));
				}

				if(cell)
				{
					cell.delete(i);
				}

				// console.log(i[ColCell].has(i));

				delete i[ColCell];

				if(!i.removed && i.firstNode && i.firstNode.isConnected)
				{
					i.remove();
				}

				i.onDespawned && i.onDespawned(this);
			}
		});

		const critiera = [
			/^Art\s+$/, /^Collision\s+$/, /^Destructible\s+$/
		];
		const comparator = () => {};

		this.layerDb = new Classifier(critiera, comparator);
		this.objectDb = new Classifier(Object.values(ObjectPalette));

		this.blocks = new Bag;

		this.args.blocks = this.blocks.list;
		this.args.actors = this.actors.list;

		this.listen(window, 'gamepadconnected', event => this.padConnected(event));
		this.listen(window, 'gamepaddisconnected', event => this.padRemoved(event));

		this.colCellDiv = 0.75 * Math.max(this.args.width, this.args.height);

		this.colCellCache = new Map;
		this.colCells = new Map;

		this[ActorPointCache] = new Map;

		this.startTime = null;

		this.args.audio = false;

		this.nextControl = false;

		this.updateStarted = new Set;
		this.updateEnded = new Set;
		this.updated = new Set;

		this.args.xBlur = 0;
		this.args.yBlur = 0;

		this.args.isReplaying  = false;
		this.args.isRecording  = false;
		this.args._isRecording = false;

		this.replayFrames = new Map;
		this.replayOffset = 0;
		this.replayStart = null;
		this.replay = null;

		this.maxReplayFrame = 0;

		this.lastFrame = {input:{}, args:{}};

		this.args.standalone = '';
		this.args.fullscreen = '';
		this.args.initializing = 'initializing';

		this.args.muteSwitch = new ClickSwitch;

		this.args.muteSwitch.args.active = false;

		this.args.bindTo('interacted', v => {

			if(!v) return;

			this.args.muteSwitch.args.active = this.getAudioSetting();

			this.args.muteSwitch.args.bindTo('active', v => this.args.audio = v);

			this.args.bindTo('audio', (v) => {

				localStorage.setItem('sonic-3000-audio-enabled', v);

				const frameId = this.args.frameId - this.args.startFrameId;

				this.onNextFrame(() => v ? Sfx.unpause() : Sfx.pause());

				if(frameId > (this.meta.bgm_delay ?? 0))
				{
					this.onNextFrame(() => v ? Bgm.unpause() : Bgm.pause());
				}

				this.args.muteSwitch.args.active = v;
			});
		});


		this.args.showConsole = null;

		this.listen(document, 'keydown', (event) => {

			if(event.key === 'Escape')
			{
				this.args.showConsole = false
			}

			if(event.key === 'F10' || event.key === '`')
			{
				if(!this.args.subspace)
				{
					this.args.subspace = new Terminal({
						scroller: this.tags.subspace
						, path:{
							'input': InputTask
							, 'mark': MarkTask
							, 'impulse': ImpulseTask
							, 'move': MoveTask
							, 'pos': PosTask
							, 'set': SettingsTask
							, 'spawn': SpawnTask
							, 'chao': ChaoTask
						}
					});
				}

				if(this.args.networked)
				{
					this.args.showConsole = false;
				}
				else
				{
					this.args.showConsole = this.args.showConsole ? null : 'showConsole';
				}

				event.preventDefault();
			}
		});

		this.args.bindTo('shakeY', (v,k,t,d,p) => {

			if(!this.controlActor || !this.controlActor.controller || !this.controlActor.controller.rumble)
			{
				return;
			}

			if(Math.abs(v) > 40 && Math.abs(v) > Math.abs(p))
			{
				this.controlActor.controller && this.controlActor.controller.rumble({
					duration: 4*v,
					strongMagnitude: 1.0,
					weakMagnitude: 1.0
				});
			}
			else if(Math.abs(v) > 20 && Math.abs(v) > Math.abs(p))
			{
				this.controlActor.controller && this.controlActor.controller.rumble({
					duration: 8*v,
					strongMagnitude: v/20,
					weakMagnitude: 1.0
				});
			}
			else if(Math.abs(v) > 1)
			{
				this.controlActor.controller && this.controlActor.controller.rumble({
					duration: 16*v,
					strongMagnitude: 0.1,
					weakMagnitude: 1.0
				});
			}
		});

		this.args.bindTo('showConsole', v => {

			if(!this.args.subspace)
			{
				return;
			}

			if(v)
			{
				this.onNextFrame(()=>this.args.subspace.focus());
				this.args.showConsole = 'showConsole';
			}
			else
			{
				this.onNextFrame(()=>this.tags.viewport.focus());
				this.args.showConsole = null;
			}
		});

		this.controller = new Controller({deadZone: 0.2});

		this.controller.zero();

		this.matrix = new Matrix(this.settings.matrixUrl, {
			interval:  0
			// , storage: localStorage
		});
	}

	loadWorld({worldUrl, networked = false})
	{
		let firstMapLoaded = false;

		const loader = new Elicit(worldUrl);

		loader.json().then(world => {

			const maps = world.maps.sort((a,b) => {
				if(a.x === b.x)
				{
					return a.y - b.y;
				}

				return a.x - b.x;
			});

			let xMin = Math.min(...maps.map(m => m.x));
			let yMin = Math.min(...maps.map(m => m.y));

			let xMax = Math.max(...maps.map(m => m.x + m.width));
			let yMax = Math.max(...maps.map(m => m.y + m.height));

			for(const map of maps)
			{
				map.x -= xMin;
				map.y -= yMin;
			}

			const firstMap = maps.shift();

			this.loadMap({mapUrl: '/map/' + firstMap.fileName, networked}).then(() => {

				const blockSize = this.tileMap.mapData.tilewidth;

				// this.tileMap.offset(0, );

				// console.log(-xMin / blockSize, -yMin / blockSize);

				this.tileMap.resize(xMax, yMax);

				for(const map of maps)
				{
					console.log(map);

					const mapUrl = '/map/' + map.fileName;

					this.appendMap(mapUrl, map.x/blockSize, map.y/blockSize);
				}
			});

		});
	}

	loadSaves(reload = false)
	{
		if(reload || !this.getSaveIndex)
		{
			return this.getSaveIndex = Save.index();
		}

		return this.getSaveIndex;
	}

	getZoneState(zone)
	{
		const currentSave = this.currentSave;
		const currentZone = this.currentMap ?? '';

		return currentSave ? currentSave.getZoneState(zone || currentZone) : {};
	}

	getCharacterState(name)
	{
		const currentSave = this.currentSave;

		if(name)
		{
			const charState = currentSave.getCharacterState(name);

			return charState;
		}

		if(this.controlActor && this.controlActor.args.canonical)
		{
			const charState = currentSave.getCharacterState(this.controlActor.args.canonical);

			return charState;
		}
	}

	loadMap({mapUrl, networked = false, useCheckpoint = true})
	{
		this.maps.clear();

		this.maps.set(mapUrl, {x:0, y: 0});

		const tileMap = new TileMap({ mapUrl });

		this.baseMap = this.currentMap = mapUrl;

		this.args.networked = networked;

		this.tileMap = tileMap;

		this.args.started = false;
		this.args.running = false;

		const load = new LoadingCard({
			timeout: -1, text: 'loading ... 0%'
		}, this);

		let inputType = 'kb';

		if(!this.args.selectedChar || this.args.selectedChar === 'Sonic' || this.args.selectedChar === 'Tails' || this.args.selectedChar === 'Knuckles')
		{
			inputType = this.args.inputType;

			if(inputType === 'input-generic')
			{
				inputType = 'input-xbox';
			}

			if(this.controller
				&& this.controller.buttons
				&& this.controller.buttons[6]
				&& this.controller.buttons[7]
				&& this.controller.buttons[6].time > 0
				&& this.controller.buttons[7].time > 0
			){
				this.args.controlCardShown.delete(this.args.selectedChar);
				inputType = 'input-dreamcast';
			}
			else if(this.controller
				&& this.controller.buttons
				&& this.controller.buttons[10]
				&& this.controller.buttons[10].time > 0
			){
				this.args.controlCardShown.delete(this.args.selectedChar);
				inputType = 'input-gamecube';
			}
			else if(this.controller
				&& this.controller.buttons
				&& this.controller.buttons[8]
				&& this.controller.buttons[8].time > 0
			){
				this.args.controlCardShown.delete(this.args.selectedChar);
			}
		}

		const controllerCard = new GamepadConfig({
			inputType
			, char: this.args.selectedChar
			, timeout: -1
			, caption: 'loading ... 0%'
		});

		tileMap.addEventListener('level-progress', event => {
			const {received, length, done} = event.detail;
			load.args.text = `loading level ... ${(done*100).toFixed(4)}%`;
			controllerCard.args.caption = `loading level ... ${(done*100).toFixed(4)}%`;
		});

		tileMap.addEventListener('texture-progress', event => {
			const {received, length, done} = event.detail;

			load.args.text = `loading textures ... ${(done*100).toFixed(4)}%`;
			controllerCard.args.caption = `loading textures ... ${(done*100).toFixed(4)}%`;

			if(done === 1)
			{
				load.args.text = `initializing...`;
				controllerCard.args.caption = `initializing...`;
			}
		});

		tileMap.ready.then(() => {

			const defList = Object.create(null);

			[...tileMap.getObjectDefs()].forEach(d => defList[ d.oid || d.id ] = d);

			this.defsByMap.set(this.currentMap, defList);

			if(this.tileMap.mapData && this.tileMap.mapData.properties)
			{
				for(const property of this.tileMap.mapData.properties)
				{
					const name = property.name.replace(/-/g, '_');

					this.meta[ name ] = property.value;
				}
			}

			this.args.fgLayers.length = 0;
			this.args.layers.length = 0;

			const layers = this.tileMap.tileLayers;
			const layerCount = layers.length;

			const blockSize  = this.tileMap.mapData.tilewidth;

			this.args.blockSize = blockSize;

			for(let i = 0; i < layerCount; i++)
			{
				const layer = new Layer({
					layerId: i
					, blockSize
					, viewport: this
					, name:     layers[i].name
					, width:    this.args.width
					, height:   this.args.height
					, parallax: layers[i].parallaxx
					, perspective: this.args.xPerspective
				});

				if(layers[i].name.substring(0, 10) === 'Foreground')
				{
					this.args.fgLayers.push(layer);
				}
				else
				{
					this.args.layers.push(layer);
				}

				if(layers[i].name.substring(0, 9) === 'Collision')
				{
					layer.meta.solid = true;
				}
				else if(layers[i].name.substring(0, 6) === 'Moving' && layers[i].name.substring(0, 10) !== 'Moving Art')
				{
					layer.meta.solid = true;
				}

				if(this.meta.theme !== 'construct')
				{
					if(layers[i].name.substring(0, 9) === 'Collision')
					{
						layer.args.hidden = true;
					}
					else if(layers[i].name.substring(0, 6) === 'Moving' && layers[i].name.substring(0, 10) !== 'Moving Art')
					{
						layer.args.hidden = true;
					}
					else
					{
						layer.args.hidden = layer.args.hidden ?? false;
					}
				}
			}
		});

		let waiter = new Promise(a => setTimeout(a, 7250));
		const cardShown = this.args.controlCardShown.has(this.args.selectedChar) && !this.args.networked;
		const willShowCard = !cardShown && !this.args.map && (!this.args.selectedChar || this.args.selectedChar === 'Sonic' ||  this.args.selectedChar === 'Tails' ||  this.args.selectedChar === 'Knuckles');

		if(!this.replay && willShowCard && !Router.query.map)
		{
			this.args.titlecard = new Series({cards:[controllerCard]}, this);
			this.args.controlCardShown.add(this.args.selectedChar);
		}
		else
		{
			this.args.titlecard = new Series({cards:[load]}, this);
			waiter = Promise.resolve();
		}

		this.args.titlecard.play();

		const all = Promise.all([tileMap.ready, waiter]);

		all.then(() => load.args.text = `starting level`);
		all.then(() => this.startLevel({useCheckpoint}));

		return all;
	}

	fullscreen()
	{
		this.exitFullscreen();

		this.args.focusMe.args.hide = 'hide';

		this.initScale = this.args.scale;

		this.showStatus(3500, ' hit escape to revert. ');

		this.tags.frame.node.requestFullscreen().then(res=>{
			this.onTimeout(100, ()=>{

				this.fitScale();

				this.args.fullscreen = 'fullscreen';

			});
		}).catch(e =>console.error(e));
	}

	exitFullscreen()
	{
		if(document.fullscreenElement)
		{
			document.exitFullscreen();
			this.showStatus(0, '');
			this.args.focusMe.args.hide = '';
			this.args.fullscreen = '';
			return;
		}
	}

	fitScale(fill = false)
	{
		if(!this.settings.scaling)
		{
			this.args.scale = 1;
		}
		else
		{
			const hScale = window.innerHeight / this.args.height;
			const vScale = window.innerWidth / this.args.width;

			if(fill)
			{
				this.args.scale = hScale > vScale ? hScale : vScale;
			}
			else
			{
				this.args.scale = hScale > vScale ? vScale : hScale;
			}
		}

		this.tags.frame && this.tags.frame.style({
			'--width': this.args.width * this.args.tileScale
			, '--height': this.args.height * this.args.tileScale
			, '--scale': this.args.scale
		});
	}

	showStatus(timeout, text)
	{
		this.args.status.args.hide  = '';
		this.args.status.args.value = '';
		this.args.status.args.value = text;

		if(timeout >= 0)
		{
			if(this.statusTimeout)
			{
				clearTimeout(this.statusTimeout);

				this.statusTimeout = null;
			}

			this.statusTimeout = this.onTimeout(timeout, ()=>{
				this.args.status.args.hide = 'hide';
			});

			this.statusTimeout = this.onTimeout(timeout * 2, ()=>{
				this.args.status.args.hide = 'hide hidden';
			});
		}
	}

	getAudioSetting()
	{
		return !!JSON.parse(localStorage.getItem('sonic-3000-audio-enabled') ?? true);
	}

	onAttached(event)
	{
		SettingsTask.viewport = this;
		ImpulseTask.viewport = this;
		InputTask.viewport = this;
		MarkTask.viewport = this;
		MoveTask.viewport  = this;
		PosTask.viewport   = this;
		SpawnTask.viewport = this;
		ChaoTask.viewport = this;

		this.buildDetect();
		this.cpuDetect();
		this.gpuDetect();

		this.onTimeout(100, () => this.fitScale(false));

		this.onTimeout(5500, () => this.args.ntsc = '');

		const audioWasEnabled = this.getAudioSetting();

		const enableKeyboardMessage = ' Click here to enable keyboard control. ';
		const enableAudioMessage = ' Click here to enable audio. ';

		this.onTimeout((Router.query.map || Router.query.nointro) ? 0 : 36000, () => {
			this.args.bindTo('interacted', v => {
				const focusMeMessage = (!v && audioWasEnabled)
					? enableAudioMessage
					: enableKeyboardMessage;

				const oldMessage = this.args.focusMe.args.value;

				if(oldMessage === focusMeMessage)
				{
					return;
				}

				this.args.focusMe.args.value = '';
				this.args.focusMe.args.value = focusMeMessage;
			}, {wait: 250});
		});

		// this.listen(this.tags.frame, 'click', (event) => {
		// 	if(event.target === this.tags.frame.node)
		// 	{
		// 		this.tags.viewport.focus();
		// 	}
		// });

		this.settings.bindTo('blur', v => {
			if(v)
			{
				this.tags.blurDistance.setAttribute('style', `filter:url(#motionBlur)`);
				this.tags.blurDistanceFg.setAttribute('style', `filter:url(#motionBlur)`);
			}
			else
			{
				this.tags.blurDistance.setAttribute('style', ``);
				this.tags.blurDistanceFg.setAttribute('style', ``);
			}
		});

		this.listen(window, 'resize', (event) => {
			this.onTimeout(100, () => this.fitScale(false));
		});

		this.listen(document, 'fullscreenchange', (event) => {
			this.onTimeout(100, () => this.fitScale(false));
			if (!document.fullscreenElement)
			{
				this.args.scale = this.initScale;
				this.args.fullscreen = '';

				return;
			}
		});

		this.tags.frame.style({
			'--width': this.args.width
			, '--height': this.args.height
			, '--scale': this.args.scale
		});

		if(!this.startTime)
		{
			this.startTime = 0;
		}

		this.args.started = false;
		this.args.running = false;
		this.args.paused  = false;

		this.listen(
			document.body
			, 'click'
			, event => {

				let element = event.target;

				while(element && element.matches)
				{
					if(element.matches('[data-click-barrier]'))
					{
						return;
					}

					element = element.parentNode;
				}

				if(this.tags.viewport.contains(document.activeElement))
				{
					return;
				}

				this.tags.viewport.focus()
			}
			, {capture: true}
		);

		this.args.scale = this.args.scale || 1;

		const keyboard = Keyboard.get();

		keyboard.listening = true

		keyboard.focusElement = this.tags.viewport.node;

		keyboard.codes.bindTo((v,k,t,d) => {
			if(this.controller && this.controller.keyIsMapped(k))
			{
				return;
			}
			if(v === -1)
			{
				this.sequences.map(s => s.check(k));
			}
		});

		this.tags.viewport.node.focus();

		if(0 || window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches)
		{
			this.args.standalone = 'standalone';

			document.title = 'Sonic 3000'

			this.listen(window, 'resize', () => this.fitScale(false));
			this.onTimeout(100, () => this.fitScale(false));
		}

		this.onTimeout(100, () => this.args.initializing = '');
	}

	setZoneCard(replay = false)
	{
		if(!replay)
		{
			this.args.zonecard = new Titlecard({waitFor: this.tileMap.ready}, this);
		}

		const line1  = this.meta.titlecard_title_1;
		const line2  = this.meta.titlecard_title_2;
		const author = this.meta.titlecard_author;
		const number = this.meta.titlecard_number;

		this.args.zonecard.args.firstLine  = line1;
		this.args.zonecard.args.secondLine = line2;
		this.args.zonecard.args.creditLine = author;
		this.args.zonecard.args.actNumber  = number;

		this.args.actName = `${line1} ${line2} ${number}`;

		if(!replay)
		{
			this.args.titlecard = new Series({
				cards:[this.args.zonecard]}, this
			);

			return this.args.titlecard.play();
		}

		return Promise.resolve();
	}

	fillBackground()
	{
		const backdropClass = BackdropPalette[ this.meta.backdrop ];

		delete this.args.backdrop;

		if(backdropClass)
		{
			this.args.backdrop = new backdropClass;
		}
		else
		{
			this.args.backdrop = null;
		}

		this.args.theme = this.meta.theme || 'construct';

		this.args.bg = this.meta.backdrop;
	}

	startLevel(refresh = true)
	{
		performance.mark('init-start');
		this.populateMap();

		this.levelFinished = false;

		if(!this.args.isReplaying)
		{
			this.args._isRecording = !this.args.networked;
		}

		this.args.debugEditMode = false;

		this.clearDialog();
		this.hideDialog();

		this.args.mouse = 'hide';

		this.args.currentSheild = null;
		this.args.hasFire    = false;
		this.args.hasWater   = false;
		this.args.hasElectric = false;
		this.args.hasNormal  = false;

		if(this.meta.zoneScript && ScriptPalette[this.meta.zoneScript])
		{
			this.zoneScript = new ScriptPalette[this.meta.zoneScript];
		}

		Bgm.stop('MENU_THEME');

		if(Bgm.playing && this.meta.bgm !== this.bgm)
		{
			Bgm.stop();
		}

		if(!this.meta.bgm)
		{
			Bgm.fadeOut(250);
		}

		if(!this.args.audio)
		{
			Bgm.pause();
		}

		if(refresh)
		{
			this.setZoneCard();
			this.zeroFrame = false;
		}

		this.fillBackground();

		if(this.args.networked && !this.remotePlayer)
		{
			const sonic = new Sonic({name:'Player 1', id: String(new Uuid)}, this);
			const tails = new Sonic({name:'Player 2', id: String(new Uuid)}, this);

			if(this.args.playerId === 1)
			{
				this.nextControl  = sonic;
				this.remotePlayer = tails;

				tails.args.netplayer = true;
			}
			else if(this.args.playerId === 2)
			{
				this.remotePlayer = sonic;
				this.nextControl  = tails;

				sonic.args.netplayer = true;
			}

			const startDef = this.defsByName.get('player-start');
			sonic.args.x = startDef.x;
			sonic.args.y = startDef.y;

			tails.args.x = startDef.x;
			tails.args.y = startDef.y;

			this.spawn.add({object: sonic});
			this.spawn.add({object: tails});

			this.auras.add(sonic);
			this.auras.add(tails);

			this.actors.add(sonic);
			this.actors.add(tails);
		}

		for(const layer of [...this.args.fgLayers, ...this.args.layers])
		{
			layer.args.destroyed = false;
		}

		if(!this.args.networked)
		{
			const actors = this.actors.list;

			if(!this.playableIterator)
			{
				this.playableIterator = this.playable.entries();
			}

			if(Object.values(this.args.actors)[0] && Object.values(this.args.actors)[0].controllable)
			{
				this.nextControl = Object.values(this.args.actors)[0];
			}
		}

		if(this.nextControl && this.nextControl.controller)
		{
			this.nextControl.controller.zero();
		}

		if(this.controller)
		{
			this.controller.zero();
		}

		Keyboard.get().reset();

		this.args.started = false;

		Bgm.unpause();

		this.args.zonecard.played.then(() => {

			performance.mark('init-end');
			performance.measure('init-marker', 'init-start', 'init-end');

			const zoneState = this.getZoneState();

			if(!this.replay)
			{
				for(const emblemId of zoneState.emblems)
				{
					if(!this.actorsById[emblemId])
					{
						continue;
					}

					const emblem = this.actorsByMap.get(this.currentMap)[emblemId];

					if(!emblem || emblem.mapUrl !== this.currentMap || !(emblem instanceof Emblem))
					{
						continue;
					}

					emblem.existing = 'existing';

					if(this.nextControl && !this.nextControl.args.emblems.includes(emblem))
					{
						this.nextControl.args.emblems.push(emblem);
					}
				}

				for(const emerald of this.currentSave.emeralds)
				{
					if(!this.args.emeralds.includes(emerald))
					{
						this.args.emeralds.push(emerald);
					}
				}
			}

			this.args.startFrameId = this.args.frameId - this.replayOffset;
			this.args.actStartFrameId = this.args.startFrameId;

			if(this.replayStart)
			{
				if(this.nextControl)
				{
					for(let i in this.replayStart[2])
					{
						Object.assign(this.nextControl.args, this.replayStart[2][i]);
						break;
					}

					this.nextControl.controller.replay(this.replayStart[1]||{});
					this.nextControl.readInput();
				}
			}
			else if(Router.query.start)
			{
				const start = Router.query.start;

				if(start.match(/\d+(\.\d+)?,\d+(\.\d+)?/))
				{
					const [x = 128, y = 128] = start.split(',');

					this.nextControl.args.x = Number(x);
					this.nextControl.args.y = Number(y);
				}
				else if(this.defsByName.has(start))
				{
					const point = this.defsByName.get(start);

					this.nextControl.args.x = Number(point.x);
					this.nextControl.args.y = Number(point.y);
				}

				if(Number(Router.query.noClip))
				{
					this.nextControl.args.float = -1;
					this.nextControl.noClip = 1;
				}
			}
			else if(!this.replay && !this.args.isReplaying && !this.args.isRecording && !this.args.networked)
			{
				this.args.demoIndicator = null;

				if(this.nextControl)
				{
					const storedPosition = this.getCheckpoint(this.nextControl.args.canonical);

					if(storedPosition)
					{
						const checkpoint = storedPosition ? this.actorsByMap.get(this.currentMap)[storedPosition.checkpointId] : null;

						if(checkpoint)
						{
							this.args.startFrameId = this.args.frameId - storedPosition.frames;
							this.args.actStartFrameId = this.args.startFrameId;

							checkpoint.args.wasActive = true;
							checkpoint.args.active    = true;

							this.nextControl.args.x = checkpoint.x;
							this.nextControl.args.y = checkpoint.y;

							if(this.nextControl.follower)
							{
								this.nextControl.follower.args.x = checkpoint.x;
								this.nextControl.follower.args.y = checkpoint.y;

								this.setColCell(this.nextControl.follower);
							}

							this.args.xOffset = 0.5;
							this.args.yOffset = 0.5;

							Bgm.play(this.meta.bgm, {loop:true});
						}
					}
				}
			}

			if(Number(Router.query.pause))
			{
				this.args.pauseMenu.args.hideMenu = 'pause-menu-hide';
				this.args.paused = Number(Router.query.pause);
			}

			if(this.nextControl.follower)
			{
				this.nextControl.follower.args.x = this.nextControl.x;
				this.nextControl.follower.args.y = this.nextControl.y;

				this.setColCell(this.nextControl.follower);
			}

			if(Router.query.impulse)
			{
				const impulse = Router.query.impulse;

				console.log(impulse);

				if(impulse.match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/))
				{
					const [x = 0, y = 0] = impulse.split(',');

					console.log({x,y});

					this.nextControl.args.xSpeed = Number(x);
					this.nextControl.args.ySpeed = Number(y);
				}
			}

			if(Router.query.rings)
			{
				this.nextControl.args.rings = Number(Router.query.rings);
			}

			this.args.level = 'level';

			this.args.fade    = false;
			this.args.started = true;
			this.args.running = true;
			this.startTime    = Date.now();

			this.onFrameOut(30, () => this.args.fade = 'hide');

			Analytic.report({
				eventCategory: 'zone',
				eventAction: 'started',
				eventLabel: `${this.args.actName}`
			});
		});
	}

	finishLevel()
	{
		if(!this.replay)
		{
			this.saveReplay('#008000').catch(()=>{});
		}

		this.levelFinished = true;
	}

	saveReplay(color)
	{
		const replay = new Replay;

		replay.consume({color, map: this.baseMap, frames: [...this.replayFrames.values()]});

		if(replay.lastFrame - replay.firstFrame < 30)
		{
			return Promise.reject();
		}

		return ReplayDatabase.open('replays', 3).then(database => {
			delete replay.id;
			const res = database.insert('replays', replay).then(() => replay);

			this.replayFrames = new Map;
			this.replayOffset = 0;
			this.replayStart  = null
			this.replay = null;

			return res;
		});

	}

	takeInput(controller)
	{
		const keyboard = Keyboard.get();

		keyboard.update();

		if(!this.gamepad && !this.args.cutScene)
		{
			controller.readInput({keyboard});

			this.args.inputType = 'input-keyboard';
		}
		else if(!this.args.cutScene)
		{
			const gamepads = navigator.getGamepads();

			const active = controller.readInput({keyboard, gamepads});

			for(const device of active)
			{
				if(device === keyboard)
				{
					continue;
				}

				const gamepad = device;

				if(gamepad)
				{
					this.gamepad = gamepad;

					const gamepadId = String(gamepad.id);

					if(gamepadId.match(/x-?bo?x/i))
					{
						this.args.inputType = 'input-xbox';
					}
					else if(gamepadId.match(/ps[345]/i)
						|| gamepadId.match(/playstation/i)
						|| gamepadId.match(/duals(hock|ense)/i)
						|| gamepadId.match(/ds[45]/i)
					){
						this.args.inputType = 'input-playstation';
					}
					else
					{
						this.args.inputType = 'input-generic';
					}

				}
				else
				{
					this.args.inputName = 'keyboard';

					this.args.inputType = 'input-keyboard';
				}
			}
		}
		else
		{
			this.controlActor.args.idleTime = 0;
		}

		if(this.controlActor && this.args.debugEditMode)
		{
			if(controller.buttons[0] && controller.buttons[0].time === 1)
			{
				const defKeys = Object.keys(ObjectPalette);

				const debugObjectType = defKeys[ this.args.debugObjectCursor ];

				if(!this.debugBank[debugObjectType])
				{
					this.debugBank[debugObjectType] = new ObjectPalette[debugObjectType];
				}

				const spawnObject = this.debugBank[debugObjectType];

				this.spawn.add({object:spawnObject});

				if(spawnObject.controllable)
				{
					spawnObject.args.name = 'SPAWN';

					this.playable.add(spawnObject);
				}

				spawnObject[Run] = this[Run];

				spawnObject.args.x = this.controlActor.args.x;
				spawnObject.args.y = this.controlActor.args.y;

				delete this.debugBank[debugObjectType];
			}

			if(controller.buttons[1] && controller.buttons[1].time === 1)
			{
				this.args.debugObjectCursor++;

				const defKeys = Object.keys(ObjectPalette);

				if(this.args.debugObjectCursor >= defKeys.length)
				{
					this.args.debugObjectCursor = 0;
				}

				const debugObjectType = defKeys[ this.args.debugObjectCursor ];

				if(!this.debugBank[debugObjectType])
				{
					this.debugBank[debugObjectType] = new ObjectPalette[debugObjectType];
				}

				while(this.tags.spawnPreview.node.firstChild)
				{
					this.tags.spawnPreview.node.firstChild.remove();
				}

				this.debugBank[debugObjectType].render(this.tags.spawnPreview.node);

				this.args.debugObjectName.args.value = debugObjectType;
			}

			if(controller.buttons[2] && controller.buttons[2].time === 1)
			{
				this.args.debugObjectCursor--;

				const defKeys = Object.keys(ObjectPalette);

				if(this.args.debugObjectCursor <= 0)
				{
					this.args.debugObjectCursor = defKeys.length - 1;
				}

				const debugObjectType = defKeys[ this.args.debugObjectCursor ];

				if(!this.debugBank[debugObjectType])
				{
					this.debugBank[debugObjectType] = new ObjectPalette[debugObjectType];
				}

				while(this.tags.spawnPreview.node.firstChild)
				{
					this.tags.spawnPreview.node.firstChild.remove();
				}

				this.debugBank[debugObjectType].render(this.tags.spawnPreview.node);

				this.args.debugObjectName.args.value = debugObjectType;
			}

		}

		if(this.args.debugEnabled)
		{
			// if(!this.args.plot)
			// {
			// 	this.args.plot = new Plot;
			// }

			if(controller.buttons[8] && controller.buttons[8].time === 1)
			{
				this.args.debugEditMode = !this.args.debugEditMode;
				this.settings.debugOsd = this.args.debugEditMode;
			}
		}

		if(controller.buttons[2011] && controller.buttons[2011].time === 1)
		{
			this.fullscreen();
		}

		if(controller.buttons[2008] && controller.buttons[2008].time === 1)
		{
			this.args.muteSwitch.args.active = !this.args.muteSwitch.args.active;
		}

		if(controller.buttons[2009] && controller.buttons[2009].time === 1)
		{
			this.settings.debugOsd = !this.settings.debugOsd;
		}

		if(controller.buttons[1050] && controller.buttons[1050].time === 1)
		{
			if(this.args.fullscreen)
			{
				this.exitFullscreen();
			}
		}

		if(controller.buttons[1020] && controller.buttons[1020].time === 1)
		{
			if(this.args.started)
			{
				this.args.paused
					? this.unpauseGame()
					: this.pauseGame();
			}
		}

		if(!this.args.networked && controller.buttons[1011] && controller.buttons[1011].time > 0)
		{
			this.args.pauseMenu.input(controller);
		}

		if(this.replay && this.replay.auto && controller.buttons[1209] && controller.buttons[1209].time > 0)
		{
			this.quit(this.args.replayQuickExit ?  2 : 1);
		}

		if(!this.args.networked && !this.args.paused)
		{
			if(!this.dontSwitch && controller.buttons[11] && controller.buttons[11].time === 1)
			{
				this.playableIterator = this.playableIterator || this.playable.entries();

				let next = this.playableIterator.next();

				if(next.done)
				{
					this.playableIterator = false;

					this.playableIterator = this.playable.entries();

					next = this.playableIterator.next();
				}

				if(next.value)
				{
					this.nextControl = next.value[0];

					this.dontSwitch = 3;
				}
			}
		}

		if(this.args.started)
		{
			if(this.controlActor)
			{
				this.args.currentSheild = this.controlActor.args.currentSheild
					? this.controlActor.args.currentSheild.type
					: '';
			}

			const pauseButton = 9;

			if(controller.buttons[pauseButton]
				&& controller.buttons[pauseButton].active
				&& controller.buttons[pauseButton].time === 1
			){
				if(this.args.paused)
				{
					this.unpauseGame();
				}
				else
				{
					this.pauseGame();
				}
			}

			if(!this.args.isReplaying && (this.args.isRecording || this.args._isRecording))
			{
				if(this.args.isRecording && !this.args.demoIndicator)
				{
					this.args.demoIndicator = new CharacterString({value:'⏺ REC', color: 'red'})
				}

				const frame = this.args.frameId - this.args.startFrameId;
				const input = controller.serialize();

				let args = {}, _args = {}, _input = {};

				if(this.controlActor)
				{
					args = {
						[this.controlActor.args.id]: {
							x: this.controlActor.args.x
							, y: this.controlActor.args.y
							, mode: this.controlActor.args.mode
							, falling: this.controlActor.args.falling
							, groundAngle: this.controlActor.args.groundAngle
							, gSpeed: this.controlActor.args.gSpeed
							, xSpeed: this.controlActor.args.xSpeed
							, ySpeed: this.controlActor.args.ySpeed
						}
					};
				}

				let changed = false;

				if(frame % 60 === 0 || this.replayFrames.size === 0)
				for(let i in args)
				{
					_args[i] = _args[i] || {};
					this.lastFrame.args[i] = this.lastFrame.args[i] || {};

					let _changed = false;

					for(let j in args[i])
					{
						if(args[i][j] !== this.lastFrame.args[i][j])
						{
							this.lastFrame.args[i][j] = _args[i][j] = args[i][j];
							changed = _changed = true;
						}
					}

					if(!_changed)
					{
						delete _args[i];
					}
				}

				for(let i in input)
				{
					_input[i] = _input[i] || {};
					this.lastFrame.input[i] = this.lastFrame.input[i] || {};

					for(let j in input[i])
					{
						if(input[i][j] !== this.lastFrame.input[i][j])
						{
							this.lastFrame.input[i][j] = _input[i][j] = input[i][j];
							changed = true;
						}
					}
				}

				if(_input.axes && !Object.keys(_input.axes).length)
				{
					delete _input.axes;
				}

				if(_input.buttons && !Object.keys(_input.buttons).length)
				{
					delete _input.buttons;
				}
				else
				{
					delete _input.buttons[1011];
				}

				if(changed && this.controlActor && !this.controlActor.args.dead)
				{
					this.replayFrames.set(frame, [frame, _input, _args]);
				}
			}
		}

		controller.update({gamepad:this.gamepad});
	}

	moveCamera()
	{
		if(!this.controlActor)
		{
			return;
		}

		if(!this.zeroFrame)
		{
			this.args.x = -this.controlActor.args.x;
			this.args.y = -this.controlActor.args.y;
		}

		this.zeroFrame = true;

		if(this.cameraBound <= this.maxCameraBound)
		{
			this.cameraBound = this.maxCameraBound;
		}
		else if(this.cameraBound < Infinity)
		{
			this.cameraBound -= 0.05 * this.cameraBound;
		}
		else
		{
			this.maxCameraBound = this.cameraBound = Math.hypot(this.args.x + this.controlActor.args.x, this.args.y + this.controlActor.args.y);
		}

		let cameraSpeed = 25;

		let actor = this.controlActor;

		let groundBias = 0;

		if(actor.args.standingOn)
		{
			groundBias = actor.args.standingOn.args.cameraBias;

			if(actor.args.standingOn.isVehicle)
			{
				actor = actor.args.standingOn;
			}
		}

		if(actor.focused)
		{
			if(this.cameraMode !== 'panning' && actor.args.cameraMode === 'panning')
			{
				const focus = actor.focused;

				this.cameraBound = this.maxCameraBound = Math.max(Math.abs(focus.x - actor.args.x), Math.abs(focus.y - actor.args.y));

				this.args.x -= actor.args.x - focus.x;
				this.args.y -= actor.args.y - focus.y;
			}

			this.cameraMode = actor.args.cameraMode;

			actor = actor.focused;
		}
		else
		{
			this.cameraMode = actor.args.cameraMode;
		}

		const highJump  = actor.args.highJump;
		const deepJump  = actor.args.deepJump;
		const falling   = actor.args.falling;
		const fallSpeed = actor.args.ySpeed;

		switch(this.cameraMode)
		{
			case 'panning':
				this.args.xOffsetTarget = 0.5;
				this.args.yOffsetTarget = 0.85;
				cameraSpeed = 8;
				break;

			case 'boost-ring':
				const angle = actor.args.angle;

				if(!angle || Math.abs(angle - Math.PI) < 0.1)
				{
					this.args.xOffsetTarget = 0.5;
					this.args.yOffsetTarget = 0.5;
					cameraSpeed = 24;
				}
				else
				{
					this.args.xOffsetTarget = 0.5 - 0.5 * Math.cos(angle);
					this.args.yOffsetTarget = 0.5 - 0.2 * Math.sin(angle);
					cameraSpeed = 16;
				}

				break;

			case 'cross-cannon':
				this.args.xOffsetTarget = 0.5;
				this.args.yOffsetTarget = 0.4;
				cameraSpeed = 18;
				break;

			case 'cross-cannon-quick':
				this.args.xOffsetTarget = 0.5;
				this.args.yOffsetTarget = 0.4;
				cameraSpeed = 5;
				break;

			case 'cutScene':
				this.args.xOffsetTarget = [0.50, 0.25, 0.50, 0.75][actor.args.mode];
				this.args.yOffsetTarget = [0.75, 0.50, 0.25, 0.50][actor.args.mode];
				this.maxCameraBound = 64;
				cameraSpeed = 15;
				break;

			case 'corkscrew':
				this.args.xOffsetTarget = 0.5;
				this.args.yOffsetTarget = 0.75;
				this.maxCameraBound = 96;
				cameraSpeed = 64;
				break;

			case 'normal':
				this.args.xOffsetTarget = [0.50, 0.45, 0.50, 0.55][actor.args.mode];
				this.args.yOffsetTarget = [0.50, 0.50, 0.50, 0.50][actor.args.mode];
				this.maxCameraBound = actor.args.falling ? 64 : 48;
				cameraSpeed = 12;
				if(actor.args.mode === 0)
				{
					cameraSpeed = 9;
				}
				break;

			case 'walker':
				const xWalk = 0.50 + (-0.35 * Math.sign(actor.args.direction)) * (actor.args.falling ? 0.65 : 1);
				const yWalk = 0.50 + (actor.args.falling ? -0.15 : 0);
				this.args.xOffsetTarget = [xWalk, 0.45, 0.50, 0.55][actor.args.mode];
				this.args.yOffsetTarget = [yWalk, 0.50, 0.50, 0.50][actor.args.mode];
				this.maxCameraBound = 96;
				cameraSpeed = 16;

				break;

			case 'perspective':
				this.args.xOffsetTarget = [0.50, 0.60, 0.50, 0.40][actor.args.mode];
				this.args.yOffsetTarget = [0.50, 0.50, 0.50, 0.50][actor.args.mode];
				this.maxCameraBound = 96;
				cameraSpeed = 12;
				break;

			case 'climbing':
				this.args.xOffsetTarget = [0.50, 0.33, 0.50, 0.66][actor.args.mode];
				this.args.yOffsetTarget = [0.50, 0.50, 0.50, 0.50][actor.args.mode];
				this.maxCameraBound = 48;
				cameraSpeed = 24;
				break;

			case 'airplane': {
				const xSpeed     = actor.args.xSpeed;
				const absSpeed   = Math.abs(xSpeed);
				const shiftSpeed = 5;

				cameraSpeed = 20;

				const speedBias = Math.max(absSpeed / 100, 0.45) * -Math.sign(xSpeed);

				this.args.xOffsetTarget = 0.5 + speedBias;
				this.args.yOffsetTarget = 0.5;
				break;

			}

			// case 'railcar-aerial':
			// case 'railcar-normal':
			// 	this.args.xOffsetTarget = 0.5;
			// 	this.args.yOffsetTarget = 0.5;
			// 	this.maxCameraBound = 0;
			// 	cameraSpeed = 0;

			// 	break;

			case 'aerial':
				this.args.xOffsetTarget = 0.5;

				cameraSpeed = 24;

				if(!actor.args.flying && (deepJump || highJump))
				{
					if(fallSpeed < 0)
					{
						this.args.yOffsetTarget = 0.75;
					}
					else
					{
						this.args.yOffsetTarget = 0.35;

						// cameraSpeed = 15;
					}
				}
				else
				{
					this.args.yOffsetTarget = 0.5;
				}

				break;

			case 'popping':
					this.args.xOffsetTarget = 0.5;
					this.args.yOffsetTarget = 0.25;
					this.maxCameraBound     = 64;
					cameraSpeed = 6;

					break;

			case 'hooked':
				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.60;
				this.maxCameraBound     = 1;
				cameraSpeed = 25;
				break;

			case 'tube':
				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.50;
				this.maxCameraBound     = 64;
				cameraSpeed = 24;
				break;

			case 'cinematic':
				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.50;
				this.maxCameraBound     = 1;
				cameraSpeed = 0;
				break;

			case 'cliff':
				this.args.xOffsetTarget = 0.50 + -0.1 * actor.args.direction;
				this.args.yOffsetTarget = 0.30;

				cameraSpeed = 9;

				break;

			case 'bridge':
				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.35;

				cameraSpeed = 9;

				break;

			case 'boss':
				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.72;
				this.maxCameraBound     = 64;

				cameraSpeed = 24;

				break;

			case 'draggable':
				this.args.xOffsetTarget = 0.5;
				this.args.yOffsetTarget = 0.5;
				this.maxCameraBound     = 48;
				cameraSpeed = 3;
				break;


			case 'locked':
				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.25;
				this.maxCameraBound     = 32;
				cameraSpeed = 16;
				break;

			default:
				this.maxCameraBound = 64;
				cameraSpeed = 25;
				break;
		}

		const biasModes = ['normal', 'perspective', 'bridge', 'cliff', 'aerial', 'tube', 'hooked', 'cutScene', 'hooked', 'corkscrew'];

		if(biasModes.includes(this.cameraMode) && !actor.args.pushing  && actor.args.modeTime > 0)
		{
			let biaser = actor;

			if(actor.args.standingOn && actor.args.standingOn.invertsBias)
			{
				biaser = actor.args.standingOn;
			}

			let gSpeed = biaser.args.gSpeed;
			let xSpeed = biaser.args.xSpeed;

			if(actor.args.hangingFrom)
			{
				xSpeed = actor.args.hangingFrom.args.xSpeed;
			}

			if(biaser.args.standingLayer)
			{
				gSpeed += biaser.args.standingLayer.offsetXChanged;
			}

			const grounded   = !biaser.args.falling;
			const absSpeed   = Math.abs(grounded ? gSpeed : xSpeed);
			const shiftSpeed = 17;

			let speedBias = Math.abs(biaser.xLast - biaser.args.x) > 1 && (Math.min(absSpeed / shiftSpeed, 1) * -Math.sign(gSpeed || xSpeed));

			if(biaser !== actor)
			{
				speedBias *= 4;
			}

			switch(biaser.args.mode)
			{
				case 0:
					this.args.xOffsetTarget += speedBias * 0.4;
					break;

				case 1:
					this.args.yOffsetTarget += speedBias * 0.4;
					break;

				case 2:
					this.args.xOffsetTarget -= speedBias * 0.4;
	 				break;

				case 3:
					this.args.yOffsetTarget -= speedBias * 0.4;
					break;
			}

			this.args.speedBias = speedBias;
		}

		this.args.xOffsetTarget = Math.max(0,Math.min(1,this.args.xOffsetTarget));

		if(actor.args.jumping && actor.args.fallTime > 15)
		{
			this.maxCameraBound = 128;

			if(deepJump || highJump)
			{
				cameraSpeed *= 0.75;
			}
		}

		let ySpeedBias = 0;
		let ySpeedMax  = 512;
		let ySpeed     = 0;

		if(this.cameraMode !== 'boss' && this.cameraMode !== 'rocket' && actor.args.modeTime > 0)
		{
			if(!actor.args.falling && actor.args.mode === 1)
			{
				ySpeedMax = actor.args.gSpeedMax;
				ySpeed = actor.args.gSpeed / 12;
			}
			else if(!actor.args.falling && actor.args.mode === 3)
			{
				ySpeedMax = actor.args.gSpeedMax;
				ySpeed = -actor.args.gSpeed / 12;
			}

			if(actor.args.rolling)
			{
				ySpeed /= 4;
			}

			if(actor.args.falling && actor.args.ySpeed > 0)
			{
				if(deepJump || highJump)
				{
					ySpeed = actor.args.ySpeed;
				}

				if(actor.args.ySpeed > 0)
				{
					ySpeedBias += actor.args.ySpeed > 24 ? 0.5 : 0;
				}
				else
				{
					ySpeedBias += (actor.args.deepJump || actor.args.ySpeed < -24) ? -0.5 : 0;
				}
			}

			if(actor.args.hangingFrom)
			{
				ySpeed = actor.args.ySpeed;
			}

			ySpeedBias += (ySpeed / ySpeedMax);

			if(actor.args.hangingFrom)
			{
				ySpeedBias += 0.2;
			}
		}

		if(actor.args.climbing)
		{
			ySpeedBias  = -0.33 * Math.sign(actor.args.gSpeed) * (Math.max(4, Math.abs(actor.args.gSpeed))/4)  * (actor.args.mode === 1 ? -1:1);
		}

		this.args.yOffsetTarget += groundBias + actor.args.cameraBias - ySpeedBias;

		if(actor.args.mode === 0 && Math.abs(actor.args.groundAngle - -Math.PI / 4) < 0.001)
		{
			this.args.yOffsetTarget -= 0.25 * Math.sign(actor.args.y - actor.yLast);
		}

		if(cameraSpeed)
		{
			const xOffsetDiff = this.args.xOffsetTarget - this.args.xOffset;
			const yOffsetDiff = this.args.yOffsetTarget - this.args.yOffset;

			this.args.xOffset += xOffsetDiff / cameraSpeed;
			this.args.yOffset += yOffsetDiff / cameraSpeed;
		}
		else
		{
			this.args.xOffset = this.args.xOffsetTarget;
			this.args.yOffset = this.args.yOffsetTarget;
		}

		const center = actor.rotatePoint(0, -actor.args.height / 2);

		if(actor.cofocused)
		{
			if(!actor.cofocusPoint)
			{
				actor.cofocusPoint = {};
			}

			actor.cofocusPoint.x = (actor.args.x + actor.cofocused.args.x) * 0.5;
			actor.cofocusPoint.y = (actor.args.y + actor.cofocused.args.y) * 0.5;
		}
		else
		{
			actor.cofocusPoint = null;
		}

		const actorX = center[0] + (actor.cofocused ? -actor.cofocusPoint.x : -actor.args.x);
		const actorY = center[1] + (actor.cofocused ? -actor.cofocusPoint.y : -actor.args.y);

		const xNext = actorX + center[0] + this.args.width  * Number(this.args.xOffset);
		const yNext = actorY + center[1] + this.args.height * Number(this.args.yOffset);

		const xDiff = this.args.x + -xNext;
		const yDiff = this.args.y + -yNext;

		const distance = Math.hypot(xDiff, yDiff);
		const angle    = Math.atan2(yDiff, xDiff);

		const maxDistance = this.cameraBound;

		const dragDistance = Math.min(maxDistance, distance);

		const snapFactor = Math.abs(dragDistance / maxDistance);
		const snapFrames = this.cameraMode === 'panning' ? 6 : 12;
		const snapSpeed  = dragDistance / snapFrames;

		let x = xNext + dragDistance * Math.cos(angle);
		let y = yNext + dragDistance * Math.sin(angle);

		if(snapFactor * snapSpeed > 0.1)
		{
			x = x - snapFactor * Math.cos(angle) * snapSpeed;
			y = y - snapFactor * Math.sin(angle) * snapSpeed / 2;
		}

		const xMin = actor.screenLock ? -(actor.screenLock.xMin + 0) : 0;

		if(x > xMin && !this.meta.wrapX)
		{
			x = xMin;
		}

		if(y > 0 && !this.meta.wrapY)
		{
			y = 0;
		}

		const playableHeight = this.meta.deathLine || (this.tileMap.mapData.height * this.tileMap.mapData.tileheight);

		const xMax = actor.screenLock
			? -(actor.screenLock.xMax - this.args.width)
			: -(this.tileMap.mapData.width * this.tileMap.mapData.tilewidth) + this.args.width;

		const yMax = -playableHeight + this.args.height;

		if(x < xMax && !this.meta.wrapX)
		{
			x = xMax;
		}

		if(y < yMax && !this.meta.wrapY)
		{
			y = yMax;
		}

		this.args.shakeX *= -0.95;
		this.args.shakeY *= -0.95;

		this.args.shakeX = Math.abs(this.args.shakeX) < 0.1 ? 0 : this.args.shakeX;
		this.args.shakeY = Math.abs(this.args.shakeY) < 0.1 ? 0 : this.args.shakeY;

		let xFine = x
		let yFine = y;

		const prevX = this.args.x;
		const prevY = this.args.y;

		if(actor.args.dead && !actor.args.respawning)
		{
			xFine = x + this.args.shakeX;

			this.args.x = Number(xFine.toFixed(3));
		}
		else
		{
			xFine = x + this.args.shakeX;
			yFine = y + this.args.shakeY;

			this.args.x = Number(xFine.toFixed(3));
			this.args.y = Number(yFine.toFixed(3));
		}

		this.args.yDelta = this.args.y - prevY;

		if(Math.abs(this.args.yDelta) > 12)
		{
			this.args.yDeltaDecay += 0.75 * Math.sign(this.args.yDelta);
		}

		this.args.yDeltaDecay *= 0.85;
	}

	applyMotionBlur()
	{
		if(this.args.frameId % this.settings.frameSkip !== 0)
		{
			return;
		}

		const controlActor = this.controlActor;

		if(this.settings.blur && controlActor && this.tags.blur)
		{
			const xMoved = this.args.x - this.xPrev;
			const yMoved = this.args.y - this.yPrev;

			const blurDenominator = 6;

			let xBlur = (Number(xMoved) / blurDenominator) ** 2;
			let yBlur = (Number(yMoved) / blurDenominator) ** 2;

			const maxBlur = 32;

			xBlur = xBlur < maxBlur ? xBlur : maxBlur;
			yBlur = yBlur < maxBlur ? yBlur : maxBlur;

			let blur = Math.max(0, -1 + 0.25 * Math.hypot(xBlur, yBlur));

			const blurAngle = Math.atan2(yMoved, xMoved);

			if(this.args.frozen > 0)
			{
				blur = 0;
			}

			if(blur > 0.5)
			{
				this.tags.blurAngle.setAttribute('style', `transform:rotate(calc(1rad * ${blurAngle}))`);
				this.tags.blurAngleFg.setAttribute('style', `transform:rotate(calc(1rad * ${blurAngle}))`);
				this.tags.blurAngleCancel.setAttribute('style', `transform:rotate(calc(-1rad * ${blurAngle}))`);
				this.tags.blurAngleCancelFg.setAttribute('style', `transform:rotate(calc(-1rad * ${blurAngle}))`);
				this.tags.blur.setAttribute('stdDeviation', `${blur}, 0`);
			}
			else
			{
				this.tags.blurAngle.setAttribute('style', `transform:none;`);
				this.tags.blurAngleFg.setAttribute('style', `transform:none;`);
				this.tags.blurAngleCancel.setAttribute('style', `transform:none;`);
				this.tags.blurAngleCancelFg.setAttribute('style', `transform:none;`);
				this.tags.blur.removeAttribute('stdDeviation');
			}

			this.xPrev = this.args.x;
			this.yPrev = this.args.y;
		}
		else
		{
			this.tags.blurAngle.setAttribute('style', `transform:none;`);
			this.tags.blurAngleFg.setAttribute('style', `transform:none;`);
			this.tags.blurAngleCancel.setAttribute('style', `transform:none;`);
			this.tags.blurAngleCancelFg.setAttribute('style', `transform:none;`);
			this.tags.blur.removeAttribute('stdDeviation');
		}
	}

	updateBackground()
	{
		if(this.args.frameId % this.settings.frameSkip !== 0)
		{
			return;
		}

		let controlActor = this.controlActor;

		if(controlActor && controlActor.standingOn && controlActor.standingOn.isVehicle)
		{
			controlActor = this.controlActor.standingOn;
		}

		this.tags.bgFilters.style({
			'--x': this.args.x
			, '--y': this.args.y
		});

		if(this.args.plot)
		{
			this.args.plot.args.x = Number(this.args.x).toFixed(2);
			this.args.plot.args.y = Number(this.args.y).toFixed(2);
		}

		this.tags.content.style({
			'--xPos': this.args.x
			, '--yPos': this.args.y
			, '--xPerspective': this.args.xPerspective
			, '--outlineWidth': this.settings.outline + 'px'
		});

		// this.tags.tilt.style({
		// 	'--yDelta': this.args.yDeltaDecay
		// });

		const xMod = this.args.x <= 0
			? (this.args.x % (this.args.blockSize))
			: (-this.args.blockSize + (this.args.x % this.args.blockSize)) % this.args.blockSize;

		const yMod = this.args.y <= 0
			? (this.args.y % (this.args.blockSize))
			: (-this.args.blockSize + (this.args.y % this.args.blockSize)) % this.args.blockSize;

		this.tags.background.style({transform: `translate( ${xMod.toFixed(2)}px, ${yMod.toFixed(2)}px )`});
		this.tags.foreground.style({transform: `translate( ${xMod.toFixed(2)}px, ${yMod.toFixed(2)}px )`});

		this.tags.frame.style({
			'--width':    this.args.width
			, '--height': this.args.height
			, '--scale':  this.args.scale
		});
	}

	updateBackdrops()
	{
		if(this.args.frameId % this.settings.frameSkip !== 0)
		{
			return;
		}

		for(const [,backdrop] of this.backdrops)
		{
			if(!backdrop.view)
			{
				const args = {};

				let backdropType = '';

				for(const property of backdrop.properties)
				{
					if(property.name === 'backdrop')
					{
						backdropType = property.value;
						continue;
					}

					args[ property.name ] = property.value;
				}

				args.width  = backdrop.width;
				args.height = backdrop.height;

				args.bX = backdrop.x;
				args.bY = backdrop.y;

				const backdropClass = BackdropPalette[backdropType];

				if(backdropClass)
				{
					backdrop.view = new backdropClass(args, this);
					backdrop.view.render( this.tags.backdrops );
				}
			}

			const leftIntersect   =   this.args.width  + -this.args.x + -backdrop.x;
			const topIntersect    =   this.args.height + -this.args.y + -backdrop.y;

			const rightIntersect  = -(-backdrop.width  + -this.args.x + -backdrop.x);
			const bottomIntersect = -(-backdrop.height + -this.args.y + -backdrop.y);

			const xMax = this.tileMap ? -(this.tileMap.mapData.width * 32) : 2 ** 9;
			const yMax = this.tileMap ? -(this.tileMap.mapData.height * 32) : 2 ** 9;

			backdrop.view && Object.assign(backdrop.view.args, ({
				x: this.args.x
				, xOffset: -this.args.x + -backdrop.x
				, xPan: this.args.x + this.args.xPerspective * 1.5
				, xMax: xMax
				, y: this.args.y + backdrop.y
				, yMax: this.args.y + backdrop.y + -backdrop.view.stacked
				, stacked: -backdrop.view.stacked + 'px'
				, frame: this.args.frameId
				, top: topIntersect
				, bottom: bottomIntersect
			}));
		}

		const tWidth  = this.tileMap.mapData.tilewidth;
		const tHeight = this.tileMap.mapData.tileheight;

		const mWidth  = this.tileMap.mapData.width;
		const mHeight = this.tileMap.mapData.height;

		this.tileMap && this.tileMap.ready.then(() => {
			const xMax = this.tileMap ? -(mWidth * tHeight) : 2 ** 9;
			const yMax = this.tileMap ? -(mHeight * tHeight) : 2 ** 9;

			this.args.backdrop && Object.assign(this.args.backdrop.args, ({
				x: 0
				, xPan: this.args.x + this.args.xPerspective * 1.5
				, y: this.args.y + this.args.yOffset
				, xMax: xMax ?? 0
				, yMax: yMax ?? 0
				, frame: this.args.frameId
				, stacked: -this.args.backdrop.stacked + 'px'
			}));
		});
	}

	spawnFromDef(objDef)
	{
		const objType = objDef.type || objDef.class || objDef.name;

		if(objDef.id > this.maxObjectId)
		{
			this.maxObjectId = objDef.id;
		}

		if(objType === 'particle')
		{
			const particle = new Particle3d;

			particle.style({'--x': objDef.x, '--y': objDef.y});

			this.particles.add(particle.node);
		}

		if(objType === 'backdrop')
		{
			this.backdrops.set(objDef.id, objDef);
			return;
		}

		if(!ObjectPalette[objType])
		{
			return;
		}

		const objClass = ObjectPalette[objType];
		const rawActor = objClass.fromDef(objDef);

		rawActor[Run] = this[Run];

		rawActor[ Bindable.NoGetters ] = true;

		const actor = Bindable.make(rawActor);

		actor.oid  = objDef.oid || objDef.id;
		actor.name = actor.name || objDef.name;
		actor.startFrame = this.args.frameId || 0;

		this.actors.add( actor );

		return actor;
	}

	spawnInitialObjects(objDefs, mapUrl)
	{
		const spawned = new Set;

		for(let i in objDefs)
		{
			this.defsByName.set(objDefs[i].name, objDefs[i]);
			this.objDefs.set(objDefs[i].id, objDefs[i]);

			const actor = this.spawnFromDef(objDefs[i]);

			if(actor)
			{
				actor.mapUrl = mapUrl;
				spawned.add(actor);

				if(!this.actorsByMap.has(mapUrl))
				{
					this.actorsByMap.set(mapUrl, Object.create(null));
				}

				this.actorsByMap.get(mapUrl)[actor.oid] = actor;
			}
		}

		if(this.defsByName.has('player-start') && !this.args.started)
		{
			const start = this.defsByName.get('player-start');

			this.args.x = -start.x;
			this.args.y = -start.y;
		}

		for(const actor of this.actors.items())
		{
			if(!spawned.has(actor))
			{
				continue;
			}

			for(const o in actor.others)
			{
				actor.others[o] = this.actorsById[actor.others[o]];
			}

			if(actor.objDef && actor.objDef.properties)
			{
				for(const property of actor.objDef.properties)
				{
					if(property.type === 'object')
					{
						actor.otherDefs[property.name] = this.objDefs.get(property.value);
					}
				}
			}

			if(this.actorIsOnScreen(actor))
			{
				actor.args.display = actor.defaultDisplay || null;
				actor.render(this.tags.actors);
			}
			else
			{
				actor.args.display = 'none';
				actor.render()
				actor.detach();
			}

			if((actor.onAttach && actor.onAttach() === false) || actor.args.hidden)
			{
				actor.args.display = 'none';
				actor.detach();
			}

			if(actor.controllable)
			{
				actor.args.display = actor.defaultDisplay || null;
			}
		}

		for(const actor of this.actors.items())
		{
			actor.initialize && actor.initialize();
			actor.vizi = false;
		}

		if(!this.args.started)
		{
			this.args.started = true;
			this.update();
			this.args.started = false;
		}
	}

	appendMap(url, x, y)
	{
		this.maps.set(url, {x, y});

		this.args.loadingMap = true;

		return this.tileMap.preloadMap(url).then(mapData => {

			const newBottom = y + mapData.height;

			if(newBottom > this.tileMap.mapData.height)
			{
				const yDiff = newBottom - this.tileMap.mapData.height;

				this.tileMap.resize(this.tileMap.mapData.width, newBottom);

				this.offsetMap(0, yDiff);

				y = 0;
			}

			return this.tileMap.append(url, x, y, this.maxObjectId);
		})
		.then(({defs, data,}) => {

			this.currentMap = url;

			const zoneState = this.getZoneState();

			this.controlActor.args.emblems.splice(0);

			const maxObjectId = this.maxObjectId;

			let newMaxObjectId = 0;

			for(const def of defs)
			{
				def.oid = def.id;
				def.id += maxObjectId;
				def.x  += x * this.tileMap.mapData.tilewidth;
				def.y  += y * this.tileMap.mapData.tileheight;

				newMaxObjectId = Math.max(newMaxObjectId, def.id);

				if(!def.properties)
				{
					continue;
				}

				for(const prop of def.properties)
				{
					if(prop.type === 'object')
					{
						prop.value += maxObjectId;
					}
				}
			}

			const defList = Object.create(null);

			[...defs].forEach(d => defList[ d.oid ] = d);

			this.defsByMap.set(this.currentMap, defList);

			this.maxObjectId = newMaxObjectId;

			for(const prop of Object.values(data.properties))
			{
				const name = prop.name.replace(/-/g, '_');

				this.meta[name] = prop.value;
			}

			const spawn = this.spawnInitialObjects(defs, url);

			const newStart = this.defsByName.get('player-start');

			if(newStart)
			{
				this.storeCheckpoint(this.controlActor.args.canonical, newStart.oid || newStart.args.id);
			}

			for(const emblemId of zoneState.emblems)
			{
				const emblem = this.actorsByMap.get(this.currentMap)[emblemId];

				if(!emblem || emblem.mapUrl !== url)
				{
					continue;
				}

				emblem.existing = 'existing';

				if(this.controlActor && !this.controlActor.args.emblems.includes(emblem))
				{
					this.controlActor.args.emblems.push(emblem);
				}
			}

			return spawn;

		}).finally(() => this.args.loadingMap = false);
	}

	offsetMap(x, y)
	{
		for(const actor of this.actors.items())
		{
			actor.args.x += x * this.tileMap.blockSize;
			actor.args.y += y * this.tileMap.blockSize;
			this.setColCell(actor);
		}

		this.args.x -= x * this.tileMap.blockSize;
		this.args.y -= y * this.tileMap.blockSize;

		if(this.meta.deathLine)
		{
			this.meta.deathLine += y * this.tileMap.blockSize;
		}

		this.tileMap.offset(x, y);
	}

	populateMap()
	{
		if(this.args.populated)
		{
			return;
		}

		const mapWidth  = this.tileMap.mapData.width * 32 + 64;
		const mapHeight = this.tileMap.mapData.height * 32 + 64;

		// this.quadCell = new QuadCell(
		// 	this.args.width * 2
		// 	, {x: mapWidth/2, y: mapHeight/2}
		// 	, {x: mapWidth, y: mapHeight}
		// );

		this.args.populated = true;

		this.defsByName = new Map;
		this.objDefs    = new Map;

		for(const [id,backdrop] of this.backdrops)
		{
			if(backdrop.view)
			{
				backdrop.view.remove();

				backdrop.view = undefined;
			}

			this.backdrops.delete(id);
		}

		for(const particle of Object.entries(this.particles.list))
		{
			if(particle)
			{
				this.particles.remove(particle);
			}
		}

		const selectedChar = String(this.args.selectedChar || Router.query.char || 'Sonic').toLowerCase();
		const charClass = ObjectPalette[selectedChar] || Sonic;

		const character = new charClass({name: selectedChar}, this);

		// const objDefs = this.tileMap.getObjectDefs();

		for(const [mapUrl, objDefs] of this.defsByMap)
		{
			this.spawnInitialObjects(objDefs, mapUrl);
		}

		if(!this.args.networked)
		{
			let startType = 'player-start';

			if(!character.canRoll && this.defsByName.has('wide-player-start'))
			{
				startType = 'wide-player-start';
			}

			const startDef = this.defsByName.get(startType);

			character.args.x = startDef ? startDef.x : mapWidth  / 2;
			character.args.y = startDef ? startDef.y : mapHeight / 2;
			character.args.z = startDef ? startDef.z ?? 10 : 10;

			character.args.animation = 'dropping';

			const followerChar = String(this.args.followerChar || Router.query.follower || '').toLowerCase();

			if(followerChar)
			{
				const charClass = ObjectPalette[followerChar] || Tails;

				const follower = new charClass({
					following: true
					, name:   followerChar
					, x: character.args.x
					, y: character.args.y
					, z: character.args.z - 1
				}, this);

				this.spawn.add({object:follower});
				this.auras.add(follower);
				this.actors.add(follower);

				character.follower = follower;
			}

			this.spawn.add({object:character});
			this.auras.add(character)
			this.actors.add(character);

			if(startDef && startDef.properties)
			{
				for(const property of startDef.properties)
				{
					character.args[property.name] = property.value;
				}
			}

			this.nextControl = character;
		}

		this.onFrameOut(1, () => {
			if(character.follower)
			{
				character.follower.args.x = character.args.x;
				character.follower.args.y = character.args.y;
			}
		});

		if(!this.replayStart)
		for(const [id, actor] of Object.entries(this.actors.list))
		{
			if(!actor || actor.args.npc)
			{
				continue;
			}

			if(!actor.controllable)
			{
				continue;
			}

			const position = this.getCheckpoint(actor.args.canonical);

			if(position && position.checkpointId)
			{
				const checkpointDef = this.defsByMap.get(this.currentMap)[position.checkpointId];
				const checkpointObj = this.actorsByMap.get(this.currentMap)[position.checkpointId];

				if(checkpointDef)
				{
					actor.args.x = checkpointDef.x;
					actor.args.y = checkpointDef.y;
				}

				if(checkpointObj)
				{
					checkpointObj.args.active = true;
				}
			}

		}
	}

	actorIsOnScreen(actor, margin = 512)
	{
		if(!actor)
		{
			return;
		}

		const width  = this.args.width;
		const height = this.args.height;

		const camLeft   = -this.args.x + -16 + -margin;
		const camRight  = -this.args.x +  16 +  margin + width;

		const camTop    = -this.args.y - margin;
		const camBottom = -this.args.y + height + margin * 0.5;

		const actorWidth = actor.args.width;

		const actorTop   = actor.args.y - actor.args.height;

		const actorLeft  = actor.args.x - (actor.isRegion ? 0 : actorWidth / 2);
		const actorRight = actor.args.x + (actor.isRegion ? actorWidth : (actorWidth / 2));

		if(camLeft > actorRight || actorLeft > camRight)
		{
			return false;
		}

		if(camTop > actor.args.y || actorTop > camBottom)
		{
			return false;
		}

		return true;
	}

	spawnActors()
	{
		const actorDoc  = new DocumentFragment;
		const regionDoc = new DocumentFragment;

		let actorSpawned  = false;
		let regionSpawned = false;

		for(const spawn of this.spawn)
		{
			if(spawn.frame)
			{
				if(spawn.frame <= this.args.frameId)
				{
					this.spawn.delete(spawn);

					spawn.object[ Bindable.NoGetters ] = true;

					spawn.object[Run] = this[Run];

					spawn.object.startFrame = this.args.frameId || 0;
					spawn.object.args.id = ++this.maxObjectId;

					this.actors.add(Bindable.make(spawn.object));

					const isRegion = spawn.object instanceof Region;

					const doc = actorDoc;

					spawn.object.render(doc);
					spawn.object.onRendered();

					if(spawn.object.onAttach && spawn.object.onAttach() === false)
					{
						if(!spawn.object.args.hidden)
						{
							spawn.object.detach();
						}
					}

					this.setColCell(spawn.object);

					actorSpawned = true;

					spawn.object.initialize && spawn.object.initialize();
				}
			}
			else
			{
				this.spawn.delete(spawn);

				spawn.object[ Bindable.NoGetters ] = true;

				spawn.object[Run] = this[Run];

				spawn.object.startFrame = this.args.frameId || 0;
				spawn.object.args.id = ++this.maxObjectId;

				this.actors.add(Bindable.make(spawn.object));

				spawn.object.render(actorDoc);
				spawn.object.onRendered();
				spawn.object.onAttached && spawn.object.onAttached()

				if(spawn.object.onAttach && spawn.object.onAttach() === false)
				{
					spawn.object.detach();
				}

				actorSpawned = true;

				spawn.object.initialize && spawn.object.initialize();
			}
		}

		if(actorSpawned)
		{
			this.tags.actors.append(actorDoc);
		}

		if(regionSpawned)
		{
			this.tags.actors.append(regionDoc);
		}
	}

	actorUpdateStart(actor)
	{
		if(this.updateStarted.has(actor))
		{
			return;
		}

		this.updateStarted.add(actor);

		actor.updateStart();

		if(actor.colliding)
		{
			actor.colliding = false;
		}

		actor.moved = false;
	}

	actorUpdate(actor)
	{
		if(this.updated.has(actor))
		{
			return;
		}

		this.updated.add(actor);

		actor.update();
	}

	actorUpdateEnd(actor)
	{
		if(this.updateEnded.has(actor))
		{
			return;
		}

		this.updateEnded.add(actor);

		actor.args.colliding = actor.colliding;

		actor.updateEnd();

		if(actor.moved && !actor.removed)
		{
			this.setColCell(actor);
		}

		// this.quadCell.remove(actor, actor.args);

		// this.quadCell.insert(actor, actor.args);

		// this.quadCell.insert(actor, {x: actor.args.x - actor.args.width / 2, y: actor.args.y});
		// this.quadCell.insert(actor, {x: actor.args.x + actor.args.width / 2, y: actor.args.y});
	}

	nearbyActors(x, y, regions = false)
	{
		const nearbyCells = this.getNearbyColCells(x, y);

		const result = new Set;

		for(const actors of nearbyCells)
		{
			for(const actor of actors)
			{
				if(regions && !actor.isRegion)
				{
					continue;
				}

				result.add(actor);
			}
		}

		return result;
	}

	update()
	{
		const frameId = this.args.frameId - this.args.startFrameId;

		if(this.zoneScript && this.args.started && this.args.paused === false)
		{
			this.zoneScript.update(frameId, this);
		}

		if(this.args.started && this.meta.bgm && frameId === (this.meta.bgm_delay||1))
		{
			Bgm.play(this.meta.bgm, {loop:true});
		}

		if(this.socket && this.args.frameId % 120 === 0)
		{
			this.socket.publish('keepalive', '');
		}

		if(this.args.loadingMap)
		{
			return;
		}

		if(this.args.paused > 0)
		{
			this.args.paused--;
		}

		if(this.args.frozen > 0)
		{
			this.args.frozen--;
		}

		if(this.tallyBoard && !this.args.paused && this.controlActor)
		{
			this.tallyBoard.update(this);

			this.args.score.args.value = String(this.controlActor.args.score).padStart(4, ' ');

			if(!this.tallyBoard.done)
			{
				this.args.frozen = 1;
			}
		}

		const controller = this.controlActor
			? this.controlActor.controller
			: this.controller;

		for(const b in controller.buttons)
		{
			if(controller.buttonIsMapped(b))
			{
				continue;
			}

			if(controller.buttons[b].active && controller.buttons[b].time === 1)
			{
				this.debugSeq.check(`Button${b}`);
				this.konamiSeqA.check(`Button${b}`);
				this.konamiSeqB.check(`Button${b}`);
			}
		}

		if(this.args.frameId % 600 === 0)
		{
			ga('set', 'metric1', this.args.frameId / 60);

			if(typeof ga === 'function')
			{
				Analytic.report({
					eventCategory: 'fps-check',
					eventAction: `fps-check::${navigator.platform}::cores_${navigator.hardwareConcurrency}`,
					eventLabel: `${this.args.actName}`,
					eventValue: Math.trunc(this.args.fps),
					Value: Math.trunc(this.args.fps)
				});
			}
		}

		if(!this.args.started)
		{
			this.startTime = Date.now();

			if(controller)
			{
				this.takeInput(controller);

				if(this.args.titlecard)
				{
					this.args.titlecard.input(controller);
				}
			}
		}

		if(this.args.paused !== false)
		{
			this.takeInput(controller);

			this.args.pauseMenu.input(controller);
		}

		if(this.args.paused === false || this.args.paused > 0 || this.args.networked)
		{
			this.callFrameOuts();
			this.callRenderedFrameOut();
			this.callFrameIntervals();

			for(const [key, timer] of this.timers)
			{
				timer.update();
			}

			this.args.lastFrameId = this.args.frameId;

			if(this.args.cutScene)
			{
				this.args.startFrameId++;

				this.args.showHud = false;
			}
			else if(this.settings.showHud)
			{
				this.args.showHud = true;
			}

			if(!this.args.debugEditMode)
			{
				this.args.frameId++;
			}

			if(this.args.debugOsd)
			{
				this.args.frame.args.value = this.args.frameId;
			}
		}

		if(!this.args.networked && this.args.started && (this.args.paused !== false && this.args.paused <= 0))
		{
			return;
		}

		if(!this.args.networked && this.args.frozen > 0)
		{
			this.args.startFrameId++;
			this.args.blur = 0;
			return;
		}

		if(!this.args.started && this.args.frameId > 0)
		{
			return;
		}

		if(this.tileMap && this.tileMap.mapData)
		{
			this.updateBackdrops();
		}

		for(const [detachee, detacher] of this.willDetach)
		{
			this.willDetach.delete(detachee);

			detacher();
		}

		if(!Number(this.args.rings.args.value))
		{
			this.args.ringLabel.args.color = 'red-alert';
		}
		else
		{
			this.args.ringLabel.args.color = 'yellow';
		}

		this.args.fpsSprite.args.value = Number(this.args.fps).toFixed(0).padStart(2,'0');

		const time  = (this.args.frameId - this.args.actStartFrameId) / 60;
		let minutes = String(Math.trunc(Math.abs(time) / 60)).padStart(2,'0')
		let seconds = String(Math.trunc(Math.abs(time) % 60)).padStart(2,'0');

		const neg = time < 0 ? '-' : '';

		if(neg)
		{
			minutes = Number(minutes);
		}

		this.args.timer.args.value = `${neg}${minutes}:${seconds}`;

		if(this.dontSwitch > 0)
		{
			this.dontSwitch--;
		}

		if(this.dontSwitch < 0)
		{
			this.dontSwitch = 0;
		}

		this.args.rippleFrame = this.args.frameId % 128;
		this.args.displaceWater = this.args.frameId % 128;

		this[ActorPointCache].clear();

		if(!this.args.isReplaying && !this.args.isRecording)
		{
			this.args.demoIndicator = null;
		}

		this.updateBackground();

		if(this.controlActor)
		{
			if(this.args.isReplaying)
			{
				const keyboard = Keyboard.get();

				if(keyboard.getKeyCode('NumpadAdd') > 0)
				{
					this.focus();
					this.args.paused = 1;
					this.args.pauseMenu.args.hideMenu = 'pause-menu-hide';
				}

				if(!this.args.demoIndicator)
				{
					this.args.demoIndicator = new CharacterString({value:'▶ PLAY', color: 'green'})
				}

				this.onFrameOut(60, () => {
					if(this.args.focusMe.args.hide)
					{
						this.args.focusMe.args.hide = 'hide hidden';
					}
				});

				const frameId = this.args.frameId - this.args.startFrameId;

				if(frameId < this.maxReplayFrame)
				{
					const actor = this.controlActor;

					this.lastInput = this.lastInput || {};
					this.lastInput.axes = this.lastInput.axes || {};
					this.lastInput.buttons = this.lastInput.buttons || {};

					if(this.replayFrames.has(frameId))
					{
						const [_,input,args] = this.replayFrames.get(frameId);
						const frame = {frame:_,input,args};

						if(frame.args)
						{
							for(const actorId in frame.args)
							{
								Object.assign(actor.args, frame.args[actorId]);
								actor.args.ignore = 0;
								actor.args.respawning = false;
								actor.args.dead = false;
								actor.noClip = false;
							}
						}

						if(frame.input && frame.input.buttons)
						{
							delete frame.input.buttons[9];
						}

						if(frame.input)
						{
							Object.assign(this.lastInput.axes, frame.input.axes || {});
							Object.assign(this.lastInput.buttons, frame.input.buttons || {});

							actor.controller.replay(this.lastInput);
							actor.readInput();

							// console.log(frameId, JSON.stringify(this.lastInput));
						}
						else
						{
							actor.controller.replay(this.lastInput);
							actor.readInput();
						}
					}
					else
					{
						// console.log(frameId, JSON.stringify(this.lastInput));
						actor.controller.replay(this.lastInput);
						actor.readInput();
					}

					this.args.hasRecording = true;

					if(this.args.replayBanners && this.args.frameId - this.args.startFrameId < 5)
					{
						this.args.topLine.args.hide = 'hide hidden';
						this.args.status.args.hide  = 'hide hidden';
						this.args.focusMe.args.hide = 'hide hidden';

						this.onTimeout(1, ()=>{
							// this.args.topLine.args.value = '    i cant believe its not canvas!    ';
							// this.args.topLine.args.hide = '';

							// this.args.status.args.value = '    click here to exit demo.    ';
							// this.args.status.args.hide = '';

						});
					}
				}
				else
				{
					this.args.topLine.args.hide = 'hide hidden';
					this.args.status.args.hide = 'hide hidden';

					this.replayFrames = new Map;
					this.replayOffset = 0;
					this.replayStart  = null
					// this.replay = null;

					this.args.isReplaying = false;
					this.args._isRecording = false;

					this.onFrameOut(30, () => this.quit(this.args.replayQuickExit ?  2 : 1));
				}
			}
			else
			{
				if(this.gamepad)
				{
					this.args.focusMe.args.hide = 'hide hidden';
				}

				this.controlActor.controller && this.takeInput(this.controlActor.controller);

				if(!this.args.cutScene)
				{
					this.controlActor.readInput();
				}
			}
		}

		if(this.controlActor && this.controlActor.args.respawning && !this.args.isReplaying)
		{
			this.replay = null;
		}

		if(!this.args.isReplaying && this.controlActor && this.controlActor.args.dead)
		{
			this.onFrameOut(30, () => {
				if(this.replayFrames.size)
				{
					this.saveReplay('#804000').catch(()=>{});
					this.replayFrames = new Map;
				}
			});
		}

		this.collisionCache = new Map;
		this.collisions = new Map;

		this.updateStarted.clear();
		this.updated.clear();
		this.updateEnded.clear();

		if(this.controlActor)
		{
			this.controlActor.setCameraMode();
		}

		const zBuf = new Map;

		const layers = [...this.args.layers, ...this.args.fgLayers];

		for(let i = layers.length; i > 0; i--)
		{
			const layer = layers[i - 1];

			layer.x = this.args.x;
			layer.y = this.args.y;

			layer.update(this.tileMap, zBuf);
		}

		for(let i = layers.length; i > 0; i--)
		{
			const layer = layers[i - 1];
			layer.move();
		}

		if(this.args.running && !this.args.debugEditMode)
		{
			const updatable = new Set;

			for(const region of this.regions)
			{
				if(!this.actorIsOnScreen(region, 768))
				{
					continue;
				}

				updatable.add(region);
			}

			for(const actor of this.auras)
			{
				if(!actor || actor.removed)
				{
					this.auras.delete(actor);
					continue;
				}

				if(actor !== this.controlActor)
				{
					updatable.add(actor);
				}

				const nearbyActors = this.nearbyActors(actor.args.x, actor.args.y);

				for(const actor of nearbyActors)
				{
					if(actor !== this.controlActor && !actor.removed)
					{
						updatable.add(actor);
					}
				}
			}

			for(const actor of updatable)
			{
				if(actor[Run] === this[Run] && !actor.removed)
				{
					this.actorUpdateStart(actor);
				}
			}

			if(this.controlActor)
			{
				if(this.controlActor[Run] === this[Run])
				{
					this.actorUpdateStart(this.controlActor);
				}
			}

			for(const actor of updatable)
			{
				if(actor[Run] === this[Run] && !actor.removed)
				{
					this.actorUpdate(actor);
				}
			}

			if(this.controlActor)
			{
				if(this.controlActor[Run] === this[Run])
				{
					this.actorUpdate(this.controlActor);
				}
			}

			for(const actor of updatable)
			{
				if(actor[Run] === this[Run] && !actor.removed)
				{
					this.actorUpdateEnd(actor);
				}
			}

			if(this.controlActor)
			{
				if(this.controlActor[Run] === this[Run])
				{
					this.actorUpdateEnd(this.controlActor);
				}
			}

			for(const actor of updatable)
			{
				if(actor.moved && !actor.removed && actor[Run] === this[Run])
				{
					this.setColCell(actor);
				}
			}

			if(this.controlActor)
			{
				if(this.controlActor[Run] === this[Run])
				{
					this.setColCell(this.controlActor);
				}
			}

			if(this.collisions)
			{
				for(const [collider, collidees] of this.collisions)
				{
					for(const [collidee, type] of collidees)
					{
						if(!collidee)
						{
							continue;
						}

						collidee.pause(false);
					}
				}
			}

			if(this.controlActor)
			{
				this.args.score.args.value = String(this.controlActor.args.score).padStart(4, ' ');
				this.args.rings.args.value = String(this.controlActor.args.rings).padStart(4, ' ');

				this.args.emblems = this.controlActor.args.emblems;

				this.args.hasRings    = !!this.controlActor.args.rings;
				this.args.hasEmeralds = !!this.controlActor.args.emeralds;
				this.args.char.args.value = this.controlActor.args.name;
				this.args.charName        = this.controlActor.args.name;

				if(this.args.debugOsd)
				{
					this.args.xPos.args.value     = Number(this.controlActor.args.x).toFixed(3);
					this.args.yPos.args.value     = Number(this.controlActor.args.y).toFixed(3);
					this.args.layer.args.value    = Number(this.controlActor.args.layer);

					this.args.ground.args.value   = this.controlActor.args.landed;
					this.args.gSpeed.args.value   = Number(this.controlActor.args.gSpeed).toFixed(3);

					this.args.xSpeed.args.value   = Number(this.controlActor.args.xSpeed).toFixed(3);
					this.args.ySpeed.args.value   = Number(this.controlActor.args.ySpeed).toFixed(3);

					this.args.angle.args.value    = (Math.round((this.controlActor.args.groundAngle) * 1000) / 1000).toFixed(3);
					this.args.airAngle.args.value = (Math.round((this.controlActor.args.airAngle) * 1000) / 1000).toFixed(3);

					this.args.actorCount.args.value = this.actors.size;
					this.args.regionCount.args.value = this.regions.size;
					this.args.ignore.args.value   = this.controlActor.args.ignore;

					const modes = ['FLOOR (0)', 'L-WALL (1)', 'CEILING (2)', 'R-WALL (3)'];

					this.args.mode.args.value = modes[Math.floor(this.controlActor.args.mode)] || Math.floor(this.controlActor.args.mode);
					this.args.cameraMode.args.value = this.controlActor.args.cameraMode;
				}
			}
		}
		else if(this.args.running && this.args.debugEditMode)
		{
			if(this.controlActor)
			{
				this.controlActor.args.x += controller.axes[0].magnitude * 4;
				this.controlActor.args.y += controller.axes[1].magnitude * 4;

				this.controlActor.args.respawning = false;
				this.controlActor.args.dead = false;
				this.controlActor.noClip = false;

				this.controlActor.args.xSpeed = 0;
				this.controlActor.args.ySpeed = 0;
				this.controlActor.args.gSpeed = 0;
			}
		}

		const width  = this.args.width;
		const height = this.args.height;
		const margin = 16;

		const camLeft   = -this.args.x + -16 + -margin;
		const camRight  = -this.args.x + width + -16 + margin;

		const camTop    = -this.args.y - margin;
		const camBottom = -this.args.y + height + margin;

		const inAuras = new WeakSet;

		if(this.controlActor)
		{
			const actorDoc = new DocumentFragment;
			const regionDoc = new DocumentFragment;

			let wakeActors = false;
			let wakeRegions = false;

			let focusedActor = this.controlActor;

			if(this.controlActor.focused)
			{
				focusedActor = this.controlActor.focused;
			}

			const nearbyActors  = this.nearbyActors(focusedActor.args.x, focusedActor.args.y) || [];
			const nearbyRegions = this.nearbyActors(focusedActor.args.x, focusedActor.args.y, true) || [];

			for(const actorList of [nearbyActors, nearbyRegions])
			{
				for(const actor of actorList)
				{
					if(actor[Run] !== this[Run])
					{
						continue;
					}

					if(!actor.args.hidden && !actor.nodes.length)
					{
						actor.render(this.tags.actors);
					}

					const margin = 0.5 * Math.max(actor.args.width, actor.args.height);

					const actorIsOnScreen = this.actorIsOnScreen(actor, margin);

					if(actorIsOnScreen && !(actor instanceof LayerSwitch))
					{
						actor.args.display = actor.defaultDisplay || null;

						if(!actor.vizi)
						{
							if(!actor.nodes.length)
							{
								if(actor.onAttach && actor.onAttach() === false)
								{
									actor.detach();
								}
							}

							if(!actor.args.hidden)
							{
								if(actor instanceof Region)
								{
									actor.nodes.map(n => actorDoc.append(n));
									wakeActors = true;
								}
								else
								{
									actor.nodes.map(n => actorDoc.append(n));
									wakeActors = true;
								}
							}

							actor.wakeUp();
						}

						this.willDetach.delete(actor);

						this.visible.add(actor);

						if(!actor.args.hidden)
						{
							actor.vizi = true;
						}
					}

					inAuras.add(actor);

					this.recent.add(actor);
				}
			}

			for(const actor of new Set([...this.recent, ...this.visible]))
			{
				if(actor.removed)
				{
					this.visible.delete(actor);
					this.recent.delete(actor);
					continue;
				}

				if(actor[Run] !== this[Run])
				{
					this.recent.delete(actor);
					continue;
				}

				const actorIsOnScreen = !actor.args.hidden && this.actorIsOnScreen(actor, 256);

				if(actor.vizi && !actorIsOnScreen)
				{
					this.willDetach.set(actor, () => {

						actor.sleep();
						actor.args.display = 'none';
						actor.detach();
						this.visible.delete(actor);
						actor.vizi = false;
						actor.willhide = null;

						this.willDetach.delete(actor);

					});

					this.recent.delete(actor);
				}
			}

			if(wakeActors)
			{
				this.tags.actors.append(actorDoc);
			}

			if(wakeRegions)
			{
				this.tags.actors.append(regionDoc);
			}
		}

		if(this.nextControl)
		{
			!this.args.networked && this.auras.clear();

			this.controlActor
				&& this.controlActor.sprite
				&& this.controlActor.sprite.parentNode
				&& this.controlActor.sprite.parentNode.classList.remove('actor-selected');

			if(this.controlActor)
			{
				this.controlActor.args.selected = false;
			}

			this.controlActor = this.nextControl;

			this.controlActor.args.selected = true;

			this.auras.add(this.controlActor);

			this.controlActor.args.display = this.controlActor.defaultDisplay || null;

			this.controlActor.nodes.map(n => this.tags.actors.append(n));

			this.visible.add(this.controlActor);
			this.controlActor.vizi = true;

			this.args.maxSpeed = null;
			this.nextControl   = null;
		}

		this.updated.forEach(actor => {
			if(actor.args.standingLayer)
			{
				const groundShift = actor.args.standingLayer.offsetXChanged;

				if(groundShift)
				{
					const spaceLeft = actor.bMap('scanForward', groundShift).get(Platformer);

					if(spaceLeft === false)
					{
						actor.args.x += groundShift || 0;
					}
					else
					{
						actor.args.x += spaceLeft * Math.sign(groundShift);
					}
				}

				actor.args.y += actor.args.standingLayer.offsetYChanged || 0;
			}
		});

		if(this.controlActor)
		{
			this.moveCamera();

			this.applyMotionBlur();

			this.args.popTopLine = this.args.popTopLine || this.getUnusedCharString({color:'yellow'});
			this.args.popBottomLine = this.args.popBottomLine || this.getUnusedCharString({color:'yellow'});

			let multiply = 0;
			let base = 0;

			let showCombo = this.controlActor.args.popChain.length > 1;

			let len = 0;

			if(this.controlActor.args.popChain.length)
			{
				if(this.controlActor.args.popChain[0].special)
				{
					showCombo = true;
				}

				len = this.controlActor.args.popChain.length;
				const cutOff = Math.max(0, len - 4);

				if(!len)
				{
					for(const item of this.args.combo)
					{
						// this.pooledCharStringDetached(item.score);
						this.pooledCharStringDetached(item.label);
					}
				}

				let pulse = false;

				for(let i = 0; i < len; i++)
				{
					const pop = this.controlActor.args.popChain[i];

					multiply += pop.multiplier;
					base += pop.points;

					const c = i + -cutOff;

					if(i >= cutOff)
					{
						this.args.combo[c] = this.args.combo[c] || {
							label:  this.getUnusedCharString()
							, score: null
							, index: i
						};

						this.args.combo[c].label = this.args.combo[c].label || this.getUnusedCharString();

						if(this.args.combo[c].index !== i)
						{
							pulse = true;
						}

						// this.args.combo[c].score.args.value = pop.points;
						this.args.combo[c].label.args.value = String(pop.label).replace(/-/g, ' ');
						this.args.combo[c].index = i;

						if(pop.color)
						{
							this.args.combo[c].label.args.color = pop.color
						}
						else if(pop.multiplier > 1)
						{
							this.args.combo[c].label.args.color = 'orange';
						}
						else
						{
							this.args.combo[c].label.args.color = 'white';
						}
					}
					else if(i < cutOff && this.args.combo[c])
					{
						// this.pooledCharStringDetached(this.args.combo[c].score);
						this.pooledCharStringDetached(this.args.combo[c].label);
					}
				}

				if(pulse)
				{
					const last = this.args.combo[ this.args.combo.length + -1 ];
					last.label.args.classes = 'pulse';
					this.onFrameOut(1, () => last.label.args.classes = '');
					// this.onFrameOut(30, () => last.label.args.classes = '');
				}

				this.args.combo.length = Math.min(4, Math.max(0, -cutOff + this.controlActor.args.popChain.length));
			}
			else
			{
				for(const item of this.args.combo)
				{
					// this.pooledCharStringDetached(item.score);
					this.pooledCharStringDetached(item.label);
				}

				this.args.combo.length = 0;
			}

			this.args.popTopLine.args.value = base + ' x ' + multiply;
			this.args.popBottomLine.args.value =  len > 4 ? '+' + (len - 4) : '';

			this.args.showCombo = showCombo;
		}

		if(this.args.networked && this.controlActor)
		{
			const netState = {frame:this.serializePlayer()};

			if(this.args.playerId === 1)
			{
				this.server.send(JSON.stringify(netState));
			}
			else if(this.args.playerId === 2)
			{
				this.client.send(JSON.stringify(netState));
			}
		}

		if(this.socket && this.args.publishTime <= 0)
		{
			this.packPlayerFrame().arrayBuffer().then(buffer => this.socket.publish(0, buffer));

			this.args.publishTime = 10;
		}
		else
		{
			this.args.publishTime--;
		}

		this.spawnActors();

		if(this.controlActor
			&& this.controlActor.isSuper
			&& !this.controlActor.isHyper
			&& this.controlActor.args.rings
			&& this.controlActor.args.minRingsHyper
			&& this.controlActor.args.rings >= this.controlActor.args.minRingsHyper
			){
				this.args.prompt.args.value = '❸ ℍ ';
			}
		else if(this.controlActor
			&& !this.controlActor.isSuper
			&& !this.controlActor.isHyper
			&& this.controlActor.args.rings
			&& this.controlActor.args.minRingsSuper
			&& this.controlActor.args.rings >= this.controlActor.args.minRingsSuper
		){
			this.args.prompt.args.value = '❸ 𝕊 ';
		}
		else
		{
			this.args.prompt.args.value = '';
		}

		if(this.args.fps < 30)
		{
			this.settings.frameSkip = 3;
		}
		else if(this.args.fps < 20)
		{
			this.settings.frameSkip = 2;
		}
		else
		{
			this.settings.frameSkip = 1;
		}

		for(const b in this.mouseState.buttons)
		{
			if(this.mouseState.buttons[b])
			{
				this.mouseState.buttons[b]++;
			}
		}
	}

	populateCharStringPool()
	{
		if(!this.charStringPool)
		{
			this.charStringPool = new Set;
			this.charStringOpen = new Set;

			for(let i = 0; i < 30; i++)
			{
				const charString = Bindable.make(new CharacterString({value:' '.repeat(10)}));

				charString.preserve = true;

				this.charStringPool.add( charString );
				this.charStringOpen.add( charString );
			}
		}
	}

	getUnusedCharString(args = {})
	{
		this.populateCharStringPool();

		for(const charString of this.charStringOpen)
		{
			this.charStringOpen.delete(charString);

			Object.assign(charString.args, args);

			if(!args.value)
			{
				charString.args.value = '';
			}

			return charString;
		}
	}

	pooledCharStringDetached(charString)
	{
		this.charStringOpen.add(charString);
	}

	resetCharStringPool()
	{
		this.populateCharStringPool();

		for(const charString of this.charStringPool)
		{
			this.charStringOpen.add(charString);
		}
	}

	click(event)
	{
		if(this.args.isReplaying)
		{
			this.controlActor && this.controlActor.controller.zero();
			this.stop();

			this.args.topLine.args.hide = 'hide hidden';
			this.args.status.args.hide = 'hide hidden';

			this.quit(this.args.replayQuickExit ?  2 : 1);
		}
	}

	regionsAtPoint(x, y, nearbyActors = null)
	{
		const regions = new Set;

		nearbyActors = nearbyActors ?? this.nearbyActors(x, y, true);

		for(const region of nearbyActors)
		{
			if(!region.isRegion)
			{
				continue;
			}

			if(region[Run] !== this[Run])
			{
				this.regions.delete(region);
				continue;
			}

			const regionArgs = region.args;

			const regionX = regionArgs.x;
			const regionY = regionArgs.y;

			const width  = regionArgs.width;
			const height = regionArgs.height;

			const offset = Math.floor(width / 2);

			const left   = regionX;
			const right  = regionX + width;

			const top    = regionY - height;
			const bottom = regionY;

			if(x >= left && right > x)
			{
				if(bottom >= y && y > top)
				{
					regions.add(region);
				}
			}
		}

		return regions;
	}

	actorsAtPoint(x, y, w = 0, h = 0, options = {ghosts: false, nearbyActors: null})
	{
		// x = Math.trunc(x);
		// y = Math.trunc(y);

		// const cacheKey = x+'::'+y+'::'+w+'::'+h;
		// const actorPointCache = this[ActorPointCache];

		// if(actorPointCache.has(cacheKey))
		// {
		// 	return Array.from(actorPointCache.get(cacheKey));
		// }

		const nearbyActors = options.nearbyActors ?? this.nearbyActors(x, y);

		if(!nearbyActors.size)
		{
			return [];
		}

		const actors = new Set;

		for(const actor of nearbyActors)
		{
			if(!options.ghosts && actor.isGhost)
			{
				continue;
			}

			const myRadius = Math.max(Math.floor(w / 2), 0);

			const isRegion = actor.isRegion;

			const myLeft   = x - myRadius;
			const myRight  = x + myRadius;

			const actorArgs = actor.args;

			const actorX = actorArgs.x;
			const width  = actorArgs.width;

			const offset = width / 2;

			const otherLeft   = actorX - (isRegion ? 0 : offset);
			const otherRight  = actorX + (isRegion ? width : offset);

			// if(myRight < otherLeft || otherRight <= myLeft)
			if(myRight < otherLeft || otherRight < myLeft)
			{
				continue;
			}

			const myTop    = y - Math.max(h, 0);
			const myBottom = y;

			const actorY = actorArgs.y;
			const height = actorArgs.height;

			const otherTop    = actorY - height;
			const otherBottom = actorY;

			if(otherBottom < myTop || myBottom < otherTop)
			{
				continue;
			}

			actors.add( actor );
		}

		const list = Array.from(actors.values());

		// if(actors.size)
		// {
		// 	actorPointCache.set(cacheKey, list);
		// }

		return list;
	}

	actorsAtLine(x1, y1, x2, y2)
	{
		const testActors = new Set;

		const cellX1 = Math.floor(x1 / this.colCellDiv);
		const cellY1 = Math.floor(y1 / this.colCellDiv);
		const cellX2 = Math.floor(x2 / this.colCellDiv);
		const cellY2 = Math.floor(y2 / this.colCellDiv);

		for(let x = 0; x < 3 + Math.abs(cellX1 + -cellX2); x++)
		for(let y = 0; y < 3 + Math.abs(cellY1 + -cellY2); y++)
		{
			const name = (x + Math.min(cellX1, cellX2) + -1) + ':' +  (y + Math.min(cellY1, cellY2) + -1);

			if(!this.colCells.has(name))
			{
				continue;
			}

			for(const actor of this.colCells.get(name))
			{
				testActors.add(actor)
			}
		}

		const actors = new Map;

		for(const actor of testActors)
		{
			if(actor.isGhost)
			{
				continue;
			}

			const intersection = this.actorIntersectsLine(actor, x1, y1, x2, y2)

			if(!intersection)
			{
				continue;
			}

			const distance = Math.hypot(x1 - intersection[0], y1 - intersection[1]);

			actors.set(actor, {intersection, distance});
		}

		return new Map(Array.from(actors.entries()).sort((a,b) => a[1].distance - b[1].distance));
	}

	lineIntersectsLine(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y)
	{
		const ax = a2x - a1x;
		const ay = a2y - a1y;

		const bx = b2x - b1x;
		const by = b2y - b1y;

		const crossProduct = ax * by - ay * bx;

		// Parallel Lines cannot intersect
		if(crossProduct === 0)
		{
			return false;
		}

		const cx = b1x - a1x;
		const cy = b1y - a1y;

		// Is our point within the bounds of line a?
		const d = (cx * ay - cy * ax) / crossProduct;
		if(d < 0 || d > 1)
		{
			return false;
		}

		// Is our point within the bounds of line b?
		const e = (cx * by - cy * bx) / crossProduct;
		if(e < 0 || e > 1)
		{
			return false;
		}

		return [a1x + e * ax, a1y + e * ay];
	}

	actorIntersectsLine(actor, b1x, b1y, b2x, b2y)
	{
		const actorArgs = actor.args;
		const width  = actorArgs.width;
		const height = actorArgs.height;
		const bottom = actorArgs.y;
		const top    = bottom - height;
		const left   = actorArgs.x - (actor.isRegion ? 0 : (width * 0.5));
		const right  = left + width;

		if(left < b1x && b1x < right && top < b1y && b1y < bottom)
		{
			return [b1x, b1y];
		}

		const points  = [];
		const bounds  = actor.getBoundingLines();

		let min = Infinity, closest;

		for(const line of bounds)
		{
			const point = this.lineIntersectsLine(line[0], line[1], line[2], line[3], b1x, b1y, b2x, b2y);

			if(!point)
			{
				continue;
			}

			const dist  = Math.hypot(b1x - point[0], b1y - point[1]);

			if(dist < min)
			{
				min = dist;
				closest = point;
			}
		}

		return closest;

		// if(!points.length)
		// {
		// 	if(left < b2x && b2x < right && top < b2y && b2y < bottom)
		// 	{
		// 		return [b2x, b2y];
		// 	}

		// 	return false;
		// }

		// const distances = points.map(point => Math.hypot(b1x - point[0], b1y - point[1]));

		// const closest = points[ distances.indexOf(Math.min(...distances)) ];

		// return closest;
	}

	padConnected(event)
	{
		this.gamepad = event.gamepad;

		console.log(this.gamepad);

		const shortName = String(this.gamepad.id)
		.replace(/\(.\)/, ' ')
		.replace(/\s?\(.+/, '');

		this.showStatus(2500, ' Gamepad connected: ' + shortName + ' ');

		this.args.focusMe.args.hide = 'hide';

		this.interact();

		if(typeof ga === 'function')
		{
			Analytic.report({
				eventCategory: 'gamepad',
				eventAction: 'connected',
				eventLabel: event.gamepad.id
			});
		}
	}

	padRemoved(event)
	{
		if(!this.gamepad)
		{
			return;
		}

		const shortName = String(this.gamepad.id)
		.replace(/\(.\)/, ' ')
		.replace(/\s?\(.+/, '');

		this.showStatus(2500, ' Gamepad disconnected: ' + shortName + ' ');

		if(this.args.started)
		{
			this.pauseGame();
		}

		if(this.gamepad.index === event.gamepad.index)
		{
			this.gamepad = null;
		}

		if(typeof ga ==='function')
		{
			Analytic.report({
				eventCategory: 'gamepad',
				eventAction: 'disconnected',
				eventLabel: event.gamepad.id
			});
		}
	}

	getColCell(point)
	{
		const colCellDiv = this.colCellDiv;
		const colCells   = this.colCells;

		const cellX = Math.floor( point.x / colCellDiv );
		const cellY = Math.floor( point.y / colCellDiv );

		const name = `${cellX}:${cellY}`;

		if(!colCells.has(name))
		{
			const cell = new Set;

			colCells.set(name, cell);

			cell.name = name;

			return cell;
		}

		return colCells.get(name);
	}

	getColCells(actor)
	{
		const colCellDiv = this.colCellDiv;

		const actorTop   = actor.args.y - actor.args.height;

		const actorWidth = actor.args.width;

		const actorLeft  = actor.args.x - (actor.isRegion ? 0 : actorWidth / 2);
		const actorRight = actor.args.x + (actor.isRegion ? actorWidth : (actorWidth / 2));

		const cellMinX = -1 + Math.floor( actorLeft  / colCellDiv );
		const cellMaxX = Math.ceil( actorRight / colCellDiv );

		const cellMinY = -1 + Math.floor( actorTop / colCellDiv );
		const cellMaxY = Math.ceil( actor.args.y  / colCellDiv );

		const cells = new Set;

		for(let x = cellMinX; x <= cellMaxX; x++)
		{
			for(let y = cellMinY; y <= cellMaxY; y++)
			{
				const cell = this.getColCell({x:x*colCellDiv,y:y*colCellDiv});

				cell.add(actor);

				cells.add( cell );
			}
		}

		return cells;
	}

	actorsInCells(cells)
	{
		const actors = new Set;

		for(const cell of cells)
		{
			for(const actor of cell)
			{
				actors.add(actor);
			}
		}

		return actors;
	}

	setColCell(actor)
	{
		if(actor.removed)
		{
			return;
		}

		if(!Bindable.isBindable(actor))
		{
			console.log(actor);
		}

		actor[ Bindable.NoGetters ] = true;

		actor = Bindable.make(actor);

		const cell = this.getColCell(actor.args);

		if(actor[ColCell] && actor[ColCell] !== cell)
		{
			actor[ColCell].delete(actor);
		}

		cell.add(actor);

		actor[ColCell] = cell;

		if(!actor.isRegion)
		{
			return cell;
		}

		const prevCells = actor[ColCells];

		actor[ColCells] = this.getColCells(actor);

		if(prevCells)
		for(const prevCell of prevCells)
		{
			if(!actor[ColCells].has(prevCell))
			{
				prevCell.delete(actor);
			}
		}

		return cell;
	}

	getNearbyColCells(actorX, actorY)
	{
		// const actorX = actor.args.x;
		// const actorY = actor.args.y;

		const colCellDiv = this.colCellDiv
		const cellX = Math.floor( actorX / colCellDiv );
		const cellY = Math.floor( actorY / colCellDiv );

		const name = `${cellX}::${cellY}`;

		let cache = this.colCellCache.get(name);

		if(cache)
		{
			return cache;//.filter(set=>set.size);
		}

		const space = colCellDiv;

		const colA = actorX - space * 2;
		const colB = actorX - space;
		const colC = actorX;
		const colD = actorX + space;
		const colE = actorX + space * 2;

		const rowA = actorY - space * 2;
		const rowB = actorY - space;
		const rowC = actorY;
		const rowD = actorY + space;
		const rowE = actorY + space * 2;

		this.colCellCache.set(name, cache = [
			// this.getColCell({x:colA, y:rowA})
			// , this.getColCell({x:colA, y:rowB})
			// , this.getColCell({x:colA, y:rowC})
			// , this.getColCell({x:colA, y:rowD})
			// , this.getColCell({x:colA, y:rowE})

			// , this.getColCell({x:colB, y:rowA})
			this.getColCell({x:colB, y:rowB})
			, this.getColCell({x:colB, y:rowC})
			, this.getColCell({x:colB, y:rowD})
			// , this.getColCell({x:colB, y:rowE})

			// , this.getColCell({x:colC, y:rowA})
			, this.getColCell({x:colC, y:rowB})
			, this.getColCell({x:colC, y:rowC})
			, this.getColCell({x:colC, y:rowD})
			// , this.getColCell({x:colC, y:rowE})

			// , this.getColCell({x:colD, y:rowA})
			, this.getColCell({x:colD, y:rowB})
			, this.getColCell({x:colD, y:rowC})
			, this.getColCell({x:colD, y:rowD})
			// , this.getColCell({x:colD, y:rowE})

			// , this.getColCell({x:colE, y:rowA})
			// , this.getColCell({x:colE, y:rowB})
			// , this.getColCell({x:colE, y:rowC})
			// , this.getColCell({x:colE, y:rowD})
			// , this.getColCell({x:colE, y:rowE})
		]);

		return cache;//.filter(set=>set.size);
	}

	screenFilter(filterName)
	{
		this.args.screenFilter = filterName;
	}

	reset()
	{
		console.clear();

		this[Run]++;

		this.stop();

		this.args.currentSheild = null;
		this.args.hasFire    = false;
		this.args.hasWater   = false;
		this.args.hasElectric = false;
		this.args.hasNormal  = false;

		this.clearDialog();
		this.hideDialog();

		this.replayFrames = new Map;
		// this.replayOffset = 0;
		// this.replay = null;

		this.visible.clear();
		this.callFrames.clear();
		this.callIntervals.clear();
		this.collisionCache.clear();
		this.collisions.clear();
		this.colCellCache.clear();
		this.colCells.clear();
		this.regions.clear();
		this.spawn.clear();
		this.auras.clear();

		this.updateStarted.clear();
		this.updateEnded.clear();
		this.updated.clear();

		this[ActorPointCache].clear();

		this.objectDb = new Classifier(Object.values(ObjectPalette));

		this.args.actClear = false;
		this.args.cutScene = false;
		this.args.fade = false;

		this.onFrameOut(30, () => this.args.fade = 'hide');

		this.args.xOffset = 0.5;
		this.args.yOffset = 0.5;

		this.args.screenEffects = new Bag;

		if(this.tileMap)
		{
			this.tileMap.unreplace();

			const layers = this.tileMap.tileLayers;

			for(const layerDef of layers)
			{
				layerDef.offsetX = 0;
				layerDef.offsetY = 0;
				layerDef.offsetXChanged = 0;
				layerDef.offsetYChanged = 0;
			}

			for(const layer of [...this.args.layers, ...this.args.fgLayers])
			{
				layer.args.destroyed = false;

				layer.args.offsetX = 0;
				layer.args.offsetY = 0;

				layer.args.offsetXChanged = 0;
				layer.args.offsetYChanged = 0;
			}
		}

		for(const actor of this.actors.items())
		{
			this.actors.remove(actor);
		}

		this.controlActor && this.actors.remove(this.controlActor);
		this.nextControl = null;

		this.actorsById = {};

		for(const [id,effect] of Object.entries(this.effects.list))
		{
			effect && this.effects.remove(effect);
		}

		for(const [id,particle] of Object.entries(this.particles.list))
		{
			particle && this.particles.remove(particle);
		}

		this.spawn.clear();
		this[ActorPointCache].clear();

		this.args.isRecording = false;
		this.args.isReplaying = false;

		this.args.populated = false;
		this.controlActor   = null;
		// this.args.frameId   = -1;

		this.tags.viewport.focus();

		this.args.paused = true;
	}

	quit(quick = false, after = false)
	{
		if(!this.replay && !this.levelFinished)
		{
			this.saveReplay('#FFF').catch(()=>{});
		}

		this.baseMap = this.currentMap = null;

		if(this.args.networked)
		{
			this.server && this.server.close();
			this.client && this.client.close();

			this.actors.remove(this.remotePlayer);
			this.actors.remove(this.controlActor);

			this.controlActor = this.remotePlayer = null;
		}

		this.args.fade = this.args.fade === true ? this.args.fade : false;

		this.onNextFrame(() => this.args.fade = true);

		this.onFrameOut(45, () => {
			this.args.actClear = false;
			this.args.cutScene = false;

			this.args.screenEffects = new Bag;

			this.callFrames.clear();
			this.callIntervals.clear();
			this.collisionCache.clear();
			this.collisions.clear();
			this.colCellCache.clear();
			this.colCells.clear();
			this.regions.clear();
			this.spawn.clear();
			this.auras.clear();


			this.replayFrames = new Map;
			this.replayOffset = 0;
			this.replayStart = null;
			this.replay = null;

			this.args.timeBonus.args.value  = 0;
			this.args.ringBonus.args.value  = 0;
			this.args.speedBonus.args.value = 0;
			this.args.totalBonus.args.value = 0;

			this.defsByMap.clear();
			this.actorsByMap.clear();

			this.meta = {};

			this.willDetach.clear();

			this.objectDb.clear();

			this.args.currentSheild = null;
			this.args.hasFire    = false;
			this.args.hasWater   = false;
			this.args.hasElectric = false;
			this.args.hasNormal  = false;

			this.args.isRecording = false;
			this.args.isReplaying = false;

			this.playableIterator = false;

			this.args.populated = false;
			this.args.paused    = false;
			this.args.started   = false;
			this.controlActor   = null;
			this.args.frameId   = -1;

			this.args.timer.args.value = '';
			this.args.rings.args.value  = 0;
			// this.emeralds.args.value = 0;
			// this.coins.args.value    = 0;

			this.args.hasRings    = false;
			this.args.hasCoins    = false;
			this.args.hasEmeralds = false;

			this.args.char.args.value = '';
			this.args.charName        = '';

			this.args.level = false;

			const layers = this.args.layers;
			const layerCount = layers.length;

			this.recent.clear();
			this.visible.clear();
			this[ActorPointCache].clear()

			for(const actor of this.actors.items())
			{
				this.actors.remove(actor);
			}

			for(const particle of this.particles.items())
			{
				this.particles.remove(particle);

				particle.remove();
			}

			for(const layer of [...this.args.layers, ...this.args.fgLayers])
			{
				layer.args.destroyed = false;
			}

			for(const layer of this.args.layers)
			{
				layer.remove();
			}

			for(const layer of this.args.fgLayers)
			{
				layer.remove();
			}

			this.args.layers.splice(0);
			this.args.fgLayers.splice(0);

			this.args.bg = this.args.backdrop = null;

			for(const [k,v] of this.backdrops)
			{
				v.view.remove();
			}

			this.backdrops.clear();

			if(after)
			{
				this.onFrameOut(15, () => after());
			}
			else
			{
				const cards = [];

				if(quick === 2 || this.args.networked)
				{
					const menu = new MainMenu({timeout: -1}, this);

					if(this.args.networked)
					{
						menu.args.initialPath = ['Multiplayer'];
					}

					cards.push(menu);
				}
				else if(quick)
				{
					Bgm.fadeOut(2000);
					cards.push(...this.homeCards());
				}
				else
				{
					Bgm.fadeOut(3000);
					cards.push(...this.returnHomeCards());
				}

				this.onFrameOut(15, () => {
					this.args.titlecard = new Series({cards}, this);
					this.args.titlecard.play();
				});
			}
		});

		Keyboard.get().reset();
		this.controller.zero();
	}

	introCards()
	{
		return [
			new LoadingCard({timeout: 3500, text: 'loading'}, this)
			, new BootCard({timeout: 3500})
			, new WarningCard({timeout: 8500})
			, new DebianCard({timeout: 4500})
			, new WebkitCard({timeout: 3500})
			, new NewgroundsCard({timeout: 2500})
			, new SaneCard({timeout: 4500})
			, new GamepadCard({timeout: 25000000})
			, new SeanCard({timeout: 5000}, this)
			, ...this.homeCards()
		]
	}

	homeCards()
	{
		return  [
			new TitleScreenCard({timeout: 51000}, this)
			, new MainMenu({timeout: -1}, this)
		];
	}

	returnHomeCards()
	{
		return  [
			new ThankYouCard({timeout: 5000}, this)
			, ...this.homeCards()
		];
	}

	playCards()
	{
		this.args.titlecard.play();
	}

	record()
	{
		this.args.demoIndicator = null;

		this.reset();

		this.args.frameId = 0;

		this.replayFrames = new Map;

		this.args.isRecording  = true;
		this.args.isReplaying  = false;
		this.args.hasRecording = true;
		this.args.paused       = false

		this.startLevel();
	}

	playback()
	{
		this.args.demoIndicator = null;

		this.args.frameId = 0;

		this.args.isReplaying = true;
		this.args.isRecording = false;

		this.lastInput = {};

		this.startLevel();

		this.args.paused = false;
	}

	stop()
	{
		if(this.args.isRecording)
		{
			const replay = JSON.stringify(this.replayFrames.entries());

			localStorage.setItem('replay', replay);
		}

		this.args.isReplaying = false;
		this.args.isRecording = false;
		this.args.paused      = false;

		this.controlActor && this.controlActor.controller.zero();

		this.tags.viewport.focus();
	}

	focus()
	{
		this.tags.viewport && this.tags.viewport.focus();
	}

	getServer(refresh = false)
	{
		if(!refresh && this.server && this.server.peerServer && this.server.peerServer.connectionState === 'new')
		{
			return this.server;
		}

		const rtcConfig = {
			iceServers: [
				{urls: this.settings.iceServer1},
				{urls: this.settings.iceServer2},
			]
		};

		const server = (refresh || !this.server)
			? (new RtcServer(rtcConfig))
			: (this.server || new RtcServer(rtcConfig));

		const onOpen = event => {
			// console.log('Connection opened!');
			this.args.chatBox  = new ChatBox({pipe: server});
			this.args.playerId = 1;
		};

		const onMessage = event => {
			// const actors = this.actors.list;

			if(this.remotePlayer)
			{
				const packet = JSON.parse(event.detail);
				const actor = this.remotePlayer;

				if(packet.frame)
				{
					if(packet.frame.frame > this.args.frameId)
					{
						this.args.frameId = packet.frame.frame;
					}

					if(packet.frame.input)
					{
						actor.controller.replay(packet.frame.input);
						actor.readInput();
					}

					if(packet.frame.args)
					{
						Object.assign(actor.args, packet.frame.args);
					}

					actor.noClip = actor.args.dead;
				}

			}
		};

		const onClose = event => {
			this.actors.remove(this.remotePlayer);
			this.quit(2)
		};

		this.listen(server, 'open',    onOpen,  {once:true});
		this.listen(server, 'close',   onClose, {once:true});
		this.listen(server, 'message', onMessage);

		this.server = server;

		return server;
	}

	getClient(refresh = false)
	{
		if(!refresh && this.client && this.client.peerClient && this.client.peerClient.connectionState === 'new')
		{
			return this.client;
		}

		const rtcConfig = {
			iceServers: [
				{urls: this.settings.iceServer1},
				{urls: this.settings.iceServer2},
			]
		};

		// const client = (!refresh && this.client) || new RtcClient(rtcConfig);
		const client = (refresh || !this.client)
			? (new RtcClient(rtcConfig))
			: (this.client || new RtcClient(rtcConfig));

		const onOpen = event => {
			// console.log('Connection opened!')
			this.args.chatBox = new ChatBox({pipe: client});
			this.args.playerId = 2;
		};

		const onMessage = event => {
			// const actors = this.actors.list;

			if(this.remotePlayer)
			{
				const packet = JSON.parse(event.detail);
				const actor = this.remotePlayer;

				if(packet.frame)
				{
					if(packet.frame.frame > this.args.frameId)
					{
						this.args.frameId = packet.frame.frame;
					}

					if(packet.frame.input)
					{
						actor.controller.replay(packet.frame.input);
						actor.readInput();
					}

					if(packet.frame.args)
					{
						Object.assign(actor.args, packet.frame.args);

					}

					actor.noClip = actor.args.dead;
				}

			}
		};

		const onClose = event => this.quit(2);

		this.listen(client, 'open',    onOpen,  {once:true});
		this.listen(client, 'close',   onClose, {once:true});
		this.listen(client, 'message', onMessage);

		this.client = client;

		return client;
	}

	serializePlayer()
	{
		if(!this.controlActor || !this.controlActor.controller)
		{
			return {};
		}

		const frame = this.args.frameId;
		const input = this.controlActor.controller.serialize();
		const actorArgs = this.controlActor.args;
		const args  = {
			x: actorArgs.x
			, y: actorArgs.y

			, gSpeed: actorArgs.gSpeed
			, xSpeed: actorArgs.xSpeed
			, ySpeed: actorArgs.ySpeed

			, direction: actorArgs.direction
			, facing: actorArgs.facing

			, falling: actorArgs.falling
			, rolling: actorArgs.rolling
			, jumping: actorArgs.jumping
			, flying:  actorArgs.flying
			, float:   actorArgs.float
			, angle:   actorArgs.angle
			, mode:    actorArgs.mode

			, rings:    actorArgs.rings

			, groundAngle: actorArgs.groundAngle
			, respawning:  actorArgs.respawning
			, dead:        actorArgs.dead ? true : false
		};

		return {frame, input, args};
	}

	packPlayerFrame()
	{
		const actorArgs = this.controlActor.args;

		const axisInts   = new Int8Array(8);
		const buttonInts = new Int8Array(16);

		const playerInts   = new Int32Array(11);
		const playerFloats = new Float32Array(7);

		const gameInts     = new Int32Array(1);

		playerInts[0] = actorArgs.direction;
		playerInts[1] = actorArgs.facing === 'left' ? -1 : 1;
		playerInts[2] = actorArgs.falling;
		playerInts[3] = actorArgs.rolling;
		playerInts[4] = actorArgs.jumping;
		playerInts[5] = actorArgs.flying;
		playerInts[6] = actorArgs.float;
		playerInts[7] = actorArgs.mode;
		playerInts[8] = actorArgs.rings;
		playerInts[9] = actorArgs.respawning;
		playerInts[10] = Number(actorArgs.dead);

		playerFloats[0] = actorArgs.x;
		playerFloats[1] = actorArgs.y;
		playerFloats[2] = actorArgs.gSpeed;
		playerFloats[3] = actorArgs.xSpeed;
		playerFloats[4] = actorArgs.ySpeed;
		playerFloats[5] = actorArgs.angle;
		playerFloats[6] = actorArgs.groundAngle;

		gameInts[0] = this.args.frameId;

		const {axes, buttons} = this.controlActor.controller.serialize();

		for(const i in axisInts)
		{
			axisInts[i] = 127 * (axes[i] ?? 0);
		}

		for(const i in buttonInts)
		{
			buttonInts[i] = 127 * (buttons[i] ?? 0);
		}

		const packed = new Blob([
			axisInts.buffer
			, buttonInts.buffer
			, playerInts.buffer
			, playerFloats.buffer
			, gameInts.buffer
		]);

		return packed;
	}

	unpackPlayerFrame(buffer)
	{
		const axisView        = new DataView(buffer, 0);
		const buttonView      = new DataView(buffer, 8);
		const playerIntView   = new DataView(buffer, 24);
		const playerFloatView = new DataView(buffer, 68);
		const gameIntView     = new DataView(buffer, 96);

		const input = {axes:{},buttons:{}};
		const args = {};

		for(let i = 0; i < 8; i++)
		{
			input.axes[i] = axisView.getInt8(i) / 127;
		}

		for(let i = 0; i < 16; i++)
		{
			input.buttons[i] = buttonView.getInt8(i) / 127;
		}

		args.direction  = playerIntView.getInt32(0, true);
		args.facing     = playerIntView.getInt32(4, true) === -1 ? 'left' : 'right';
		args.falling    = playerIntView.getInt32(8, true);
		args.rolling    = playerIntView.getInt32(12, true);
		args.jumping    = playerIntView.getInt32(16, true);
		args.flying     = playerIntView.getInt32(20, true);
		args.float      = playerIntView.getInt32(24, true);
		args.mode       = playerIntView.getInt32(28, true);
		args.rings      = playerIntView.getInt32(32, true);
		args.respawning = playerIntView.getInt32(36, true);
		args.dead       = playerIntView.getInt32(40, true);

		args.x      = playerFloatView.getFloat32(0, true);
		args.y      = playerFloatView.getFloat32(4, true);
		args.gSpeed = playerFloatView.getFloat32(8, true);
		args.xSpeed = playerFloatView.getFloat32(12, true);
		args.ySpeed = playerFloatView.getFloat32(16, true);
		args.angle  = playerFloatView.getFloat32(20, true);
		args.groundAngle = playerFloatView.getFloat32(24, true);

		const frame = gameIntView.getInt32(0, true);

		return {frame: {input, args, frame}};
	}

	onRenderedFrameOut(frames, callback)
	{
		if(frames < 0)
		{
			callback();
			return;
		}

		this.callRenderedFrames.set(callback, frames);
	}

	onFrameOut(frames, callback)
	{
		if(frames <= 0)
		{
			callback();
			return;
		}

		const callFrame = this.args.frameId + frames;

		if(!this.callFrames.has(callFrame))
		{
			this.callFrames.set(callFrame, new Set);
		}

		const callbacks = this.callFrames.get(callFrame);

		callbacks.add(callback);

		return () => callbacks.delete(callback);
	}

	onFrameInterval(interval, callback)
	{
		if(frames <= 0)
		{
			return;
		}

		const callInterval = interval;

		if(!this.callIntervals.has(callInterval))
		{
			this.callIntervals.set(callInterval, new Set);
		}

		const callbacks = this.callIntervals.get(callInterval);

		callbacks.add(callback);

		return () => callbacks.delete(callback);
	}

	callFrameOuts()
	{
		for(let i = this.args.lastFrameId; i <= this.args.frameId; i++)
		{
			if(!this.callFrames.has(i))
			{
				continue;
			}

			const callbacks = this.callFrames.get(i);

			for(const callback of callbacks)
			{
				callback();
			}

			this.callFrames.delete(i);
		}
	}

	callRenderedFrameOut()
	{
		if(this.args.frameId % this.settings.frameSkip !== 0)
		{
			return;
		}

		for(const [callback, framesLeft] of this.callRenderedFrames)
		{
			if(framesLeft <=0)
			{
				callback();
				continue;
			}

			this.callRenderedFrames.set(callback, -1 + frames);
		}
	}

	callFrameIntervals()
	{
		for(let i = this.args.lastFrameId; i <= this.args.frameId; i++)
		{
			for(const [interval, callbacks] of this.callIntervals)
			{
				if(i % interval === 0)
				{
					for(const callback of callbacks)
					{
						callback();
					}
				}
			}
		}
	}

	pauseGame()
	{
		this.focus();

		this.args.mouse = 'moved';

		this.args.paused = -1;

		this.args.pauseMenu.focusFirst();

		Bgm.pause();

		this.onTimeout(6, ()=>{
			this.controller && this.controller.zero();
		});
	}

	unpauseGame()
	{
		this.args.pauseMenu.reset();
		Bgm.unpause();

		this.args.mouse = 'hide';

		this.onTimeout(15, ()=>{
			this.controller && this.controller.zero();
		});

		this.onTimeout(30, ()=>{
			this.focus();
		});

		this.onTimeout(60, ()=>{
			this.args.paused = false;
		});

	}

	mousemove(event)
	{
		const xOrigin = event.currentTarget.offsetLeft;
		const yOrigin = event.currentTarget.offsetTop;

		const xMouse = (event.pageX + -xOrigin) / this.args.scale;
		const yMouse = (event.pageY + -yOrigin) / this.args.scale;

		this.args.xMouseOffset = xMouse;
		this.args.yMouseOffset = yMouse;

		this.args.mouse = 'moved';

		if(this.mouseMoveTimeout)
		{
			clearTimeout(this.mouseMoveTimeout);
			this.mouseMoveTimeout = null;
		}

		this.mouseMoveTimeout = this.onTimeout(800, () => {
			this.args.mouse = 'hide';
		});
	}

	mousedown(event)
	{
		this.setMouseButtons(event);
	}

	mouseup(event)
	{
		this.setMouseButtons(event);
	}

	setMouseButtons(event)
	{
		for(let i = 0; i < 8; i++)
		{
			const bit = 2 ** i;

			this.mouseState.buttons[i] = this.mouseState.buttons[i] || 0;

			if(event.buttons & bit)
			{
				this.mouseState.buttons[i]++;
			}
			else
			{
				this.mouseState.buttons[i] = 0;
			}
		}
	}

	hyphenate(string)
	{
		return String(string).replace(/\s/g, '-').toLowerCase();
	}

	storeCheckpoint(name, checkpointId)
	{
		if(!this.checkpoints[this.currentMap])
		{
			this.checkpoints[this.currentMap] = {};
		}

		const checkpointsByActor = this.checkpoints[this.currentMap];

		checkpointsByActor[name] = {checkpointId, frames: this.args.frameId - this.args.startFrameId};

		localStorage.setItem(
			`checkpoints:::${this.currentMap}`
			, JSON.stringify(this.checkpoints[this.currentMap])
		);
	}

	getCheckpoint(name)
	{
		if(!this.checkpoints[this.currentMap])
		{
			const checkpointSource = localStorage.getItem(`checkpoints:::${this.currentMap}`) || '{}';
			this.checkpoints[this.currentMap] = JSON.parse(checkpointSource) || {};
		}

		const checkpointsByActor = this.checkpoints[this.currentMap];
		const currentCheckpoint  = checkpointsByActor[name];

		return currentCheckpoint;
	}

	setCheckpoint(mapUrl, storedCheckpoint)
	{
		const checkpointSource = localStorage.setItem(
			`checkpoints:::${mapUrl}`
			, JSON.stringify(storedCheckpoint)
		);
	}

	clearCheckpoints(name = null)
	{
		if(!this.controlActor)
		{
			return;
		}

		if(name === null)
		{
			name = this.controlActor.args.canonical;
		}

		if(!this.checkpoints[this.currentMap])
		{
			this.checkpoints[this.currentMap] = {};
		}

		const checkpointsByActor = this.checkpoints[this.currentMap];

		delete checkpointsByActor[name];

		localStorage.setItem(
			`checkpoints:::${this.currentMap}`
			, JSON.stringify(this.checkpoints[this.currentMap])
		);
	}

	showCenterMessage(message, color)
	{
		this.args.centerMessage = new CharacterString({value: message, color});
	}

	hideCenterMessage()
	{
		this.args.centerMessage = false;
	}

	showDialog(lines = [], classes = '')
	{
		this.args.dialog = true;

		this.clearDialog();

		lines = lines.map(t => new CharacterString({value: t}));

		let offset = 0;

		for(const line of lines)
		{
			line.offset = offset;

			offset += line.args.value.length;
		}

		this.args.dialogLines = lines;

		this.args.dialogClasses = classes;
	}

	hideDialog(message)
	{
		this.clearDialog();
		this.args.dialog = false;
	}

	clearDialog()
	{
		this.args.dialogLines = [];
	}

	clearAct(message, showZonecard = true)
	{
		const zoneState = this.getZoneState();

		if(this.controlActor && this.controlActor.args.canonical)
		{
			const charState = this.getCharacterState(this.controlActor.args.canonical);

			if(charState)
			{
				if(!(this.currentMap in charState.cleared))
				{
					charState.cleared[this.currentMap] = {
						firstCleared: Date.now()
					};
				}

				charState.cleared[this.currentMap].clearCount = charState.cleared[this.currentMap].clearCount || 0;

				charState.cleared[this.currentMap].lastCleared = Date.now();
				charState.cleared[this.currentMap].clearCount++;
			}
		}

		this.args.actClearLabel.args.value = message;

		const rings  = this.controlActor.args.rings;
		const frames = this.args.frameId - this.args.startFrameId
		const time   = frames / 60;
		const air    = this.controlActor.args.airTimeTotal / (this.controlActor.args.airTimeTotal + this.controlActor.args.groundTimeTotal);

		const speedBonus = Math.trunc(this.controlActor.args.clearSpeed * 10);
		const ringBonus  = rings * 100;
		const airBonus   = (Math.round(10000 * (air||0)));
		let   timeBonus  = 0;

		const seconds = Math.trunc(Math.abs(time));

		if(seconds < 30)
		{
			timeBonus = 50000;
		}
		else if(seconds < 45)
		{
			timeBonus = 10000;
		}
		else if(seconds < 60)
		{
			timeBonus = 5000;
		}
		else if(seconds < 90)
		{
			timeBonus = 4000;
		}
		else if(seconds < 120)
		{
			timeBonus = 3000;
		}
		else if(seconds < 180)
		{
			timeBonus = 2000;
		}
		else if(seconds < 240)
		{
			timeBonus = 1000;
		}
		else
		{
			timeBonus = 500;
		}

		const totalBonus = timeBonus + ringBonus + speedBonus + airBonus;

		const score = totalBonus;

		this.args.actClear = true;
		this.args.skidBonusValue = this.controlActor.args.dragBonus || 0;

		// this.args.timeBonus.args.value  = 0;
		// this.args.ringBonus.args.value  = 0;
		// this.args.airBonus.args.value   = 0;
		// this.args.speedBonus.args.value = 0;
		// this.args.skidBonus.args.value  = 0;
		// this.args.totalBonus.args.value = 0;

		const skidBonus = this.controlActor.args.dragBonus || 0;

		// this.onFrameOut(45 * 1, () => this.args.timeBonus.args.value  = timeBonus);
		// this.onFrameOut(45 * 2, () => this.args.ringBonus.args.value  = ringBonus);
		// this.onFrameOut(45 * 3, () => this.args.speedBonus.args.value = speedBonus);
		// this.onFrameOut(45 * 4, () => this.args.skidBonus.args.value  = skidBonus);
		// this.onFrameOut(45 * 5, () => this.args.airBonus.args.value   = airBonus);
		// this.onFrameOut(45 * 6, () => this.args.totalBonus.args.value = totalBonus);
		// this.onFrameOut(45 * 7, () => this.args.actClear = false);

		// tallyBoard.addCounter({label:'Skid Bonus:',  value: skidBonus||30000});

		const tallyBoard = new TallyBoard;

		tallyBoard.addCounter({label:'Time Bonus:',  value: timeBonus});
		tallyBoard.addCounter({label:'Ring Bonus:',  value: ringBonus});

		if(speedBonus)
		{
			tallyBoard.addCounter({label:'Speed Bonus:', value: speedBonus});
		}

		tallyBoard.addCounter({label:'Air Bonus:',   value: airBonus});

		Bgm.play('ACT_CLEAR', {interlude:true});

		tallyBoard.update(this);

		// tallyBoard.addEventListener('almostdone', console.log);
		// tallyBoard.addEventListener('totalingstarted', console.log);

		if(showZonecard)
		{
			tallyBoard.addEventListener('totalingdone', event => this.setZoneCard(true));
		}

		tallyBoard.addEventListener('done', event => {
			this.controlActor.args.clearSpeed = 0;
			this.args.tallyBoard = null;
			this.tallyBoard = false;
			this.args.actStartFrameId = this.args.frameId;
			this.args.actClear = false;
			this.args.inventory.splice(0);
			Bgm.stop('ACT_CLEAR');

			if(showZonecard)
			{
				this.args.zonecard.replay();
			}
		});

		this.tallyBoard = tallyBoard;

		this.args.tallyBoard = tallyBoard.view();

		if(!zoneState.time || zoneState.time > frames)
		{
			zoneState.time = frames;
		}

		if(!zoneState.rings || zoneState.rings < rings)
		{
			zoneState.rings = rings;
		}

		if(!zoneState.air || zoneState.air < air)
		{
			zoneState.air = air;
		}

		if(!zoneState.score || zoneState.score < score)
		{
			zoneState.score = score;
		}

		this.currentSave.save();

		return tallyBoard;
	}

	cpuDetect()
	{
		try{
			Analytic.report({
				eventCategory: 'cpu',
				eventAction:   'cores',
				eventLabel:    `core check`,
				eventValue:    navigator.hardwareConcurrency
			});
		}
		catch (error) {
			Analytic.report({
				eventCategory: 'cpu',
				eventAction:   'cpu detect fail',
				eventLabel:    `Cpu Detect Failure: ${error}`
			});
		}
	}

	gpuDetect()
	{
		try{
			this.gpuDetector = this.gpuDetector || document.createElement('canvas').getContext('webgl');

			const debug  = this.gpuDetector.getExtension('WEBGL_debug_renderer_info');
			const vendor = this.gpuDetector.getParameter(debug.UNMASKED_VENDOR_WEBGL);
			const gpu    = this.gpuDetector.getParameter(debug.UNMASKED_RENDERER_WEBGL);

			Analytic.report({
				eventCategory: 'gpu',
				eventAction:   'gpu detect',
				eventLabel:    `${vendor} :: ${gpu}`
			});
		}
		catch (error) {
			Analytic.report({
				eventCategory: 'gpu',
				eventAction:   'gpu detect fail',
				eventLabel:    `Gpu Detect Failure: ${error}`
			});
		}
	}

	buildDetect()
	{
		const buildTag = document.head.querySelector('meta[name="x-build-time"]');

		const build = buildTag.getAttribute('content');

		Analytic.report({
			eventCategory: 'build',
			eventAction:   'build check',
			eventLabel:    build
		});
	}

	interact()
	{
		this.args.interacted = true;
	}

	matrixConnect(refresh = false)
	{
		if(!this.settings.matrixUrl)
		{
			console.error('No matrixUrl defined!!!');
		}

		const redirectUrl = location.origin + '/accept-sso';

		if(!refresh && this.matrix)
		{
			if(!this.matrix.isLoggedIn)
			{
				return this.matrix.logIn(redirectUrl).then(() => this.matrix);
			}

			return Promise.resolve(this.matrix);
		}

		return this.matrix.logIn(redirectUrl).then(() => this.matrix);
	}

	subspaceConnect()
	{
		this.socket = Socket.get('ws://localhost:9998');
		this.socket.subscribe('open',  () => {
			console.log('socket ready!');

			fetch('http://localhost:2020/auth?api')
			.then(r => r.text())
			.then(token => {
				console.log(token)
				this.socket.send(`auth ${token}`);

				const channel = 'testing';
				const message = 'This is the payload.';

				this.socket.subscribe('message', (event, message, channel, origin, originId, originalChannel) => {
					if(origin === 'user')
					{
						return;
					}

					console.log(event.data);

					if(event.data[0] !== '{')
					{
						return;
					}

					const packet = JSON.parse(event.data);

					if('youruid' in packet)
					{
						this.netId = packet.youruid;
					}
				});

				this.socket.send('uid');

				this.socket.subscribe('message:0', (event, message, channel, origin, originId, originalChannel) => {

					this.bytesReceived += message.length || message.byteLength;

					if(origin !== 'user')
					{
						console.log(message);
						return;
					}

					if(!this.controlActor || originId === this.netId)
					{
						return;
					}

					const packet = this.unpackPlayerFrame(message);

					if(!this.netPlayers.has(originId))
					{
						const netPlayer = new Sonic({name:'Player ' + originId, id: String(new Uuid), netplayer: true}, this);
						this.netPlayers.set(originId, netPlayer);
						this.spawn.add({object: netPlayer});
						this.actors.add(netPlayer);
						this.auras.add(netPlayer);
					}

					const netPlayer = this.netPlayers.get(originId);

					if(packet.frame)
					{
						if(packet.frame.frame > this.args.frameId)
						{
							this.args.frameId = packet.frame.frame;
						}

						if(packet.frame.input)
						{
							netPlayer.controller.replay(packet.frame.input);
							netPlayer.readInput();
						}

						if(packet.frame.args)
						{
							Object.assign(netPlayer.args, packet.frame.args);
						}

						netPlayer.noClip = netPlayer.args.dead;
					}

					// console.log('message received!', {event, message, channel, origin, originId, originalChannel});
				});

				this.socket.publish(channel, message);
			});
		});

		this.socket.subscribe('close', () => {
			console.log('socket closed!');
			this.quit(2);
		});
	}

	nowPlayingClicked(event)
	{
		if(!this.args.audioComment)
		{
			return;
		}

		console.log(this.args.audioComment);

		if(this.args.audioComment.substr(0,8) !== 'https://')
		{
			return;
		}

		this.pauseGame();

		window.open(this.args.audioComment, 'audio-credit');
	}

	handleUncaughtException(event)
	{
		console.error(event.error);

		Analytic.report({
			eventCategory: 'error',
			eventAction: `${event.error.message} @ ${event.filename}:${event.lineno}:${event.colno}`,
			eventLabel: event.error.stack
		});

		TraceDatabase.open('traces', 1).then(database => {
			const trace = Trace.from(event.error);
			delete trace.id;
			console.log(JSON.stringify(trace));

			trace.consume(event);

			console.log(JSON.stringify(trace));
			console.log(trace, event);

			if(!this.currentMap)
			{
				return;
			}

			database.insert('traces', trace).then(() => {
				if(this.replay)
				{
					trace.replay = this.replay.uuid;
					database.update('traces', trace);
					return;
				}

				this.saveReplay('#FF0000').then(replay => {
					trace.replay = replay.uuid;
					database.update('traces', trace);
				}).catch(()=>{});
			});
		});
	}

	get mouse() {
		this.mouseState.position[0] = this.args.xMouseOffset + -this.args.x;
		this.mouseState.position[1] = this.args.yMouseOffset + -this.args.y;

		return this.mouseState;
	}
}

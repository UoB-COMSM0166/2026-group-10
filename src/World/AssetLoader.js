export default class AssetLoader {
	constructor(p5) {
		this.p5 = p5;
		this.assets = {};
	}

	preload() {
		const p = this.p5;
		this.assets.winPopUp = p.loadImage('assets/WinNotification.png');
		this.assets.heroDied = p.loadImage('assets/HeroDied.png');
		this.assets.objectiveLost = p.loadImage('assets/ObjectiveLost.png');
		this.assets.heroReswawn = p.loadImage('assets/HeroRespawned.png');
		this.assets.gamePaused = p.loadImage('assets/GamePaused.png');
		this.assets.customCursor = p.loadImage('assets/Cursor_Normal.png');
		this.assets.coolDown = p.loadImage('assets/CoolDown.png');
		this.assets.actionFrame = p.loadImage('assets/ActionFrame.png');
		this.assets.settingIcon = p.loadImage('assets/settings_icon.png');
		this.assets.heroIdle = {
			image: p.loadImage('assets/human_idle.png'),
			frames: 8
		};
		this.assets.heroRun = {
			image: p.loadImage('assets/human_run.png'),
			frames: 8
		};
		this.assets.heroAttack = {
			image: p.loadImage('assets/human_attack.png'),
			frames: 10
		};
		this.assets.fireballSprite = {
			image: p.loadImage('assets/fireball.png'),
			frames: 9
		};
	}

	getAsset(name) {
		return this.assets[name] || null;
	}
}
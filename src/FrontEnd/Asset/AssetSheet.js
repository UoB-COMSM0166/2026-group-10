export function getSoundResource() {
    return {
        normal: 'src/FrontEnd/Asset/Sound/Normal.mid',
        boss: 'src/FrontEnd/Asset/Sound/Boss.mid',
        death: 'src/FrontEnd/Asset/Sound/Death.mid',
        dead: 'src/FrontEnd/Asset/Sound/Dead.mid',
        lose: 'src/FrontEnd/Asset/Sound/Lose.mid',
        win: 'src/FrontEnd/Asset/Sound/Win.mid',
    }
}

export function loadSpriteImage(hero, enemies, map) {
    const enemySprites = {};
    for (const enemy of enemies) {
        enemySprites[enemy] = `src/FrontEnd/Asset/Image/${map}/${enemy}_Layout.png`
    }

    const enemySkillEntity = {};
    if (map === 'Forest') {
        enemySkillEntity['diecry_poison'] = `src/FrontEnd/Asset/Image/${map}/Poison.png`;
        enemySkillEntity['diecry_explosion'] = `src/FrontEnd/Asset/Image/${map}/Explosion.png`;
    }


    const skillEntity = {};

    switch (hero) {
        case 'Architect':
            skillEntity.arrow_tower = `src/FrontEnd/Asset/Image/Architect/ArrowTower.png`;
            skillEntity.rock_tower = `src/FrontEnd/Asset/Image/Architect/RockTower.png`;
            skillEntity.flame_tower = `src/FrontEnd/Asset/Image/Architect/FlameTower.png`;
            skillEntity.frost_tower = `src/FrontEnd/Asset/Image/Architect/FrostTower.png`;
            skillEntity.flying_arrow = `src/FrontEnd/Asset/Image/Architect/Arrow_Layout.png`;
            skillEntity.rolling_rock = `src/FrontEnd/Asset/Image/Architect/Rock_Layout.png`;
            break;
        case 'Archmage':
            skillEntity.fire_ball = `src/FrontEnd/Asset/Image/Archmage/FireBall_Layout.png`;
            skillEntity.flame_wave = `src/FrontEnd/Asset/Image/Archmage/FlameWave_Layout.png`;
            skillEntity.viper_guardian = `src/FrontEnd/Asset/Image/Archmage/Guardian_Layout.png`;
            skillEntity.pure_lightning = `src/FrontEnd/Asset/Image/Archmage/Lightning_Layout.png`;
            skillEntity.thunder_cloud = `src/FrontEnd/Asset/Image/Archmage/Lightning_Layout.png`;
            skillEntity.meteorite = `src/FrontEnd/Asset/Image/Archmage/Meteorite_Layout.png`;
            skillEntity.storm_blast = `src/FrontEnd/Asset/Image/Archmage/StormBlast_Layout.png`;
            skillEntity.ice_pick = `src/FrontEnd/Asset/Image/Archmage/IcePick_Layout.png`;
            skillEntity.ball_lightning = `src/FrontEnd/Asset/Image/Archmage/BallLightning_Layout.png`;
            break;
        case 'Warrior':
            skillEntity.fore_sight_aura = `src/FrontEnd/Asset/Image/Warrior/Blade.png`;
            skillEntity.blade_spin = `src/FrontEnd/Asset/Image/Warrior/Spin.png`;
            skillEntity.sword_energy = `src/FrontEnd/Asset/Image/Warrior/SwordEnergy_Layout.png`;
    }

    return {
        hero: loadImageAsset(`src/FrontEnd/Asset/Image/${hero}/Walk_Layout.png`),
        death: loadImageAsset(`src/FrontEnd/Asset/Image/${hero}/Death_Layout.png`),
        background: loadImageAsset(`src/FrontEnd/Asset/Image/${map}/background.png`),
        objective: loadImageAsset(`src/FrontEnd/Asset/Image/${map}/Sprite_Tree.png`),
        enemies: loadImageAssets(enemySprites),
        enemySkillEntity: loadImageAssets(enemySkillEntity),
        skillEntity: loadImageAssets(skillEntity),
        casting: loadImageAsset(`src/FrontEnd/Asset/Image/${map}/Casting.png`),
    }
}

export function loadUIImage(hero, map) {
    // To UI
    let skillIcon;

    if (hero === 'Architect') {
        skillIcon = {
            skill_A_1: `src/FrontEnd/Asset/Image/${hero}/Skill_A_1.png`,
            skill_Q_1: `src/FrontEnd/Asset/Image/${hero}/Skill_Q_1.png`,
            skill_W_1: `src/FrontEnd/Asset/Image/${hero}/Skill_W_1.png`,
            skill_E_1: `src/FrontEnd/Asset/Image/${hero}/Skill_E_1.png`,
            skill_R_1: `src/FrontEnd/Asset/Image/${hero}/Skill_R_1.png`,
            skill_P_1: `src/FrontEnd/Asset/Image/${hero}/Skill_P_1.png`,
        }
    } else {
        skillIcon = {
            skill_A_1: `src/FrontEnd/Asset/Image/${hero}/Skill_A_1.png`,
            skill_A_2: `src/FrontEnd/Asset/Image/${hero}/Skill_A_2.png`,
            skill_A_3: `src/FrontEnd/Asset/Image/${hero}/Skill_A_3.png`,
            skill_Q_1: `src/FrontEnd/Asset/Image/${hero}/Skill_Q_1.png`,
            skill_Q_2: `src/FrontEnd/Asset/Image/${hero}/Skill_Q_2.png`,
            skill_Q_3: `src/FrontEnd/Asset/Image/${hero}/Skill_Q_3.png`,
            skill_W_1: `src/FrontEnd/Asset/Image/${hero}/Skill_W_1.png`,
            skill_W_2: `src/FrontEnd/Asset/Image/${hero}/Skill_W_2.png`,
            skill_W_3: `src/FrontEnd/Asset/Image/${hero}/Skill_W_3.png`,
            skill_E_1: `src/FrontEnd/Asset/Image/${hero}/Skill_E_1.png`,
            skill_E_2: `src/FrontEnd/Asset/Image/${hero}/Skill_E_2.png`,
            skill_E_3: `src/FrontEnd/Asset/Image/${hero}/Skill_E_3.png`,
            skill_R_1: `src/FrontEnd/Asset/Image/${hero}/Skill_R_1.png`,
            skill_R_2: `src/FrontEnd/Asset/Image/${hero}/Skill_R_2.png`,
            skill_R_3: `src/FrontEnd/Asset/Image/${hero}/Skill_R_3.png`,
            skill_P_1: `src/FrontEnd/Asset/Image/${hero}/Skill_P_1.png`,
            skill_P_2: `src/FrontEnd/Asset/Image/${hero}/Skill_P_2.png`,
            skill_P_3: `src/FrontEnd/Asset/Image/${hero}/Skill_P_3.png`,
        };
    }

    const skillEntity = {};
    switch (hero) {
        case 'Architect':
            skillEntity['arrow_tower'] = `src/FrontEnd/Asset/Image/${hero}/ArrowTower.png`;
            skillEntity['rock_tower'] = `src/FrontEnd/Asset/Image/${hero}/RockTower.png`;
            skillEntity['flame_tower'] = `src/FrontEnd/Asset/Image/${hero}/FlameTower.png`;
            skillEntity['frost_tower'] = `src/FrontEnd/Asset/Image/${hero}/FrostTower.png`;
            skillEntity['flying_arrow'] = `src/FrontEnd/Asset/Image/${hero}/Arrow_Layout.png`;
            skillEntity['rolling_rock'] = `src/FrontEnd/Asset/Image/${hero}/Rock_Layout.png`;
            break;
        case 'Archmage':
            skillEntity.fire_ball = `src/FrontEnd/Asset/Image/Archmage/FireBall_Layout.png`;
            skillEntity.flame_wave = `src/FrontEnd/Asset/Image/Archmage/FlameWave_Layout.png`;
            skillEntity.viper_guardian = `src/FrontEnd/Asset/Image/Archmage/Guardian_Layout.png`;
            skillEntity.lightning = `src/FrontEnd/Asset/Image/Archmage/Lightning_Layout.png`;
            skillEntity.thunder_cloud = `src/FrontEnd/Asset/Image/Archmage/Lightning_Layout.png`;
            skillEntity.meteorite = `src/FrontEnd/Asset/Image/Archmage/Meteorite_Layout.png`;
            skillEntity.storm_blast = `src/FrontEnd/Asset/Image/Archmage/StormBlast_Layout.png`;
            skillEntity.ice_pick = `src/FrontEnd/Asset/Image/Archmage/IcePick_Layout.png`;
            skillEntity.ball_lightning = `src/FrontEnd/Asset/Image/Archmage/BallLightning_Layout.png`;
            break;
        case 'Warrior':
            skillEntity.fore_sight_aura = `src/FrontEnd/Asset/Image/Warrior/Blade.png`;
            skillEntity.blade_spin = `src/FrontEnd/Asset/Image/Warrior/Spin.png`;
            skillEntity.sword_energy = `src/FrontEnd/Asset/Image/Warrior/SwordEnergy_Layout.png`;
            break;
    }

    // To UI
    const profile = {
        alive: `src/FrontEnd/Asset/Image/${hero}/Profile.png`,
        dead: `src/FrontEnd/Asset/Image/${hero}/Profile_Dead.png`,
        book_background: `src/FrontEnd/Asset/Image/${hero}/Book_Background.png`,
        objectiveProfile: `src/FrontEnd/Asset/Image/${map}/Profile_Tree.png`,
        skill_book: `src/FrontEnd/Asset/Image/${hero}/Skill_SkillBook.png`,
        win: `src/FrontEnd/Asset/Image/General/Win.png`,
        lose: `src/FrontEnd/Asset/Image/General/Lose.png`,
    }

    const general = {
        objectiveProfile: 'src/FrontEnd/Asset/Image/General/Profile_Tree.png',
        upgrade: 'src/FrontEnd/Asset/Image/General/Button_Upgrade.png',
        statSpeed: 'src/FrontEnd/Asset/Image/General/Stats_Speed.png',
        statArmor: 'src/FrontEnd/Asset/Image/General/Stats_Armor.png',
        statStrength: 'src/FrontEnd/Asset/Image/General/Stats_Strength.png',
        statIntelligence: 'src/FrontEnd/Asset/Image/General/Stats_Intelligence.png',
        statSlot: 'src/FrontEnd/Asset/Image/General/Stats_Slot.png',
        statGold: 'src/FrontEnd/Asset/Image/General/Stats_Gold.png',
    }

    return {
        profile: loadImageAssets(profile),
        skillIcon: loadImageAssets(skillIcon),
        general: loadImageAssets(general),
        skillEntity: loadImageAssets(skillEntity),
    }
}

function loadImageAssets(assetMap) {
    const assets = {};

    for (const [key, path] of Object.entries(assetMap ?? {})) {
        assets[key] = loadImageAsset(path);
    }

    return assets;
}

function loadImageAsset(path) {
    if (typeof window === 'undefined' || typeof window.Image !== 'function') {
        return null;
    }

    const image = new window.Image();
    image.src = path;
    return image;
}

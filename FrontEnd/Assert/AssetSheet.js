export function getSoundResource() {
    return {
        normal: 'FrontEnd/Assert/Sound/Normal.mid',
        boss: 'FrontEnd/Assert/Sound/Boss.mid',
        death: 'FrontEnd/Assert/Sound/Death.mid',
        dead: 'FrontEnd/Assert/Sound/Dead.mid',
        lose: 'FrontEnd/Assert/Sound/Lose.mid',
        win: 'FrontEnd/Assert/Sound/Win.mid',
    }
}

export function loadSpriteImage(hero, enemies, map) {
    const enemySprites = {};
    for (const enemy of enemies) {
        enemySprites[enemy] = `FrontEnd/Assert/Image/${map}/${enemy}_Layout.png`
    }

    const load = loadImageAssets(enemySprites);

    return {
        hero: loadImageAsset(`FrontEnd/Assert/Image/${hero}/Walk_Layout.png`),
        death: loadImageAsset(`FrontEnd/Assert/Image/${hero}/Death_Layout.png`),
        background: loadImageAsset(`FrontEnd/Assert/Image/${map}/background.png`),
        objective: loadImageAsset(`FrontEnd/Assert/Image/${map}/Sprite_Tree.png`),
        enemies: load,
        casting: loadImageAsset(`FrontEnd/Assert/Image/${map}/Casting.png`),
    }
}

export function loadUIImage(hero, map) {
    // To UI
    let skillIcon;

    if (hero === 'Architect') {
        skillIcon = {
            skill_A_1: `FrontEnd/Assert/Image/${hero}/Skill_A_1.png`,
            skill_Q_1: `FrontEnd/Assert/Image/${hero}/Skill_Q_1.png`,
            skill_W_1: `FrontEnd/Assert/Image/${hero}/Skill_W_1.png`,
            skill_E_1: `FrontEnd/Assert/Image/${hero}/Skill_E_1.png`,
            skill_R_1: `FrontEnd/Assert/Image/${hero}/Skill_R_1.png`,
            skill_P_1: `FrontEnd/Assert/Image/${hero}/Skill_P_1.png`,
        }
    } else {
        skillIcon = {
            skill_A_1: `FrontEnd/Assert/Image/${hero}/Skill_A_1.png`,
            skill_A_2: `FrontEnd/Assert/Image/${hero}/Skill_A_2.png`,
            skill_A_3: `FrontEnd/Assert/Image/${hero}/Skill_A_3.png`,
            skill_Q_1: `FrontEnd/Assert/Image/${hero}/Skill_Q_1.png`,
            skill_Q_2: `FrontEnd/Assert/Image/${hero}/Skill_Q_2.png`,
            skill_Q_3: `FrontEnd/Assert/Image/${hero}/Skill_Q_3.png`,
            skill_W_1: `FrontEnd/Assert/Image/${hero}/Skill_W_1.png`,
            skill_W_2: `FrontEnd/Assert/Image/${hero}/Skill_W_2.png`,
            skill_W_3: `FrontEnd/Assert/Image/${hero}/Skill_W_3.png`,
            skill_E_1: `FrontEnd/Assert/Image/${hero}/Skill_E_1.png`,
            skill_E_2: `FrontEnd/Assert/Image/${hero}/Skill_E_2.png`,
            skill_E_3: `FrontEnd/Assert/Image/${hero}/Skill_E_3.png`,
            skill_R_1: `FrontEnd/Assert/Image/${hero}/Skill_R_1.png`,
            skill_R_2: `FrontEnd/Assert/Image/${hero}/Skill_R_2.png`,
            skill_R_3: `FrontEnd/Assert/Image/${hero}/Skill_R_3.png`,
            skill_P_1: `FrontEnd/Assert/Image/${hero}/Skill_P_1.png`,
            skill_P_2: `FrontEnd/Assert/Image/${hero}/Skill_P_2.png`,
            skill_P_3: `FrontEnd/Assert/Image/${hero}/Skill_P_3.png`,
        };
    }

    // To UI
    const profile = {
        alive: `FrontEnd/Assert/Image/${hero}/Profile.png`,
        dead: `FrontEnd/Assert/Image/${hero}/Profile_Dead.png`,
        book_background: `FrontEnd/Assert/Image/${hero}/Book_Background.png`,
        objectiveProfile: `FrontEnd/Assert/Image/${map}/Profile_Tree.png`,
        skill_book: `FrontEnd/Assert/Image/${hero}/Skill_SkillBook.png`,
    }

    const general = {
        objectiveProfile: 'FrontEnd/Assert/Image/General/Profile_Tree.png',
        upgrade: 'FrontEnd/Assert/Image/General/Button_Upgrade.png',
        statSpeed: 'FrontEnd/Assert/Image/General/Stats_Speed.png',
        statArmor: 'FrontEnd/Assert/Image/General/Stats_Armor.png',
        statStrength: 'FrontEnd/Assert/Image/General/Stats_Strength.png',
        statIntelligence: 'FrontEnd/Assert/Image/General/Stats_Intelligence.png',
        statSlot: 'FrontEnd/Assert/Image/General/Stats_Slot.png',
        statGold: 'FrontEnd/Assert/Image/General/Stats_Gold.png',
    }

    return {
        profile: loadImageAssets(profile),
        skillIcon: loadImageAssets(skillIcon),
        general: loadImageAssets(general),
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
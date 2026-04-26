export function getSoundResource() {
    return {
        normal: 'src/FrontEnd/Assert/Sound/Normal.mid',
        boss: 'src/FrontEnd/Assert/Sound/Boss.mid',
        death: 'src/FrontEnd/Assert/Sound/Death.mid',
        dead: 'src/FrontEnd/Assert/Sound/Dead.mid',
        lose: 'src/FrontEnd/Assert/Sound/Lose.mid',
        win: 'src/FrontEnd/Assert/Sound/Win.mid',
    }
}

export function loadSpriteImage(hero, enemies, map) {
    const enemySprites = {};
    for (const enemy of enemies) {
        enemySprites[enemy] = `src/FrontEnd/Assert/Image/${map}/${enemy}_Layout.png`
    }

    const load = loadImageAssets(enemySprites);

    return {
        hero: loadImageAsset(`src/FrontEnd/Assert/Image/${hero}/Walk_Layout.png`),
        death: loadImageAsset(`src/FrontEnd/Assert/Image/${hero}/Death_Layout.png`),
        background: loadImageAsset(`src/FrontEnd/Assert/Image/${map}/background.png`),
        objective: loadImageAsset(`src/FrontEnd/Assert/Image/${map}/Sprite_Tree.png`),
        enemies: load,
        casting: loadImageAsset(`src/FrontEnd/Assert/Image/${map}/Casting.png`),
    }
}

export function loadUIImage(hero, map) {
    // To UI
    let skillIcon;

    if (hero === 'Architect') {
        skillIcon = {
            skill_A_1: `src/FrontEnd/Assert/Image/${hero}/Skill_A_1.png`,
            skill_Q_1: `src/FrontEnd/Assert/Image/${hero}/Skill_Q_1.png`,
            skill_W_1: `src/FrontEnd/Assert/Image/${hero}/Skill_W_1.png`,
            skill_E_1: `src/FrontEnd/Assert/Image/${hero}/Skill_E_1.png`,
            skill_R_1: `src/FrontEnd/Assert/Image/${hero}/Skill_R_1.png`,
            skill_P_1: `src/FrontEnd/Assert/Image/${hero}/Skill_P_1.png`,
        }
    } else {
        skillIcon = {
            skill_A_1: `src/FrontEnd/Assert/Image/${hero}/Skill_A_1.png`,
            skill_A_2: `src/FrontEnd/Assert/Image/${hero}/Skill_A_2.png`,
            skill_A_3: `src/FrontEnd/Assert/Image/${hero}/Skill_A_3.png`,
            skill_Q_1: `src/FrontEnd/Assert/Image/${hero}/Skill_Q_1.png`,
            skill_Q_2: `src/FrontEnd/Assert/Image/${hero}/Skill_Q_2.png`,
            skill_Q_3: `src/FrontEnd/Assert/Image/${hero}/Skill_Q_3.png`,
            skill_W_1: `src/FrontEnd/Assert/Image/${hero}/Skill_W_1.png`,
            skill_W_2: `src/FrontEnd/Assert/Image/${hero}/Skill_W_2.png`,
            skill_W_3: `src/FrontEnd/Assert/Image/${hero}/Skill_W_3.png`,
            skill_E_1: `src/FrontEnd/Assert/Image/${hero}/Skill_E_1.png`,
            skill_E_2: `src/FrontEnd/Assert/Image/${hero}/Skill_E_2.png`,
            skill_E_3: `src/FrontEnd/Assert/Image/${hero}/Skill_E_3.png`,
            skill_R_1: `src/FrontEnd/Assert/Image/${hero}/Skill_R_1.png`,
            skill_R_2: `src/FrontEnd/Assert/Image/${hero}/Skill_R_2.png`,
            skill_R_3: `src/FrontEnd/Assert/Image/${hero}/Skill_R_3.png`,
            skill_P_1: `src/FrontEnd/Assert/Image/${hero}/Skill_P_1.png`,
            skill_P_2: `src/FrontEnd/Assert/Image/${hero}/Skill_P_2.png`,
            skill_P_3: `src/FrontEnd/Assert/Image/${hero}/Skill_P_3.png`,
        };
    }

    // To UI
    const profile = {
        alive: `src/FrontEnd/Assert/Image/${hero}/Profile.png`,
        dead: `src/FrontEnd/Assert/Image/${hero}/Profile_Dead.png`,
        book_background: `src/FrontEnd/Assert/Image/${hero}/Book_Background.png`,
        objectiveProfile: `src/FrontEnd/Assert/Image/${map}/Profile_Tree.png`,
        skill_book: `src/FrontEnd/Assert/Image/${hero}/Skill_SkillBook.png`,
    }

    const general = {
        objectiveProfile: 'src/FrontEnd/Assert/Image/General/Profile_Tree.png',
        upgrade: 'src/FrontEnd/Assert/Image/General/Button_Upgrade.png',
        statSpeed: 'src/FrontEnd/Assert/Image/General/Stats_Speed.png',
        statArmor: 'src/FrontEnd/Assert/Image/General/Stats_Armor.png',
        statStrength: 'src/FrontEnd/Assert/Image/General/Stats_Strength.png',
        statIntelligence: 'src/FrontEnd/Assert/Image/General/Stats_Intelligence.png',
        statSlot: 'src/FrontEnd/Assert/Image/General/Stats_Slot.png',
        statGold: 'src/FrontEnd/Assert/Image/General/Stats_Gold.png',
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
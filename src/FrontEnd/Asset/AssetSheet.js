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

    const load = loadImageAssets(enemySprites);

    return {
        hero: loadImageAsset(`src/FrontEnd/Asset/Image/${hero}/Walk_Layout.png`),
        death: loadImageAsset(`src/FrontEnd/Asset/Image/${hero}/Death_Layout.png`),
        background: loadImageAsset(`src/FrontEnd/Asset/Image/${map}/background.png`),
        objective: loadImageAsset(`src/FrontEnd/Asset/Image/${map}/Sprite_Tree.png`),
        enemies: load,
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

    // To UI
    const profile = {
        alive: `src/FrontEnd/Asset/Image/${hero}/Profile.png`,
        dead: `src/FrontEnd/Asset/Image/${hero}/Profile_Dead.png`,
        book_background: `src/FrontEnd/Asset/Image/${hero}/Book_Background.png`,
        objectiveProfile: `src/FrontEnd/Asset/Image/${map}/Profile_Tree.png`,
        skill_book: `src/FrontEnd/Asset/Image/${hero}/Skill_SkillBook.png`,
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
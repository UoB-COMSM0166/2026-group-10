import GameManager from './src/GameManager.js';

async function loadAssets(p5) {
  const mapData = await p5.loadJSON('./data/Map/Forest.json');
  const heroData = await p5.loadJSON('./data/Hero/Archmage.json');

  return { mapData, heroData };
}

new p5(p5 => {
    let gameManager = null;
    const canvasSize = { width: 1280, height: 720 };

    p5.setup = async () => {
        console.log("Setting up the world...");

        p5.createCanvas(canvasSize.width, canvasSize.height)
            .elt.addEventListener('contextmenu', e => e.preventDefault());

        p5.frameRate(60);

        const assets = await loadAssets(p5);

        gameManager = new GameManager(
            p5,
            assets.mapData,
            assets.heroData,
            canvasSize
        );

        gameManager.start();
    };

    p5.draw = () => {
        if (!gameManager) {
            p5.background(220);
            return;
        }

        gameManager.loop();
        p5.background(220);
        p5.image(gameManager.layers.game, 0, 0);
        p5.image(gameManager.layers.ui, 0, 0);
    }
});

/**
 * TypeFlow - Bootstrap
 * Application entry point for initializing the MVC architecture.
 */

(function () {
  function startTypeFlow() {
    // Only initialize in browser environments
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Instantiate models, services, and views
    const wordsModel = new WordsModel();
    const sessionModel = new SessionModel();
    const flowModel = new FlowModel();
    const eggNestModel = new EggNestModel();

    const storageService = (typeof StorageManager !== 'undefined') ? StorageManager : new StorageService();
    const audio = (typeof audioService !== 'undefined') ? audioService : new AudioService();

    const stageView = new StageView();
    const nestView = new NestView();
    const hudView = new HUDView();
    const chartView = new ChartView();
    const modalView = new ModalView();

    const gameController = new GameController({
      wordsModel,
      sessionModel,
      flowModel,
      eggNestModel,
      storageService,
      audioService: audio,
      stageView,
      nestView,
      hudView,
      chartView,
      modalView
    });

    window.gameController = gameController;
    window.typeflow = gameController;

    gameController.init();

    // Synchronize caret after web fonts finish loading
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!gameController.sessionModel.isActive) {
          gameController.stageView.updateCaret(0, 0);
        }
      });
    }
  }

  if (typeof document !== 'undefined') {
    startTypeFlow();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { startTypeFlow };
  }
})();

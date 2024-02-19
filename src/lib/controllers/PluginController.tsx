import { ServerAPI } from "decky-frontend-lib";
import { PythonInterop } from "./PythonInterop";
import { SteamController } from "./SteamController";
import { LogController } from "./LogController";
import { HomeMasterManager } from "../../state/HomeMasterManager";

/**
 * Main controller class for the plugin.
 */
export class PluginController {
  // @ts-ignore
  private static server: ServerAPI;
  private static homeMasterManager: HomeMasterManager;

  private static steamController: SteamController;

  private static hasInitialized = false;

  private static onWakeSub: Unregisterer;

  /**
   * Sets the plugin's serverAPI.
   * @param server The serverAPI to use.
   * @param homeMasterManager The state manager for the plugin.
   */
  static setup(server: ServerAPI, homeMasterManager: HomeMasterManager): void {
    LogController.setup("HomeMaster", "8de500");

    this.server = server;
    this.homeMasterManager = homeMasterManager;
    this.steamController = new SteamController();
  }

  /**
   * Sets the plugin to initialize once the user changes in.
   * @returns The unregister function for the user change hook.
   */
  static initOnUserChange(onMount: () => Promise<void>): Unregisterer {
    return this.steamController.registerForCurrentUserChanges(async (userInfo) => {
      if (await this.steamController.waitForServicesToInitialize()) {
        if (!PluginController.hasInitialized) {
          await PythonInterop.setActiveSteamId(userInfo!.strSteamID);
          await this.homeMasterManager.loadSettings();
          await PluginController.init();
          onMount();
        } else {
          await this.onUserChange(userInfo!.strSteamID);
        }
      } else {
        PythonInterop.toast("Error", "Failed to initialize, try restarting.");
      }
    });
  }

  /**
   * Initializes the Plugin.
   */
  static async init(): Promise<void> {
    LogController.log("PluginController initialized.");

    this.onWakeSub = this.steamController.registerForOnResumeFromSuspend(this.onWakeFromSleep.bind(this));
    PluginController.hasInitialized = true;
  }

  /**
   * Gets the carouselCollectionId when the current user changes.
   * @param userId The id of the user.
   */
  static async onUserChange(userId: string): Promise<void> {
    await PythonInterop.setActiveSteamId(userId);
    const carouselCollectionId = await PythonInterop.getCarouselCollectionId();

    if (!(carouselCollectionId instanceof Error)) {
      this.homeMasterManager.setCarouselCollectionId(carouselCollectionId);
    }
  }

  /**
   * Function to run when resuming from sleep.
   */
  static onWakeFromSleep() {
    // TODO: make sure patching happens
  }

  /**
   * Function to run when the plugin dismounts.
   */
  static dismount(): void {
    if (this.onWakeSub) this.onWakeSub.unregister();
    this.homeMasterManager.disposeReactions();

    LogController.log("PluginController dismounted.");
  }
}

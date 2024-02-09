import { IReactionDisposer, reaction } from "mobx";
import { LogController } from "../lib/controllers/LogController";
import { PythonInterop } from "../lib/controllers/PythonInterop";


/**
 * Class that handles TabMaster's core state.
 */
export class HomeMasterManager {
  private hasLoaded: boolean;

  public eventBus = new EventTarget();

  private favoriteReaction: IReactionDisposer | undefined;
  private installedReaction: IReactionDisposer | undefined;
  private nonSteamReaction: IReactionDisposer | undefined;
  private collectionRemoveReaction: IReactionDisposer | undefined;

  private carouselCollectionId: string | undefined;

  /**
   * Creates a new HomeMasterManager.
   */
  constructor() {
    this.hasLoaded = false;
  }

  get hasSettingsLoaded() {
    return this.hasLoaded;
  }

  private initReactions(): void {
    // * subscribe to when visible favorites change
    this.favoriteReaction = reaction(() => collectionStore.GetCollection('favorite').allApps.length, this.resetCarouselCollectionOnLengthChange('favorite').bind(this));

    // *subscribe to when installed games change
    this.installedReaction = reaction(() => collectionStore.GetCollection('local-install').allApps.length, this.resetCarouselCollectionOnLengthChange('local-install').bind(this));

    // * subscribe to non-steam games if they exist
    if (collectionStore.GetCollection('desk-desktop-apps')) {
      this.nonSteamReaction = reaction(() => collectionStore.GetCollection('desk-desktop-apps').allApps.length, this.resetCarouselCollectionOnLengthChange('desk-desktop-apps').bind(this));
    }

    // * subscribe for when collections are deleted
    this.collectionRemoveReaction = reaction(() => collectionStore.userCollections.length, this.handleUserCollectionRemove.bind(this));
  
    // * this checks if the 
    this.handleUserCollectionRemove(collectionStore.userCollections.length); 
  }

  
  /**
   * Handles the collection size change reaction.
   * @param collectionId The id of the collection to react to.
   */
  private resetCarouselCollectionOnLengthChange(collectionId: string): (numApps: number) => void {
    return (numApps: number) => {
      if (!this.hasLoaded) return;
  
      if (this.carouselCollectionId === collectionId && numApps === 0) {
        LogController.log(`${collectionId} has a size of zero, setting carousel to NO_CHANGE`);
        this.setCarouselCollectionId("NO_CHANGE");
      }
    }
  }

  /**
   * Handles when the user deletes one of their collections.
   * @param newLength The new length of the userCollections.
   */
  private handleUserCollectionRemove(_newLength: number) {
    const userCollections = collectionStore.userCollections;
    const collectionIds = userCollections.map((collection) => collection.id);

    if (this.hasLoaded && collectionIds.includes(this.carouselCollectionId!)) {
      LogController.log(`${this.carouselCollectionId} was deleted, setting carousel to NO_CHANGE`);
      this.setCarouselCollectionId("NO_CHANGE");
    }
  }

  /**
   * Loads the user's settings from the backend.
   */
  loadSettings = async () => {
    const carouselCollectionId = await PythonInterop.getCarouselCollectionId();

    if (carouselCollectionId instanceof Error) {
      LogController.log("Couldn't load settings");
      LogController.error(carouselCollectionId.message);
      return;
    }

    this.carouselCollectionId = carouselCollectionId;

    this.hasLoaded = true;
    
    this.initReactions();
  };

  /**
   * Gets the user's carousel collection id.
   * @returns The carousel collection id, or "" if it isnt set.
   */
  getCarouselCollectionId(): string {
    return this.carouselCollectionId ?? "";
  }

  /**
   * Sets the user's carousel collection id.
   * @param collectionId The collection id.
   */
  async setCarouselCollectionId(collectionId: string): Promise<void> {
    await PythonInterop.setCarouselCollectionId(collectionId);
    this.carouselCollectionId = collectionId;
    this.update();
  }
  
  /**
   * Dispatches event to update context provider and rerenders library component.
   */
  private update() {
    this.eventBus.dispatchEvent(new Event("stateUpdate"));
    this.rerenderHomePage();
  }

  /**
   * Method that will be used to force the home page to rerender. Assigned later in the home page patch.
   */
  private rerenderHomePage() { }
  
  /**
   * Assigns the callback that will be used to rerender the home page.
   * @param handler The callback that will cause the home page to rerender.
   */
  registerRerenderHomePageHandler(handler: () => void): void {
    this.rerenderHomePage = handler;
  }


  /**
   * Handles cleaning up all reactions.
   */
  disposeReactions(): void {
    if (this.favoriteReaction) this.favoriteReaction();
    if (this.installedReaction) this.installedReaction();
    if (this.nonSteamReaction) this.nonSteamReaction();
    if (this.collectionRemoveReaction) this.collectionRemoveReaction();
  }
}

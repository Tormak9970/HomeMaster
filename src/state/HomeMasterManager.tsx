import { IReactionDisposer, reaction } from "mobx";
import { LogController } from "../lib/controllers/LogController";


/**
 * Class that handles TabMaster's core state.
 */
export class HomeMasterManager {
  private hasLoaded: boolean;

  private userCollectionIds: string[] = [];

  public eventBus = new EventTarget();

  private favoriteReaction: IReactionDisposer | undefined;
  private installedReaction: IReactionDisposer | undefined;
  private hiddenReaction: IReactionDisposer | undefined;
  private nonSteamReaction: IReactionDisposer | undefined;

  private collectionReactions: { [collectionId: string]: IReactionDisposer; } = {};
  private collectionRemoveReaction: IReactionDisposer | undefined;

  /**
   * Creates a new HomeMasterManager.
   */
  constructor() {
    this.hasLoaded = false;
  }


  private initReactions(): void {
    // //* subscribe to when visible favorites change
    // this.favoriteReaction = reaction(() => collectionStore.GetCollection('favorite').allApps.length, this.handleNumOfVisibleFavoritesChanged.bind(this));

    // //*subscribe to when installed games change
    // this.installedReaction = reaction(() => collectionStore.GetCollection('local-install').allApps.length, this.rebuildCustomTabsOnCollectionChange.bind(this));

    // //* subscribe to non-steam games if they exist
    // if (collectionStore.GetCollection('desk-desktop-apps')) {
    //   this.nonSteamReaction = reaction(() => collectionStore.GetCollection('desk-desktop-apps').allApps.length, this.rebuildCustomTabsOnCollectionChange.bind(this));
    // }

    // //* subscribe for when collections are deleted
    // this.collectionRemoveReaction = reaction(() => collectionStore.userCollections.length, this.handleUserCollectionRemove.bind(this));
    
    // TODO: listen for changes on all user colletions

    // this.handleUserCollectionRemove(collectionStore.userCollections.length); //* this loads the collection ids for the first time.
  }

  /**
   * Handles rebuilding tabs when a collection changes.
   */
  private async rebuildCustomTabsOnCollectionChange() {
    if (!this.hasLoaded) return;
  }

  /**
   * Handles when the user deletes one of their collections.
   * @param newLength The new length of the userCollections.
   */
  private handleUserCollectionRemove(newLength: number) {
    // const userCollections = collectionStore.userCollections;

    // if (newLength < this.userCollectionIds.length && this.hasLoaded) {
    //   let validateTabs = false;
    //   const collectionsInUse = Object.keys(this.collectionReactions);
    //   const currentUserCollectionIds = userCollections.map((collection) => collection.id);

    //   this.userCollectionIds = this.userCollectionIds.filter((id) => {
    //     const isIncluded = currentUserCollectionIds.includes(id);

    //     if (!isIncluded && collectionsInUse.includes(id)) {
    //       validateTabs = true;
    //       this.collectionReactions[id]();
    //       delete this.collectionReactions[id];
    //     }

    //     return isIncluded;
    //   });

    //   if (validateTabs) TabErrorController.validateTabs(Array.from(this.tabsMap.keys()), this);
    // } else {
    //   for (const userCollection of userCollections) {
    //     if (!this.userCollectionIds.includes(userCollection.id)) this.userCollectionIds.push(userCollection.id);
    //   }
    // }
  }


  /**
   * Handles cleaning up all reactions.
   */
  disposeReactions(): void {
    if (this.favoriteReaction) this.favoriteReaction();
    if (this.installedReaction) this.installedReaction();
    if (this.hiddenReaction) this.hiddenReaction();
    if (this.nonSteamReaction) this.nonSteamReaction();

    if (this.collectionReactions) {
      for (const reaction of Object.values(this.collectionReactions)) {
        reaction();
      }
    }

    if (this.collectionRemoveReaction) this.collectionRemoveReaction();
  }

  /**
   * Loads the user's settings from the backend.
   */
  loadSettings = async () => {
    this.initReactions();
    const settings = {}; //await PythonInterop.getSettings();

    if (settings instanceof Error) {
      LogController.log("Couldn't load tab settings");
      LogController.error(settings.message);
      return;
    }

    this.hasLoaded = true;
  };
}

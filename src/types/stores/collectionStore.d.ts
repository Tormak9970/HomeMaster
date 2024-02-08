// Types for the collectionStore global

type AppCollectionType = 'type-games' | 'type-software' | 'type-music' | 'type-videos' | 'type-tools'

type CollectionStore = {
  appTypeCollectionMap: Map<AppCollectionType, Collection>,
  allGamesCollection: Collection,
  deckDesktopApps: Collection | null,
  neptuneGamesCollection: Collection | null,
  userCollections: Collection[],
  localGamesCollection: Collection,
  allAppsCollection: Collection,
  BIsHidden: (appId: number) => boolean,
  SetAppsAsHidden: (appIds: number[], hide: boolean) => void,
  GetUserCollectionsByName: (name: string) => Collection[]
  GetCollectionListForAppID: (appId: number) => Collection[]
  GetCollection: (id: Collection['id']) => Collection
}

type Collection = {
  AsDeletableCollection: () => null,
  AsDragDropCollection: () => null,
  AsEditableCollection: () => null,
  GetAppCountWithToolsFilter: (t) => any,
  allApps: SteamAppOverview[],
  apps: Map<number, SteamAppOverview>,
  bAllowsDragAndDrop: boolean,
  bIsDeletable: boolean,
  bIsDynamic: boolean,
  bIsEditable: boolean,
  displayName: string,
  id: string,
  visibleApps: SteamAppOverview[]
}

import {
  afterPatch,
  findInReactTree,
  RoutePatch,
  ServerAPI,
  wrapReactType
} from "decky-frontend-lib";
import { ReactElement } from "react";
import { HomeMasterManager } from "../state/HomeMasterManager";

/**
 * Patches the Steam library to allow the plugin to change the tabs.
 * @param serverAPI The plugin's serverAPI.
 * @param homeMasterManager The plugin's core state manager.
 * @returns A routepatch for the library.
 */
export const patchHome = (serverAPI: ServerAPI, homeMasterManager: HomeMasterManager): RoutePatch => {
  //* This only runs 1 time, which is perfect
  return serverAPI.routerHook.addPatch("/library/home", (props: { path: string; children: ReactElement; }) => {
    afterPatch(props.children, 'type', (_: Record<string, unknown>[], ret?: any) => {
      let cache2: any = null;

      wrapReactType(ret);
      afterPatch(ret.type, 'type', (_: Record<string, unknown>[], ret2?: any) => {
        if (cache2) {
          ret2 = cache2;
          return ret2;
        }

        const recents = findInReactTree(ret2, (x) => x?.props && ('autoFocus' in x.props) && ('showBackground' in x.props));
        console.log("recents:", JSON.parse(JSON.stringify(recents)));

        wrapReactType(recents);
        afterPatch(recents.type, 'type', (_: Record<string, unknown>[], ret3?: any) => {
          console.log("ret3:", JSON.parse(JSON.stringify(ret3)));

          cache2 = ret2;

          const p = findInReactTree(ret3, (x) => x?.props?.games && x?.props.onItemFocus);

          const collectionId = homeMasterManager.getCarouselCollectionId();
          if (homeMasterManager.hasSettingsLoaded && collectionId !== "NO_CHANGE") {
            const collection = collectionStore.GetCollection(collectionId);

            // * Set the label
            ret3.props.children[1].props.children[0].props.children[0].props.children = collection.displayName;

            // * Set the games to be rendered
            p.props.games = collection.allApps.map((app) => app.appid).slice(0, 20); // ! need to limit number to 20
          }

          return ret3;
        });
        return ret2;
      });
      return ret;
    });
    return props;
  });
};

import {
  afterPatch,
  findInReactTree,
  Patch,
  replacePatch,
  RoutePatch,
  ServerAPI,
  wrapReactType
} from "decky-frontend-lib";
import { ReactElement, useEffect, useState } from "react";
import { HomeMasterManager } from "../state/HomeMasterManager";
import { LogController } from "../lib/controllers/LogController";

/**
 * Patches the Steam library to allow the plugin to change the tabs.
 * @param serverAPI The plugin's serverAPI.
 * @param homeMasterManager The plugin's core state manager.
 * @returns A routepatch for the library.
 */
export const patchHome = (serverAPI: ServerAPI, homeMasterManager: HomeMasterManager): RoutePatch => {
  LogController.log("Patching home carousel...");
  //* This only runs 1 time, which is perfect
  return serverAPI.routerHook.addPatch("/library/home", (props: { path: string; children: ReactElement; }) => {
    afterPatch(props.children, 'type', (_: Record<string, unknown>[], ret?: any) => {
      const [refresh, setRefresh] = useState(false);

      // TODO: make this reload or prepatch so that it doesn't refresh when the user tries to navigate the carousel
      // ? Its already auto updating on changes which is good, but we may wanna change that so we have control over it

      let innerPatch: Patch;
      let cache2: any = null;
      // let memoCache: any;
      
      useEffect(() => {
        homeMasterManager.registerRerenderHomePageHandler(() => setRefresh(!refresh));
        return innerPatch?.unpatch();
      });

      wrapReactType(ret);
      afterPatch(ret.type, 'type', (_: Record<string, unknown>[], ret2?: any) => {
        if (cache2) {
          ret2 = cache2;
          return ret2;
        }

        const recents = findInReactTree(ret2, (x) => x?.props && ('autoFocus' in x.props) && ('showBackground' in x.props));
        console.log("recents:", JSON.parse(JSON.stringify(recents)));

        wrapReactType(recents);
        
        // innerPatch = replacePatch
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

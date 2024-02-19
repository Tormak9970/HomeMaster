import {
  definePlugin,
  RoutePatch,
  ServerAPI,
} from "decky-frontend-lib";

import { PluginController } from "./lib/controllers/PluginController";
import { PythonInterop } from "./lib/controllers/PythonInterop";

import { HomeMasterContextProvider } from "./state/HomeMasterContext";
import { HomeMasterManager } from "./state/HomeMasterManager";

import { patchHome } from "./patches/HomePatch";

import { QuickAccessContent } from "./components/QuickAccessContent";
import { Fragment } from 'react';
import { FaHouse } from "react-icons/fa6";

declare global {
  let DeckyPluginLoader: { pluginReloadQueue: { name: string; version?: string; }[]; };
  var SteamClient: SteamClient;
  let collectionStore: CollectionStore;
  let appStore: AppStore;
  let loginStore: LoginStore;
  //* This casing is correct, idk why it doesn't match the others.
  let securitystore: SecurityStore;
  let settingsStore: SettingsStore;
}


export default definePlugin((serverAPI: ServerAPI) => {
  let homePatch: RoutePatch;

  PythonInterop.setServer(serverAPI);

  const homeMasterManager = new HomeMasterManager();
  PluginController.setup(serverAPI, homeMasterManager);

  const userChangeUnregisterer = PluginController.initOnUserChange(async () => {
    homePatch = patchHome(serverAPI, homeMasterManager);
  });

  return {
    title: <>HomeMaster</>,
    content:
      <HomeMasterContextProvider homeMasterManager={homeMasterManager}>
        <QuickAccessContent />
      </HomeMasterContextProvider>,
    icon: <FaHouse />,
    alwaysRender: true,
    onDismount: () => {
      serverAPI.routerHook.removePatch("/", homePatch);

      // loginUnregisterer.unregister();
      userChangeUnregisterer.unregister();
      PluginController.dismount();
    },
  };
});


import {
  definePlugin,
  RoutePatch,
  ServerAPI,
} from "decky-frontend-lib";

import { TbLayoutNavbarExpand } from "react-icons/tb";

import { PluginController } from "./lib/controllers/PluginController";
import { PythonInterop } from "./lib/controllers/PythonInterop";

import { HomeMasterContextProvider } from "./state/HomeMasterContext";
import { HomeMasterManager } from "./state/HomeMasterManager";

import { patchHome } from "./patches/HomePatch";

import { QuickAccessContent } from "./components/QuickAccessContent";
import { Fragment } from 'react';

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

  const loginUnregisterer = PluginController.initOnLogin(async () => {
    await homeMasterManager.loadSettings();
    homePatch = patchHome(serverAPI, homeMasterManager);
  });

  return {
    title: <>HomeMaster</>,
    content:
      <HomeMasterContextProvider homeMasterManager={homeMasterManager}>
        <QuickAccessContent />
      </HomeMasterContextProvider>,
    icon: <TbLayoutNavbarExpand />,
    onDismount: () => {
      serverAPI.routerHook.removePatch("/", homePatch);

      loginUnregisterer.unregister();
      PluginController.dismount();
    },
  };
});


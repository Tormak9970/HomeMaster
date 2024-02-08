import asyncio
import os
import decky_plugin
from settings import SettingsManager
from typing import TypeVar


def log(txt):
  decky_plugin.logger.info(txt)

def warn(txt):
  decky_plugin.logger.warn(txt)

def error(txt):
  decky_plugin.logger.error(txt)

Initialized = False

class Plugin:
  user_id: str = None
  users_dict: dict[str, dict] = None

  settings: SettingsManager

  async def logMessage(self, message, level):
    if level == 0:
      log(message)
    elif level == 1:
      warn(message)
    elif level == 2:
      error(message)

  # Plugin settings getters
  async def get_users_dict(self) -> dict[str, dict] | None:
    """
    Waits until users_dict is loaded, then returns users_dict

    :return: The users dictionary
    """
    while Plugin.users_dict is None:
      await asyncio.sleep(0.1)
      
    log(f"Got users_dict {Plugin.users_dict}")
    return Plugin.users_dict
  
  async def set_active_user_id(self, user_id: str) -> bool:
    log(f"active user id: {user_id}")
    Plugin.user_id = user_id
    
    while Plugin.users_dict is None:
      await asyncio.sleep(0.1)

    if not user_id in Plugin.users_dict.keys():
      log(f"User {user_id} had no settings.")

      Plugin.users_dict[user_id] = {
        "selectedCollectionId": {}
      }
      await Plugin.set_setting(self, "usersDict", Plugin.users_dict)

    return True
  
  async def get_selected_collection_id(self) -> str | None:
    """
    Waits until the user_dict is loaded, then returns the selectedCollectionId settings

    :return: The user's selectedCollectionId
    """
    while Plugin.users_dict is None:
      await asyncio.sleep(0.1)
    
    selectedCollectionId = Plugin.users_dict[Plugin.user_id]["selectedCollectionId"]
    log(f"Got selectedCollectionId {selectedCollectionId}")
    return selectedCollectionId or {}

  # Plugin settings setters
  async def set_selected_collection_id(self, collectionId: str):
    Plugin.users_dict[Plugin.user_id]["selectedCollectionId"] = collectionId
    await Plugin.set_setting(self, "usersDict", Plugin.users_dict)



  async def read(self) -> None:
    """
    Reads the json from disk
    """
    Plugin.settings.read()
    Plugin.users_dict = await Plugin.get_setting(self, "usersDict", {})

  T = TypeVar("T")

  # Plugin settingsManager wrappers
  async def get_setting(self, key, default: T) -> T:
    """
    Gets the specified setting from the json

    :param key: The key to get
    :param default: The default value
    :return: The value, or default if not found
    """
    return Plugin.settings.getSetting(key, default)

  async def set_setting(self, key, value: T) -> T:
    """
    Sets the specified setting in the json

    :param key: The key to set
    :param value: The value to set it to
    :return: The new value
    """
    Plugin.settings.setSetting(key, value)
    return value
  
  def del_setting(self, key) -> None:
    """
    Deletes the specified setting in the json
    """
    del Plugin.settings.settings[key]
    Plugin.settings.commit()
    pass

  # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
  async def _main(self):
    global Initialized

    if Initialized:
      return

    Initialized = True

    Plugin.settings = SettingsManager(name="settings", settings_directory=os.environ["DECKY_PLUGIN_SETTINGS_DIR"])
    await Plugin.read(self)

    log("Initializing Home Master.")

  # Function called first during the unload process, utilize this to handle your plugin being removed
  async def _unload(self):
    decky_plugin.logger.info("Unloading Home Master.")

  # Migrations that should be performed before entering `_main()`.
  async def _migration(self):
    pass

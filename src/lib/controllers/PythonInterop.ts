import { ServerAPI } from "decky-frontend-lib";

/**
 * Class for frontend -> backend communication.
 */
export class PythonInterop {
  private static serverAPI: ServerAPI;

  /**
   * Sets the interop's severAPI.
   * @param serv The ServerAPI for the interop to use.
   */
  static setServer(serv: ServerAPI): void {
    this.serverAPI = serv;
  }

  /**
   * Gets the interop's serverAPI.
   */
  static get server(): ServerAPI { return this.serverAPI; }

  /**
   * Logs a message to the plugin's log file and the frontend console.
   * @param message The message to log.
   */
  static async log(message: String): Promise<void> {
    await this.serverAPI.callPluginMethod<{ message: string, level: number }, boolean>("logMessage", { message: `[front-end]: ${message}`, level: 0 });
  }

  /**
   * Logs a warning to the plugin's log file and the frontend console.
   * @param message The message to log.
   */
  static async warn(message: string): Promise<void> {
    await this.serverAPI.callPluginMethod<{ message: string, level: number }, boolean>("logMessage", { message: `[front-end]: ${message}`, level: 1 });
  }

  /**
   * Logs an error to the plugin's log file and the frontend console.
   * @param message The message to log.
   */
  static async error(message: string): Promise<void> {
    await this.serverAPI.callPluginMethod<{ message: string, level: number }, boolean>("logMessage", { message: `[front-end]: ${message}`, level: 2 });
  }
  
  /**
   * Gets the plugin's users dictionary.
   * @returns A promise resolving to the plugin's users dictionary.
   */
  static async getUsersDict(): Promise<UsersDict | Error> {
    const result = await this.serverAPI.callPluginMethod<{}, UsersDict>("get_users_dict", {});

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    }
  }
  
  /**
   * Sends the active user's steamID to the backend.
   * @returns A promise resolving to the plugin's users dictionary.
   */
  static async setActiveSteamId(userId: string): Promise<boolean | Error> {
    const result = await this.serverAPI.callPluginMethod<{ user_id: string }, boolean>("set_active_user_id", { user_id: userId});

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    }
  }

  /**
   * Gets the user's selected collection id.
   * @returns A promise resolving to the user's selected collection id.
   */
  static async getSelectedCollectionId(): Promise<string | Error> {
    let result = await PythonInterop.serverAPI.callPluginMethod<{}, string>("get_selected_collection_id", {});

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    }
  }

  /**
   * Sets the user's selected collection id.
   * @param collectionId The collection id.
   * @returns A promise resolving to whether or not the selected collection id was successfully set.
   */
  static async setSelectedCollectionId(collectionId: string): Promise<void | Error> {
    let result = await PythonInterop.serverAPI.callPluginMethod<{ collectionId: string, }, void>("set_selected_collection_id", { collectionId: collectionId });

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    };
  }

  /**
   * Shows a toast message.
   * @param title The title of the toast.
   * @param message The message of the toast.
   */
  static toast(title: string, message: string): void {
    return (() => {
      try {
        return this.serverAPI.toaster.toast({
          title: title,
          body: message,
          duration: 8000,
        });
      } catch (e) {
        console.log("Toaster Error", e);
      }
    })();
  }
}

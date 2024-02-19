// Types for SteamClient.User

type UserNotificationCounts = {
  async_game_updates: number,
  comments: number,
  gifts: number,
  help_request_replies: number,
  inventory_items: number,
  invites: number,
  moderator_messages: number,
  offline_messages: number,
  trade_offers: number
}

type UserInfo = {
  NotificationCounts: UserNotificationCounts,
  bHWSurveyPending: boolean,
  bIsLimited: boolean,
  bIsOfflineMode: boolean,
  bPromptToChangePassword: boolean,
  bSupportAckOnlyMessages: boolean,
  bSupportAlertActive: boolean,
  bSupportPopupMessage: boolean,
  clientinstanceid: string,
  strAccountBalance: string,
  strAccountBalancePending: string,
  strAccountName: string,
  strFamilyGroupID: string,
  strSteamID: string
}

type User = {
  RegisterForCurrentUserChanges: (callback: (userInfo: UserInfo) => void) => Unregisterer,
  RegisterForLoginStateChange: (callback: (username: string) => void) => Unregisterer,
  RegisterForPrepareForSystemSuspendProgress: (callback: (data: any) => void) => Unregisterer,
  RegisterForShutdownStart: (callback: () => void) => Unregisterer,
  RegisterForShutdownDone: (callback: () => void) => Unregisterer,
  StartRestart: () => void
}

export enum ViewType {
  None = '',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Borrow = 'Borrow',
  Close = 'Close',
  Repay = 'Repay',
}

export enum AssetType {
  Primary,
  Secondary,
  Borrow,
}

export enum State {
  READY,
  INITIALISING,
  ERROR,
}

export enum NotificationType {
  Info,
  Warning,
}

export enum ActionType {
  None = '',
  ExternalLink = 'extLink',
  Modal = 'modal',
  Analytics = 'analytics',
}

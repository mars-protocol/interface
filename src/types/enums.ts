export enum ViewType {
    None = '',
    Deposit = 'Deposit',
    Withdraw = 'Withdraw',
    Borrow = 'Borrow',
    Close = 'Close',
    Repay = 'Repay',
    Stake = 'Stake',
    StakeFromPropsal = 'Stake2',
    Unstake = 'Unstake',
    NewPropsal = 'NewProposal',
    Vote = 'Vote',
    Manage = 'Manage',
    Farm = 'Farm',
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
    Error,
}

export enum ActionType {
    None = '',
    ExternalLink = 'extLink',
    Modal = 'modal',
    Analytics = 'analytics',
}

interface ActionModal extends Modal {
  symbol: string
  denom: string
  strategy: Strategy | undefined
  activeView: ViewTypes
  setView: (viewType: ViewTypes) => void
  open: (denom: string, viewType: ViewTypes) => void
  openStrategy: (strategy: Strategy, viewType: ViewTypes) => void
}

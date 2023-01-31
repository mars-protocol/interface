interface MarsBalance {
  initialised: boolean
  findByDenom: (key: string) => import('@cosmjs/stargate').Coin | undefined
  refetch: () => void
}

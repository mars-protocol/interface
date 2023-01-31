export const findByDenom = (items: Record<string, any>[], denom: string) =>
  items.find((item) => item.denom === denom)

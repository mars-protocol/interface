import { RedbankAction } from 'components/redbank'
import { useRouter } from 'next/router'
import React from 'react'
import { ViewType } from 'types/enums'

const Withdraw = () => {
  const router = useRouter()
  const symbol = router.query.symbol as string

  return <RedbankAction activeView={ViewType.Withdraw} symbol={symbol} />
}

export default Withdraw

import { RedbankAction } from 'components/redbank'
import { useRouter } from 'next/router'
import React from 'react'
import { ViewType } from 'types/enums'

const Borrow = () => {
  const router = useRouter()
  const symbol = router.query.symbol as string

  return <RedbankAction activeView={ViewType.Borrow} symbol={symbol} />
}

export default Borrow

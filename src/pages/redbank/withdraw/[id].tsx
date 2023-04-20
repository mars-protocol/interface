import { RedbankAction } from 'components/redbank'
import { useRouter } from 'next/router'
import { ViewType } from 'types/enums'

const Withdraw = () => {
  const router = useRouter()
  const id = router.query.id as string

  return <RedbankAction activeView={ViewType.Withdraw} id={id} />
}

export default Withdraw

import { RedbankAction } from 'components/redbank'
import { useRouter } from 'next/router'
import { ViewType } from 'types/enums'

const Repay = () => {
  const router = useRouter()
  const id = router.query.id as string

  return <RedbankAction activeView={ViewType.Repay} id={id} />
}

export default Repay

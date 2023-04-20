import { RedbankAction } from 'components/redbank'
import { useRouter } from 'next/router'
import { ViewType } from 'types/enums'

const Borrow = () => {
  const router = useRouter()
  const id = router.query.id as string

  return <RedbankAction activeView={ViewType.Borrow} id={id} />
}

export default Borrow

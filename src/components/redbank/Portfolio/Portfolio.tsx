import { BorrowCapacity, Tutorial } from 'components/common'
import { MyBorrowBalance, MyDepositBalance } from 'components/redbank'
import { RED_BANK_TUTORIAL_KEY } from 'constants/appConstants'
import { balanceSum } from 'libs/assetInfo'
import useStore from 'store'

import styles from './Portfolio.module.scss'

interface Props {
  borrowLimit: number
  liquidationThreshold: number
}

export const Portfolio = ({ borrowLimit, liquidationThreshold }: Props) => {
  const redBankAssets = useStore((s) => s.redBankAssets)
  const borrowBalance = Number(balanceSum(redBankAssets, 'borrowBalanceBaseCurrency'))
  const showTutorial = !localStorage.getItem(RED_BANK_TUTORIAL_KEY)

  const borrowCapacity = (
    <BorrowCapacity
      balance={borrowBalance}
      barHeight={'22px'}
      className={styles.capacity}
      limit={borrowLimit}
      max={liquidationThreshold}
      showPercentageText={true}
    />
  )

  return (
    <div className={styles.portfolio}>
      <MyDepositBalance className={styles.deposit} />
      <div className={styles.capacity}>
        {showTutorial ? (
          <Tutorial step={3} type='redbank'>
            {borrowCapacity}
          </Tutorial>
        ) : (
          <>{borrowCapacity}</>
        )}
      </div>
      <MyBorrowBalance className={styles.borrow} />
    </div>
  )
}

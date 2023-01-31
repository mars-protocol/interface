import { DisplayCurrency } from 'components/common'
import { balanceSum } from 'libs/assetInfo'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

interface Props {
  className?: string
}

export const MyBorrowBalance = ({ className }: Props) => {
  const { t } = useTranslation()
  const baseCurrency = useStore((s) => s.baseCurrency)
  const redBankAssets = useStore((s) => s.redBankAssets)
  const borrowBalance = Number(balanceSum(redBankAssets, 'borrowBalanceBaseCurrency'))

  return (
    <div className={className}>
      <div className='sub2 faded'>{t('redbank.myBorrowBalance')}</div>
      <DisplayCurrency
        coin={{
          amount: borrowBalance.toString(),
          denom: baseCurrency.denom,
        }}
        prefixClass='sub2'
        valueClass='h3'
      />
    </div>
  )
}

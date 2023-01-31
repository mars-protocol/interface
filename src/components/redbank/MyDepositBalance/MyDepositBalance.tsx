import { DisplayCurrency } from 'components/common'
import { balanceSum } from 'libs/assetInfo'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

interface Props {
  className?: string
}

export const MyDepositBalance = ({ className }: Props) => {
  const { t } = useTranslation()
  const baseCurrency = useStore((s) => s.baseCurrency)
  const redBankAssets = useStore((s) => s.redBankAssets)
  const depositBalance = Number(balanceSum(redBankAssets, 'depositBalanceBaseCurrency'))

  return (
    <div className={className}>
      <div className='faded sub2'>{t('redbank.myDepositBalance')}</div>
      <DisplayCurrency
        coin={{
          amount: depositBalance.toString(),
          denom: baseCurrency.denom,
        }}
        prefixClass='sub2'
        valueClass='h3'
      />
    </div>
  )
}

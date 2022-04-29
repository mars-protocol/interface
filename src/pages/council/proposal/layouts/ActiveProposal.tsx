import Card from '../../../../components/card/Card'
import Header from '../../../../layouts/txmodal/Header'
import Details from './Details'
import { useTranslation } from 'react-i18next'
import styles from './ActiveProposal.module.scss'
import History from './History'
import InfoSection from '../components/InfoSection'
import { Proposal } from '../../hooks/useProposals'
import moment from 'moment'
import EndDate from '../components/EndDate'
import { useHistory } from 'react-router-dom'
import { MsgExecuteContract, Fee } from '@terra-money/terra.js'
import { useNewContractMsg, useContract } from '../../../../hooks'
import BigNumber from 'bignumber.js'
import { plus } from '../../../../libs/math'
import useStore from '../../../../store'

interface Props {
    proposal: Proposal | undefined
}

const ActiveProposal = ({ proposal }: Props) => {
    const { t } = useTranslation()
    const history = useHistory()
    const basecampAddresses = useStore((s) => s.basecampAddresses)
    const newContractMsg = useNewContractMsg()

    const handleClose = () => {
        history.push('/council')
    }

    const title = proposal?.title || ''
    const description = proposal?.description || ''
    const status = proposal?.status || ''

    const creator = proposal?.submitter_address || ''
    const discussionLink = proposal?.link || ''
    const startDateFormatted = moment(proposal?.startDate).format('DD/MM/YY')
    const endDateFormatted = moment(proposal?.endDate).format(
        'MMM Do, hh:mm:ss'
    )

    const fromNow = moment(proposal?.endDate).fromNow()

    const { post } = useContract()

    // -------------
    // TEST TX MESSAGES
    // -------------

    // End Proposal
    const endProposalMessage = () => {
        const executeMsg = {
            end_proposal: {
                proposal_id: proposal?.proposal_id,
            },
        }

        const msgs: MsgExecuteContract[] = [
            newContractMsg(
                basecampAddresses?.contracts.basecampAddress || '',
                executeMsg
            ),
        ]

        return msgs
    }

    // Execute Proposal
    const executeProposalMessage = () => {
        const executeMsg = {
            execute_proposal: {
                proposal_id: proposal?.proposal_id,
            },
        }

        const msgs: MsgExecuteContract[] = [
            newContractMsg(
                basecampAddresses?.contracts.basecampAddress || '',
                executeMsg
            ),
        ]

        return msgs
    }

    // callbacks
    const handleEndProposal = async () => {
        const fee = { gasPrice: 0.15, amount: Number(300_000) }
        if (!fee) {
            return
        }

        const msgs = endProposalMessage()
        const { gasPrice, amount } = fee
        const gas = new BigNumber(amount)
            .div(gasPrice)
            .integerValue(BigNumber.ROUND_FLOOR)
            .toNumber()

        const txOptions = {
            msgs,
            memo: '',
            gasPrices: `${gasPrice}uusd`,
            fee: new Fee(gas, {
                uusd: plus(amount),
            }),
            purgeQueue: true,
        }

        await post(txOptions, 1)
    }

    const handleExecuteProposal = async () => {
        const fee = { gasPrice: 0.15, amount: Number(300_000) }
        if (!fee) {
            return
        }

        const msgs = executeProposalMessage()
        const { gasPrice, amount } = fee
        const gas = new BigNumber(amount)
            .div(gasPrice)
            .integerValue(BigNumber.ROUND_FLOOR)
            .toNumber()

        const txOptions = {
            msgs,
            memo: '',
            gasPrices: `${gasPrice}uusd`,
            fee: new Fee(gas, {
                uusd: plus(amount),
            }),
            purgeQueue: true,
        }

        await post(txOptions)
    }

    return (
        <div className={styles.container}>
            <Card>
                <Header
                    handleClose={handleClose}
                    titleText={
                        status === 'active'
                            ? t('council.activeProposal')
                            : t('council.proposal')
                    }
                    src={'back'}
                    tooltip={t('council.activeProposalTooltip')}
                />
                <Details
                    endDate={
                        <EndDate
                            endDateFormatted={endDateFormatted}
                            fromNow={fromNow}
                        />
                    }
                    creator={creator}
                    discussionLink={
                        discussionLink.startsWith('https://') ||
                        discussionLink.length === 0
                            ? discussionLink
                            : `https://${discussionLink}`
                    }
                    handleEndProposal={handleEndProposal}
                    handleExecuteProposal={handleExecuteProposal}
                />
                <History status={status} startDate={startDateFormatted} />
                <InfoSection
                    title={title}
                    content={description}
                    messages={proposal?.messages || []}
                />
            </Card>
        </div>
    )
}

export default ActiveProposal

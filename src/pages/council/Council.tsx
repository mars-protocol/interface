import { useBasecamp, useStaking } from '../../hooks/'
import styles from './Council.module.scss'
import Summary from './layouts/Summary'
import Title from '../../components/Title'
import ActiveProposals from './layouts/ActiveProposals'
import AllProposals from './layouts/AllProposals'
import Stake from './layouts/Stake'
import Details from './layouts/Details'
import NewProposalModal from './layouts/NewProposalModal'
import { ProposalsProvider, useProposalState } from './hooks/useProposals'
import { Route, Switch } from 'react-router-dom'
import Proposal from './proposal/Proposal'

import Notification from '../../components/Notification'
import { CooldownProvider, useCooldownState } from './hooks/useCooldown'
import { useTranslation } from 'react-i18next'
import { lookup, produceCountdown } from '../../libs/parse'
import { useHistory } from 'react-router-dom'
import {
    COOLDOWN_BUFFER,
    MARS_DECIMALS,
    MARS_DENOM,
} from '../../constants/appConstants'
import { NotificationType } from '../../types/enums'

const Council = () => {
    const { t } = useTranslation()
    // ---------------
    // STATE
    // ---------------
    const { config } = useBasecamp()
    const { initialised: stakingInitialised } = useStaking()

    const cooldown = useCooldownState()
    const proposalState = useProposalState()
    const history = useHistory()

    const now = new Date().getTime()
    const quorum = Number(config?.proposal_required_quorum || 0.2) * 100

    // ---------------
    // CALLBACKS
    // ---------------
    const stakeButtonClickHandler = () => {
        history.push('/council/stake')
    }

    const unstakeButtonClickHandler = () => {
        history.push('/council/unstake')
    }

    const newProposalButtonClickHandler = () => {
        history.push('/council/submitproposal')
    }

    // ---------------
    // PRESENTATION
    // ---------------
    const marsToUnstake = lookup(
        Number(cooldown.claim?.amount),
        MARS_DENOM,
        MARS_DECIMALS
    )
    const cooldownEnds =
        Number(cooldown.claim?.cooldown_end_timestamp) * 1000 + COOLDOWN_BUFFER
    const showNotification = cooldown.claim !== undefined

    const notificationText =
        cooldownEnds > now ? (
            t('council.cooldownEndsIn', {
                remaining: produceCountdown(cooldownEnds - now),
            })
        ) : (
            <>
                {t('council.yourStakedMarsAreReadyToUnstake', {
                    marsToUnstake: marsToUnstake,
                })}
                <button
                    onClick={unstakeButtonClickHandler}
                    className={styles.cooldownDetailsBtn}
                >
                    {t('council.unstakeNow')}
                </button>
            </>
        )

    const isLoaded = proposalState.initialised && stakingInitialised
    const activeProposal = proposalState.getActiveProposals()
    return (
        <CooldownProvider value={cooldown}>
            <ProposalsProvider value={proposalState}>
                <div className={styles.council}>
                    <Switch>
                        <Route exact={true} path='/council'>
                            <Notification
                                showNotification={showNotification}
                                type={NotificationType.Info}
                                content={notificationText}
                            />

                            <>
                                <div>
                                    <Summary
                                        stakeButtonClickHandler={
                                            stakeButtonClickHandler
                                        }
                                        unstakeButtonClickHandler={
                                            unstakeButtonClickHandler
                                        }
                                    />
                                </div>
                                <div className={styles.detailsContainer}>
                                    <Details />
                                </div>
                            </>
                            {isLoaded && activeProposal.length > 0 && (
                                <div>
                                    <Title
                                        text={t('council.activeProposals')}
                                        margin={'0 16px'}
                                    />
                                    <ActiveProposals quorum={quorum} />
                                </div>
                            )}
                            {isLoaded && (
                                <div className={styles.allProposals}>
                                    <Title text={t('council.allProposals')} />
                                    <AllProposals
                                        actionButtonHandler={
                                            newProposalButtonClickHandler
                                        }
                                        quorum={quorum}
                                    />
                                </div>
                            )}
                        </Route>
                        <Route exact={true} path='/council/proposal/:id'>
                            <Proposal />
                        </Route>

                        <Route exact={true} path='/council/stake'>
                            <Stake />
                        </Route>
                        <Route exact={true} path='/council/unstake'>
                            <Stake />
                        </Route>
                        <Route exact={true} path='/council/submitproposal'>
                            <NewProposalModal />
                        </Route>
                    </Switch>
                </div>
            </ProposalsProvider>
        </CooldownProvider>
    )
}

export default Council

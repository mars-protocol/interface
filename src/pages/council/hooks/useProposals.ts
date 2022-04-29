import { useState, useEffect } from 'react'
import { useAddressProvider } from '../../../hooks'
import createContext from '../../../hooks/createContext'
import moment from 'moment'
import { useMarsBalance } from '../../../hooks/useMarsBalance'
import { useContract } from '../../../hooks/useContract'
import useStore from '../../../store'
import { contractQuery } from '../../../queries/contractQuery'
import { gql, useQuery } from '@apollo/client'
import { LCDClient } from '@terra-money/terra.js'

export interface Proposal {
    proposal_id: number
    submitter_address: string
    status: string
    for_votes: string
    against_votes: string
    start_height: number
    end_height: number
    title: string
    description: string
    link: string
    messages: Message[]
    depositAmount: number
    endDate: string
    startDate: string
    userVestedVotingPower: number
    totalVestedVotingPower: number
    userXmarsVotingPower: number
    totalXmarsVotingPower: number
}

export interface Message {
    execution_order: number
    msg: {
        wasm: {
            execute: {
                contract_addr: string
                funds: []
                msg: string
            }
        }
    }
}

export interface ProposalVote {
    voter_address: string
    option: string
    power: number
}

export interface ProposalResponse {
    proposal_count: number
    proposal_list: Proposal[]
}

export interface ProposalVoteResponse {
    //proposal_id: 1, votes: [], proposal_votes_count: 0
    proposal_id: number
    votes: ProposalVote[]
    proposal_votes_count: number
}

export interface ProposalQueryFilter {
    voter_address?: string
    vote_option?: string
}

export interface Proposals {
    getAllProposals: (start?: number, limit?: number) => Proposal[]
    getActiveProposals: () => Proposal[]
    getInactiveProposals: (start?: number, limit?: number) => Proposal[]
    initialised: boolean
    findProposal: (proposalId: number) => Proposal | undefined
    loadProposal: (proposalId: number) => Promise<Proposal | undefined>
    findProposalVotes: (
        proposalId: number
    ) => Promise<ProposalVote[] | undefined>
    findProposalVote: (proposalId: number) => Promise<ProposalVote | undefined>
    refetch: () => void
    proposalCount: number
    participationRate: number
}

export const [useProposals, ProposalsProvider] =
    createContext<Proposals>('useProposals')

export const useProposalState = (): Proposals => {
    const { initialised: marsInitialiased } = useMarsBalance()
    const { query } = useContract()
    const { config: addressProvider } = useAddressProvider()

    const [participationRate, setParticipationRate] = useState<number>(0)
    const [proposals, setProposals] = useState<Proposal[]>()
    const [proposalCount, setProposalCount] = useState<number>(0)
    const [initialised, setIntialised] = useState(false)
    const [suppyAtIntialised, setSuppyAtIntialised] = useState(false)
    const [refetchRequired, setRefetchRequired] = useState(true)
    const lcd = useStore((s) => s.networkConfig?.lcd)
    const privateLcd = useStore((s) => s.networkConfig?.privateLcd)
    const chainID = useStore((s) => s.networkConfig?.chainID)
    const basecampAddresses = useStore((s) => s.basecampAddresses)
    const latestBlockHeight = useStore((s) => s.latestBlockHeight)
    const userWalletAddress = useStore((s) => s.userWalletAddress)

    const xmarsTotalSupplyAtWasmKey = 'xmarsTotalSupplyAt'
    const xmarsTotalSupplyAtqueries = proposals?.map((proposal: Proposal) => {
        return contractQuery(
            `proposal${proposal.proposal_id}`,
            addressProvider?.xmars_token_address || '',
            `{ total_supply_at: { block: ${proposal.start_height} } }`
        )
    })

    const xmarsUserSupplyAtWasmKey = 'xmarsUserSupplyAt'
    const xmarsUserSupplyAtqueries = proposals?.map((proposal: Proposal) => {
        return contractQuery(
            `proposal${proposal.proposal_id}`,
            addressProvider?.xmars_token_address || '',
            `{ balance_at: { block: ${proposal.start_height}, address: "${userWalletAddress}" }}`
        )
    })

    const vestingTotalSupplyAtWasmKey = 'vestingTotalSupplyAt'
    const vestingTotalSupplyAtqueries = proposals?.map((proposal: Proposal) => {
        return contractQuery(
            `proposal${proposal.proposal_id}`,
            addressProvider?.vesting_address || '',
            `{ total_voting_power_at: { block: ${proposal.start_height} } }`
        )
    })

    const vestingUserSupplyAtWasmKey = 'vestingUserSupplyAt'
    const vestingUserSupplyAtqueries = proposals?.map((proposal: Proposal) => {
        return contractQuery(
            `proposal${proposal.proposal_id}`,
            addressProvider?.vesting_address || '',
            `{ voting_power_at: { user_address: "${userWalletAddress}" block: ${proposal.start_height}}}`
        )
    })

    const supplyAtQueries = gql` 
    query supplyAtQueries{
        ${xmarsTotalSupplyAtWasmKey}: wasm {
            ${proposals?.length ? xmarsTotalSupplyAtqueries : 'ping'}
        }
        ${xmarsUserSupplyAtWasmKey}: wasm {
            ${proposals?.length ? xmarsUserSupplyAtqueries : 'ping'}
        }
        ${vestingTotalSupplyAtWasmKey}: wasm {
            ${proposals?.length ? vestingTotalSupplyAtqueries : 'ping'}
        }
        ${vestingUserSupplyAtWasmKey}: wasm {
            ${proposals?.length ? vestingUserSupplyAtqueries : 'ping'}
        }
    }
    `

    const {
        data,
        loading,
        error,
        refetch: refetchSupplyAt,
    } = useQuery(supplyAtQueries, {
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        skip:
            !addressProvider?.xmars_token_address ||
            !addressProvider?.vesting_address ||
            proposals?.length === 0,
    })

    const applySupplyAt = (data: any) => {
        // If we have more proposals that supply at data, because the user has created a new proposal, we should refetch supply at data
        if (
            proposals?.length !==
            Object.keys(data[xmarsUserSupplyAtWasmKey]).length - 1
        ) {
            refetchSupplyAt()
            return
        }

        proposals?.forEach((proposal) => {
            const key = `proposal${proposal.proposal_id}`

            proposal.userXmarsVotingPower =
                data[xmarsUserSupplyAtWasmKey][key].balance
            proposal.totalXmarsVotingPower =
                data[xmarsTotalSupplyAtWasmKey][key].total_supply
            proposal.userVestedVotingPower =
                data[vestingUserSupplyAtWasmKey][key]
            proposal.totalVestedVotingPower =
                data[vestingTotalSupplyAtWasmKey][key]
        })

        setProposals([...(proposals || [])])
    }

    useEffect(() => {
        const initialise = () => {
            if (!error && !loading && data) {
                applySupplyAt(data)

                //---------------- Calculate Participation Rate ---------------------
                const proposalList =
                    proposals?.filter((proposal) =>
                        moment(proposal.endDate).isBefore()
                    ) || []
                if (proposalList.length > 0) {
                    const lastFiveProposals = proposalList.slice(0, 5)
                    const participationRates = lastFiveProposals.map(
                        (proposal) => {
                            const totalSupply =
                                Number(proposal.totalXmarsVotingPower) +
                                Number(proposal.totalVestedVotingPower)
                            const totalVotes =
                                Number(proposal.for_votes) +
                                Number(proposal.against_votes)

                            return totalVotes > 0 && totalSupply > 0
                                ? totalVotes / totalSupply
                                : 0
                        }
                    )
                    const totalParticipationRate = participationRates.reduce(
                        (curr, prev) => prev + curr,
                        0
                    )

                    const participationRate =
                        (totalParticipationRate / participationRates.length) *
                        100

                    setParticipationRate(participationRate)
                }

                setSuppyAtIntialised(true)
            }
        }
        initialise()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    useEffect(
        () => {
            // calculate start and end date for a proposal, and set it on the proposal
            // Note currently we estimate the block time rather than fetching the block to reduce the spam on the node
            const fetchDate = async (
                proposal: Proposal,
                currentBlockheight: number
            ) => {
                const AVERAGE_BLOCK_TIME = 6.5
                const blocksSinceStart =
                    currentBlockheight - proposal.start_height
                const secondsSinceStart = blocksSinceStart * AVERAGE_BLOCK_TIME
                const startDate = moment()
                    .subtract(secondsSinceStart, 'seconds')
                    .format()

                let endDate = ''
                if (proposal.end_height <= currentBlockheight) {
                    const blocksUntilEnd =
                        currentBlockheight - proposal.end_height
                    const secondsSinceEnd = blocksUntilEnd * AVERAGE_BLOCK_TIME
                    endDate = moment()
                        .subtract(secondsSinceEnd, 'seconds')
                        .format()
                } else {
                    const blocksUntilEnd =
                        proposal.end_height - currentBlockheight
                    const timeInSeconds = blocksUntilEnd * AVERAGE_BLOCK_TIME
                    endDate = moment().add(timeInSeconds, 'seconds').format()
                }

                proposal.endDate = endDate
                proposal.startDate = startDate
            }

            const getProposals = async () => {
                if (
                    !refetchRequired ||
                    !userWalletAddress ||
                    !lcd ||
                    !chainID ||
                    !basecampAddresses ||
                    !marsInitialiased ||
                    proposals?.length === 0
                )
                    return

                // for each block of 30, fetch until our start is past the max
                let max = 30
                let start = 1
                let proposalsHolder: Proposal[] = []
                let proposalCount = 0
                while (max > start) {
                    const result = await query<ProposalResponse>(
                        basecampAddresses.contracts.basecampAddress,
                        { proposals: { start: start, limit: 30 } }
                    )

                    if (!result) return

                    proposalsHolder = proposalsHolder.concat(
                        result?.proposal_list
                    )
                    max = result.proposal_count
                    proposalCount = result.proposal_count
                    start += 30
                }

                const promises = proposalsHolder.map(
                    async (proposal: Proposal) =>
                        fetchDate(proposal, latestBlockHeight)
                )
                await Promise.all(promises)

                setProposals(proposalsHolder.reverse())
                setIntialised(true)
                setProposalCount(proposalCount)
                setRefetchRequired(false)

                // If we are refetching the proposals, re-apply the supply at data to the proposals
                if (suppyAtIntialised) {
                    applySupplyAt(data)
                }
                // If no proposals to load - force set this to initialised
                if (proposalCount === 0) {
                    setSuppyAtIntialised(true)
                }
            }
            getProposals()
        },
        // eslint-disable-next-line
        [
            userWalletAddress,
            lcd,
            chainID,
            refetchRequired,
            basecampAddresses,
            proposals,
        ]
    )

    const findProposalVotes = async (proposalId: number) => {
        if (!basecampAddresses || !lcd || !chainID || !userWalletAddress) return

        // for each block of 30, fetch until our start is past the max
        let finished = false
        let start = ''
        let votesList: ProposalVote[] = []
        while (!finished) {
            const result = await query<ProposalVoteResponse>(
                basecampAddresses?.contracts.basecampAddress,
                {
                    proposal_votes: {
                        proposal_id: proposalId,
                        start: start,
                        limit: 30,
                    },
                }
            )

            if (!result) return

            if (result?.votes.length < 30) finished = true
            if (result.votes.length === 0) return votesList

            start = result.votes[result.votes.length - 1].voter_address
            votesList = votesList.concat(result.votes)
        }

        return votesList
    }

    const findProposalVote = async (proposalId: number) => {
        if (!privateLcd || !chainID || !addressProvider?.council_address) return

        const terra = new LCDClient({
            URL: privateLcd,
            chainID: chainID,
        })

        try {
            let txsQueryResult = await terra.tx.search({
                events: [
                    {
                        key: 'wasm.contract_address',
                        value: addressProvider?.council_address || '',
                    },
                    {
                        key: 'wasm.action',
                        value: 'cast_vote',
                    },
                    {
                        key: 'wasm.proposal_id',
                        value: proposalId.toString(),
                    },
                    { key: 'wasm.voter', value: userWalletAddress },
                ],
                order_by: 'ORDER_BY_DESC',
                'pagination.count_total': 'false',
                'pagination.limit': '1',
                'pagination.offset': '0',
            })

            if (!txsQueryResult || txsQueryResult.txs.length === 0) return

            const voteOption =
                (txsQueryResult &&
                    txsQueryResult.txs[0] &&
                    txsQueryResult.txs[0].logs &&
                    txsQueryResult.txs[0].logs[0].eventsByType.wasm.vote[0]) ||
                ''
            const votePower =
                (txsQueryResult &&
                    txsQueryResult.txs[0] &&
                    txsQueryResult.txs[0].logs &&
                    Number(
                        txsQueryResult.txs[0].logs[0].eventsByType.wasm
                            .voting_power[0]
                    )) ||
                0

            const proposalVote: ProposalVote = {
                voter_address: userWalletAddress,
                option: voteOption,
                power: votePower,
            }

            return proposalVote
        } catch {
            return
        }
    }

    const findProposal = (proposalId: number) =>
        proposals &&
        proposals.find((proposal) => proposal.proposal_id === proposalId)

    const loadProposal = async (proposalId: number) => {
        if (!userWalletAddress || !basecampAddresses) return
        const proposal = await query<Proposal>(
            basecampAddresses.contracts.basecampAddress,
            { proposal: { proposal_id: proposalId } }
        )

        return proposal
    }

    const refetch = () => setRefetchRequired(true)

    const getAllProposals = (start?: number, limit?: number) => {
        if (start === undefined || !limit) return proposals || []

        return proposals?.slice(start, start + limit) || []
    }

    const getActiveProposals = () =>
        proposals?.filter((proposal) => proposal.status === 'active') || []

    const getInactiveProposals = (start?: number, limit?: number) => {
        if (start === undefined || !limit)
            return (
                proposals?.filter((proposal) => proposal.status !== 'active') ||
                []
            )

        return (
            proposals
                ?.filter((proposal) => proposal.status !== 'active')
                .slice(start, start + limit) || []
        )
    }

    return {
        initialised: initialised && suppyAtIntialised,
        findProposal,
        loadProposal,
        refetch,
        getAllProposals,
        getActiveProposals,
        getInactiveProposals,
        findProposalVotes,
        findProposalVote,
        proposalCount,
        participationRate,
    }
}

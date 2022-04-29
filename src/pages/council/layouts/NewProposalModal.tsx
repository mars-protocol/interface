import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../../../layouts/txmodal/Header'
import { useNewContractMsg } from '../../../hooks'
import { useBasecamp } from '../../../hooks/useBasecamp'
import styles from './NewProposalModal.module.scss'
import txResponseStyle from '../../../layouts/txmodal/TxResultContent.module.scss'
import TxResponse from '../../../layouts/txmodal/TxResponse'
import TxFailed from '../../../layouts/txmodal/TxFailed'
import { formatGasFee, formatValue, lookup } from '../../../libs/parse'
import { MsgExecuteContract, Fee } from '@terra-money/terra.js'
import { useMarsBalance } from '../../../hooks/useMarsBalance'
import Card from '../../../components/card/Card'
import Input from '../components/Input'
import TextArea from '../components/TextArea'
import { MARS_DECIMALS, MARS_DENOM } from '../../../constants/appConstants'
import TxFee from '../../../components/TxFee'
import { useProposals } from '../hooks/useProposals'
import ProposalMessage from './ProposalMessage'
import {
    validateTitle,
    validateDesc,
    validateLink,
    validateContractAddress,
    validateContractMsg,
} from '../../../libs/validate'
import { useAddressProvider } from '../../../hooks/useAddressProvider'
import { TxResult, UserDenied } from '@terra-money/wallet-provider'
import { PostError } from '../../../layouts/txmodal/TxResultContent'
import { useContract } from '../../../hooks/useContract'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import useStore from '../../../store'
import Button from '../../../components/Button'

interface FormData {
    title: string
    description: string
    discussionLink: string | undefined
    messages: Message[]
    titleError: string
    descriptionError: string
    discussionLinkError: string
}

interface Message {
    execution_order: number
    target_contract_address: string // HumanAddr
    msg: string // Binary
    addressError: string
    msgError: string
}

const NewProposalModal = () => {
    const { t } = useTranslation()
    const userWalletAddress = useStore((s) => s.userWalletAddress)
    const whitelistedAssets = useStore((s) => s.whitelistedAssets)
    const basecampAddresses = useStore((s) => s.basecampAddresses)
    const { config: basecampConfig } = useBasecamp()
    const { config: addressProviderConfig } = useAddressProvider()
    const newContractMsg = useNewContractMsg()
    const history = useHistory()

    const { findBalance, refetch: refetchMarsBalance } = useMarsBalance()
    const { refetch: refetchProposals } = useProposals()
    const [amount, setAmount] = useState(0)
    const [refreshTx, setRefreshTx] = useState(true)
    const [submitted, setSubmitted] = useState(false)
    const [response, setResponse] = useState<TxResult>()
    const [error, setError] = useState<PostError>()
    const { post, estimateFee } = useContract()
    const [fee, setFee] = useState<StdFee>()
    const [feeError, setFeeError] = useState(false)
    const [validationError, setValidationError] = useState('')
    const [activeMessage, setActiveMessage] = useState(-1)

    const basecampContractAddress = basecampAddresses?.contracts.basecampAddress
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        discussionLink: undefined,
        titleError: '',
        descriptionError: '',
        discussionLinkError: '',
        messages: [],
    })

    const marsBallance = Number(findBalance(MARS_DENOM)?.amount || 0)
    const notEnoughMarsBalance = !!amount && marsBallance < amount

    const gasFeeFormatted = useMemo(
        () => formatGasFee(whitelistedAssets, fee?.amount.toString()),
        [fee, whitelistedAssets]
    )

    useEffect(() => {
        setAmount(basecampConfig?.proposal_required_deposit || 0)

        return () => {
            setAmount(0)
            mountedRef.current = false
        }
    }, [basecampConfig])

    const txMessage = useMemo(() => {
        const executeMsg = {
            send: {
                contract: basecampContractAddress,
                amount: Number(amount).toFixed(0),
                msg: Buffer.from(
                    JSON.stringify({
                        submit_proposal: {
                            title: formData.title || t('council.estimateTitle'),
                            description:
                                formData.description ||
                                t('council.estimateDescription'),
                            link:
                                formData.discussionLink === ''
                                    ? undefined
                                    : formData.discussionLink,
                            messages: formData.messages.map(
                                (message, index) => {
                                    return {
                                        execution_order:
                                            message.execution_order || index,
                                        msg: {
                                            wasm: {
                                                execute: {
                                                    contract_addr:
                                                        message.target_contract_address ||
                                                        basecampContractAddress,
                                                    funds: [],
                                                    msg:
                                                        message.msg ||
                                                        // Below is a base64 encofed empty update_config message to be executed against the coucil contract, for fee estimation
                                                        'ICAgIHsKICAgICAgICAidXBkYXRlX2NvbmZpZyI6IHsKICAgICAgICAgICAgImNvbmZpZyI6IHt9CiAgICAgICAgfQogICAgfQ==',
                                                },
                                            },
                                        },
                                    }
                                }
                            ),
                        },
                    })
                ).toString('base64'),
            },
        }
        const msgs: MsgExecuteContract[] = [
            newContractMsg(
                addressProviderConfig?.mars_token_address || '',
                executeMsg
            ),
        ]
        return msgs
    }, [
        t,
        basecampContractAddress,
        amount,
        formData,
        addressProviderConfig,
        newContractMsg,
    ])

    const mountedRef = useRef(true)

    useEffect(() => {
        let isSubscribed = true
        const fetchFee = async () => {
            if (
                !addressProviderConfig?.mars_token_address ||
                !basecampConfig?.proposal_required_deposit ||
                !amount ||
                notEnoughMarsBalance
            ) {
                return
            }

            if (refreshTx) {
                setRefreshTx(false)

                const msgs = txMessage
                try {
                    const fee = estimateFee({ msgs })
                    setFee(await fee)
                } catch {
                    if (isSubscribed) {
                        setFeeError(true)
                    }
                }
            }
        }
        fetchFee()

        return () => {
            isSubscribed = false
            mountedRef.current = false
            setRefreshTx(false)
        }
    }, [
        estimateFee,
        refreshTx,
        userWalletAddress,
        basecampConfig,
        addressProviderConfig,
        amount,
        notEnoughMarsBalance,
        txMessage,
    ])

    const validateFrom = () => {
        let formDataCopy = { ...formData }
        formDataCopy.titleError = validateTitle(formData.title)
        formDataCopy.descriptionError = validateDesc(formData.description)
        formDataCopy.discussionLinkError = validateLink(formData.discussionLink)
        let errorInExecuteMsgs = false
        formDataCopy.messages.forEach((message) => {
            message.addressError = validateContractAddress(
                message.target_contract_address
            )
            message.msgError = validateContractMsg(message.msg)
            if (!!message.addressError || !!message.msgError)
                errorInExecuteMsgs = true
        })

        setFormData(formDataCopy)

        return (
            !formDataCopy.titleError &&
            !formDataCopy.descriptionError &&
            !formDataCopy.discussionLinkError &&
            !errorInExecuteMsgs
        )
    }

    const handleValidateTitle = (value: string | undefined) => {
        let validationError = validateTitle(value)

        setFormData({
            ...formData,
            titleError: validationError,
        })
    }

    const handleValidateDesc = (value: string) => {
        let validationError = validateDesc(value)

        setFormData({
            ...formData,
            descriptionError: validationError,
        })
    }

    const handleValidateLink = (value: string | undefined) => {
        let validationError = validateLink(value)

        setFormData({
            ...formData,
            discussionLinkError: validationError,
        })
    }

    const handleValidateContractAddress = (
        index: number,
        value: string | undefined
    ) => {
        let validationError = validateContractAddress(value)

        if (!!validationError) {
            let formDataCopy = { ...formData }
            formDataCopy.messages[index].addressError = validationError
            setFormData(formDataCopy)
        }
    }

    const handleValidateContractMsg = (
        index: number,
        value: string | undefined
    ) => {
        let validationError = validateContractMsg(value)

        if (!!validationError) {
            let formDataCopy = { ...formData }
            formDataCopy.messages[index].msgError = validationError
            setFormData(formDataCopy)
        }
    }

    const handleAction = async () => {
        if (
            !basecampContractAddress ||
            !addressProviderConfig?.mars_token_address ||
            !basecampConfig?.proposal_required_deposit
        ) {
            alert(t('error.errorProposal'))
            return
        }

        const formValid = validateFrom()
        if (!formValid) {
            setValidationError(t('council.warningYouHaveErrorsInYourForm'))
            return
        }

        // Set the final execution order on submit.
        formData.messages.forEach((message, index) => {
            message.execution_order = index + 1
        })

        setSubmitted(true)

        if (!fee) {
            return
        }

        const msgs = txMessage
        try {
            const { gasPrice, amount, gas } = fee

            const txOptions = {
                msgs,
                memo: '',
                gasPrices: `${gasPrice}uusd`,
                fee: new Fee(gas, {
                    uusd: amount,
                }),
                purgeQueue: true,
            }

            const postResponse = await post(txOptions)
            setResponse(postResponse)
        } catch (postError) {
            if (postError instanceof UserDenied) {
                setSubmitted(false)
                setResponse(undefined)
                setError(undefined)
            } else {
                setError(postError as PostError)
            }
        }
    }

    const reset = () => {
        setFormData({
            title: '',
            description: '',
            discussionLink: undefined,
            titleError: '',
            descriptionError: '',
            discussionLinkError: '',
            messages: [],
        })
        setFeeError(false)
        setSubmitted(false)
        setValidationError('')
        setResponse(undefined)
        setError(undefined)
    }

    const handleClose = () => {
        reset()
        history.push('/council')
    }

    const handleBack = () => {
        setSubmitted(false)
        setValidationError('')
        setResponse(undefined)
        setError(undefined)
    }

    const handleChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>
    ): void => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
            [`${e.target.name}Error`]: '',
        })
        setValidationError('')
    }

    const handleAddMessage = () => {
        const formDataCopy = { ...formData }
        const newMessage: Message = {
            execution_order: 0,
            target_contract_address: '',
            msg: '',
            addressError: '',
            msgError: '',
        }
        formDataCopy.messages.push(newMessage)
        setFormData(formDataCopy)
        setActiveMessage(formDataCopy.messages.length - 1)
        setRefreshTx(true)
    }

    const handleRemoveMessage = (event: MouseEvent, index: number) => {
        event.stopPropagation()
        const formDataCopy = { ...formData }
        formDataCopy.messages.splice(index, 1)
        setFormData(formDataCopy)
        setActiveMessage(-1)
        setValidationError('')
        setRefreshTx(true)
    }

    const handleChangeMessageAddress = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>,
        index: number
    ) => {
        const formDataCopy = { ...formData }
        formDataCopy.messages[index].target_contract_address = e.target.value
        formDataCopy.messages[index].addressError = ''
        setFormData(formDataCopy)
        setValidationError('')
    }

    const handleChangeMessageMsg = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>,
        index: number
    ) => {
        const formDataCopy = { ...formData }
        formDataCopy.messages[index].msg = e.target.value
        formDataCopy.messages[index].msgError = ''
        setFormData(formDataCopy)
        setValidationError('')
    }

    const handleSetActiveMessage = (index: number) => {
        if (activeMessage === index) {
            setActiveMessage(-1)
        } else {
            setActiveMessage(index)
        }
    }

    const txResultTitle = (
        <div
            style={{
                display: 'flex',
                width: '100%',
            }}
        >
            <div className={txResponseStyle.label}>Title</div>
            <div
                className={txResponseStyle.value}
                style={{
                    maxWidth: '300px',
                    textAlign: 'start',
                }}
            >
                {formData.title}
            </div>
        </div>
    )

    return (
        <div className={styles.cardContainer}>
            <Card>
                <div className={styles.container}>
                    {feeError ? (
                        <TxFailed
                            message={t('error.errorEstimatedFee')}
                            handleClose={handleClose}
                        />
                    ) : response || error ? (
                        <TxResponse
                            error={error}
                            response={response}
                            denom={MARS_DENOM}
                            decimals={MARS_DECIMALS}
                            amount={lookup(
                                amount,
                                MARS_DENOM,
                                MARS_DECIMALS
                            ).toString()}
                            txFee={gasFeeFormatted}
                            handleClose={handleClose}
                            handleBack={handleBack}
                            label={t('council.newProposal')}
                            exitImgSrc={'back'}
                            refetchQueries={[
                                refetchMarsBalance,
                                refetchProposals,
                            ]}
                            title={txResultTitle}
                        />
                    ) : (
                        <div>
                            <Header
                                src={'back'}
                                handleClose={handleClose}
                                titleText={t('council.submitProposal')}
                                tooltip={t('council.newProposalTooltip')}
                            />

                            <div className={styles.form}>
                                {/* Title */}
                                <div>
                                    <span
                                        className={`overline ${styles.required}`}
                                    >
                                        *
                                    </span>
                                    <label className={'overline'}>
                                        {t('council.title')}
                                    </label>
                                </div>
                                <Input
                                    handleInput={handleChange}
                                    name='title'
                                    type={'text'}
                                    value={formData.title}
                                    validate={handleValidateTitle}
                                    error={formData.titleError}
                                    maxLength={500}
                                    onEnterHandler={handleAction}
                                    focusOnRender={true}
                                />
                                {/* Description */}
                                <div>
                                    <span
                                        className={`overline ${styles.required}`}
                                    >
                                        *
                                    </span>
                                    <label className={'overline'}>
                                        {t('common.description')}
                                    </label>
                                </div>
                                <TextArea
                                    rows={4}
                                    handleInput={handleChange}
                                    name='description'
                                    value={formData.description}
                                    validate={handleValidateDesc}
                                    error={formData.descriptionError}
                                    maxLength={10000}
                                />
                                {/* Link */}
                                <label className={'overline'}>
                                    {t('council.linkToDiscussion')}
                                </label>
                                <Input
                                    handleInput={handleChange}
                                    type={'text'}
                                    name='discussionLink'
                                    value={formData.discussionLink}
                                    validate={handleValidateLink}
                                    error={formData.discussionLinkError}
                                    maxLength={500}
                                    onEnterHandler={handleAction}
                                />
                                {/* Messages */}
                                <div className={styles.messageHeader}>
                                    <label className={`sub2 ${styles.title}`}>
                                        {t('council.proposalMessage')}
                                    </label>
                                    <Button
                                        text={t('council.add')}
                                        onClick={handleAddMessage}
                                        color='tertiary'
                                    />
                                </div>
                                <div className={styles.message}>
                                    {formData.messages.map((message, index) => {
                                        return (
                                            <ProposalMessage
                                                key={index}
                                                active={activeMessage === index}
                                                id={index}
                                                targetContractAddress={
                                                    message.target_contract_address
                                                }
                                                msg={message.msg}
                                                setActive={() =>
                                                    handleSetActiveMessage(
                                                        index
                                                    )
                                                }
                                                remove={(e) =>
                                                    handleRemoveMessage(
                                                        e,
                                                        index
                                                    )
                                                }
                                                updateExecuteAddress={(e) =>
                                                    handleChangeMessageAddress(
                                                        e,
                                                        index
                                                    )
                                                }
                                                updateExecuteMsg={(e) =>
                                                    handleChangeMessageMsg(
                                                        e,
                                                        index
                                                    )
                                                }
                                                validateAddress={(value) =>
                                                    handleValidateContractAddress(
                                                        index,
                                                        value
                                                    )
                                                }
                                                validateMsg={(value) =>
                                                    handleValidateContractMsg(
                                                        index,
                                                        value
                                                    )
                                                }
                                                addressError={
                                                    message.addressError
                                                }
                                                msgError={message.msgError}
                                            />
                                        )
                                    })}
                                </div>
                                {/* Deposit Amount */}
                                <div className={styles.amountLabels}>
                                    <label className={'overline'}>
                                        {t('redbank.deposit')}
                                    </label>
                                    <label className={'overline'}>
                                        {t('council.myAssetBalance', {
                                            assetAmount: lookup(
                                                marsBallance,
                                                MARS_DENOM,
                                                MARS_DECIMALS
                                            ),
                                            assetSymbol: 'MARS',
                                        })}
                                    </label>
                                </div>
                                <div
                                    className={styles.depositAmount}
                                >{`${formatValue(
                                    lookup(amount, MARS_DENOM, MARS_DECIMALS),
                                    2,
                                    2,
                                    true,
                                    false,
                                    ' MARS'
                                )}`}</div>
                                {notEnoughMarsBalance ? (
                                    <label
                                        className={`body ${styles.marsBalanceError}`}
                                    >
                                        {t('error.errorMarsBalance')}
                                    </label>
                                ) : validationError ? (
                                    <label
                                        className={`body ${styles.marsBalanceError}`}
                                    >
                                        {validationError}
                                    </label>
                                ) : null}
                                {/* Submit Button */}
                                <div className={styles.submitControls}>
                                    <Button
                                        disabled={
                                            notEnoughMarsBalance ||
                                            refreshTx ||
                                            !!validationError ||
                                            submitted
                                        }
                                        text={t('council.submit')}
                                        onClick={handleAction}
                                        color='primary'
                                    />
                                </div>
                                {/* Tx Fee */}
                                <TxFee txFee={gasFeeFormatted} />
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default NewProposalModal

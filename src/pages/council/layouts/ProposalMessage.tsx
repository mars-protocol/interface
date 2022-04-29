import Input from '../components/Input'
import styles from './ProposalMessage.module.scss'
import { ArrowDownSVG, RubbishSVG } from '../../../components/Svg'
import { useTranslation } from 'react-i18next'
import TxLink from '../../../layouts/txmodal/TxLink'
import { FINDER_URL } from '../../../constants/appConstants'
import useStore from '../../../store'
import Button from '../../../components/Button'

interface Props {
    active: boolean
    id: number
    targetContractAddress: string
    msg: string
    setActive: () => void
    remove: (event: MouseEvent) => void
    updateExecuteAddress: (
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>
    ) => void
    updateExecuteMsg: (
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>
    ) => void
    validateAddress?: (value: string | undefined) => void
    validateMsg?: (value: string | undefined) => void
    addressError?: string
    msgError?: string
    readonly?: boolean
}

const ProposalMessage = ({
    active,
    id,
    targetContractAddress,
    msg,
    setActive,
    remove,
    updateExecuteAddress,
    updateExecuteMsg,
    validateAddress,
    validateMsg,
    addressError,
    msgError,
    readonly,
}: Props) => {
    const { t } = useTranslation()
    const chainID = useStore((s) => s.networkConfig?.chainID)
    const produceProposalMessage = () => {
        return readonly ? (
            <div
                className={`${styles.proposalMessagesContent} ${styles.readOnlyCall}`}
            >
                <div className={styles.call}>{msg}</div>
            </div>
        ) : (
            <div className={styles.proposalMessagesContent}>
                <div>
                    <span className={`overline ${styles.required}`}>*</span>
                    <label className={'overline'}>
                        {t('council.targetContractAddress')}
                    </label>
                </div>
                <Input
                    handleInput={(e) => updateExecuteAddress(e)}
                    type={'text'}
                    name='target_contract_address'
                    value={targetContractAddress}
                    validate={validateAddress}
                    error={addressError}
                />

                <div>
                    <span className={`overline ${styles.required}`}>*</span>
                    <label className={'overline'}>
                        {t('council.binarMessage')}
                    </label>
                </div>
                <Input
                    handleInput={(e) => updateExecuteMsg(e)}
                    type={'text'}
                    name='msg'
                    value={msg}
                    validate={validateMsg}
                    error={msgError}
                />
            </div>
        )
    }

    return (
        <div
            className={`${styles.proposalMessage}  ${
                readonly ? styles.readOnly : ''
            }`}
        >
            <div
                className={`${styles.proposalMessagesLabels} ${
                    active ? styles.active : ''
                } `}
                onClick={setActive}
            >
                <div
                    className={`${styles.titleContainer} ${
                        addressError || msgError ? styles.errored : null
                    } `}
                >
                    <span className={styles.downArrow}>
                        <ArrowDownSVG />
                    </span>
                    <label className={`overline ${styles.title}`}>
                        {t('council.messageId', { id: id + 1 })}
                    </label>
                </div>
                {!readonly ? (
                    <Button
                        prefix={<RubbishSVG />}
                        onClick={(e: MouseEvent) => remove(e)}
                        color='tertiary'
                        variant='round'
                    />
                ) : (
                    <div className={styles.targetContractAddress}>
                        <span className={`caption ${styles.title}`}>
                            {t('council.targetContractAddress')}
                        </span>
                        <TxLink
                            hash={targetContractAddress}
                            link={`${FINDER_URL}/${chainID}/account/${targetContractAddress}`}
                        ></TxLink>
                    </div>
                )}
            </div>
            {active ? produceProposalMessage() : null}
        </div>
    )
}

export default ProposalMessage

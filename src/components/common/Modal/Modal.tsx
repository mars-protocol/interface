import { SVG } from 'components/common/SVG/SVG'
import { ReactNode, useEffect, useRef } from 'react'

import styles from './Modal.module.scss'

interface Props {
  title: string | ReactNode
  copy?: string
  children: ReactNode
  onClose: () => void
}

export const Modal = (props: Props) => {
  const ref: React.RefObject<HTMLDialogElement> = useRef(null)

  function onClose() {
    ref.current?.close()
    props.onClose()
  }

  useEffect(() => {
    ref.current?.showModal()
    document.body.classList.add('modal-open')
  }, [])

  useEffect(() => {
    const dialog = ref.current
    return () => {
      dialog?.removeAttribute('open')
      dialog?.close()
      document.body.classList.remove('modal-open')
    }
  }, [])

  return (
    <dialog ref={ref} onCancel={onClose} className={styles.dialog}>
      <div className={styles.container}>
        <div className={styles.header}>
          {props.title}
          <button className={styles.button} onClick={props.onClose}>
            <SVG.Close />
          </button>
        </div>
        {props.copy && <div className={styles.copy}>{props.copy}</div>}
        <div className={styles.content}>{props.children}</div>
      </div>
    </dialog>
  )
}

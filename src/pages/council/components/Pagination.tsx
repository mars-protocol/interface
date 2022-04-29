import { useState } from 'react'
import { PROPOSAL_LIMIT } from '../../../constants/appConstants'
import { useProposals } from '../hooks/useProposals'
import styles from './Pagination.module.scss'

enum NavClick {
    Right,
    Left,
}

interface Props {
    handlePageClick: (pageNumber: number) => void
}

const Pagination = ({ handlePageClick }: Props) => {
    const { getInactiveProposals } = useProposals()

    const [selectedIndex, setSelectedIndex] = useState<number>(1)
    const [selectorStart, setSelectorStart] = useState<number>(0)

    // -------------------------
    // LOGIC
    // -------------------------
    const calculateNavigationElementCount = () => {
        const proposalCount = getInactiveProposals().length
        return proposalCount / PROPOSAL_LIMIT
    }

    const produceNavigationItems = (): Array<number> => {
        const elements: Array<number> = []
        let count = 0
        while (count < calculateNavigationElementCount()) {
            count += 1
            if (count > selectorStart && count <= selectorStart + 5) {
                elements.push(count)
            }
        }

        return elements
    }

    // -------------------------
    // CLICK HANDLERS
    // -------------------------
    const handleNavigationClick = (direction: NavClick) => {
        if (direction === NavClick.Right) {
            if (selectorStart + 5 < calculateNavigationElementCount()) {
                setSelectorStart(selectorStart + 5)
            }
        } else if (direction === NavClick.Left) {
            if (selectorStart - 5 > 0) {
                setSelectorStart(selectorStart - 5)
            } else {
                setSelectorStart(0)
            }
        }
    }

    // -------------------------
    // PRESENTATION
    // -------------------------
    return calculateNavigationElementCount() > 1 ? (
        <div className={styles.pagination}>
            <span
                className={`${styles.paginationButton} ${
                    selectorStart < 5 ? styles.inactive : ''
                }`}
                onClick={() => {
                    handleNavigationClick(NavClick.Left)
                }}
            >{`<`}</span>

            <nav>
                <ul className={styles.paginationGroup}>
                    {produceNavigationItems().map((index: number) => {
                        return (
                            <div
                                className={`${styles.paginationItem} ${
                                    index === selectedIndex ? styles.active : ''
                                }`}
                                key={index}
                                onClick={() => {
                                    setSelectedIndex(index)
                                    handlePageClick(index)
                                }}
                            >
                                <span>{index}</span>
                            </div>
                        )
                    })}
                </ul>
            </nav>
            <span
                className={`${styles.paginationButton} ${
                    selectorStart > calculateNavigationElementCount() - 5
                        ? styles.inactive
                        : ''
                }`}
                onClick={() => {
                    handleNavigationClick(NavClick.Right)
                }}
            >
                {`>`}
            </span>
        </div>
    ) : null
}

export default Pagination

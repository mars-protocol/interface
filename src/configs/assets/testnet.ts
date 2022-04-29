import colors from '../../styles/_assets.module.scss'

// Native asset images
import luna from '../../images/LUNA.svg'
import ust from '../../images/UST.svg'

// CW20 asset images
import mars from '../../images/MARS-COLORED.svg'
import astro from '../../images/ASTRO.png'
import anc from '../../images/ANC.svg'
import mir from '../../images/MIR.svg'
import stLuna from '../../images/STLUNA.svg'
// import mine from '../../images/MINE.svg'
// import ornb from '../../images/ORNb.svg'

const Assets: Assets = {
    luna: {
        symbol: 'LUNA',
        name: 'Terra',
        logo: luna,
        denom: 'uluna',
        maToken: 'maluna',
        color: colors.luna,
        native: true,
        decimals: 6,
        hasOraclePrice: true,
    },
    ust: {
        symbol: 'UST',
        name: 'Terra USD',
        logo: ust,
        denom: 'uusd',
        maToken: 'mausd',
        color: colors.ust,
        native: true,
        decimals: 6,
        hasOraclePrice: true,
    },
    stLuna: {
        symbol: 'stLUNA',
        name: 'Lido Staked LUNA',
        logo: stLuna,
        denom: 'stLuna',
        contract_addr: 'terra1e42d7l5z5u53n7g990ry24tltdphs9vugap8cd',
        maToken: 'mastluna',
        color: colors.stLuna,
        native: false,
        decimals: 6,
        hasOraclePrice: true,
    },
    mars: {
        symbol: 'MARS',
        name: 'Mars',
        logo: mars,
        denom: 'MARS',
        contract_addr: 'terra1qs7h830ud0a4hj72yr8f7jmlppyx7z524f7gw6',
        maToken: 'mamars',
        color: colors.mars,
        native: false,
        decimals: 6,
        hasOraclePrice: false,
    },
    astro: {
        symbol: 'ASTRO',
        name: 'Astroport',
        logo: astro,
        denom: 'ASTRO',
        contract_addr: 'terra1cc2up8erdqn2l7nz37qjgvnqy56sr38aj9vqry',
        maToken: 'maastro',
        color: colors.astro,
        native: false,
        decimals: 6,
        hasOraclePrice: false,
    },
    anc: {
        symbol: 'ANC',
        name: 'Anchor',
        logo: anc,
        denom: 'TTN',
        contract_addr: 'terra1747mad58h0w4y589y3sk84r5efqdev9q4r02pc',
        maToken: 'mattn',
        color: colors.anc,
        native: false,
        decimals: 6,
        hasOraclePrice: true,
    },
    fanc: {
        symbol: 'FANC',
        name: 'Anchor',
        logo: anc,
        denom: 'FTTN',
        contract_addr: 'terra12n6pf6rj3z86s90594d57nmmh65q4pyh502c8z',
        maToken: 'mafttn',
        color: colors.anc,
        native: false,
        decimals: 6,
        hasOraclePrice: true,
    },
    mir: {
        symbol: 'MIR',
        name: 'Mirror',
        logo: mir,
        denom: 'MIR',
        contract_addr: 'terra10llyp6v3j3her8u3ce66ragytu45kcmd9asj3u',
        maToken: 'mamir',
        color: colors.mir,
        native: false,
        decimals: 6,
        hasOraclePrice: true,
    },
    fmir: {
        symbol: 'FMIR',
        name: 'Mirror',
        logo: mir,
        denom: 'FMIR',
        contract_addr: 'terra1swlg8vmfajfw6j0ay57wpa533dywwqz9zqd7cj',
        maToken: 'mafmir',
        color: colors.mir,
        native: false,
        decimals: 6,
        hasOraclePrice: true,
    },
}

export default Assets

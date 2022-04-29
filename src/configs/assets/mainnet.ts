import colors from '../../styles/_assets.module.scss'

// Native asset images
import luna from '../../images/LUNA.svg'
import ust from '../../images/UST.svg'

// CW20 asset images
import mars from '../../images/MARS-COLORED.svg'
import astro from '../../images/ASTRO.png'
import anc from '../../images/ANC.svg'
import mir from '../../images/MIR.svg'

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
    mars: {
        symbol: 'MARS',
        name: 'Mars',
        logo: mars,
        denom: 'MARS',
        contract_addr: 'terra12hgwnpupflfpuual532wgrxu2gjp0tcagzgx4n',
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
        contract_addr: 'terra1xj49zyqrwpv5k928jwfpfy2ha668nwdgkwlrg3',
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
        denom: 'ANC',
        contract_addr: 'terra14z56l0fp2lsf86zy3hty2z47ezkhnthtr9yq76',
        maToken: 'maanc',
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
        contract_addr: 'terra15gwkyepfc6xgca5t5zefzwy42uts8l2m4g40k6',
        maToken: 'mamir',
        color: colors.mir,
        native: false,
        decimals: 6,
        hasOraclePrice: true,
    },
}

export default Assets

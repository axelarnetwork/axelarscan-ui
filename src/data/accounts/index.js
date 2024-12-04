/*
{
  address,
  name,
  image: '/logos/accounts/{image}',
  environment, // undefined for any
}
*/

const data = [
  {
    address: 'axelar1d4v2fad26kze27s9przdc6zrcyxqsj20vas39m',
    name: 'Cross-chain Faucet',
    image: '/logos/accounts/axelarnet.svg',
    environment: 'testnet',
  },
  {
    address: 'axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5',
    name: 'Axelar GMP Account',
    image: '/logos/accounts/axelarnet.svg',
  },
  {
    address: 'axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5s',
    name: 'Axelar GMP Account',
    image: '/logos/accounts/axelarnet.svg',
  },
  {
    address: '0x607113F751251267fC0E00927e524cE846AE1205',
    name: 'Sugarcane Express Relayer',
    image: '/logos/accounts/axelarnet.svg',
    environment: 'mainnet',
  },
  {
    address: '0x2eA9cC891E1f8e14E010c08bd51077BFB941b39d',
    name: 'Sugarcane Express Relayer',
    image: '/logos/accounts/axelarnet.svg',
    environment: 'testnet',
  },
  {
    address: '0xfDF36A30070ea0241d69052ea85ff44Ad0476a66',
    name: 'Interchain Gateway Governance',
    image: '/logos/accounts/axelarnet.svg',
  },
  {
    address: '0x83a93500d23Fbc3e82B410aD07A6a9F7A0670D66',
    name: 'Interchain Token Factory',
    image: '/logos/accounts/axelarnet.svg',
  },
  {
    address: '0x1f8A4d195B647647c7dD45650CBd553FD33cCAA6',
    name: 'Interchain Proposal Sender',
    image: '/logos/accounts/axelarnet.svg',
  },
  {
    address: 'axelar10d07y265gmmuvt4z0w9aw880jnsr700j7v9daj',
    name: 'Axelar Governance',
    image: '/logos/accounts/axelarnet.svg',
  },
  {
    address: 'axelar1aythygn6z5thymj6tmzfwekzh05ewg3l7d6y89',
    name: 'Axelar Gas Collector',
    image: '/logos/accounts/axelarnet.svg',
    environment: 'mainnet',
  },
  {
    address: 'axelar1zl3rxpp70lmte2xr6c4lgske2fyuj3hupcsvcd',
    name: 'Axelar Gas Collector',
    image: '/logos/accounts/axelarnet.svg',
    environment: 'testnet',
  },
  {
    address: 'axelar1ggfhcn9e8kye4susvd9d30kdw3zhcsl8gxysv3',
    name: 'Imperator: IBC Relayer',
    image: '/logos/accounts/imperator.svg',
  },
  {
    address: 'axelar19s8q4zh3jyg9h5pe3al8ahul0e4e7xp68jrpvr',
    name: 'Imperator: IBC Relayer',
    image: '/logos/accounts/imperator.svg',
    environment: 'mainnet',
  },
  {
    address: 'terra148euq27wv05cgs5s5fwt227gvzppa2ghjxrd9d',
    name: 'Imperator: IBC Relayer',
    image: '/logos/accounts/imperator.svg',
    environment: 'mainnet',
  },
  {
    address: 'cosmos1t0khldzm22mk4wvcadw789drmkzawe9ah69upp',
    name: 'Imperator: IBC Relayer',
    image: '/logos/accounts/imperator.svg',
    environment: 'mainnet',
  },
  {
    address: 'inj1wq62pg8prdg4jnz2r90za0352cdg8tu59zkjuf',
    name: 'Imperator: IBC Relayer',
    image: '/logos/accounts/imperator.svg',
    environment: 'mainnet',
  },
  {
    address: 'emoney16e702d3n4hnq8asqzlpnpvd4gj7p6f6gthpvjr',
    name: 'Imperator: IBC Relayer',
    image: '/logos/accounts/imperator.svg',
    environment: 'mainnet',
  },
  {
    address: 'cre1faj5xcmfwv9e77zl7ht7yn2e9wlk9rp87lafg0',
    name: 'Imperator: IBC Relayer',
    image: '/logos/accounts/imperator.svg',
    environment: 'mainnet',
  },
  {
    address: 'axelar1cq45k0l2jchymj9z3z0e7mstr8a3f3dgekmzmd',
    name: 'Enigma: IBC Relayer',
    image: '/logos/accounts/enigma.svg',
    environment: 'mainnet',
  },
  {
    address: 'terra10k73hutvsuu2hds9lmt6ltns78mvxgdcrzrc65',
    name: 'Enigma: IBC Relayer',
    image: '/logos/accounts/enigma.svg',
    environment: 'mainnet',
  },
  {
    address: 'cosmos1rw0n4xn4uaa42hg8eu4guequw83da5hy6dhunt',
    name: 'Enigma: IBC Relayer',
    image: '/logos/accounts/enigma.svg',
    environment: 'mainnet',
  },
  {
    address: 'osmo12uuuxy7mwlv8dgu8dg66s30lfrdlctgas0ffha',
    name: 'Enigma: IBC Relayer',
    image: '/logos/accounts/enigma.svg',
    environment: 'mainnet',
  },
  {
    address: 'juno1k36qxz8ps37845gaua2vuejyc0dzx5jwf6qrkf',
    name: 'Enigma: IBC Relayer',
    image: '/logos/accounts/enigma.svg',
    environment: 'mainnet',
  },
  {
    address: 'inj1r6ldghj8pkmzxq8d0th03862wjaazdk6kz8uru',
    name: 'Enigma: IBC Relayer',
    image: '/logos/accounts/enigma.svg',
    environment: 'mainnet',
  },
  {
    address: 'emoney1yqtdqpwu4nkudyu3tygdj59vc9mce4u7d496c4',
    name: 'Enigma: IBC Relayer',
    image: '/logos/accounts/enigma.svg',
    environment: 'mainnet',
  },
  {
    address: 'cre1k354s0qgj22k8zxqu0nlwcep607zm6m6lk7828',
    name: 'Enigma: IBC Relayer',
    image: '/logos/accounts/enigma.svg',
    environment: 'mainnet',
  },
  {
    address: 'axelar1p4zdymjq0jna478v96kjwn8glcuvkmtqwlrrf4',
    name: 'Notional: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar16dc379m0qj64g4pr4nkl7ewak52qy2srd5shys',
    name: 'Notional: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'terra1uf9m0mhy8y9lucpvd6p5hrgzm46xm8mvg9lquq',
    name: 'Notional: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1mlzgx9zsncyrhzl23w9dt6c9zphsx5h8j65fm3',
    name: '3ventures: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar19kzuzfmmy9wjr3cl0ss8wjzjup9g49hqzxn3p9',
    name: 'Cros-nest: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1l267dmlmprhu4p5aqslf50f495vjqlg3e6uve2',
    name: 'Cros-nest: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'terra19kzuzfmmy9wjr3cl0ss8wjzjup9g49hqqvlegy',
    name: 'Cros-nest: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar16vmp7sz28pnvgz6f3zm6q93y39jsd33aszn9np',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'axelar1evdjzy3w9t2yu54w4dhc2cvrlc2fvnpt5skcqe',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'bcna1evdjzy3w9t2yu54w4dhc2cvrlc2fvnpt2ws3r2',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'cosmos16vmp7sz28pnvgz6f3zm6q93y39jsd33a5v9dcq',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'ixo14uyfxlv00lj0qhcwt7vms2rsf7kxuld7t4xq70',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'juno16vmp7sz28pnvgz6f3zm6q93y39jsd33az7xklu',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'ki1evdjzy3w9t2yu54w4dhc2cvrlc2fvnptpn3l0v',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'kujira1evdjzy3w9t2yu54w4dhc2cvrlc2fvnptpkzgxj',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'kyve1evdjzy3w9t2yu54w4dhc2cvrlc2fvnpt8sdxqu',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'osmo16vmp7sz28pnvgz6f3zm6q93y39jsd33auhkawj',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'stars1evdjzy3w9t2yu54w4dhc2cvrlc2fvnptyzhdqf',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'tori14uyfxlv00lj0qhcwt7vms2rsf7kxuld7k50mpv',
    name: 'Inter Blockchain Services: IBC Relayer',
    image: '/logos/accounts/InterBlockchainServices.svg',
    environment: 'mainnet',
  },
  {
    address: 'cre1kn4tkqezr3c7zc43lsu5r4p2l2qqf4mp4lqhgt',
    name: 'Strangelove: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1z5znvgnwn295h26a88530d6kqs3sg4klagnvze',
    name: 'Comdex: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1evdjzy3w9t2yu54w4dhc2cvrlc2fvnpt5skcqe',
    name: 'Inter Blockchain Services: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1hhzf9u376mg8zcuvx3jsls7t805kzcrs99cusl',
    name: 'Synergy Nodes: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar14awanvwztk4rnspjqtukq4m5lv98umw6atjnw6',
    name: 'Qubelabs: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1ks0qeq9vyt9l7vgasaajd49ff0k8klura5027j',
    name: 'Cosmos spaces team: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1vkjtazp8x2arv8r23vtlm8zl2w258k8z40w29t',
    name: 'Evilnodes: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar18xkav82x6um8v4xpgy26ea7zqyyz0zv875g34k',
    name: 'B-Harvest: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1cr4xwgkltnp7ccgk98v9u63yl94stum8x3q3a9',
    name: 'DSRV: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1qzuuuzaeqfddnpzcl3xadka08k8dgcwcaumzxk',
    name: 'DELIGHT: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1u4he0w85dlxf65t8pn3hwjsyz5p2dz694c42kp',
    name: 'Stakin: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1fegapd4jc3ejqeg0eu3jk4hvr74hg660657v0v',
    name: 'Polkachu: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar19uavz3w7p6h0ahlyw3wkhuwtynzl902048a6x5',
    name: 'Mandragora: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1mjq48r6435aewerpruwc8up3tz3rzan2ghgl25',
    name: 'StakeLab: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1fgkvrphcnwckj2pp5hdvy5zvrc25aa0de7f99f',
    name: 'StakeRun: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1y4t6q5hg4896mz68kn2dfwv2jkcqhfzlx22jqm',
    name: 'Alkadeta: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1t6tveyjtmcf54p56yrd9x48vecu94fyfkmpnm2',
    name: 'Carbon Demex: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1jsxwpl3gwcs54se0nj86qx2n58hjztggwh204r',
    name: 'AsGuard: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar17uwjyc7e8enfdkdxslgteuff6hs5apdtfq3qnd',
    name: 'OKX Chain: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1xj04c8cx5etajpwsypmk3vej4sejqxuzxy9f72',
    name: 'AUDIT.one: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar1r7445s2hrny8p4yr707s62g4g4q90a0vxcn8wk',
    name: 'Secret team: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: 'axelar1ym3rcer9p0cehj380tdp2qfpa6ksvtcfnssv2g',
    name: 'StingRay: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: 'axelar1e2hmtt9c28tncuwrq0ct45wd0tgp5ms5zkrk8h',
    name: 'Etienne Klub Staking: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: 'axelar1jxn2v002u4utjkgd9hcr6etwsxvr06g0mk3ws7',
    name: 'nakanodo.xyz: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: 'axelar1qfmxkhhvjufjlmvhs9ccghc78hkcqw5asev87v',
    name: 'AUDIT.one: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: 'axelar1gmm70h2p4qx0yrjcawcdccjwpa6zmxd6d602vg',
    name: 'Raul BitCanna 420 Relayer: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: 'axelar17kkx87dupug844zuzrh38exyc48mrr27fvj7yf',
    name: 'DELIGHT: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: 'axelar1hhzf9u376mg8zcuvx3jsls7t805kzcrs99cusl',
    name: 'Synergy Nodes: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: 'axelar1em3kpqz32zg3dmhwt5xj5xked5m63u83h5v5m4',
    name: 'Czar: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: 'axelar10rrxectjm6sz6u2ayvrupm8drvjxvpeqpuqjcn',
    name: 'Zenscape: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: 'axelar1fegapd4jc3ejqeg0eu3jk4hvr74hg660657v0v',
    name: 'Polkachu: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: 'axelar1p4557mdpc2qk8vcemeqgrcg55gs2uyznqcp9vp',
    name: 'Cosmos Rescue: IBC Relayer',
    environment: 'mainnet',
  },
  {
    address: 'axelar16dc379m0qj64g4pr4nkl7ewak52qy2srd5shys',
    name: 'Delegate Notional: IBC Relayer',
    environment: 'testnet',
  },
  {
    address: '0x481A2AAE41cd34832dDCF5A79404538bb2c02bC8',
    name: 'Squid',
    image: '/logos/accounts/squid.svg',
    environment: 'testnet',
  },
  {
    address: '0xc3468a191fe51815b26535ed1f82c1f79e6ec37d',
    name: 'Squid',
    image: '/logos/accounts/squid.svg',
    environment: 'testnet',
  },
  {
    address: 'osmo1zl9ztmwe2wcdvv9std8xn06mdaqaqm789rutmazfh3z869zcax4sv0ctqw',
    name: 'Squid',
    image: '/logos/accounts/squid.svg',
    environment: 'testnet',
  },
  {
    address: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
    name: 'Squid',
    image: '/logos/accounts/squid.svg',
    environment: 'mainnet',
  },
  {
    address: '0xDC3D8e1Abe590BCa428a8a2FC4CfDbD1AcF57Bd9',
    name: 'Squid',
    image: '/logos/accounts/squid.svg',
    environment: 'mainnet',
  },
  {
    address: '0x492751eC3c57141deb205eC2da8bFcb410738630',
    name: 'Squid',
    image: '/logos/accounts/squid.svg',
    environment: 'mainnet',
  },
  {
    address: 'osmo15jw7xccxaxk30lf4xgag8f7aeg53pgkh74e39rv00xfnymldjaas2fk627',
    name: 'Squid',
    image: '/logos/accounts/squid.svg',
    environment: 'mainnet',
  },
  {
    address: '0x66423a1b45e14EaB8B132665FebC7Ec86BfcBF44',
    name: 'The Junkyard',
    image: '/logos/accounts/junkyard.png',
    environment: 'mainnet',
  },
  {
    address: '0x4EFE356BEDeCC817cb89B4E9b796dB8bC188DC59',
    name: 'The Junkyard',
    image: '/logos/accounts/junkyard.png',
    environment: 'mainnet',
  },
  {
    address: '0x05a8AA0ed1e1bc598C23B415F67Cd774B530546C',
    name: 'The Junkyard',
    image: '/logos/accounts/junkyard.png',
    environment: 'mainnet',
  },
  {
    address: '0xEf6D4e4c75f86962385335127dF9a12ef6953b2c',
    name: 'The Junkyard',
    image: '/logos/accounts/junkyard.png',
    environment: 'mainnet',
  },
  {
    address: '0x2E4B0F20bDb1cAa0886C531256efdaaB925dBE72',
    name: 'The Junkyard',
    image: '/logos/accounts/junkyard.png',
    environment: 'mainnet',
  },
  {
    address: '0x41FdF36Ae744c47097CE253A3CBb327640bf4fa7',
    name: 'Hibiki.finance Bridge',
    image: '/logos/accounts/hibikifinance.svg',
    environment: 'mainnet',
  },
  {
    address: '0xC19d317c84e43F93fFeBa146f4f116A6F2B04663',
    name: 'Stake DAO: Ethereum State Sender',
    image: '/logos/accounts/stakeDAO.svg',
    environment: 'mainnet',
  },
  {
    address: '0xe742141075767106FeD9F6FFA99f07f33bd66312',
    name: 'Stake DAO: Ethereum State Sender',
    image: '/logos/accounts/stakeDAO.svg',
    environment: 'mainnet',
  },
  {
    address: '0x7718602Fb061Fc2E0a20fc76261CA02D2f03e65d',
    name: 'Stake DAO: Ethereum State Sender',
    image: '/logos/accounts/stakeDAO.svg',
    environment: 'mainnet',
  },
  {
    address: '0xB8D85A5e0c5e3354d35d576818B57AEd0300dE16',
    name: 'Prime Protocol',
    image: '/logos/accounts/prime.svg',
    environment: 'mainnet',
  },
  {
    address: '0xbe54BaFC56B468d4D20D609F0Cf17fFc56b99913',
    name: 'Prime Protocol',
    image: '/logos/accounts/prime.svg',
    environment: 'mainnet',
  },
  {
    address: '0x0cD070285380cabfc3be55176928dc8A55e6d2A7',
    name: 'Prime Protocol',
    image: '/logos/accounts/prime.svg',
    environment: 'mainnet',
  },
  {
    address: '0xfb3330531E3f98671296f905cd82CC407d90CE97',
    name: 'Prime Protocol',
    image: '/logos/accounts/prime.svg',
    environment: 'mainnet',
  },
  {
    address: '0xc1248efE4CeE8e2341Bc736Fcc634067c64A55A6',
    name: 'MintDAO Bridge',
    image: '/logos/accounts/mintdao-bridge.svg',
    environment: 'mainnet',
  },
  {
    address: '0x8201ADAcd11243d1D420DddDF2778b57aEE8A36c',
    name: 'MintDAO Bridge',
    image: '/logos/accounts/mintdao-bridge.svg',
    environment: 'mainnet',
  },
  {
    address: '0xDc9B12DCe8297411d67FF4091Ac0E8574B5D5Adc',
    name: 'MintDAO Bridge',
    image: '/logos/accounts/mintdao-bridge.svg',
    environment: 'mainnet',
  },
  {
    address: '0xF3BdDcb3719Cd02F574C5837D93ebFD2E90cf31C',
    name: 'MintDAO Bridge',
    image: '/logos/accounts/mintdao-bridge.svg',
    environment: 'mainnet',
  },
  {
    address: '0x29C4dE1AF44f1a0Cae73b67646f30bF1Dd92A884',
    name: 'MintDAO Bridge',
    image: '/logos/accounts/mintdao-bridge.svg',
    environment: 'mainnet',
  },
  {
    address: '0xD0FFD6fE14b2037897Ad8cD072F6d6DE30CF8e56',
    name: 'MintDAO Bridge',
    image: '/logos/accounts/mintdao-bridge.svg',
    environment: 'mainnet',
  },
  {
    address: '0x385549FdaC3460c45D7aB2A12b416916119a93Fb',
    name: 'MintDAO Bridge',
    image: '/logos/accounts/mintdao-bridge.svg',
    environment: 'mainnet',
  },
  {
    address: 'axelar1l267dmlmprhu4p5aqslf50f495vjqlg3e6uve2',
    name: 'Crosnest IBC relayer',
    image: '/logos/accounts/crosnest.png',
    environment: 'mainnet',
  },
  {
    address: 'axelar19kzuzfmmy9wjr3cl0ss8wjzjup9g49hqzxn3p9',
    name: 'Crosnest IBC relayer',
    image: '/logos/accounts/crosnest.png',
    environment: 'mainnet',
  },
  {
    address: 'axelar14awanvwztk4rnspjqtukq4m5lv98umw6atjnw6',
    name: 'Qubelabs IBC relayer',
    image: '/logos/accounts/qubelabs.svg',
    environment: 'mainnet',
  },
  {
    address: 'evmos1w4tereqw45m2lqa3aea764la4ycnqrvvcndf0j',
    name: 'Qubelabs IBC relayer',
    image: '/logos/accounts/qubelabs.svg',
    environment: 'mainnet',
  },
  {
    address: 'agoric1yjjvxayecreq4ds4ggm08jxnzlese7smhwakle',
    name: 'Qubelabs IBC relayer',
    image: '/logos/accounts/qubelabs.svg',
    environment: 'mainnet',
  },
  {
    address: 'umee1rqaetvk3mx2cnn6guectun8a9k22mmgthhp02h',
    name: 'Qubelabs IBC relayer',
    image: '/logos/accounts/qubelabs.svg',
    environment: 'mainnet',
  },
  {
    address: 'axelar1hhzf9u376mg8zcuvx3jsls7t805kzcrs99cusl',
    name: 'SynergyNodes IBC relayer',
    image: '/logos/accounts/SynergyNodes.svg',
    environment: 'mainnet',
  },
  {
    address: 'cosmos1hhzf9u376mg8zcuvx3jsls7t805kzcrsptw5m7',
    name: 'SynergyNodes IBC relayer',
    image: '/logos/accounts/SynergyNodes.svg',
    environment: 'mainnet',
  },
  {
    address: 'persistence1hhzf9u376mg8zcuvx3jsls7t805kzcrs08g846',
    name: 'SynergyNodes IBC relayer',
    image: '/logos/accounts/SynergyNodes.svg',
    environment: 'mainnet',
  },
  {
    address: 'evmos1q3054e3nrzlkp4act9236lwgl6hncftf4sczk0',
    name: 'SynergyNodes IBC relayer',
    image: '/logos/accounts/SynergyNodes.svg',
    environment: 'mainnet',
  },
  {
    address: 'acre1q3054e3nrzlkp4act9236lwgl6hncftfdj30n2',
    name: 'SynergyNodes IBC relayer',
    image: '/logos/accounts/SynergyNodes.svg',
    environment: 'mainnet',
  },
  {
    address: 'stride1hhzf9u376mg8zcuvx3jsls7t805kzcrszqwg0j',
    name: 'SynergyNodes IBC relayer',
    image: '/logos/accounts/SynergyNodes.svg',
    environment: 'mainnet',
  },
  {
    address: 'juno1hhzf9u376mg8zcuvx3jsls7t805kzcrshed0uz',
    name: 'SynergyNodes IBC relayer',
    image: '/logos/accounts/SynergyNodes.svg',
    environment: 'mainnet',
  },
  {
    address: 'osmo1hhzf9u376mg8zcuvx3jsls7t805kzcrsfsaydv',
    name: 'SynergyNodes IBC relayer',
    image: '/logos/accounts/SynergyNodes.svg',
    environment: 'mainnet',
  },
  {
    address: 'terra1lznn08qlmpfsp5amxdshq7vc4gr5ceyeqz9sde',
    name: 'SynergyNodes IBC relayer',
    image: '/logos/accounts/SynergyNodes.svg',
    environment: 'mainnet',
  },
  {
    address: 'terra1hhzf9u376mg8zcuvx3jsls7t805kzcrs8055e7',
    name: 'SynergyNodes IBC relayer',
    image: '/logos/accounts/SynergyNodes.svg',
    environment: 'mainnet',
  },
  {
    address: 'kujira1hhzf9u376mg8zcuvx3jsls7t805kzcrssrvvk5',
    name: 'SynergyNodes IBC relayer',
    image: '/logos/accounts/SynergyNodes.svg',
    environment: 'mainnet',
  },
  {
    address: '0x273C9c5766c0c2441d778814c5d68D847c022f00',
    name: 'Archly',
    image: '/logos/accounts/archly.png',
    environment: 'mainnet',
  },
  {
    address: '0xFD7A105225433c05fE0E5851df7AF5C00b245dF8',
    name: 'Archly',
    image: '/logos/accounts/archly.png',
    environment: 'mainnet',
  },
  {
    address: '0x027d732749992c7b12D8c48a08eFCcE9Cb1288BC',
    name: 'Archly',
    image: '/logos/accounts/archly.png',
    environment: 'mainnet',
  },
  {
    address: '0xb162BF709505765605B447F9817acbF428cB86F6',
    name: 'Archly',
    image: '/logos/accounts/archly.png',
    environment: 'mainnet',
  },
  {
    address: '0x0d6cf9AF5062e20dE91480eF61E44F5C97C124D9',
    name: 'Archly',
    image: '/logos/accounts/archly.png',
    environment: 'mainnet',
  },
  {
    address: '0xbf9813FC8f99759A77D877F812ff065D2070F1cC',
    name: 'Archly',
    image: '/logos/accounts/archly.png',
    environment: 'mainnet',
  },
  {
    address: '0x523073f029C889242beBFbB7eE3BDaB52942a39A',
    name: 'Archly',
    image: '/logos/accounts/archly.png',
    environment: 'mainnet',
  },
  {
    address: '0x877fe019d5320bc5A1ab6d72f05D13ba8A651350',
    name: 'Archly',
    image: '/logos/accounts/archly.png',
    environment: 'mainnet',
  },
  {
    address: '0x0808CC60D8E6c130c2133e4b3B499ba0D0B1aB88',
    name: 'Archly',
    image: '/logos/accounts/archly.png',
    environment: 'mainnet',
  },
  {
    address: 'axelar16ml47kyg4we30xeqze3jnyr3yuy06czfyfut2g',
    name: 'Skyskipper',
    environment: 'testnet',
  },
  {
    address: '0x791b648AA3Bd21964417690C635040F40ce974a5',
    name: 'Insrt: Perpetual Mints',
    image: '/logos/accounts/insrt.png',
    environment: 'mainnet',
  },
  {
    address: '0xEf97C7394F71851880A7868D21df3A9dF24FAfC7',
    name: 'Insrt: $MINT',
    image: '/logos/accounts/insrt.png',
    environment: 'mainnet',
  },
  {
    address: '0xAf753cc76156Ab0f2C9f316049Cc3df267f78e1a',
    name: 'eesee.io: AssetHub',
    image: '/logos/accounts/eesee.png',
    environment: 'mainnet',
  },
  {
    address: '0xb62339c4CCda62c920C75bCC5FD43f07431dfdE4',
    name: 'eesee.io: AssetSpoke',
    image: '/logos/accounts/eesee.png',
    environment: 'mainnet',
  },
  {
    address: '0x4690C5B0EB109219Bb27E660b17099fEb870F4bD',
    name: 'eesee.io: AssetSpoke',
    image: '/logos/accounts/eesee.png',
    environment: 'mainnet',
  },
  {
    address: '0xEac19c899098951fc6d0e6a7832b090474E2C292',
    name: 'eesee.io: AssetHub',
    image: '/logos/accounts/eesee.png',
    environment: 'mainnet',
  },
  {
    address: '0x50C43F95ca9F6b363ea92a0Af7404e30822a728f',
    name: 'eesee.io: AssetSpoke',
    image: '/logos/accounts/eesee.png',
    environment: 'mainnet',
  },
  {
    address: '0xd122A08920f8096D7294f3a449A69bFc83396e0B',
    name: 'eesee.io: AssetSpoke',
    image: '/logos/accounts/eesee.png',
    environment: 'mainnet',
  },
  {
    address: 'osmo1emhzj4a8c0423mcgkmrkfuu6xxa2xt9ndmhaq0l3heef35m7jfwq7378lu',
    name: 'Skip',
    image: '/logos/accounts/skip.svg',
  },
  {
    address: 'neutron1emhzj4a8c0423mcgkmrkfuu6xxa2xt9ndmhaq0l3heef35m7jfwq2rhmke',
    name: 'Skip',
    image: '/logos/accounts/skip.svg',
    environment: 'mainnet',
  },
  {
    address: 'neutron18jgzyha8r25ltxn6u5ng9zajwflhnwzzunlnfunyktjfpextuqfqyjre7j',
    name: 'Skip',
    image: '/logos/accounts/skip.svg',
    environment: 'testnet',
  },
  {
    address: '0x4fa7900db5d23e85986e03b8d175a1bd9877ebe5',
    name: 'EXR Passport',
    image: '/logos/accounts/exr.png',
    environment: 'mainnet',
  },
  {
    address: '0x08c8690024BfBA91a1A4c578a6918F8b8e64c005',
    name: 'EXR Race Data Controller',
    image: '/logos/accounts/exr.png',
    environment: 'mainnet',
  },
  {
    address: '0xd98e1313e826340bb1cc127b22fe2b4509cc9cc3',
    name: 'EXR MultiPass',
    image: '/logos/accounts/exr.png',
    environment: 'mainnet',
  },
  {
    address: '0x723aead29acee7e9281c32d11ea4ed0070c41b13',
    name: 'Lido wstETH: AxelarTransceiver',
    image: '/logos/accounts/lido.svg',
    environment: 'mainnet',
  },
  {
    address: '0xaa8267908e8d2BEfeB601f88A7Cf3ec148039423',
    name: 'Lido wstETH: AxelarTransceiver',
    image: '/logos/accounts/lido.svg',
    environment: 'testnet',
  },
  {
    address: '0x19247618D79E3fc4d4866169789E4B8eEDef52E6',
    name: 'ChasmAI',
    image: '/logos/accounts/chasm.svg',
    environment: 'mainnet',
  },
  {
    address: '0xcbBA104B6CB4960a70E5dfc48E76C536A1f19609',
    name: 'Nya Bridge',
    image: '/logos/accounts/nya.png',
    environment: 'mainnet',
  },
  {
    address: '0x3A455607Def92819a2c541fAA4525522905A7c2C',
    name: 'Nya NFT Bridge',
    image: '/logos/accounts/nya.png',
    environment: 'mainnet',
  },
  {address:'axelar1y2a43qhk7clgy0aa8fuul8746mqed379kv84u6',name:'0base.vc',environment:'testnet'},
  {address:'axelar1afj2uhx69pjclgcspfufj9dq9x87zfv0avf6we',name:'4SV',environment:'testnet'},
  {address:'axelar1lg0d9rt4syalck9ux0hhmeeayq7njmjjdguxd6',name:'AlexZ',environment:'testnet'},
  {address:'axelar1ed7zk4g6rmlph6z00p6swky65qyldxrpxw9759',name:'AutoStake',environment:'testnet'},
  {address:'axelar12umz2ds9gvtnkkmcwhukl7lm5asxjc9533dkj8',name:'B-Harvest',environment:'testnet'},
  {address:'axelar16dxsfhyegy40e4eqfxee5jw5gyy2xxtcw4t2na',name:'Bokoblinet',environment:'testnet'},
  {address:'axelar1aeylef34xqhrxn4mf8hpl94cya0rww9ld3ymep',name:'Brightlystake',environment:'testnet'},
  {address:'axelar189twvmrax309e7hvke0zjgn5p55avy5ukafhc2',name:'BwareLabs',environment:'testnet'},
  {address:'axelar1wkvh8zavznfcmsapdzxxuf2pntvktf8vzkknwa',name:'Chainlayer',environment:'testnet'},
  {address:'axelar1xt9eevxhcmrx90gc06n87em5dz4nw6v3nvxs7d',name:'Chainode Tech',environment:'testnet'},
  {address:'axelar19xvkln5jypz8k0x9sq66mmzawkshqxfvl9h5y8',name:'ContributionDAO',environment:'testnet'},
  {address:'axelar14eh260ptse8qsk80ztmeyua9qklhccyv62h9yw',name:'Cosmostation',environment:'testnet'},
  {address:'axelar1u37w5l93vx8uts5eazm8w489h9q22k026dklaq',name:'DSRV',environment:'testnet'},
  {address:'axelar1gc40fw08ee4vamhvtgcszladfsrd8tyhc75l3j',name:'Encapsulate',environment:'testnet'},
  {address:'axelar19l32d5nhhwnwemzfd788j4ld095a3n6k05mmry',name:'Enigma',environment:'testnet'},
  {address:'axelar1lpseq7mscuag7j9yehxmgdxh6k4ehe4hgfvfgw',name:'Figment',environment:'testnet'},
  {address:'axelar1yf58f0xkgu65stqlgf99nhmqfuzc84w2qme92m',name:'Imperator',environment:'testnet'},
  {address:'axelar1l65q24tc9e8z4dj8wj6g7t08reztazf5ur6ux2',name:'Inter Blockchain Services',environment:'testnet'},
  {address:'axelar1awmhk4xhzh3224ydnrwxthpkz00tf7d5hw5kzk',name:'LunaNova',environment:'testnet'},
  {address:'axelar1y5dkjhyeuqmkhq42wydaxvjt8j00d86t4xnjsu',name:'Node.monster',environment:'testnet'},
  {address:'axelar1pcdufjvqegu5dfqr7w4ltlfjvnpf403gt5h99n',name:'Nodiums',environment:'testnet'},
  {address:'axelar1melmdxuzk5mzs252kvykcjw2vyrqmqnke0mdyx',name:'P-OPS Team',environment:'testnet'},
  {address:'axelar1zqnwrhv35cyf65u0059a8rvw8njtqeqjckzhlx',name:'Polkachu',environment:'testnet'},
  {address:'axelar1ejv5td70estc7ed4avnxnqqv4tpef2zafdkgms',name:'Quantnode',environment:'testnet'},
  {address:'axelar12uqmh4qkax6ct0dr67c0ffurplwhrv7h5t9x42',name:'Qubelabs',environment:'testnet'},
  {address:'axelar1avayd50dt4mneu6s2s03yuwlc0swwmmzvf7f9f',name:'Redbooker',environment:'testnet'},
  {address:'axelar1verw7xy2cwhwhq6c3df0alyfxr2pl7jgy7pv5e',name:'Rockaway Infra',environment:'testnet'},
  {address:'axelar16rfnanrns0u2cxm06ugvxej438y0gktzv9hwcl',name:'Squid',environment:'testnet'},
  {address:'axelar1j3u6kd4027wln9vnvmg449hmc3xj2m2g5uh69q',name:'Stakin',environment:'testnet'},
  {address:'axelar1j9w5c54z5erz2awtkmztfqlues9d329x5fqps0',name:'Validatrium',environment:'testnet'},
  {address:'axelar1wue2mm6xqk52wpynuqjlzwwux4kp3dkva5dpzw',name:'Whispernode',environment:'testnet'},
  {address:'axelar16ulxkme882pcwpp43rtmz7cxn95x9cqalmas5h',name:'0base.vc',environment:'mainnet'},
  {address:'axelar1t23g23u5pcuh9y2stzesf4cx5z3jr66zykkffm',name:'4SV',environment:'mainnet'},
  {address:'axelar1qgwu4jjgeapqm82w4nslhwlzxa3mjd8fvn4xdx',name:'AlexZ',environment:'mainnet'},
  {address:'axelar1x9qfct58w0yxecmc294k0z39j8fqpa6nzhwwas',name:'AutoStake',environment:'mainnet'},
  {address:'axelar104jgwmkat4xn2800r6yd44djjhgw2ejrjvqkaj',name:'B-Harvest',environment:'mainnet'},
  {address:'axelar15jgwuakp87hjr0z24f5dhurhas6hdy9h64jfrc',name:'Bokoblinet',environment:'mainnet'},
  {address:'axelar1zhazt54ewqhva5pujhfyhr7sf39hm7myatmjtd',name:'Brightlystake',environment:'mainnet'},
  {address:'axelar19f26mhy2x488my9pc6wr5x74t4gde8l8scq34g',name:'BlockHunters',environment:'mainnet'},
  {address:'axelar18mrzfgk63sv455c84gx0p70kl2e329gxnsmgsu',name:'Chainlayer',environment:'mainnet'},
  {address:'axelar1nrk5wk4446342lgcdpjllen4ydc2f2c35h9ynf',name:'Chainode Tech',environment:'mainnet'},
  {address:'axelar1dqqeuwvpvn2dr7gw7clayshzdemgu7j9cluehl',name:'ContributionDAO',environment:'mainnet'},
  {address:'axelar16g3c4z0dx3qcplhqfln92p20mkqdj9cr0wyrsh',name:'Cosmostation',environment:'mainnet'},
  {address:'axelar1lkg5zs5zgywc0ua9mpd9d63gdnl3ka9n07r5fg',name:'DSRV',environment:'mainnet'},
  {address:'axelar1nppclnu328tgvxyvu0fmd6yder3r9mrrgusrj3',name:'Encapsulate',environment:'mainnet'},
  {address:'axelar1hm3qzhevpsfpkxnwz89j9eu6fy8lf36sl6nsd8',name:'Enigma',environment:'mainnet'},
  {address:'axelar1wuckkey0xug0547lr3pwnuag79zpns5xt49j9a',name:'Figment',environment:'mainnet'},
  {address:'axelar1k22ud8g8k7dqx4u5a77gklf6f6exth0u474vt2',name:'Imperator',environment:'mainnet'},
  {address:'axelar1s2cf963rm0u6kxgker95dh5urmq0utqq3rezdn',name:'Inter Blockchain Services',environment:'mainnet'},
  {address:'axelar1d8xyrpwpqgp9m2xuaa8gwhgraqvq8y5unv924h',name:'LunaNova',environment:'mainnet'},
  {address:'axelar1kaeq00sgqvy65sngedc8dqwxerqzsg2xf7e72z',name:'Node.monster',environment:'mainnet'},
  {address:'axelar1ym6xeu9xc8gfu5vh40a0httefxe63j537x5rle',name:'Nodiums',environment:'mainnet'},
  {address:'axelar1uu6hl8uvkxjzwpuacaxwvh7ph3qjyragk62n2e',name:'P-OPS Team',environment:'mainnet'},
  {address:'axelar1zqnwrhv35cyf65u0059a8rvw8njtqeqjckzhlx',name:'Polkachu',environment:'mainnet'},
  {address:'axelar1ejv5td70estc7ed4avnxnqqv4tpef2zafdkgms',name:'Quantnode',environment:'mainnet'},
  {address:'axelar1up6evve8slwnflmx0x096klxqh4ufaahsk9y0s',name:'Qubelabs',environment:'mainnet'},
  {address:'axelar1kr5f2wrq9l2denmvfqfky7f8rd07wk9kygxjak',name:'Redbooker',environment:'mainnet'},
  {address:'axelar1x0a0ylzsjrr57v2ymnsl0d770nt3pwktet9npg',name:'Rockaway Infra',environment:'mainnet'},
  {address:'axelar1mpp7huuq45qfv0585wej7h76nk545e2jkrxpez',name:'Squid',environment:'mainnet'},
  {address:'axelar15k8d4hqgytdxmcx3lhph2qagvt0r7683cchglj',name:'Stakin',environment:'mainnet'},
  {address:'axelar1eu4zvmhum66mz7sd82sfnp6w2vfqj06gd4t8f5',name:'Validatrium',environment:'mainnet'},
  {address:'axelar1ensvyl4p5gkdmjcezgjd5se5ykxmdqagl67xgm',name:'Whispernode',environment:'mainnet'},
  {address:'axelar1p0z7ff4wru5yq0v2ny5h6vx5e6ceg06kqnhfpg',name:'Axelar',environment:'mainnet'},
]

export default data

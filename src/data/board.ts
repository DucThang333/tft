import type { Trait, BoardChampion, TrayChampion } from '../types'

export const synergies: Trait[] = [
  { name: 'Arcanist', icon: 'auto_awesome', current: 4, max: 6, active: true, color: 'tertiary' },
  { name: 'Warden', icon: 'shield', current: 2, max: 2, active: true, color: 'primary' },
  { name: 'Behemoth', icon: 'pets', current: 1, max: 2, active: false, color: 'default' },
]

export const boardChampions: BoardChampion[] = [
  {
    id: 'sylas',
    name: 'SYLAS',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQCZwtH5kc3rb6ToYncO1lx3FS3O3BC5jINu3d_BkU0FaeoCU1wxZwJL7BsrbwicgCr1VyUewOqBvSS7jUK1Sz9hyoDupkHBdXf7Suh3p3uhb9gx-ubfTi1NuWagX7GW_UWdZOZLs5HiDXbn7l9edfjf992KRGyWzglL-OBSfbjxW7pP8zJXd8KCKLNrSVbEBpckmZcoOnfE8bgg44-b9JF-tslnmu5gJSjWCNfGf3g8lGDrsSQJNaldndiwqBrp30ddDKWf-SNv42',
    imageAlt: 'futuristic cyber warrior champion with glowing purple visor',
    row: 0,
    col: 1,
  },
  {
    id: 'morgana',
    name: 'MORGANA',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmY3R_12kVQjKf6At163zZTGjENqxSFFIDr2EbtVDfybXS0-UOeO9gIxzzxq-xk60qmYMwUtAv-Ce2beXYRMXtO6kursn-L0uRzXY3w8fwFYGcvwIisb5pSUR3iA01-Mvseb7lr3EHl6xyguEWjoIby-qdZ85l0oBJEqHPCIbrhG9KwvcmZKZVBZQHx86a9btQaDj-FELzfjrBg1RkopLwFnoADR7x-2ZRQJiXP0kboGTGavm7bTRhzUM_GZkltqD2R4z2RQORqarB',
    imageAlt: 'fantasy sorceress character portrait with magical cosmic energy',
    row: 1,
    col: 2,
  },
  {
    id: 'galio',
    name: 'GALIO',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASL4YxHLe2mUCJmxq5co2vIEuHWbpr9DPEqMduOtrMDMZtUU1guE33oA1ssutethFv0LwWitqIAN_-i9m4bgWR-XAQrs3bDV8jOYXGNP8zmcPn-yTwnke0PGyE0ZqThahjSpQNjEldLXLOdyRRFGAUNwwYhShijOTBgVuPcy8JwAsn2UXZCzIUda10rmI9B6xDSchtiSgSGyNIKpELNHHWsS1_SWGd4bGtpl4gxqr_R8_dHxYikOOjrOmW9u2P3OBEA-153k3mC_QJ',
    imageAlt: 'mystical ancient treant guardian spirit with glowing runes',
    row: 2,
    col: 5,
    highlighted: true,
  },
]

export const trayChampions: TrayChampion[] = [
  {
    id: 'aurelion-sol',
    name: 'Aurelion Sol',
    cost: 5,
    traits: ['Mythic', 'Invoker'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhWjlFD5Rw7Q8flvncPoWXTxsNKi17tmETVpU2ea-zhMRacErRpB7MSazs9u1XQnDGQUU1KBUifdezNoH-Ra-J762AnUbrkURqco-WjjDeCCqvafZ2NvQEeTwMf2MEv8v2HnEcIRylKJ5G7RiZlL97x5COCh6HHMrJ-zP-JRCzNFUYiILnp8N3uXXDqQaSued-p15GGOmKV5j5hvhxe6DB-9FUEjuL8QEC0igXPSrr59Tr926MpDh7FSsTvBaftALKr5psB_TrQU5o',
    imageAlt: 'epic portrait of a celestial dragon warrior',
    tierColor: 'text-tertiary',
  },
  {
    id: 'kaisa',
    name: "Kai'Sa",
    cost: 4,
    traits: ['Inkshadow', 'Sniper'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5u84Ghjm4cDYilp8_Uh3YBNHutvKOedrVt4590viUMHb-Li_xhNyYA-6OxA5T3MrKqJzbUG4BV4p9hmJEFMlUNAcdP8LioyCbaqRqagYOLJbxjE1zyUVatA9ISPN2pFEnUrAm2sorzyLHZjmaZQIBLIY-wSxh17EWcRYUACh1rwn4qpNTslGYDx7myVQJkbnjOBu-RWeBVQEGJKA3iT33tQJi5VglznZeT4b59VOK_IyStbM3XT2Fm-j1g-sFG1Pa1VqPcWuNyTPe',
    imageAlt: 'mysterious purple assassin character with twin daggers',
    tierColor: 'text-primary',
  },
  {
    id: 'amumu',
    name: 'Amumu',
    cost: 3,
    traits: ['Porcelain', 'Warden'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKS0o0fTCTzt_knC_69Wdiyj-kK8-lhK1eQcSHEISfGmfkgaMKrQcneXGys37ZyS9Zsvv-nE7O3BYk17RAN7cQEA5IEIOmm7RGTH3Wjv1TihLH1MhXTJyy7hyuR8ZC3K6zm6i2DxRVSvPkbDZbqyoeC6P8p48DktaYpUUR5YUEw5dSh9CPvZAzCPnTWvPcv8PsPMWxiISmXEZwi6X4oGIO_lfm-Otn6CGccNXd-AxlrDaZU5_k5YqHK0X1mzO1K6rMvg6TAXmoVIpi',
    imageAlt: 'valiant knight with shimmering blue aura and massive shield',
    tierColor: 'text-blue-400',
  },
  {
    id: 'neeko',
    name: 'Neeko',
    cost: 2,
    traits: ['Mythic', 'Arcanist'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLxGodtYnVAKDX2ZMRN_PTB2o6fiQV3c35BxxRzQSrMMRbmGJY3gD3t8yoLBSSWwsnlPYBEbOEX9HWD79cjBvpabWdWsYSnHq2F-qZ4-O3nNeC0XfhpW2I1qbr8zWL4SyteAPnWAJXJeCYYXntkmElN_ev0clEN6yyJcaAfnowMlme3CC4_QSmQQRyahSU_HUXl3mCVA4DKslKSuvKDbhtB-WAU9F5lF8l6AGkANdgCuwIaqogrqPIlPzOLu6Z3xBUsPS30rt6iE-v',
    imageAlt: 'earthy forest creature with leafy armor',
    tierColor: 'text-green-500',
  },
  {
    id: 'khazix',
    name: "Kha'Zix",
    cost: 1,
    traits: ['Heavenly', 'Reaper'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-QtTECOylfry_DP0IsAiznnUVryn9GrP6PpdLlJch1HI-Fo88ITn-FhCocq6Xn5LpQWeNwM4tVLt1VW51Gxrlj21AAAXcxS4tX4zK_21xIh-8z7T-tUUAJNDiBuOoRZLZ8-Gyp7I278LUNhxDn2OnoxwuI8JYjHC-ikbAvpUF49XcZK8Xpy2UjcNAmw66O5rStMeSjJn2S4m32zWbcj5F4021pHWYGVG311iOJjIGZ4XjRHTh0iflcXzmJk79nEvnsQz8S1ucRAM2',
    imageAlt: 'grumpy little yordle engineer with messy hair',
    tierColor: 'text-gray-400',
  },
]

export const boardItems = [
  { id: 'item-1', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxhWkNeoifYQnxAuIhNFBgFiAvrVuWHYpJmZdpiUl2AT16E03OgaygeyvOMZVfMMkKX-ufAh6-_ug6TbdrXurGZt48l9qAF94Kd5T2RwbvcOzilqyfa6yqXVTzGqU8L9cI_4ibPZCFVo-ft0PC0XKTRedQFHGO-JXPpyuvl8wWplmR9B37VWWeru9EEEqzv3tOJNDVSxy5RjzMBlxxWWTmPuwQPrHIulnPk1jxzg3ro3gTlkQguNrGB5pI1eekTtzUdZvOpQyZWrwv', alt: 'glowing magical sword icon' },
  { id: 'item-2', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvCUqT77RYenRxioqWaHZi0xg500wjJbImkY0Osi2xXVMFsm-EuZAhPRbgdwwDM7bJkiKnjgxZJsPM3YFvIoi9UzwIbSquoKCrWZfQtw3AGZt9QPak4u7P0UL0dBCcwXX6nC33b00w2O-ETkoO2ApeckLtspj3Cn-xcCsaEwbmanNbEewGpkT8FB_z_9Bq_7UjZBYpEhGMy304Vs6W4leTV4yLNkPGp2XSSYyWe0-jVGzHc_9a1omZgVHLXCohD0imBsfIvvhceigx', alt: 'ornate golden plate armor icon' },
  { id: 'item-3', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-8TLIZ0U01UvJNoG0IObW5W8hdpjT7llsszKnVU2cRXr370xlf4oC923YGx8bogU2Hr1h4BIbyMPljrS6pdxl6MDOfVc3CV1G5v158zeLjw7PoBL2AKlVu_di1nOl477sOFXFCeR1tQLAI6w4W_WD3aj5xO2eMyFHa8OeL6ZhobVrg0g-Svgz_P0dSlqPp4KqrbPdxOs5wqNWyPZOMUPWN1fQ3rNwcH2nxJt_3kdKpboITiC6HfGbhIOo7YCjSuFMSw3JonDLZPtF', alt: 'ethereal staff icon with purple lightning' },
]

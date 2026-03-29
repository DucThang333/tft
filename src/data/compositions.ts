import type { Composition } from '../types'

export const compositions: Composition[] = [
  {
    id: 'arcane-sentinel',
    name: 'Arcane Sentinel',
    tier: 'S',
    traits: [
      { name: 'Arcanist', count: 6 },
      { name: 'Warden', count: 2 },
    ],
    champions: [
      {
        name: 'Ryze',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpqPDIHx2AHHLaQjk0KpYETDCKXYcrgCT3epe4_5caD07iCMaKl3byMsY3Wrg2Z8reL0ZOBr4z1_DAPqtyfEkX8c1F1gUEQrfaZPjbweRT4wjSYTGfDYp68j4HGw8n9znGO_Uq82CjeVfe2z6kMxLbdaL3BClMUhvoRsoUhq-wd4Q9wFmPGeSq-IbdV7INfSUtwmGnKP63mXX6adkzuxfvxtsgYWrauGJQcYKx2wh-LrUlptnoycTnQbo85tVri6MPL1wStI8au8BZ',
        imageAlt: 'legendary warrior champion with glowing energy',
        items: ['shield_with_heart', 'bolt'],
      },
      {
        name: 'Lulu',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaOHkq4TbVdCApnAQCau87wuKOVL_assvCUvL2WQfbFSJBaMYFU35-1ybIt_b2nm5EX8z2VrkMSh-ZHWCWLKtBE7kkewiXBVVhLZNJ45rfGD0q9Y9oqe4ClW2Xr1yhzFEVvJrYiT1x9zFO5ARd32L-YVTaRlh99rROmhakL9qMdZtIM4HWekmQ7I_8edcrgqwqPYbQSi4xImLRgWuy_kgEVKUuvOc_q4HlL6VR8acReAocl7tH4z-rIfn8qQgkqxbz9TZ4finYTUi4',
        imageAlt: 'a powerful mage champion casting a shimmering indigo spell',
      },
      {
        name: 'Galio',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASn1yuF6uG-tCKPQqiZy3k3k-H-uhlJrr6p3-j1xfdQ_OBeQrvT3U7TXaZkw8h9h3SKtnMRDhRsyIFRJi0ywnOwbBu_dvn0hPlnWbeZKCAOkWmZlt-2JzfBTZB4E7Q-kUghrXBKjDq46VGZa6yOqvhbEOWRJuyrgmDNPzDXrLW4VwAYs_5ahrgbUz-IxR_LUdUFNsmOmeMFaQCTHI7IIMJgiGls4yjSAAcQ7qp0eaR4XjPUdNVA_zHmsnQcCtXSC4u7cFSNnovYG9U',
        imageAlt: 'a heavy armored tank champion with a massive glowing shield',
      },
      {
        name: 'Shen',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2JCk8S3URperKO3kuCFXNWSOmfCeS6m9jxs2Y9rKfk9BqglmMcX6YXh1dpS85vzkRIPrUMb5rA52ULG5vPOV_7Td5Z5wqW-HcUAUvIKeyI7krEaDPjx5JJXnXNwVEy4HOwTQQ7mW8Vyiu8T_zn_JHmyT2aHQl9d884i7dCx_Rc6JUrlanY44F_KsIJAUL8tCkpvxCCnyhT4I0S4Csv6T2DxtwYk2OYGJOZssogJjqlhcX5WyYehhHVstiCBft8jsPqTwobX0uiQhX',
        imageAlt: 'a fast ninja champion with dual glowing daggers',
      },
      {
        name: 'Morgana',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr7BEAE7weI8ydxfeHoA5-vmhEeEH6bOq6TVyVY1YSP4ZKW4NCVqrn5wWEQP_2yKYUkhZYWPSpZx3_1l7Ejt12JqurAKzZks3CRVbyDV_fARx7O777GAx1QcTtm3zUjMnCekLjelXggUyZI__lmCyb_gUFOgxde2coVJJ1JEfoOjwlEu6STOHiLNYGHo5eYiIP-ZZ9EBLanVQnyoVlP1NGiQAf9J7-yf9NyQKqAu-dARm4mhcN8caSHduYKTjkVUyoFao2yn9zRR18',
        imageAlt: 'a dark sorceress champion with violet energy flames',
      },
    ],
    winRate: 56.2,
    top4Rate: 68,
    difficulty: 2,
    strategy: 'Fast 8 to stabilize Ryze 2, prioritize Blue Buff & Archangel\'s Staff.',
    performanceCurve: [30, 45, 70, 85, 100],
    backgroundImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgHOjG2Feb4EGzkh3meWSoRO61Ov7fMFqCv3U6TTiTDlBuCCoRlNJZ_bae9B4YqNLosAcuTz5H_A2wyrxVe5BPhwIHn2EL2vq2CuWw_BQJHV2koi9LW_ENsvi4ORAaqWfWOOw8RrugHHoLWvLDuJTEf0rCRZxEw8sImZ7H7hya4xv6SpEI8cZVIHtt4Kd9gsm-Zrtdkq2Z4IwCJ6BE58uSVNP42bgAjEVg8ZYJNetwgBX7EVvRthtBdZ5ehcEe8bQXW5Yxk5ifriHu',
    backgroundImageAlt: 'cinematic portrait of a celestial champion with glowing purple eyes',
  },
  {
    id: 'spectral-hunter',
    name: 'Spectral Hunter',
    tier: 'A',
    traits: [
      { name: 'Ghost', count: 4 },
      { name: 'Sniper', count: 2 },
    ],
    champions: [
      {
        name: 'Hecarim',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCytxYJeVVC-jMxRdWs8iPXU6ZIkV7pcdphT7Bp9rFInNlj6Q7zyuLXferxpQG_qvwqgB0tnoaNNIFzb7YCUmgIMeCNRgxsaCJrm1Y2f60T9P1UQVxWH3NEmIk1zDMHUWfN_hve33_vYCwF4ch7KBIe5eHA5k8JvXqjIlDPiUqGqEBHb38Yi0207tcGk_0F98qbZyy8jBJgth_decog3Pud9vCAU200tMy3QUzTTQvO7Mu6QWdx_FS6NDAdy1I-gQaW2rbnGJUSESYm',
        imageAlt: 'ghost hunter champion with ethereal green energy eyes',
      },
      {
        name: 'Ashe',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo9G5qGuPPnKc6HCQCVz8qGDQASkxH4hm1YQcIbDpGHsCdhAkJBthY0T7um71RouYIc6vGJw_E3Gv5vTVoT4F-Klsu5udUCk-FVFHRhnbLoDr4Jc0fssOR7lrwpy4ajxlNkPDUnFQoKUkQfwItL0D-3uje-PBUkbO60eErUU9bgJBbKULWJpVlc_C26pxH5l7CQw5MUXzVu8jG_JLWN5WI50yz5pTbyFjqnwAmDQrTjqWtQduVmv2Vr9qgox8RfEtiaHUtVbpoR7_E',
        imageAlt: 'archer champion with a long glowing bow',
      },
    ],
    winRate: 52.4,
    top4Rate: 58,
    difficulty: 1,
    performanceCurve: [40, 55, 65, 70, 75],
  },
  {
    id: 'fated-behemoth',
    name: 'Fated Behemoth',
    tier: 'A',
    traits: [
      { name: 'Fated', count: 5 },
      { name: 'Behemoth', count: 4 },
    ],
    champions: [
      {
        name: 'Ornn',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaLXUJgeotLL1itniN6TMmR9zaBT_0GIdN_gPLk6pyrIPh0hC4pE7UUIhdJZAzMy6YRtHyf3pxBIyuPBePoF4sUHglN7DQSWXtDs5-x93ZXDSZvVdvbfxl8zWOHvn4b8rQ1KL65t7E3HzJPP7exRWVhzhY0w1KyiKaMwmQty39LD4wGX915YSNgPDGe1WxZdG7XZ7rvpGT9qAUGx4DvU7XGAGQKue5B0bVvDlvRhnF7CIL6Vq9O5HgrVK9WrhGYvlvsKjn2vz0C1zY',
        imageAlt: 'heavy armored tank champion with a massive glowing shield',
      },
      {
        name: 'Thresh',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgT1S1mWC49Zl4TBq79N7PyZuhXTVQ1Ks4eVQ79XK7FFH_X-Ku7bit6WfHks6IWg7x9jQqI2TLHb7uUo3R4tV9DGCXR33bTrFRa58wLuCAkMSHr3wXFJeab-nqRFnECFvdX741aPX05SaPTqksAVyHGU2SrSjXxSgIhDlN8xLTXnszFYn9_dCCFV3tSzAx9TOfRE4ulCkuumduKfEIGU1zhdvrckHQ6bhdn-5i3sSOk8eF8SWlWnpRy4J2qjac8oEgeGEiJqVhWcT',
        imageAlt: 'cinematic portrait of a celestial ethereal champion',
      },
    ],
    winRate: 49.8,
    top4Rate: 54,
    difficulty: 3,
    performanceCurve: [20, 35, 50, 75, 90],
  },
]

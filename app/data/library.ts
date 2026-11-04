// 栏目文案与路由集中在这里；真实内容会在后续步骤加入。
export const books = [
  {
    slug: 'resume',
    title: '简历',
    english: 'ABOUT ME',
    subtitle: '经历与热爱',
    description: '关于我，和一路走来的足迹。',
    color: 'forest',
    number: '01',
    note: '这一页，留给自我介绍。之后会在这里放上个人经历、技能与作品。',
  },
  {
    slug: 'blog',
    title: '博客',
    english: 'THOUGHTS & NOTES',
    subtitle: '思考有迹可循',
    description: '把学到的、想到的，认真写下来。',
    color: 'wine',
    number: '02',
    note: '这一页，留给值得记录的思考。之后会在这里加入文章列表与阅读页面。',
  },
  {
    slug: 'novels',
    title: '小说',
    english: 'OTHER WORLDS',
    subtitle: '在文字里远行',
    description: '去另一个世界，过另一种人生。',
    color: 'indigo',
    number: '03',
    note: '这一页，留给尚未展开的故事。之后会在这里加入作品目录与章节阅读。',
  },
  {
    slug: 'journal',
    title: '日志',
    english: 'DAY BY DAY',
    subtitle: '收集平常日子',
    description: '一些日常，一些不想忘记的瞬间。',
    color: 'linen',
    number: '04',
    note: '这一页，留给生活中的细小片段。之后会在这里加入按时间排列的日常记录。',
  },
] as const

export type LibraryBook = (typeof books)[number]

// 从上到下：逐层加宽的正面阶梯书架。
export const shelfTiers = [
  { books: [books[0]], decoration: 'left' },
  { books: [books[1], books[3]], decoration: 'right' },
  { books: [books[2]], decoration: 'both' },
] as const

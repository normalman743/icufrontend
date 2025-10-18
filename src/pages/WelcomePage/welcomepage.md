情况介绍 我们做了一个 ai助手 叫做icu里面有几个功能

1. 模型选择 star starplus starcode 按照任务类型难度选择
2. 知识库 star的知识来源于三个方面 cuhk专有知识库+ 互联网知识 + 你的私人定制化知识库 还有临时上次的文件
2.1 cuhk专有知识库（目前有树洞+部分cuhk求生指南的知识+部分我们收集到的可能有用的知识）
2.2 star可以在回答前搜索互联网
2.3 我们按照cuhk学生的情况 分为 sem course folder file ：folder 包括 lec tut lab exam assignment 符合中文大学人的习惯 可以上传file
2.4 临时上次的文件 我们支持下面的 pdf doc 编程文件 / image
3 未来可能支持
3.1 提醒 作业ddl提醒 考试ddl复习提醒 meeting提醒等
3.2 任何你认为可以帮助cuhk学生的功能
4 support us
4.1 funding
4.2 join us

const navItems = [
  { id: 'hero', label: '首页' },
  { id: 'why-icu', label: '为什么ICU' },      // 比较      让user选择模型 和对话例子 然后对比回答   后面写
一句话  icu/star are {} that knows cu knows you 然后写 star can be even better with your 个人专属知识
模型包括少一点 就主流模型吧 最多4个 你讲讲 # todo

star 有三个版本 star/plus和code


  { id: 'cuhk-exclusive', label: 'CUHK专属' }, // 这里是课程系统 还有目前只有cuhk可以参与注册
#需要一点细节
  { id: 'how', label: '工作原理' },            // 就画图 知识来源什么的 我们之后来做
  { id: 'join', label: '加入我们' },           // 行动召唤 给钱/给人力
       登陆注册 之前做好了
];
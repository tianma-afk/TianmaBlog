// Public identity policy: display **博 (only the last given-name character), mask phone, and show email in full.
// Full name and phone stay in .private/resume/identity.json for local PDF export.
// Facts from the supplied Word resume and the user's project updates.
// Project wording expands the supplied work; no unprovided metrics or responsibilities are added.
export const resume = {
  name: '**博',
  role: '大模型应用开发工程师',
  phone: '151****8912',
  email: "1265207834@qq.com",
  github: 'tianma-afk',
  school: '华南理工大学',
  degree: '28届 · 软件工程',
  academicStanding: '19%',
  politicalStatus: '共青团员',
  skills: [
    '掌握 FastAPI、LangChain、Python，熟练掌握Context Engineering、智能体开发。',
    '具备良好的问题拆解和沟通协作能力，关注模块流程设计和代码可维护性。',
    '善于运用 AI 工具提升开发效能，注重代码质量与文档规范。',
  ],
  projects: [
    {
      name: 'TableRecognition',
      description: '基于多智能体的表格解析算法服务',
      role: '核心贡献者',
      techs: [
        { name: 'Ollama', icon: '/images/tech/ollama.svg', monochrome: true },
        { name: 'FastAPI', icon: '/images/tech/fastapi.svg' },
        { name: 'Docker', icon: '/images/tech/docker.svg' },
        { name: 'Python', icon: '/images/tech/python.svg' },
        { name: 'OpenCV', icon: '/images/tech/opencv.svg' },
        { name: 'NumPy', icon: '/images/tech/numpy.svg' },
      ],
      points: [
        '面对多文件多表任务，采用配置并发参数、流水线处理的方法，提高了表格的解析效率。',
        '编写完整测试用例，覆盖表格解析的各个环节，确保算法服务的稳定性和可靠性。',
        '将复杂表格解析拆分为多个阶段，采用 Multi-Agent 协作，把一次性解析转化为分阶段处理流程；围绕各阶段目标组织输入与上下文，让智能体分别完成对应子任务，降低单次模型调用的任务复杂度，使 9B 小模型也能逐步解析较复杂的表格格式，兼顾模型能力边界与实际解析需求。',
      ],
    },
    {
      name: 'Carwin',
      description: '3D智慧教育平台',
      role: '核心贡献者',
      techs: [
        { name: 'Electron', icon: '/images/tech/electron.svg' },
        { name: 'Three.js', icon: '/images/tech/threejs.svg', monochrome: true },
        { name: 'React', icon: '/images/tech/react.svg' },
        { name: 'FastAPI', icon: '/images/tech/fastapi.svg' },
        { name: 'TypeScript', icon: '/images/tech/typescript.svg' },
        { name: 'Vite', icon: '/images/tech/vite.svg' },
      ],
      points: [
        '面向 3D 智慧教育，使用 Electron、Three.js、React 等技术栈开发 3D 教育平台，支持 3D 模型展示、交互与动画。',
        '整合EdgeTTS、Whisper.cpp等语音服务，提供语音交互、智能问答等功能。',
        '通过 Function Calling 将平台功能接口接入 LLM，根据用户的自然语言指令选择并调用对应功能，把对话中的操作意图转化为平台内的实际交互；结合已有的 3D 展示、模型交互与语音能力，串联“用户指令—智能体调用—平台执行”的链路，让问答与平台操作在同一流程中衔接。',
      ],
    },
    {
      name: 'DesignOfExpert',
      description: '实验设计智能助手',
      role: '项目开发者',
      techs: [
        { name: 'LangChain', icon: '/images/tech/langchain.svg', monochrome: true },
        { name: 'FastAPI', icon: '/images/tech/fastapi.svg' },
        { name: 'Vue', icon: '/images/tech/vue.svg' },
        { name: 'Git', icon: '/images/tech/git.svg' },
        { name: '飞书', icon: '/images/tech/feishu.png' },
      ],
      points: [
        '面向仿真实验设计，通过 AI 对话流衔接想定解析、因子推荐、实验设计、结果分析与实验报告生成流程。',
        '使用Github和飞书进行版本控制和协作，提交Pull Request进行代码审查，确保代码质量和团队协作效率。',
        '负责实验报告生成模块，与各模块负责人对齐数据需求，获取实验流程中的数据并解析为报告所需格式；按照配置模板组织输入材料，调用 LLM 服务生成实验报告，将数据整理与报告生成衔接起来，使分散在不同模块中的实验数据能够按模板要求汇总，完成从实验数据到报告内容的生成流程。',
      ],
    },
  ],
  certificates: ['CET-4、CET-6', '华南理工大学 2025 年度校级三等奖学金'],
} as const

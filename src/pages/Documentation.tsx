import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Layout, GitBranch, Activity, Layers, FileCode, Zap, TestTube, Database, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const MermaidDiagram = ({ diagram, title }: { diagram: string; title?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const loadMermaid = async () => {
      try {
        const mermaid = (window as any).mermaid;
        if (mermaid && containerRef.current) {
          containerRef.current.innerHTML = '';
          mermaid.initialize({ startOnLoad: false, theme: 'default' });
          const { svg } = await mermaid.render(`diagram-${Date.now()}`, diagram);
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid error:', error);
      }
    };
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.onload = loadMermaid;
    document.head.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [diagram]);

  return (
    <Card className="mb-6">
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div ref={containerRef} className="overflow-x-auto bg-white dark:bg-gray-900 p-4 rounded-lg" />
      </CardContent>
    </Card>
  );
};

const diagrams = {
  systemArchitecture: {
    title: '系统架构图',
    diagram: `graph TB
    subgraph "Frontend Layer"
        A[React 应用入口]
        B[React Router 路由]
        C[React 组件]
        D[UI 组件库]
    end

    subgraph "State Layer"
        E[Zustand 状态管理]
        F[LocalStorage 持久化]
    end

    subgraph "Data Layer"
        G[题目数据]
        H[专题数据]
        I[用户进度数据]
    end

    subgraph "Service Layer"
        J[问题服务]
        K[工具函数]
    end

    subgraph "Test Layer"
        L[Vitest 单元测试]
        M[Playwright E2E 测试]
    end

    A --> B
    A --> C
    C --> D
    C --> E
    E --> F
    E --> G
    E --> H
    E --> I
    C --> J
    J --> G
    J --> K
    G --> L
    H --> L
    K --> L
    C --> M`
  },
  moduleRelations: {
    title: '模块关系图',
    diagram: `graph LR
    subgraph "Pages"
        P1[Home 首页]
        P2[Topic 专题页]
        P3[Quiz 刷题页]
        P4[Results 成绩页]
    end

    subgraph "Components"
        C1[QuestionCard 题目卡片]
        C2[ProgressCard 进度卡片]
        C3[Empty 空状态]
        subgraph "UI Components"
            U1[Button]
            U2[Card]
            U3[Badge]
            U4[Progress]
            U5[Tabs]
        end
    end

    subgraph "Hooks"
        H1[useQuestion]
        H2[useTheme]
    end

    subgraph "Services"
        S1[QuestionService]
    end

    subgraph "Store"
        St1[Zustand Store]
    end

    subgraph "Data"
        D1[questions.ts]
        D2[topics.ts]
    end

    P1 --> C2
    P1 --> U2
    P1 --> U3
    P2 --> C1
    P2 --> U2
    P3 --> C1
    P3 --> U1
    P3 --> U2
    P4 --> C2
    P4 --> U2
    P4 --> U4
    
    C1 --> U2
    C1 --> U3
    C2 --> U4
    U2 --> U1
    
    P1 --> H2
    P2 --> H1
    P3 --> H1
    
    H1 --> S1
    S1 --> D1
    S1 --> D2
    H1 --> St1
    P1 --> St1
    P2 --> St1
    P3 --> St1
    P4 --> St1`
  },
  dataFlow: {
    title: '数据流程图',
    diagram: `flowchart TD
    A[用户访问] --> B[App 初始化]
    B --> C[加载 Store]
    C --> D{LocalStorage 有数据?}
    D -->|是| E[读取用户进度]
    D -->|否| F[创建空进度]
    E --> G[显示首页]
    F --> G
    
    G --> H[选择专题]
    H --> I[Topic 页面]
    I --> J{点击题目}
    J -->|是| K[进入 Quiz 页面]
    J -->|否| I
    
    K --> L[显示题目]
    L --> M[选择选项]
    M --> N[提交答案]
    N --> O[计算结果]
    O --> P[更新 Store]
    P --> Q[保存到 LocalStorage]
    Q --> R[显示解析]
    
    R --> S{继续?}
    S -->|是| T[下一题]
    S -->|否| U[查看成绩]
    T --> L
    U --> V[Results 页面]
    V --> W[返回首页]
    W --> G`
  },
  quizSequence: {
    title: '刷题流程时序图',
    diagram: `sequenceDiagram
    participant User as 用户
    participant Home as Home 页面
    participant Topic as Topic 页面
    participant Quiz as Quiz 页面
    participant Store as Zustand Store
    participant LS as LocalStorage
    
    User->>Home: 打开网站
    Home->>Store: 初始化状态
    Store->>LS: 读取进度数据
    LS-->>Store: 返回进度
    Store-->>Home: 更新状态
    
    User->>Home: 点击专题卡片
    Home->>Topic: 跳转到专题页
    Topic->>Store: 获取题目列表
    Store-->>Topic: 返回题目
    
    User->>Topic: 点击开始刷题
    Topic->>Quiz: 跳转到刷题页
    Quiz->>Store: 获取当前题目
    Store-->>Quiz: 返回题目
    
    User->>Quiz: 选择选项
    User->>Quiz: 提交答案
    Quiz->>Store: 更新答题状态
    Store->>LS: 保存进度
    Quiz->>Quiz: 显示解析
    
    User->>Quiz: 点击下一题
    Quiz->>Store: 获取下一题
    Store-->>Quiz: 返回题目`
  },
  stateManagement: {
    title: '状态管理图',
    diagram: `stateDiagram-v2
    [*] --> 初始化
    
    state 初始化 {
        [*] --> 加载进度
        加载进度 --> 加载题目
        加载题目 --> 就绪
    }
    
    state 就绪 {
        [*] --> 首页
        首页 --> 专题页
        专题页 --> 首页
        专题页 --> 刷题页
        刷题页 --> 专题页
        刷题页 --> 成绩页
        成绩页 --> 首页
        成绩页 --> 专题页
    }
    
    state 刷题页 {
        [*] --> 未答题
        未答题 --> 已答题 : 选择选项
        已答题 --> 看解析 : 提交答案
        看解析 --> 未答题 : 下一题
        看解析 --> [*] : 结束刷题
    }`
  },
  componentTree: {
    title: '组件层级图',
    diagram: `graph TB
    A[App] --> B[RouterProvider]
    B --> C[createBrowserRouter]
    
    C --> D[Home 首页]
    C --> E[Topic 专题页]
    C --> F[Quiz 刷题页]
    C --> G[Results 成绩页]
    
    D --> D1[ProgressCard]
    D --> D2[Card]
    D --> D3[Badge]
    
    E --> E1[QuestionCard]
    E --> E2[Card]
    E --> E3[Button]
    
    F --> F1[QuestionCard]
    F --> F2[Card]
    F --> F3[Button]
    F --> F4[Badge]
    F --> F5[Progress]
    
    G --> G1[ProgressCard]
    G --> G2[Card]
    G --> G3[Progress]
    
    subgraph "UI Components"
        D2
        D3
        E2
        E3
        F2
        F3
        F4
        F5
        G2
        G3
    end`
  },
  deployment: {
    title: '部署架构图',
    diagram: `graph TB
    subgraph "Development"
        A[本地开发]
        B[Vite Dev Server]
        A --> B
    end
    
    subgraph "Build"
        C[TypeScript 检查]
        D[Vite 构建]
        E[代码压缩]
        F[资源优化]
        C --> D
        D --> E
        E --> F
    end
    
    subgraph "Production"
        G[静态文件托管]
        H[CDN 分发]
        I[浏览器]
        G --> H
        H --> I
    end
    
    B -->|构建| C
    F -->|部署| G`
  },
  performance: {
    title: '性能优化策略',
    diagram: `graph LR
    A[性能优化] --> B[代码分割]
    A --> C[懒加载]
    A --> D[虚拟滚动]
    A --> E[缓存策略]
    A --> F[构建优化]
    
    B --> B1[路由级别分割]
    B --> B2[组件级别分割]
    
    C --> C1[React.lazy]
    C --> C2[Suspense]
    
    E --> E1[LocalStorage]
    E --> E2[内存缓存]
    
    F --> F1[Tree Shaking]
    F --> F2[代码压缩]
    F --> F3[Source Maps]`
  }
};

const techStack = [
  { name: 'React', version: '^18.3.1', desc: '用户界面库', reason: '组件化、生态丰富、性能优秀' },
  { name: 'TypeScript', version: '^5.2.2', desc: '类型安全', reason: '类型检查、IDE 支持、可维护性' },
  { name: 'Vite', version: '^6.4.0', desc: '构建工具', reason: '极快的启动速度、热更新、优化构建' },
  { name: 'Tailwind CSS', version: '^3.4.17', desc: 'CSS 框架', reason: '原子化 CSS、快速开发、设计系统' },
  { name: 'Zustand', version: '^5.0.3', desc: '状态管理', reason: '轻量、简单、无 Boilerplate' },
  { name: 'React Router', version: '^7.5.3', desc: '路由管理', reason: '声明式路由、嵌套路由、导航 Hooks' }
];

const Documentation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('architecture');

  const sections = [
    { id: 'architecture', label: '系统架构', icon: Layout },
    { id: 'modules', label: '模块关系', icon: Layers },
    { id: 'techstack', label: '技术栈', icon: FileCode },
    { id: 'flow', label: '数据流程', icon: GitBranch },
    { id: 'sequence', label: '时序图', icon: Activity },
    { id: 'state', label: '状态管理', icon: Database },
    { id: 'components', label: '组件层级', icon: Layers },
    { id: 'performance', label: '性能优化', icon: Zap },
    { id: 'testing', label: '测试策略', icon: TestTube },
    { id: 'deployment', label: '部署架构', icon: Play }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <aside className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden"
        )}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">技术文档</h1>
            </div>
            
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                      activeTab === section.id
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">CPA 刷题网站</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  完整的技术架构和系统设计文档
                </p>
              </div>
              <Badge className="text-sm bg-blue-600 hover:bg-blue-700">v1.0.0</Badge>
            </div>
          </header>

          <div className="p-8 max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 bg-transparent h-auto p-0">
                {sections.slice(0, 5).map((section) => {
                  const Icon = section.icon;
                  return (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg"
                    >
                      <Icon size={14} className="mr-1" />
                      <span className="hidden lg:inline">{section.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="architecture" className="space-y-6">
                <div className="grid gap-6">
                  <MermaidDiagram
                    title={diagrams.systemArchitecture.title}
                    diagram={diagrams.systemArchitecture.diagram}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>架构说明</CardTitle>
                      <CardDescription>
                        系统采用分层架构设计，各层职责清晰，便于维护和扩展
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">前端层</h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          负责用户界面渲染和交互，使用 React 组件化开发
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">状态层</h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          使用 Zustand 管理全局状态，LocalStorage 持久化用户进度
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">数据层</h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          包含 5100+ 道题目数据和 6 个专题数据
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="modules" className="space-y-6">
                <MermaidDiagram
                  title={diagrams.moduleRelations.title}
                  diagram={diagrams.moduleRelations.diagram}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>模块说明</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">页面层</h4>
                      <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Home - 首页，专题选择和统计</li>
                        <li>• Topic - 专题页，题目列表</li>
                        <li>• Quiz - 刷题页，答题界面</li>
                        <li>• Results - 成绩页，结果展示</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">组件层</h4>
                      <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• QuestionCard - 题目卡片</li>
                        <li>• ProgressCard - 进度卡片</li>
                        <li>• UI Components - 基础组件</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="techstack" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {techStack.map((tech) => (
                    <Card key={tech.name}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{tech.name}</CardTitle>
                          <Badge variant="secondary">{tech.version}</Badge>
                        </div>
                        <CardDescription>{tech.desc}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {tech.reason}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="flow" className="space-y-6">
                <MermaidDiagram
                  title={diagrams.dataFlow.title}
                  diagram={diagrams.dataFlow.diagram}
                />
              </TabsContent>

              <TabsContent value="sequence" className="space-y-6">
                <MermaidDiagram
                  title={diagrams.quizSequence.title}
                  diagram={diagrams.quizSequence.diagram}
                />
              </TabsContent>

              <TabsContent value="state" className="space-y-6">
                <MermaidDiagram
                  title={diagrams.stateManagement.title}
                  diagram={diagrams.stateManagement.diagram}
                />
              </TabsContent>

              <TabsContent value="components" className="space-y-6">
                <MermaidDiagram
                  title={diagrams.componentTree.title}
                  diagram={diagrams.componentTree.diagram}
                />
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <MermaidDiagram
                  title={diagrams.performance.title}
                  diagram={diagrams.performance.diagram}
                />
              </TabsContent>

              <TabsContent value="testing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>测试金字塔策略</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                        单元测试 (Vitest)
                      </h4>
                      <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• 工具函数测试</li>
                        <li>• 服务层测试</li>
                        <li>• Hooks 测试</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                        E2E 测试 (Playwright)
                      </h4>
                      <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• 用户流程测试</li>
                        <li>• 完整路径测试</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deployment" className="space-y-6">
                <MermaidDiagram
                  title={diagrams.deployment.title}
                  diagram={diagrams.deployment.diagram}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Documentation;
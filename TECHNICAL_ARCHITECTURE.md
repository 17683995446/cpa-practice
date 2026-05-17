# CPA 刷题网站 - 技术架构文档

## 目录

- [系统架构图](#系统架构图)
- [技术栈说明](#技术栈说明)
- [模块关系图](#模块关系图)
- [数据流程图](#数据流程图)
- [用户流程时序图](#用户流程时序图)
- [状态管理图](#状态管理图)
- [组件层级图](#组件层级图)
- [部署架构](#部署架构)

---

## 系统架构图

```mermaid
graph TB
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
    C --> M
```

---

## 技术栈说明

### 核心技术

| 技术 | 版本 | 用途 | 为什么选择 |
|------|------|------|-----------|
| **React** | ^18.3.1 | 用户界面库 | 组件化、生态丰富、性能优秀 |
| **TypeScript** | ^5.2.2 | 类型安全 | 类型检查、IDE 支持、可维护性 |
| **Vite** | ^6.4.0 | 构建工具 | 极快的启动速度、热更新、优化构建 |
| **Tailwind CSS** | ^3.4.17 | CSS 框架 | 原子化 CSS、快速开发、设计系统 |
| **Zustand** | ^5.0.3 | 状态管理 | 轻量、简单、无 Boilerplate |
| **React Router** | ^7.5.3 | 路由管理 | 声明式路由、嵌套路由、导航 Hooks |

### 开发工具

| 工具 | 用途 |
|------|------|
| **Vitest** | 单元测试 |
| **Playwright** | E2E 测试 |
| **ESLint** | 代码检查 |
| **PostCSS** | CSS 处理 |

### 图标库

| 库 | 用途 |
|----|------|
| **Lucide React** | 开源图标 |

---

## 模块关系图

```mermaid
graph LR
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
    P4 --> St1
```

---

## 数据流程图

```mermaid
flowchart TD
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
    W --> G
```

---

## 用户流程时序图

### 完整刷题流程

```mermaid
sequenceDiagram
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
    Store-->>Quiz: 返回题目
```

### 状态更新流程

```mermaid
sequenceDiagram
    participant Component as 组件
    participant Hook as useQuestion Hook
    participant Store as Zustand Store
    participant Service as QuestionService
    participant Data as 数据文件
    
    Component->>Hook: 调用 Hook
    Hook->>Store: 读取状态
    Store-->>Hook: 返回状态
    Hook-->>Component: 返回数据
    
    Component->>Hook: 触发操作
    Hook->>Store: dispatch action
    Store->>Service: 调用服务
    Service->>Data: 读取数据
    Data-->>Service: 返回数据
    Service-->>Store: 返回结果
    Store->>Store: 更新状态
    Store-->>Hook: 通知更新
    Hook-->>Component: 重新渲染
```

---

## 状态管理图

```mermaid
stateDiagram-v2
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
    }
```

---

## 组件层级图

### App 组件树

```mermaid
graph TB
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
    end
```

### QuestionCard 组件内部

```mermaid
graph TB
    A[QuestionCard] --> B[Card]
    B --> C[CardHeader]
    B --> D[CardContent]
    B --> E[CardFooter]
    
    C --> C1[Badge - 难度]
    C --> C2[Badge - 年份]
    
    D --> D1[题目内容]
    D --> D2[选项列表]
    
    D2 --> D2a[Option A]
    D2 --> D2b[Option B]
    D2 --> D2c[Option C]
    D2 --> D2d[Option D]
    
    E --> E1[解析面板]
    E1 --> E1a[正确答案]
    E1 --> E1b[详细解析]
    E1 --> E1c[记忆技巧]
```

---

## 文件结构树

```
/workspace/
├── src/
│   ├── components/
│   │   ├── ui/                    # UI 基础组件
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── progress.tsx
│   │   │   └── tabs.tsx
│   │   ├── Empty.tsx             # 空状态组件
│   │   ├── progress-card.tsx     # 进度卡片
│   │   └── question-card.tsx     # 题目卡片
│   ├── data/
│   │   ├── questions.ts          # 5100+ 题目数据
│   │   └── topics.ts             # 专题数据
│   ├── hooks/
│   │   ├── use-question.ts       # 题目 Hook
│   │   └── useTheme.ts           # 主题 Hook
│   ├── lib/
│   │   ├── utils.test.ts         # 工具函数测试
│   │   └── utils.ts              # 工具函数
│   ├── pages/
│   │   ├── Home.tsx              # 首页
│   │   ├── Quiz.tsx              # 刷题页
│   │   ├── Results.tsx           # 成绩页
│   │   └── Topic.tsx             # 专题页
│   ├── services/
│   │   ├── question-service.test.ts  # 服务测试
│   │   └── question-service.ts       # 题目服务
│   ├── test/
│   │   └── setup.ts              # 测试设置
│   ├── App.tsx                   # 应用入口
│   ├── main.tsx                  # React 入口
│   ├── store.ts                  # Zustand Store
│   ├── types.ts                  # TypeScript 类型
│   ├── index.css                 # 全局样式
│   └── vite-env.d.ts
├── public/
│   └── favicon.svg
├── .trae/
│   └── documents/
│       ├── arch.md
│       └── prd.md
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 部署架构

```mermaid
graph TB
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
    F -->|部署| G
```

---

## 性能优化策略

```mermaid
graph LR
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
    F --> F3[Source Maps]
```

---

## 测试覆盖策略

```mermaid
graph TB
    subgraph "Test Pyramid"
        A[E2E 测试<br/>Playwright]
        B[集成测试]
        C[单元测试<br/>Vitest]
    end
    
    C --> C1[工具函数]
    C --> C2[服务层]
    C --> C3[Hooks]
    
    B --> B1[组件交互]
    B --> B2[状态管理]
    
    A --> A1[用户流程]
    A --> A2[完整路径]
```

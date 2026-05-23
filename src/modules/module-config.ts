export interface ModuleConfig {
  name: string;
  version: string;
  dependencies: string[];
  exports: string[];
}

export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  core: {
    name: '@cpa/core',
    version: '1.0.0',
    dependencies: [],
    exports: ['QuizStore', 'types', 'utils']
  },
  questions: {
    name: '@cpa/questions',
    version: '1.0.0',
    dependencies: ['core'],
    exports: ['QuestionService', 'QuestionRepository']
  },
  progress: {
    name: '@cpa/progress',
    version: '1.0.0',
    dependencies: ['core', 'questions'],
    exports: ['ProgressService', 'ProgressCalculator']
  },
  ui: {
    name: '@cpa/ui',
    version: '1.0.0',
    dependencies: ['core', 'questions', 'progress'],
    exports: ['QuizCard', 'ProgressBar', 'TopicList']
  },
  storage: {
    name: '@cpa/storage',
    version: '1.0.0',
    dependencies: ['core'],
    exports: ['LocalStorageAdapter', 'PersistenceService']
  }
};

export type ModuleName = keyof typeof MODULE_CONFIGS;

export function getModuleDependencies(moduleName: ModuleName): string[] {
  return MODULE_CONFIGS[moduleName].dependencies;
}

export function getModuleExports(moduleName: ModuleName): string[] {
  return MODULE_CONFIGS[moduleName].exports;
}


import { Topic } from '@/types';

export const topics: Topic[] = [
  {
    id: 'accounting',
    name: '会计',
    description: 'CPA会计科目，包含财务会计、成本会计、管理会计等内容',
    questionCount: 900,
    icon: '📊'
  },
  {
    id: 'audit',
    name: '审计',
    description: 'CPA审计科目，包含审计原理、审计程序、审计报告等内容',
    questionCount: 850,
    icon: '🔍'
  },
  {
    id: 'finance',
    name: '财务成本管理',
    description: 'CPA财务成本管理科目，包含财务管理、成本计算、管理会计等',
    questionCount: 850,
    icon: '💰'
  },
  {
    id: 'strategy',
    name: '公司战略与风险管理',
    description: 'CPA战略科目，包含战略分析、战略选择、风险管理等',
    questionCount: 800,
    icon: '🎯'
  },
  {
    id: 'economic',
    name: '经济法',
    description: 'CPA经济法科目，包含民法、商法、经济法等法律法规',
    questionCount: 850,
    icon: '⚖️'
  },
  {
    id: 'tax',
    name: '税法',
    description: 'CPA税法科目，包含增值税、企业所得税、个人所得税等税种',
    questionCount: 850,
    icon: '📝'
  }
];

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { cn, formatNumber, calculateAccuracy } from '@/lib/utils'

interface ProgressCardProps {
  title: string
  completed: number
  total: number
  correct?: number
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning'
}

export function ProgressCard({
  title,
  completed,
  total,
  correct,
  icon,
  variant = 'default',
}: ProgressCardProps) {
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const accuracy = correct !== undefined ? calculateAccuracy(correct, completed) : null
  
  const getProgressColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-600'
    }
  }
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-white">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        {icon && <div className="text-gray-500">{icon}</div>}
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(completed)}
              <span className="text-lg text-gray-500 font-normal ml-1">
                / {formatNumber(total)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {progressPercentage}%
            </div>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className={cn('h-2', getProgressColor())}
          />
          
          {accuracy !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">正确率</span>
              <span className={cn(
                'font-semibold',
                accuracy >= 80 ? 'text-green-600' :
                accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {accuracy}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

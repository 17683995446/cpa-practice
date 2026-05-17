import React, { useState } from 'react'
import { CheckCircle2, XCircle, Star } from 'lucide-react'
import { Question } from '@/types'
import { Card, CardContent, CardHeader, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'
import { getDifficultyColor, getDifficultyText } from '@/lib/utils'

interface QuestionCardProps {
  question: Question
  userAnswer?: number | null
  showExplanation?: boolean
  onAnswer?: (answer: number) => void
  onToggleWrong?: (isWrong: boolean) => void
  onToggleFavourite?: (isFavourite: boolean) => void
  isWrong?: boolean
  isFavourite?: boolean
}

export function QuestionCard({
  question,
  userAnswer,
  showExplanation = false,
  onAnswer,
  onToggleWrong,
  onToggleFavourite,
  isWrong = false,
  isFavourite = false,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(userAnswer ?? null)
  const hasSubmitted = showExplanation || userAnswer !== null

  const handleOptionSelect = (index: number) => {
    if (!hasSubmitted) {
      setSelectedOption(index)
      if (onAnswer) {
        onAnswer(index)
      }
    }
  }

  const isCorrect = selectedOption === question.correctAnswer

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary" 
              className={cn(
                'px-3 py-1 text-sm font-medium',
                getDifficultyColor(question.difficulty)
              )}
            >
              {getDifficultyText(question.difficulty)}
            </Badge>
            {question.year && (
              <Badge variant="outline" className="px-3 py-1 text-sm">
                {question.year}年
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {onToggleWrong && (
              <Button
                variant={isWrong ? 'destructive' : 'outline'}
                size="icon"
                onClick={() => onToggleWrong(!isWrong)}
                className="h-9 w-9"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
            {onToggleFavourite && (
              <Button
                variant={isFavourite ? 'default' : 'outline'}
                size="icon"
                onClick={() => onToggleFavourite(!isFavourite)}
                className={cn(
                  'h-9 w-9',
                  isFavourite && 'bg-yellow-500 hover:bg-yellow-600'
                )}
              >
                <Star className={cn('h-4 w-4', isFavourite && 'fill-current')} />
              </Button>
            )}
          </div>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 leading-relaxed">
          {question.content}
        </h3>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index
            const isCorrectOption = index === question.correctAnswer
            
            let optionStyle = 'border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            
            if (hasSubmitted) {
              if (isCorrectOption) {
                optionStyle = 'border-2 border-green-500 bg-green-50'
              } else if (isSelected) {
                optionStyle = 'border-2 border-red-500 bg-red-50'
              } else {
                optionStyle = 'border border-gray-200 bg-gray-50 opacity-60'
              }
            } else if (isSelected) {
              optionStyle = 'border-2 border-blue-500 bg-blue-50'
            }
            
            const iconClass = hasSubmitted
              ? (isCorrectOption
                  ? 'border-green-500 bg-green-500 text-white'
                  : isSelected
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-gray-300 bg-gray-100 text-gray-500')
              : (isSelected
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700')
            
            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={hasSubmitted}
                className={cn(
                  'w-full p-4 rounded-xl text-left transition-all duration-200 flex items-start gap-4',
                  optionStyle,
                  !hasSubmitted && 'cursor-pointer hover:shadow-sm'
                )}
              >
                <div className={cn(
                  'mt-0.5 h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold border-2',
                  iconClass
                )}>
                  {hasSubmitted ? (
                    isCorrectOption ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isSelected ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <span className={cn(
                    'text-base leading-relaxed',
                    hasSubmitted && isCorrectOption
                      ? 'text-green-800 font-semibold'
                      : hasSubmitted && isSelected
                      ? 'text-red-800 font-semibold'
                      : 'text-gray-700'
                  )}>
                    {option}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
      
      {hasSubmitted && (
        <CardFooter className="border-t bg-gray-50 p-6 flex-col gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">答案解析</h4>
            <div className="bg-white rounded-lg p-4 text-gray-700 leading-relaxed border border-gray-100">
              {question.explanation}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">记忆技巧</h4>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-yellow-800 leading-relaxed">
              {question.memoryTip}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

import { Stage } from '../App';
import { Calendar, CheckCircle, ListChecks } from 'lucide-react';

interface RoadmapStageProps {
  stage: Stage;
  index: number;
  isEditMode: boolean;
}

export function RoadmapStage({ stage, index, isEditMode }: RoadmapStageProps) {

  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600'
  ];

  const bgColors = [
    'bg-blue-50 border-blue-200',
    'bg-purple-50 border-purple-200',
    'bg-pink-50 border-pink-200',
    'bg-indigo-50 border-indigo-200'
  ];

  return (
    <div className="relative flex gap-6 group">
      {/* Number Circle */}
      <div className="relative z-10 flex-shrink-0">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
          {index + 1}
        </div>
      </div>

      {/* Content Card */}
      <div className={`flex-1 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border-2 ${bgColors[index % bgColors.length]} p-6 mb-4`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800">{stage.title}</h3>
        </div>

        {/* Tasks Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-700">Мероприятия</h4>
          </div>
          <ul className="space-y-2 ml-7">
            {stage.tasks.map((task, taskIndex) => (
              <li key={taskIndex} className="flex items-start gap-2">
                <span className="text-gray-400 leading-[1.5]">•</span>
                <span className="text-gray-700">{task}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Results Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-700">Образ результата</h4>
          </div>
          <ul className="space-y-2 ml-7">
            {stage.results.map((result, resultIndex) => (
              <li key={resultIndex} className="flex items-start gap-2">
                <span className="text-gray-400 leading-[1.5]">•</span>
                <span className="text-gray-700">{result}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Duration Section */}
        <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
          <Calendar className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-700 mb-1">Срок работы над этапом:</h4>
            <div>
              {stage.duration.includes('*') ? (
                <>
                  <p className="text-gray-700">{stage.duration.split('*')[0]}</p>
                  <p className="text-xs text-gray-500 mt-1">* {stage.duration.split('*')[1]}</p>
                </>
              ) : (
                <p className="text-gray-700">{stage.duration}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
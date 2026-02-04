import { useState, useEffect } from 'react';
import { Stage } from '../App';
import { Edit2, Check, X, Plus, Trash2, Calendar, CheckCircle, ListChecks } from 'lucide-react';

interface RoadmapStageProps {
  stage: Stage;
  index: number;
  onUpdate: (id: string, stage: Stage) => void;
  onDelete: (id: string) => void;
  isEditMode: boolean;
}

export function RoadmapStage({ stage, index, onUpdate, onDelete, isEditMode }: RoadmapStageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStage, setEditedStage] = useState<Stage>(stage);

  // Синхронизируем editedStage с stage при изменении props
  useEffect(() => {
    setEditedStage(stage);
  }, [stage]);

  const handleSave = () => {
    onUpdate(stage.id, editedStage);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedStage(stage);
    setIsEditing(false);
  };

  const addTask = () => {
    setEditedStage({
      ...editedStage,
      tasks: [...editedStage.tasks, 'Новая задача']
    });
  };

  const updateTask = (taskIndex: number, value: string) => {
    const newTasks = [...editedStage.tasks];
    newTasks[taskIndex] = value;
    setEditedStage({ ...editedStage, tasks: newTasks });
  };

  const removeTask = (taskIndex: number) => {
    setEditedStage({
      ...editedStage,
      tasks: editedStage.tasks.filter((_, i) => i !== taskIndex)
    });
  };

  const addResult = () => {
    setEditedStage({
      ...editedStage,
      results: [...editedStage.results, 'Новый результат']
    });
  };

  const updateResult = (resultIndex: number, value: string) => {
    const newResults = [...editedStage.results];
    newResults[resultIndex] = value;
    setEditedStage({ ...editedStage, results: newResults });
  };

  const removeResult = (resultIndex: number) => {
    setEditedStage({
      ...editedStage,
      results: editedStage.results.filter((_, i) => i !== resultIndex)
    });
  };

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
          {isEditing ? (
            <input
              type="text"
              value={editedStage.title}
              onChange={(e) => setEditedStage({ ...editedStage, title: e.target.value })}
              className="text-2xl font-bold flex-1 bg-white border-2 border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h3 className="text-2xl font-bold text-gray-800">{isEditing ? editedStage.title : stage.title}</h3>
          )}
          
          {isEditMode && (
            <div className="flex gap-2 ml-4">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Редактировать"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(stage.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="Сохранить"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Отмена"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-700">Мероприятия</h4>
          </div>
          <ul className="space-y-2 ml-7">
            {(isEditing ? editedStage.tasks : stage.tasks).map((task, taskIndex) => (
              <li key={taskIndex} className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                {isEditing ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editedStage.tasks[taskIndex]}
                      onChange={(e) => updateTask(taskIndex, e.target.value)}
                      className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => removeTask(taskIndex)}
                      className="text-red-500 hover:text-red-700"
                      title="Удалить задачу"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-700">{task}</span>
                )}
              </li>
            ))}
          </ul>
          {isEditing && (
            <button
              onClick={addTask}
              className="ml-7 mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Добавить задачу
            </button>
          )}
        </div>

        {/* Results Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-700">Образ результата</h4>
          </div>
          <ul className="space-y-2 ml-7">
            {(isEditing ? editedStage.results : stage.results).map((result, resultIndex) => (
              <li key={resultIndex} className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                {isEditing ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editedStage.results[resultIndex]}
                      onChange={(e) => updateResult(resultIndex, e.target.value)}
                      className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => removeResult(resultIndex)}
                      className="text-red-500 hover:text-red-700"
                      title="Удалить результат"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-700">{result}</span>
                )}
              </li>
            ))}
          </ul>
          {isEditing && (
            <button
              onClick={addResult}
              className="ml-7 mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Добавить результат
            </button>
          )}
        </div>

        {/* Duration Section */}
        <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
          <Calendar className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-700 mb-1">Срок работы над этапом:</h4>
            {isEditing ? (
              <input
                type="text"
                value={editedStage.duration}
                onChange={(e) => setEditedStage({ ...editedStage, duration: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <div>
                {(isEditing ? editedStage.duration : stage.duration).includes('*') ? (
                  <>
                    <p className="text-gray-700">{(isEditing ? editedStage.duration : stage.duration).split('*')[0]}</p>
                    <p className="text-xs text-gray-500 mt-1">* {(isEditing ? editedStage.duration : stage.duration).split('*')[1]}</p>
                  </>
                ) : (
                  <p className="text-gray-700">{isEditing ? editedStage.duration : stage.duration}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
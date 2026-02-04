import { useState, useEffect } from 'react';
import { RoadmapStage } from './components/RoadmapStage';
import { ProjectCalendar } from './components/ProjectCalendar';
import { Plus, Lock, Unlock, Save } from 'lucide-react';

export interface Stage {
  id: string;
  title: string;
  tasks: string[];
  results: string[];
  duration: string;
}

function App() {
  const [password, setPassword] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  
  const EDIT_PASSWORD = '8888'; // Измените на свой пароль

  const initialStages: Stage[] = [
    {
      id: '1',
      title: 'Аналитика и подбор референсов',
      tasks: [
        'проведение и анализ брифа',
        'подбор референсов',
        'создание мудборда'
      ],
      results: [
        'согласованный и подписанный документ брифа руководителем',
        'слайд презентации с мудбордом проекта'
      ],
      duration: '03.02-06.02*при начале работы над блоком 3го февраля'
    },
    {
      id: '2',
      title: 'Основа стилистики',
      tasks: [
        'подбор фирменных шрифтовых пар',
        'подбор цветовых композиций',
        'разработка логотипа и его вариаций (полная версия, сокращенная/сокращенные версии, знак)',
        'разработка графического приема'
      ],
      results: [
        'слайды презентации с кодами цветовых палитр, графических приемов, логотипами (и правилами их использования) и шрифтовыми парами',
        'векторные и растровые файлы с логотипами, доступные для скачивания'
      ],
      duration: '09.02-24.02*при начале работы над блоком 9го февраля'
    },
    {
      id: '3',
      title: 'Визуальная стратегия и работа с медиа-каналами',
      tasks: [
        'подбор референсных кадров',
        'описание характера кадров бренда',
        'создание шаблонов для контента по рубрикам'
      ],
      results: [
        'слайды презентации с референсами и текстовыми пояснениями',
        'шаблоны для работы в программе figma'
      ],
      duration: '24.02-04.03*при начале работы над блоком 24го февраля'
    },
    {
      id: '4',
      title: 'Носители фирменного стиля',
      tasks: [
        'разработку электронных носителей',
        'разработку физических носителей'
      ],
      results: [
        'шаблоны и другие электронные файлы, доступные для скачивания и использования в медиапространстве',
        'файлы для печати по требованиям типографии и технические задания для их чтения'
      ],
      duration: 'нет возможности просчитать без согласования брифа'
    }
  ];

  // Загружаем данные из localStorage или используем начальные значения
  const loadStagesFromStorage = (): Stage[] => {
    try {
      const loadedStages = localStorage.getItem('roadmap_stages');
      if (loadedStages) {
        return JSON.parse(loadedStages);
      }
    } catch (error) {
      console.error('Ошибка при загрузке этапов из localStorage:', error);
    }
    return initialStages;
  };

  const loadedCompanyName = localStorage.getItem('roadmap_companyName');
  const [companyName, setCompanyName] = useState(
    loadedCompanyName ? loadedCompanyName : 'САПФИР'
  );
  const [stages, setStages] = useState<Stage[]>(loadStagesFromStorage());
  
  // Состояния для отслеживания изменений (не сохраняются автоматически)
  const [editedCompanyName, setEditedCompanyName] = useState(companyName);
  const [editedStages, setEditedStages] = useState<Stage[]>(stages);

  // Обновляем локальные состояния при загрузке
  useEffect(() => {
    setEditedCompanyName(companyName);
    setEditedStages([...stages]); // Создаем новый массив для правильного обновления
  }, [companyName, stages]);

  // Обновление названия компании (без сохранения)
  const updateCompanyName = (name: string) => {
    setEditedCompanyName(name);
  };

  // Обновление этапа (без сохранения)
  const updateStage = (id: string, updatedStage: Stage) => {
    const newStages = editedStages.map(stage => stage.id === id ? updatedStage : stage);
    setEditedStages(newStages);
  };

  const deleteStage = (id: string) => {
    const newStages = editedStages.filter(stage => stage.id !== id);
    setEditedStages(newStages);
  };

  const addNewStage = () => {
    const newStage: Stage = {
      id: Date.now().toString(),
      title: 'Новый этап',
      tasks: ['Задача 1'],
      results: ['Результат 1'],
      duration: 'Укажите срок'
    };
    const newStages = [...editedStages, newStage];
    setEditedStages(newStages);
  };

  // Сохранение всех изменений в localStorage
  const handleSave = () => {
    try {
      // Сохраняем в localStorage
      localStorage.setItem('roadmap_companyName', editedCompanyName);
      localStorage.setItem('roadmap_stages', JSON.stringify(editedStages));
      
      // Обновляем основные состояния (это вызовет перерисовку)
      setCompanyName(editedCompanyName);
      setStages([...editedStages]); // Создаем новый массив для правильного обновления
      
      alert('Изменения сохранены!');
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Ошибка при сохранении изменений. Попробуйте еще раз.');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === EDIT_PASSWORD) {
      setIsEditMode(true);
      setShowPasswordInput(false);
      setPassword('');
    } else {
      alert('Неверный пароль');
      setPassword('');
    }
  };

  const handleLogout = () => {
    // Откатываем все несохраненные изменения
    setEditedCompanyName(companyName);
    setEditedStages(stages);
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Edit Mode Toggle */}
        <div className="fixed top-4 right-4 z-50">
          {!isEditMode ? (
            showPasswordInput ? (
              <form onSubmit={handlePasswordSubmit} className="bg-white rounded-lg shadow-lg p-4 flex gap-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Войти
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordInput(false);
                    setPassword('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowPasswordInput(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-200"
              >
                <Lock className="w-4 h-4" />
                Режим редактирования
              </button>
            )
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Save className="w-4 h-4" />
                Сохранить
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Unlock className="w-4 h-4" />
                Выйти из редактирования
              </button>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block">
            {isEditMode ? (
              <input
                type="text"
                value={editedCompanyName}
                onChange={(e) => updateCompanyName(e.target.value)}
                className="text-4xl font-bold text-center bg-transparent border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors px-4 py-2"
              />
            ) : (
              <h1 className="text-4xl font-bold text-gray-800">{companyName}</h1>
            )}
          </div>
          <p className="text-xl text-gray-600 mt-4">
            Дорожная карта разработки брендбука
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400" />

          {/* Stages */}
          <div className="space-y-8">
            {editedStages.map((stage, index) => (
              <RoadmapStage
                key={stage.id}
                stage={stage}
                index={index}
                onUpdate={updateStage}
                onDelete={deleteStage}
                isEditMode={isEditMode}
              />
            ))}
          </div>
        </div>

        {/* Add Stage Button */}
        {isEditMode && (
          <div className="mt-12 text-center">
            <button
              onClick={addNewStage}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Добавить этап
            </button>
          </div>
        )}

        {/* Project Calendar */}
        <ProjectCalendar 
          isEditMode={isEditMode} 
          stages={editedStages}
          onCalendarUpdate={(calendarData) => {
            // Обновление данных календаря будет обрабатываться в компоненте
          }}
        />
      </div>
    </div>
  );
}

export default App;
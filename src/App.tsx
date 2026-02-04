import { RoadmapStage } from './components/RoadmapStage';
import { ProjectCalendar } from './components/ProjectCalendar';

export interface Stage {
  id: string;
  title: string;
  tasks: string[];
  results: string[];
  duration: string;
}

function App() {
  const stages: Stage[] = [
    {
      id: '1',
      title: 'Аналитика и подбор референсов',
      tasks: [
        'проведен и проанализирован бриф',
        'подобраны референсы',
        'создан мудборд'
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
        'подобраны фирменные шрифтовые пары',
        'подобраны цветовые композиции',
        'разработан логотип и его вариаций (полная версия, сокращенная/сокращенные версии, знак)',
        'разработан графический/графические приемы'
      ],
      results: [
        'слайды презентации с кодами цветовых палитр, графических приемов, логотипами (и правилами их использования) и шрифтовыми парами',
        'векторные и растровые файлы с логотипами, доступные для скачивания'
      ],
      duration: '09.02-24.02*при начале работы над блоком 9го февраля'
    },
    {
      id: '3',
      title: 'Носители фирменного стиля',
      tasks: [
        'разработаны электронные носители',
        'разработаны физические носители'
      ],
      results: [
        'шаблоны и другие электронные файлы, доступные для скачивания и использования в медиапространстве',
        'файлы для печати по требованиям типографии и технические задания для их чтения'
      ],
      duration: '25.02-04.03'
    },
    {
      id: '4',
      title: 'Визуальная стратегия и работа с медиа-каналами',
      tasks: [
        'подобраны референсные кадры/фото-контент',
        'описан характер кадров (для дальнейших генераций в нейросетях)',
        'созданы шаблоны для контента по рубрикам'
      ],
      results: [
        'слайды презентации с референсами и текстовыми пояснениями',
        'шаблоны для работы в программе figma'
      ],
      duration: '05.03-13.03'
    }
  ];

  const companyName = 'САПФИР';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">{companyName}</h1>
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
            {stages.map((stage, index) => (
              <RoadmapStage
                key={stage.id}
                stage={stage}
                index={index}
                isEditMode={false}
              />
            ))}
          </div>
        </div>

        {/* Project Calendar */}
        <ProjectCalendar 
          isEditMode={false} 
          stages={stages}
        />
      </div>
    </div>
  );
}

export default App;
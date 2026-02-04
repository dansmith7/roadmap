import { useMemo } from 'react';
import { Stage } from '../App';

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  stages: string[]; // Теперь храним ID этапов
}

interface StageDateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  stageId: string;
}

interface ProjectCalendarProps {
  isEditMode: boolean;
  stages: Stage[];
}

export function ProjectCalendar({ isEditMode, stages }: ProjectCalendarProps) {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500'
  ];

  // Хардкод данные календаря
  const getDefaultRanges = (): StageDateRange[] => {
    return [
      { start: '2026-02-03', end: '2026-02-06', stageId: '1' },
      { start: '2026-02-09', end: '2026-02-24', stageId: '2' },
      { start: '2026-02-25', end: '2026-03-04', stageId: '3' },
      { start: '2026-03-05', end: '2026-03-13', stageId: '4' },
    ];
  };

  const calendarData: StageDateRange[] = getDefaultRanges();

  const getStageIndex = (stageId: string): number => {
    return stages.findIndex(s => s.id === stageId);
  };

  const getStageColor = (stageId: string): string => {
    const index = getStageIndex(stageId);
    return colors[index % colors.length];
  };

  const getStageName = (stageId: string): string => {
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.title : `Этап ${stageId}`;
  };

  const isDateInRange = (date: Date, range: StageDateRange): boolean => {
    const dateStr = formatDate(date);
    return dateStr >= range.start && dateStr <= range.end;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const generateCalendar = (year: number, month: number): CalendarDay[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: CalendarDay[] = [];

    // Добавляем дни предыдущего месяца
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const startDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
        stages: []
      });
    }

    // Добавляем дни текущего месяца
    for (let date = 1; date <= daysInMonth; date++) {
      const currentDate = new Date(year, month, date);
      const dayOfWeek = currentDate.getDay(); // 0 = воскресенье, 6 = суббота
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isFeb23 = year === 2026 && month === 1 && date === 23; // 23 февраля 2026
      const isMar9 = year === 2026 && month === 2 && date === 9; // 9 марта 2026
      const stageIds: string[] = [];

      // Не добавляем этапы для выходных дней, 23 февраля и 9 марта
      if (!isWeekend && !isFeb23 && !isMar9) {
        calendarData.forEach((range) => {
          if (isDateInRange(currentDate, range)) {
            stageIds.push(range.stageId);
          }
        });
      }

      days.push({
        date,
        month,
        year,
        isCurrentMonth: true,
        stages: stageIds
      });
    }

    // Добавляем дни следующего месяца
    const remainingDays = 42 - days.length;
    for (let date = 1; date <= remainingDays; date++) {
      days.push({
        date,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
        stages: []
      });
    }

    return days;
  };


  // Перегенерируем календарь при изменении calendarData
  const februaryDays = useMemo(() => generateCalendar(2026, 1), [calendarData]);
  const marchDays = useMemo(() => generateCalendar(2026, 2), [calendarData]);

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];


  const renderMonth = (days: CalendarDay[], monthName: string, monthKey: string) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{monthName}</h3>
      
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayKey = `${monthKey}-${index}`;
          return (
            <div
              key={dayKey}
              className={`aspect-square flex items-center justify-center rounded-lg transition-all relative ${
                day.isCurrentMonth
                  ? 'bg-gray-50 hover:bg-gray-100'
                  : 'bg-gray-100 opacity-40'
              }`}
            >
              <span
                className={`text-sm text-center ${
                  day.isCurrentMonth ? 'text-gray-800 font-medium' : 'text-gray-400'
                }`}
              >
                {day.date}
              </span>
              
              {/* Stage indicators */}
              {day.stages.length > 0 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-0.5 flex-wrap justify-center" style={{ top: 'calc(50% + 0.75rem)' }}>
                  {day.stages.map((stageId) => (
                    <div
                      key={stageId}
                      className={`w-2 h-2 rounded-full ${getStageColor(stageId)}`}
                      title={getStageName(stageId)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
        График работ
      </h2>
      
      {/* Legend */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 mb-8">
        <h4 className="text-2xl font-bold text-gray-800 mb-4">Обозначения:</h4>
        <div className="flex flex-col gap-4">
          {stages.map((stage, index) => {
            const colorClass = colors[index % colors.length];
            return (
              <div 
                key={stage.id} 
                className="flex items-center gap-3"
              >
                <div 
                  className={`w-4 h-4 rounded-full flex-shrink-0 ${colorClass}`}
                />
                <span className="text-gray-700">
                  Этап {index + 1}: {stage.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderMonth(februaryDays, 'Февраль 2026', 'feb')}
        {renderMonth(marchDays, 'Март 2026', 'mar')}
      </div>

    </div>
  );
}

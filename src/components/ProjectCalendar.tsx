import { useState, useEffect, useMemo, useRef } from 'react';
import { Stage } from '../App';
import { X } from 'lucide-react';

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
  onCalendarUpdate?: (calendarData: StageDateRange[]) => void;
}

export function ProjectCalendar({ isEditMode, stages, onCalendarUpdate }: ProjectCalendarProps) {
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

  // Загружаем данные календаря из localStorage
  const loadCalendarData = (): StageDateRange[] => {
    const saved = localStorage.getItem('roadmap_calendar');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultRanges();
      }
    }
    return getDefaultRanges();
  };

  // Получаем начальные диапазоны на основе этапов
  const getDefaultRanges = (): StageDateRange[] => {
    return [
      { start: '2026-02-03', end: '2026-02-06', stageId: '1' },
      { start: '2026-02-09', end: '2026-02-24', stageId: '2' },
      { start: '2026-02-24', end: '2026-03-04', stageId: '3' },
    ];
  };

  const [calendarData, setCalendarData] = useState<StageDateRange[]>(loadCalendarData());
  const [selectedDate, setSelectedDate] = useState<{ date: Date; key: string } | null>(null);
  const [dragStart, setDragStart] = useState<{ date: Date; key: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: Date; key: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null);
  const dayCellsRef = useRef<Map<string, { date: Date; key: string }>>(new Map());

  // Сохраняем изменения в localStorage
  useEffect(() => {
    localStorage.setItem('roadmap_calendar', JSON.stringify(calendarData));
    if (onCalendarUpdate) {
      onCalendarUpdate(calendarData);
    }
  }, [calendarData, onCalendarUpdate]);

  // Синхронизируем с этапами - удаляем диапазоны для несуществующих этапов
  useEffect(() => {
    const existingStageIds = new Set(stages.map(s => s.id));
    setCalendarData(prev => {
      const filtered = prev.filter(range => existingStageIds.has(range.stageId));
      // Обновляем только если действительно что-то изменилось
      if (filtered.length !== prev.length) {
        return filtered;
      }
      return prev;
    });
  }, [stages]);

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

  const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
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
      const stageIds: string[] = [];

      calendarData.forEach((range) => {
        if (isDateInRange(currentDate, range)) {
          stageIds.push(range.stageId);
        }
      });

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

  const handleDateMouseDown = (day: CalendarDay, dayIndex: number, monthKey: string, e: React.MouseEvent) => {
    if (!isEditMode || !day.isCurrentMonth) return;
    
    e.preventDefault();
    
    const date = new Date(day.year, day.month, day.date);
    const dateKey = { date, key: `${monthKey}-${dayIndex}` };
    setDragStart(dateKey);
    setDragEnd(dateKey);
    setSelectedRange(null);
    setIsDragging(true);
  };


  const handleDateMouseUp = (day: CalendarDay, dayIndex: number, monthKey: string, e: React.MouseEvent) => {
    if (!isEditMode || !day.isCurrentMonth) return;
    
    if (isDragging && dragStart && dragEnd) {
      e.preventDefault();
      
      // Если начальная и конечная дата одинаковые - открываем обычное модальное окно
      if (formatDate(dragStart.date) === formatDate(dragEnd.date)) {
        setSelectedDate(dragStart);
        setSelectedRange(null);
      } else {
        // Если это диапазон - открываем модальное окно с диапазоном
        const start = dragStart.date < dragEnd.date ? dragStart.date : dragEnd.date;
        const end = dragStart.date > dragEnd.date ? dragStart.date : dragEnd.date;
        setSelectedDate(dragStart);
        setSelectedRange({ start, end });
      }

      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
    }
  };

  // Глобальные обработчики для перетаскивания: mousemove (подсветка) и mouseup (завершение)
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStart) return;

      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;

      const cell = el.closest('[data-day-key]');
      if (!cell) return;

      const isCurrentMonth = (cell as HTMLElement).getAttribute('data-is-current-month') === 'true';
      if (!isCurrentMonth) return;

      const dayKey = (cell as HTMLElement).getAttribute('data-day-key');
      if (!dayKey) return;

      const cellData = dayCellsRef.current.get(dayKey);
      if (!cellData) return;

      setDragEnd(cellData);
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (!isDragging || !dragStart) return;

      // Определяем финальную ячейку под курсором при отпускании
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cell = el?.closest('[data-day-key]');
      const isCurrentMonth = cell && (cell as HTMLElement).getAttribute('data-is-current-month') === 'true';
      const dayKey = cell && isCurrentMonth ? (cell as HTMLElement).getAttribute('data-day-key') : null;
      const finalEnd = dayKey ? dayCellsRef.current.get(dayKey) : dragEnd;

      if (finalEnd) {
        if (formatDate(dragStart.date) === formatDate(finalEnd.date)) {
          setSelectedDate(dragStart);
          setSelectedRange(null);
        } else {
          const start = dragStart.date < finalEnd.date ? dragStart.date : finalEnd.date;
          const end = dragStart.date > finalEnd.date ? dragStart.date : finalEnd.date;
          setSelectedDate(dragStart);
          setSelectedRange({ start, end });
        }
      }

      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp, true);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp, true);
      };
    }
  }, [isDragging, dragStart]);

  const toggleStageOnDate = (stageId: string) => {
    if (!selectedDate) return;

    const dateRange = getDateRange();
    if (!dateRange) return;

    const startStr = formatDate(dateRange.start);
    const endStr = formatDate(dateRange.end);

    // Если это диапазон дат, добавляем/удаляем этап для всего диапазона
    if (startStr !== endStr) {
      // Проверяем, есть ли уже этот этап на всех датах диапазона
      const allDatesHaveStage = (() => {
        const dates: string[] = [];
        const current = new Date(dateRange.start);
        while (current <= dateRange.end) {
          dates.push(formatDate(current));
          current.setDate(current.getDate() + 1);
        }
        
        return dates.every(dateStr => {
          return calendarData.some(
            r => r.stageId === stageId && dateStr >= r.start && dateStr <= r.end
          );
        });
      })();

      if (allDatesHaveStage) {
        // Удаляем этап со всех дат диапазона
        setCalendarData(prev => {
          const newData = [...prev];
          const dates: string[] = [];
          const current = new Date(dateRange.start);
          while (current <= dateRange.end) {
            dates.push(formatDate(current));
            current.setDate(current.getDate() + 1);
          }
          
          dates.forEach(dateStr => {
            const existingRange = newData.find(
              r => r.stageId === stageId && dateStr >= r.start && dateStr <= r.end
            );
            
            if (existingRange) {
              if (existingRange.start === existingRange.end) {
                // Удаляем весь диапазон
                const index = newData.indexOf(existingRange);
                newData.splice(index, 1);
              } else if (dateStr === existingRange.start) {
                // Сдвигаем начало
                existingRange.start = formatDate(new Date(parseDate(dateStr).getTime() + 86400000));
              } else if (dateStr === existingRange.end) {
                // Сдвигаем конец
                existingRange.end = formatDate(new Date(parseDate(dateStr).getTime() - 86400000));
              } else {
                // Разбиваем на два диапазона
                const index = newData.indexOf(existingRange);
                newData.splice(index, 1);
                newData.push(
                  { start: existingRange.start, end: formatDate(new Date(parseDate(dateStr).getTime() - 86400000)), stageId },
                  { start: formatDate(new Date(parseDate(dateStr).getTime() + 86400000)), end: existingRange.end, stageId }
                );
              }
            }
          });
          
          return newData;
        });
      } else {
        // Добавляем этап на весь диапазон
        setCalendarData(prev => [...prev, { start: startStr, end: endStr, stageId }]);
      }
    } else {
      // Одна дата - используем старую логику
      const dateStr = formatDate(selectedDate.date);
      const existingRange = calendarData.find(
        r => r.stageId === stageId && dateStr >= r.start && dateStr <= r.end
      );

      if (existingRange) {
        // Удаляем этап с этой даты
        if (existingRange.start === existingRange.end) {
          // Если это единственная дата в диапазоне, удаляем весь диапазон
          setCalendarData(prev => prev.filter(r => r !== existingRange));
        } else if (dateStr === existingRange.start) {
          // Если это начало диапазона, сдвигаем начало
          setCalendarData(prev => prev.map(r => 
            r === existingRange 
              ? { ...r, start: formatDate(new Date(selectedDate.date.getTime() + 86400000)) }
              : r
          ));
        } else if (dateStr === existingRange.end) {
          // Если это конец диапазона, сдвигаем конец
          setCalendarData(prev => prev.map(r => 
            r === existingRange 
              ? { ...r, end: formatDate(new Date(selectedDate.date.getTime() - 86400000)) }
              : r
          ));
        } else {
          // Если это середина диапазона, разбиваем на два диапазона
          setCalendarData(prev => [
            ...prev.filter(r => r !== existingRange),
            { start: existingRange.start, end: formatDate(new Date(selectedDate.date.getTime() - 86400000)), stageId },
            { start: formatDate(new Date(selectedDate.date.getTime() + 86400000)), end: existingRange.end, stageId }
          ]);
        }
      } else {
        // Добавляем этап на эту дату (создаем диапазон из одной даты)
        setCalendarData(prev => [...prev, { start: dateStr, end: dateStr, stageId }]);
      }
    }

    setSelectedDate(null);
    setSelectedRange(null);
  };

  const removeStageFromDate = (stageId: string) => {
    if (!selectedDate) return;
    toggleStageOnDate(stageId);
  };

  // Перегенерируем календарь при изменении calendarData
  const februaryDays = useMemo(() => generateCalendar(2026, 1), [calendarData]);
  const marchDays = useMemo(() => generateCalendar(2026, 2), [calendarData]);

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const isDateInDragRange = (day: CalendarDay): boolean => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    if (!day.isCurrentMonth) return false;
    
    const dayDate = new Date(day.year, day.month, day.date);
    const startDate = dragStart.date;
    const endDate = dragEnd.date;
    
    const dayStr = formatDate(dayDate);
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);
    
    // Определяем минимальную и максимальную дату
    const minDate = startStr < endStr ? startStr : endStr;
    const maxDate = startStr > endStr ? startStr : endStr;
    
    return dayStr >= minDate && dayStr <= maxDate;
  };

  const getDateRange = (): { start: Date; end: Date } | null => {
    if (!selectedDate) return null;
    
    // Используем сохраненный диапазон если он есть
    if (selectedRange) {
      return selectedRange;
    }
    
    // Или используем dragStart и dragEnd если они есть и разные (во время перетаскивания)
    if (dragStart && dragEnd && formatDate(dragStart.date) !== formatDate(dragEnd.date)) {
      const start = dragStart.date < dragEnd.date ? dragStart.date : dragEnd.date;
      const end = dragStart.date > dragEnd.date ? dragStart.date : dragEnd.date;
      return { start, end };
    }
    
    return { start: selectedDate.date, end: selectedDate.date };
  };

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
      <div 
        className="grid grid-cols-7 gap-2"
        style={{ userSelect: 'none' }}
      >
        {days.map((day, index) => {
          const dayKey = `${monthKey}-${index}`;
          const date = new Date(day.year, day.month, day.date);
          const cellData = { date, key: dayKey };
          dayCellsRef.current.set(dayKey, cellData);

          const isSelected = selectedDate?.key === dayKey;
          const inDragRange = isDateInDragRange(day);
          return (
            <div
              key={dayKey}
              data-day-key={dayKey}
              data-is-current-month={day.isCurrentMonth}
              onMouseDown={(e) => handleDateMouseDown(day, index, monthKey, e)}
              onMouseUp={(e) => handleDateMouseUp(day, index, monthKey, e)}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all relative select-none ${
                day.isCurrentMonth
                  ? isEditMode 
                    ? 'bg-gray-50 hover:bg-blue-100 cursor-pointer border-2 border-transparent hover:border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                  : 'bg-gray-100 opacity-40'
              } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${
                inDragRange && day.isCurrentMonth && isDragging ? 'bg-blue-200 border-blue-400 ring-2 ring-blue-300' : ''
              }`}
              style={{ 
                userSelect: 'none', 
                WebkitUserSelect: 'none',
                pointerEvents: day.isCurrentMonth ? 'auto' : 'none'
              }}
            >
              <span
                className={`text-sm ${
                  day.isCurrentMonth ? 'text-gray-800 font-medium' : 'text-gray-400'
                }`}
              >
                {day.date}
              </span>
              
              {/* Stage indicators */}
              {day.stages.length > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
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
        <h4 className="font-semibold text-gray-700 mb-4">Обозначения:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
              <span className="text-gray-700">
                Этап {index + 1}: {stage.title}
              </span>
            </div>
          ))}
        </div>
        {isEditMode && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">
              💡 Кликните на дату или зажмите и проведите мышью для выбора диапазона дат
            </p>
            <p className="text-xs text-gray-400">
              Выберите одну дату или диапазон дат, затем выберите этап в модальном окне
            </p>
          </div>
        )}
      </div>

      {/* Calendars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderMonth(februaryDays, 'Февраль 2026', 'feb')}
        {renderMonth(marchDays, 'Март 2026', 'mar')}
      </div>

      {/* Stage Selection Modal */}
      {selectedDate !== null && isEditMode === true && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ 
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          onClick={() => setSelectedDate(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative z-[10000]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {(() => {
                  const dateRange = getDateRange();
                  if (dateRange && formatDate(dateRange.start) !== formatDate(dateRange.end)) {
                    return `Выберите этап для периода: ${dateRange.start.toLocaleDateString('ru-RU')} - ${dateRange.end.toLocaleDateString('ru-RU')}`;
                  }
                  return `Выберите этап для ${selectedDate.date.toLocaleDateString('ru-RU')}`;
                })()}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {stages.map((stage, index) => {
                const dateStr = selectedDate ? formatDate(selectedDate.date) : '';
                const isActive = selectedDate && calendarData.some(
                  range => range.stageId === stage.id && dateStr >= range.start && dateStr <= range.end
                );
                
                return (
                  <button
                    key={stage.id}
                    onClick={() => toggleStageOnDate(stage.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
                      <span className="font-medium text-gray-800">{stage.title}</span>
                      {isActive && (
                        <span className="ml-auto text-sm text-blue-600">✓ Активен</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedDate && (() => {
              const dateStr = formatDate(selectedDate.date);
              const activeStages = calendarData.filter(
                range => dateStr >= range.start && dateStr <= range.end
              ).map(range => range.stageId);
              
              return activeStages.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Удалить этапы с этой даты:</p>
                  <div className="space-y-1">
                    {activeStages.map(stageId => {
                      const stage = stages.find(s => s.id === stageId);
                      return (
                        <button
                          key={stageId}
                          onClick={() => removeStageFromDate(stageId)}
                          className="w-full text-left p-2 rounded border border-red-200 hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Удалить {stage?.title || stageId}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

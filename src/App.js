import React, { useState, useEffect } from 'react';

const SalaryCalculator = () => {
  const [salary, setSalary] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [hourlyWage, setHourlyWage] = useState(0);
  const [daysInMonth, setDaysInMonth] = useState(0);
  const [workDays, setWorkDays] = useState(0);
  const [additionalDaysOff, setAdditionalDaysOff] = useState(0);
  const [earlyLeaveHours, setEarlyLeaveHours] = useState(0);
  const [calculationMode, setCalculationMode] = useState('hourlyWage'); // 'hourlyWage' 또는 'expectedSalary'
  const [expectedSalary, setExpectedSalary] = useState(0);
  const [workType, setWorkType] = useState('fiveDays'); // 'fiveDays' 또는 'sixDays'

  // 월별 일수 계산
  useEffect(() => {
    const lastDayOfMonth = new Date(year, month, 0);
    const totalDays = lastDayOfMonth.getDate();
    setDaysInMonth(totalDays);

    // 근무 형태에 따른 기본 휴무일 설정
    const defaultDaysOff = workType === 'fiveDays' ? 8 : 4;

    if (calculationMode === 'hourlyWage') {
      // 시급 계산 모드에서는 추가 휴무일을 반영하지 않음
      setWorkDays(totalDays - defaultDaysOff);
    } else {
      // 예상 급여 계산 모드에서만 추가 휴무일 반영
      setWorkDays(Math.max(0, totalDays - defaultDaysOff - additionalDaysOff));
    }
  }, [month, year, additionalDaysOff, calculationMode, workType]);

  // 시급 계산
  const calculateHourlyWage = () => {
    if (!salary || isNaN(salary) || salary <= 0 || workDays <= 0) {
      setHourlyWage(0);
      return;
    }

    // 근무 형태에 따른 기본 휴무일 설정
    const defaultDaysOff = workType === 'fiveDays' ? 8 : 4;

    // 시급 계산: 세전급여 / (총일수 - 기본휴무일) / 10시간
    // 시급 계산 모드에서는 추가 휴무일을 고려하지 않음
    const baseWorkDays = daysInMonth - defaultDaysOff;
    const hourly = Math.round(Number(salary) / baseWorkDays / 10);
    setHourlyWage(hourly);
  };

  // 예상 세전급여 계산
  const calculateExpectedSalary = () => {
    if (hourlyWage <= 0 || workDays <= 0) {
      setExpectedSalary(0);
      return;
    }

    // 총 근무 시간 계산: (근무일 * 10시간) - 조퇴시간
    const totalWorkHours = (workDays * 10) - Number(earlyLeaveHours);

    // 예상 세전급여 계산: 시급 * 총 근무 시간
    const expected = Math.round(hourlyWage * totalWorkHours);
    setExpectedSalary(expected);
  };

  // 근무일 또는 급여 변경 시 시급 다시 계산
  useEffect(() => {
    if (calculationMode === 'hourlyWage') {
      calculateHourlyWage();
    }
  }, [daysInMonth, salary, calculationMode, workType]);

  // 시급, 근무시간 변경 시 예상 세전급여 다시 계산
  useEffect(() => {
    if (calculationMode === 'expectedSalary') {
      calculateExpectedSalary();
    }
  }, [hourlyWage, workDays, earlyLeaveHours, calculationMode]);

  // 입력 변경 핸들러들
  const handleSalaryChange = (e) => {
    const value = e.target.value;
    setSalary(value);
  };

  const handleMonthChange = (e) => {
    setMonth(Number(e.target.value));
  };

  const handleYearChange = (e) => {
    setYear(Number(e.target.value));
  };

  const handleAdditionalDaysOffChange = (e) => {
    const value = Number(e.target.value);
    setAdditionalDaysOff(Math.max(0, value)); // 음수 방지
  };

  const handleEarlyLeaveHoursChange = (e) => {
    const value = Number(e.target.value);
    setEarlyLeaveHours(Math.max(0, value)); // 음수 방지
  };

  const handleWorkTypeChange = (e) => {
    setWorkType(e.target.value);
  };

  const toggleCalculationMode = () => {
    const newMode = calculationMode === 'hourlyWage' ? 'expectedSalary' : 'hourlyWage';
    setCalculationMode(newMode);

    // 모드 전환 시 필요한 작업 수행
    if (newMode === 'hourlyWage') {
      // 시급 계산 모드로 전환 시 추가 휴무일, 조퇴 시간 초기화
      setAdditionalDaysOff(0);
      setEarlyLeaveHours(0);
      // 기본 근무일 재설정
      const defaultDaysOff = workType === 'fiveDays' ? 8 : 4;
      setWorkDays(daysInMonth - defaultDaysOff);
    } else {
      // 예상 급여 계산 모드로 전환 시 해당 모드의 근무일 계산
      const defaultDaysOff = workType === 'fiveDays' ? 8 : 4;
      setWorkDays(Math.max(0, daysInMonth - defaultDaysOff - additionalDaysOff));
      // 이미 계산된 시급이 있으면 예상 급여 계산
      if (hourlyWage > 0) {
        calculateExpectedSalary();
      }
    }
  };

  // 근무 형태에 따른 기본 휴무일 텍스트
  const defaultDaysOffText = workType === 'fiveDays' ? '8일' : '4일';

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">급여 계산기</h1>
        <span className="text-sm text-gray-500 mt-1">버전 2</span>
      </div>

      <div className="flex justify-center mb-4 w-full">
        <button
          onClick={toggleCalculationMode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition"
        >
          {calculationMode === 'hourlyWage' ? '시급 계산 모드' : '예상 급여 계산 모드'}
        </button>
      </div>

      <div className="w-full mb-4">
        <label className="block text-gray-700 mb-2 font-medium">년도</label>
        <select
          value={year}
          onChange={handleYearChange}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
      </div>

      <div className="w-full mb-4">
        <label className="block text-gray-700 mb-2 font-medium">월</label>
        <select
          value={month}
          onChange={handleMonthChange}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{m}월</option>
          ))}
        </select>
      </div>

      <div className="w-full mb-4">
        <label className="block text-gray-700 mb-2 font-medium">근무 형태</label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-blue-600"
              name="workType"
              value="fiveDays"
              checked={workType === 'fiveDays'}
              onChange={handleWorkTypeChange}
            />
            <span className="ml-2 text-gray-700">주5일제</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-blue-600"
              name="workType"
              value="sixDays"
              checked={workType === 'sixDays'}
              onChange={handleWorkTypeChange}
            />
            <span className="ml-2 text-gray-700">주6일제</span>
          </label>
        </div>
      </div>

      {calculationMode === 'hourlyWage' ? (
        <div className="w-full mb-6">
          <label className="block text-gray-700 mb-2 font-medium">세전 급여 (원)</label>
          <input
            type="number"
            value={salary}
            onChange={handleSalaryChange}
            placeholder="세전 급여를 입력하세요"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ) : (
        <>
          <div className="w-full mb-6">
            <label className="block text-gray-700 mb-2 font-medium">시급 (원)</label>
            <div className="text-lg font-bold text-blue-600 bg-white p-2 border rounded">
              {hourlyWage.toLocaleString()}원
            </div>
          </div>

          <div className="w-full mb-4">
            <label className="block text-gray-700 mb-2 font-medium">추가 휴무일 (일)</label>
            <input
              type="number"
              value={additionalDaysOff === 0 ? '' : additionalDaysOff}
              onChange={handleAdditionalDaysOffChange}
              placeholder="추가 휴무일을 입력하세요"
              min="0"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full mb-6">
            <label className="block text-gray-700 mb-2 font-medium">조퇴 시간 (시간)</label>
            <input
              type="number"
              value={earlyLeaveHours === 0 ? '' : earlyLeaveHours}
              onChange={handleEarlyLeaveHoursChange}
              placeholder="조퇴 시간을 입력하세요"
              min="0"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      <div className="w-full bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">해당 월 총 일수:</span>
          <span className="font-semibold">{daysInMonth}일</span>
        </div>

        {calculationMode === 'hourlyWage' ? (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">근무 일수 (총일수-{defaultDaysOffText}):</span>
              <span className="font-semibold">{workDays}일</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">일일 근무 시간:</span>
              <span className="font-semibold">10시간</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-200 mt-2">
              <span className="text-lg font-bold text-gray-700">시급:</span>
              <span className="text-lg font-bold text-blue-600">
                {hourlyWage.toLocaleString()}원
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">기본 근무 일수 (총일수-{defaultDaysOffText}):</span>
              <span className="font-semibold">{daysInMonth - (workType === 'fiveDays' ? 8 : 4)}일</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">실제 근무 일수 (추가휴무 반영):</span>
              <span className="font-semibold">{workDays}일</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">일일 근무 시간:</span>
              <span className="font-semibold">10시간</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">총 근무 시간 (조퇴 반영):</span>
              <span className="font-semibold">{(workDays * 10) - earlyLeaveHours}시간</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-200 mt-2">
              <span className="text-lg font-bold text-gray-700">예상 세전급여:</span>
              <span className="text-lg font-bold text-blue-600">
                {expectedSalary.toLocaleString()}원
              </span>
            </div>
          </>
        )}
      </div>

      {salary && hourlyWage > 0 && calculationMode === 'hourlyWage' && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {year}년 {month}월 {workType === 'fiveDays' ? '주5일제' : '주6일제'} 기준,<br />
            세전급여 {Number(salary).toLocaleString()}원으로<br />
            시급은 {hourlyWage.toLocaleString()}원입니다.
          </p>
        </div>
      )}

      {hourlyWage > 0 && calculationMode === 'expectedSalary' && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {year}년 {month}월 {workType === 'fiveDays' ? '주5일제' : '주6일제'} 기준,<br />
            시급 {hourlyWage.toLocaleString()}원으로<br />
            추가 휴무일 {additionalDaysOff}일, 조퇴 {earlyLeaveHours}시간 반영 시<br />
            예상 세전급여는 {expectedSalary.toLocaleString()}원입니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default SalaryCalculator;
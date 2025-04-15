import React, { useState, useEffect } from 'react';

const SalaryCalculator = () => {
  const [salary, setSalary] = useState('3100000');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [hourlyWage, setHourlyWage] = useState(0);
  const [daysInMonth, setDaysInMonth] = useState(0);
  const [workDays, setWorkDays] = useState(0);
  const [additionalDaysOff, setAdditionalDaysOff] = useState(0);
  const [earlyLeaveHours, setEarlyLeaveHours] = useState(0);
  const [expectedSalary, setExpectedSalary] = useState(0);
  const [expectedNetSalary, setExpectedNetSalary] = useState(0);
  const [insuranceFees, setInsuranceFees] = useState({
    pension: 0,     // 국민연금 (4.5%)
    health: 0,      // 건강보험 (3.545%)
    longTerm: 0,    // 장기요양 (건강보험의 12.27%)
    employment: 0   // 고용보험 (0.9%)
  });
  const [workType, setWorkType] = useState('fiveDays'); // 'fiveDays' 또는 'sixDays'

  // 월별 일수 계산
  useEffect(() => {
    const lastDayOfMonth = new Date(year, month, 0);
    const totalDays = lastDayOfMonth.getDate();
    setDaysInMonth(totalDays);

    // 근무 형태에 따른 기본 휴무일 설정
    const defaultDaysOff = workType === 'fiveDays' ? 8 : 4;

    // 시급 계산용 기본 근무일
    const baseWorkDays = totalDays - defaultDaysOff;

    // 예상 급여 계산용 실제 근무일 (추가 휴무일 반영)
    const actualWorkDays = Math.max(0, baseWorkDays - additionalDaysOff);

    setWorkDays(actualWorkDays);
  }, [month, year, additionalDaysOff, workType]);

  // 시급 계산
  const calculateHourlyWage = () => {
    if (!salary || isNaN(salary) || salary <= 0) {
      setHourlyWage(0);
      return;
    }

    // 근무 형태에 따른 기본 휴무일 설정
    const defaultDaysOff = workType === 'fiveDays' ? 8 : 4;

    // 시급 계산: 세전급여 / (총일수 - 기본휴무일) / 10시간
    const baseWorkDays = daysInMonth - defaultDaysOff;

    if (baseWorkDays <= 0) {
      setHourlyWage(0);
      return;
    }

    const hourly = Math.round(Number(salary) / baseWorkDays / 10);
    setHourlyWage(hourly);
  };

  // 예상 세전급여 계산
  const calculateExpectedSalary = () => {
    if (hourlyWage <= 0 || workDays <= 0) {
      setExpectedSalary(0);
      setExpectedNetSalary(0);
      setInsuranceFees({
        pension: 0,
        health: 0,
        longTerm: 0,
        employment: 0
      });
      return;
    }

    // 총 근무 시간 계산: (근무일 * 10시간) - 조퇴시간
    const totalWorkHours = (workDays * 10) - Number(earlyLeaveHours);

    // 예상 세전급여 계산: 시급 * 총 근무 시간
    const expected = Math.round(hourlyWage * totalWorkHours);
    setExpectedSalary(expected);

    // 4대보험료 계산
    calculateInsuranceFees(expected);
  };

  // 4대보험료 계산
  const calculateInsuranceFees = (grossSalary) => {
    // 4대보험 요율 (2023년 기준)
    const pensionRate = 0.045;       // 국민연금 (4.5%)
    const healthRate = 0.03545;      // 건강보험 (3.545%)
    const longTermRate = 0.1227;     // 장기요양 (건강보험의 12.27%)
    const employmentRate = 0.009;    // 고용보험 (0.9%)

    // 각 보험료 계산
    const pension = Math.round(grossSalary * pensionRate);
    const health = Math.round(grossSalary * healthRate);
    const longTerm = Math.round(health * longTermRate);
    const employment = Math.round(grossSalary * employmentRate);

    // 전체 4대보험료
    const totalInsurance = pension + health + longTerm + employment;

    // 세후급여 계산 (소득세 등은 고려하지 않음)
    const netSalary = grossSalary - totalInsurance;

    setInsuranceFees({
      pension,
      health,
      longTerm,
      employment
    });

    setExpectedNetSalary(netSalary);
  };

  // 근무일 또는 급여 변경 시 시급 다시 계산
  useEffect(() => {
    calculateHourlyWage();
  }, [daysInMonth, salary, workType]);

  // 시급, 근무시간 변경 시 예상 세전급여 다시 계산
  useEffect(() => {
    calculateExpectedSalary();
  }, [hourlyWage, workDays, earlyLeaveHours]);

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

  // 근무 형태에 따른 기본 휴무일 텍스트
  const defaultDaysOffText = workType === 'fiveDays' ? '8일' : '4일';

  // 기본 근무일 (추가 휴무일 미반영)
  const baseWorkDays = daysInMonth - (workType === 'fiveDays' ? 8 : 4);

  // 4대보험료 총액
  const totalInsuranceFees = insuranceFees.pension + insuranceFees.health +
    insuranceFees.longTerm + insuranceFees.employment;

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">급여 계산기</h1>
        <span className="text-sm text-gray-500 mt-1">버전 2</span>
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

      {/* 시급 계산 섹션 */}
      <div className="w-full mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-blue-700 mb-4">시급 계산</h2>

        <div className="w-full mb-4">
          <label className="block text-gray-700 mb-2 font-medium">세전 급여 (원)</label>
          <input
            type="number"
            value={salary}
            onChange={handleSalaryChange}
            placeholder="세전 급여를 입력하세요"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">해당 월 총 일수:</span>
            <span className="font-semibold">{daysInMonth}일</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">기본 근무 일수 (총일수-{defaultDaysOffText}):</span>
            <span className="font-semibold">{baseWorkDays}일</span>
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
        </div>

        {salary && hourlyWage > 0 && (
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600">
              {year}년 {month}월 {workType === 'fiveDays' ? '주5일제' : '주6일제'} 기준,<br />
              세전급여 {Number(salary).toLocaleString()}원으로<br />
              시급은 {hourlyWage.toLocaleString()}원입니다.
            </p>
          </div>
        )}
      </div>

      {/* 예상 급여 계산 섹션 */}
      <div className="w-full mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-blue-700 mb-4">예상 급여 계산</h2>

        {hourlyWage > 0 ? (
          <>
            <div className="w-full mb-4">
              <label className="block text-gray-700 mb-2 font-medium">시급 (원)</label>
              <div className="text-lg font-bold text-blue-600 bg-gray-50 p-2 border rounded">
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

            <div className="w-full mb-4">
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

            <div className="mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">기본 근무 일수:</span>
                <span className="font-semibold">{baseWorkDays}일</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">실제 근무 일수 (추가휴무 반영):</span>
                <span className="font-semibold">{workDays}일</span>
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
            </div>

            {/* 4대보험료 및 세후급여 정보 */}
            {expectedSalary > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-2">4대보험료 (근로자 부담분)</h3>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-gray-600">국민연금 (4.5%):</span>
                  <span>{insuranceFees.pension.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-gray-600">건강보험 (3.545%):</span>
                  <span>{insuranceFees.health.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-gray-600">장기요양보험 (건강보험의 12.27%):</span>
                  <span>{insuranceFees.longTerm.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-gray-600">고용보험 (0.9%):</span>
                  <span>{insuranceFees.employment.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300 mt-2">
                  <span className="font-semibold">4대보험 합계:</span>
                  <span className="font-semibold">{totalInsuranceFees.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between pt-3 mt-3 border-t border-gray-300">
                  <span className="text-lg font-bold text-gray-700">예상 세후급여:</span>
                  <span className="text-lg font-bold text-green-600">
                    {expectedNetSalary.toLocaleString()}원
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  * 소득세, 지방소득세 등은 제외된 금액입니다.
                </div>
              </div>
            )}

            {hourlyWage > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {year}년 {month}월 {workType === 'fiveDays' ? '주5일제' : '주6일제'} 기준,<br />
                  시급 {hourlyWage.toLocaleString()}원으로<br />
                  추가 휴무일 {additionalDaysOff}일, 조퇴 {earlyLeaveHours}시간 반영 시<br />
                  예상 세전급여는 {expectedSalary.toLocaleString()}원,<br />
                  예상 세후급여는 {expectedNetSalary.toLocaleString()}원입니다.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-4 text-gray-500">
            시급을 먼저 계산해 주세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryCalculator;
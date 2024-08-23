/*
  时间处理工具
*/
import dayjs from 'dayjs'
// dayjs 引入插件
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
dayjs.extend(quarterOfYear)

type day_js = dayjs.Dayjs
type date = string | number | day_js | Date | null | undefined
type unit = dayjs.ManipulateType | undefined

/*
  时间格式化
*/
export const formatToString = (date?: date, template: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(template)
}

/*
  在当前时间的基础上增加一定的时间
  @param value：增加的值
  @param unit：增加的单位：day:d week:w month:m quarter:Q year:y hour:h minute:m second:s millisecond:ms
*/
export const add = (value: number, unit?: unit): day_js => {
  return dayjs().add(value, unit)
}

/*
  在当前时间的基础上减少一定的时间
  @param value：减少的值
  @param unit：减少的单位：day:d week:w month:m quarter:Q year:y hour:h minute:m second:s millisecond:ms
*/
export const subtract = (value: number, unit?: unit): day_js => {
  return dayjs().subtract(value, unit)
}

/*
  校验日期格式
*/
export const isValid = (date?: date): boolean => {
  return dayjs(date).isValid()
}

/*
  当前时间是否在另一个提供的日期时间之前
  @param curTime：当前时间
  @param targetTime：另一个提供的日期时间
*/
export const isBefore = (curTime: date, targetTime: date): boolean => {
  return dayjs(curTime).isBefore(targetTime)
}

/*
  当前时间是否和另一个提供的日期时间相同
  @param curTime：当前时间
  @param targetTime：另一个提供的日期时间
*/
export const isSame = (curTime: date, targetTime: date, unit?: unit): boolean => {
  return dayjs(curTime).isSame(targetTime, unit)
}

/*
  当前时间是否在另一个提供的日期时间之后
  @param curTime：当前时间
  @param targetTime：另一个提供的日期时间
*/
export const isAfter = (curTime: date, targetTime: date): boolean => {
  return dayjs(curTime).isAfter(targetTime)
}

/*
  当前时间是否在另一个提供的日期时间之后
  @param curTime：当前时间
  @param targetTime：另一个提供的日期时间
*/
export const isDuring = (curTime: date, timeArr: [startTime: date, endTime: date]): boolean => {
  const c = dayjs(curTime)
  const s = dayjs(timeArr[0])
  const e = dayjs(timeArr[1])
  if (isAfter(s, e)) {
    return false
  }
  if (isAfter(c, s) && isBefore(c, e)) {
    return true
  }
  return false
}

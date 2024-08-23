// treeshaking 编译后会把函数名称改变,内容不变
export const getCurrentTime = () => {
  return 'hello, this is the current time: ' + new Date().toLocaleString()
}

export const deepClone = (target: string[]) => {
  return 'hello, this is json.parse' + JSON.parse(JSON.stringify(target))
}

// export default {
//   getCurrentTime: () => {
//     return 'hello, this is the current time: ' + new Date().toLocaleString()
//   },
//   deepClone: (target: string[]) => {
//     return 'hello, this is json.parse' + JSON.parse(JSON.stringify(target))
//   },
// }

// import { getAgentConfig } from '../apis/user'
// import { getItem } from 'utils/storage'
// import { WECHECT_COOKIE_KEY } from '@/constant'
// import { showToast } from 'vant'

// export const useSDKConfig = async (apiList: Array<string> = []) => {
//   const agentId = getItem(WECHECT_COOKIE_KEY.appInfokey).agentId ?? null
//   const params = {
//     url: location.href,
//     agentId: agentId,
//     type: '1',
//   }
//   const config = await getAgentConfig(params)
//   if (config.code !== 1000) {
//     showToast(config.message)
//     return false
//   }
//   const wd: any = window
//   return wd.wx.config({
//     beta: true, // 必须这么写，否则wx.invoke调用形式的jsapi会有问题
//     // debug: ['development', 'dev'].includes(import.meta.env.VITE_APP_NAME), // 开启调试模式(只在本地以及DEV环境),调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
//     debug: false, // 开启调试模式(只在本地以及DEV环境),调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
//     appId: config.data.corpid || '', // 必填，企业微信的corpID
//     timestamp: config.data.timestamp, // 必填，生成签名的时间戳
//     nonceStr: config.data.nonceStr, // 必填，生成签名的随机串
//     signature: config.data.signature, // 必填，签名，见 附录-JS-SDK使用权限签名算法
//     jsApiList: apiList, // 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
//   })
// }

// // AgentConfig
// export const useSDKAgentConfig = async (apiList = [], successFunc = () => {}) => {
//   const agentId = getItem(WECHECT_COOKIE_KEY.appInfokey).agentId ?? null
//   const params = {
//     url: location.href,
//     agentId: agentId,
//     type: '2',
//   }
//   const config = await getAgentConfig(params)
//   if (config.code !== 1000) {
//     showToast(config.message)
//     return false
//   }
//   const wd: any = window
//   wd.wx.agentConfig({
//     corpid: config.data.corpid, // 必填，企业微信的corpid，必须与当前登录的企业一致
//     agentid: agentId, // 必填，企业微信的应用id （e.g. 1000247）
//     timestamp: config.data.timestamp, // 必填，生成签名的时间戳
//     nonceStr: config.data.nonceStr, // 必填，生成签名的随机串
//     signature: config.data.signature, // 必填，签名，见附录-JS-SDK使用权限签名算法
//     jsApiList: apiList, //必填，传入需要使用的接口名称
//     success: successFunc,
//     fail: function (res: any) {
//       if (res.errMsg.indexOf('function not exist') > -1) {
//         showToast('版本过低请升级')
//       } else {
//         console.error(res)
//       }
//     },
//   })
// }

export default function useSDKConfig(api: string[]) {}

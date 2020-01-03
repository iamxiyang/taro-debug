import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text, Button, OpenData, Block, Input, Image} from '@tarojs/components'
import './index.scss'

declare const my: any;

export interface DebugProps {

}

export interface State {
  id: string,//唯一标识id，通常是由后端提供，结合头像、昵称便于判断用户身份
  curTime: string,//访问到页面的时间，可以根据时间查询日志快速定位错误
  userAvatarUrl: string,//用户头像，微信端不需要使用，也可以是由后端提供
  nickName: string,//用户昵称，微信端不需要使用，也可以是由后端提供
  envVersion: string,//运行版本，支付宝小程序使用。develop：开发版。trial：体验版。release：发布版。 gray：灰度版。
  SDKVersion: string,
  // batteryLevel: string,
  brand: string,
  fontSizeSetting: string,
  language: string,
  model: string,
  pixelRatio: string,
  platform: string,
  screenHeight: number,
  screenWidth: number,
  statusBarHeight: number,
  system: string,
  version: string,
  windowHeight: number,
  windowWidth: number,
  isOpenVconsole: boolean,
  safeArea: {
    left: number,//安全区域左上角横坐标
    right: number,// 安全区域右下角横坐标
    top: number,// 安全区域左上角纵坐标
    bottom: number,//安全区域右下角纵坐标
    width: number,//安全区域的宽度，单位逻辑像素
    height: number,//安全区域的高度，单位逻辑像素
  },
  authSetting: {
    key: string,
    value: string
  }[],
  routerArr: {
    page: string,
    options: string,
    showOptions: boolean
  }[],//路由访问路径
  networkType: string,//网络状态
  inputStorage: string,//需要查看的缓存key
}

/**
 * Taro-Debug
 * 获取小程序的操作信息，便于测试人员、客户快速有效的反馈问题。
 * 制作：何喜阳，个人微信公众号：何喜阳，前端QQ交流群：587912117
 * 建议的入口：截屏弹窗提示（开发阶段）、摇一摇弹窗提示（开发阶段）、输入框特殊指令(线上版本）
 * 可根据自己需求任意修改。比如在app.js监听onError，或request回调中监听错误进行缓存，在此页面显示错误
 */
export default class Debug extends Component<DebugProps, State> {

  config: Config = {
    navigationBarTitleText: '向开发者反馈'
  };

  constructor(props) {
    super(props);
    this.state = {
      id: '',
      curTime: '',
      userAvatarUrl: '',
      nickName: '',
      SDKVersion: '',
      // batteryLevel: '',
      brand: '',
      fontSizeSetting: '',
      language: '',
      model: '',
      pixelRatio: '',
      platform: '',
      screenHeight: 0,
      screenWidth: 0,
      statusBarHeight: 0,
      system: '',
      version: '',
      windowHeight: 0,
      windowWidth: 0,
      isOpenVconsole: false,
      safeArea: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: 0,
        height: 0,
      },
      authSetting: [],
      routerArr: [],
      networkType: '',
      inputStorage: '',
      envVersion: ''
    }
  }

  componentWillMount() {
    // 获取设备基础信息
    Taro.getSystemInfo({
      success: (res) => {
        console.log(res);
        this.setState(res);
      }
    });
    // 获取访问路径
    this.getPages();
    // 获取当前时间
    const {year, month, day, hours, min, seconds} = this.getCurTime();
    this.setState({curTime: `${year}-${month}-${day} ${hours}:${min}:${seconds}`})
    if (process.env.TARO_ENV === 'alipay') {
      this.getAliapyData();
    }
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    // 获取授权状态
    this.getAuthState();
    // 获取网络类型
    Taro.getNetworkType({
      success: res => {
        this.setState({networkType: res.networkType})
      }
    });
  }

  componentDidHide() {
  }

  // 点击强行更新版本
  onUpdate = () => {
    Taro.getUpdateManager();
    Taro.showToast({
      title: '已执行',
      icon: 'none'
    })
  };

  // 切换vconsole状态
  onVconsole = () => {
    const isOpenVconsole = !this.state.isOpenVconsole;
    Taro.setEnableDebug({
      enableDebug: isOpenVconsole
    });
    this.setState({isOpenVconsole});
    Taro.showToast({
      icon: 'none',
      title: isOpenVconsole ? '已开启' : '已关闭'
    })
  };

  // 清理全部缓存
  onClear = () => {
    Taro.clearStorage();
    Taro.showToast({
      title: '已清空',
      icon: 'none'
    })
  };

  // 获取当前时间
  getCurTime = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const min = date.getMinutes();
    const seconds = date.getSeconds();
    return {
      year, month, day, hours, min, seconds
    }
  };

  // 获取授权状态
  getAuthState = () => {
    Taro.getSetting({}).then(res => {
      if (res.authSetting) {
        const {authSetting} = res;
        const authKeysArr = Object.keys(authSetting);
        const authValuesArr = Object.values(authSetting);
        const authArr: any[] = [];
        for (let i = 0, len = authKeysArr.length; i < len; i++) {
          authArr.push({
            'key': authKeysArr[i],
            'value': authValuesArr[i]
          })
        }
        this.setState({authSetting: authArr})
      }
    })
  };

  // 获取访问路由
  getPages = () => {
    const pages = Taro.getCurrentPages();
    const routerArr: any[] = [];
    // 支付宝
    if (process.env.TARO_ENV === 'alipay') {
      for (let i = 0, len = pages.length; i < len; i++) {
        routerArr.push({
          'page': pages[i].route,
          'options': pages[i].$component.$router.params
        })
      }
    } else {
      for (let i = 0, len = pages.length; i < len; i++) {
        routerArr.push({
          'page': pages[i].route || pages[i].router,
          'options': pages[i].options || pages[i].router.params
        })
      }
    }
    this.setState({routerArr});
  };

  // 获取指定缓存
  onGetStorage = () => {
    const {inputStorage} = this.state;
    if (!inputStorage) {
      Taro.showToast({
        icon: 'none',
        title: '没有填写需要获取的key'
      });
      return;
    }
    const value = Taro.getStorageSync(inputStorage);
    Taro.showModal({
      title: inputStorage + '的数据',
      content: JSON.stringify(value) || '没有数据',
      showCancel: false
    })
  };

  // 获取只有支付宝端才支持的数据
  getAliapyData = () => {
    my.getRunScene({
      success: (result) => {
        this.setState({envVersion: result.envVersion})
      },
    });
    this.setState({SDKVersion: my.SDKVersion});
  };

  render() {
    const {id, curTime, version, language, SDKVersion, brand, model, pixelRatio, screenWidth, screenHeight, windowWidth, windowHeight, statusBarHeight, system, platform, fontSizeSetting, safeArea, authSetting, routerArr, networkType, inputStorage, envVersion, userAvatarUrl, nickName} = this.state;
    return (
      <View className='debug'>

        <View className="user">
          <View className="user__avatar">
            {process.env.TARO_ENV === 'weapp' ?
              <OpenData type={"userAvatarUrl"}/> :
              <Image className="user__avatar" src={userAvatarUrl}/>}
          </View>
          <View className="user__text">
            {process.env.TARO_ENV === 'weapp' ?
              <OpenData type={"userNickName"} className="user__name"/> :
              <Text className="user__name">{nickName || '---'}</Text>}
            <Text className="user__id">唯一标识：{id || '---'}</Text>
          </View>
        </View>

        <View className="tips">
          <Text className="tips__text">
            须知：此处提供的一些建议在某些情况下可以帮助您自助解决一些问题，如果仍然无法解决，请把此页面完整的截图、能复现问题的操作步骤告诉我们。
          </Text>
          <Text className="tips__text bold">
            注意：您应该明确的说明问题是怎么出现的（最好有录屏），目前的错误是什么（是否有错误提示语），您认为正确的情况应当是什么样的。
          </Text>
        </View>

        <View className="block">
          <View className="block-title"
                onClick={() => {
                  Taro.showModal({
                    title: '信息说明',
                    content: '我们需要知道这些信息，以便能够有效的判断您的问题。',
                    showCancel: false
                  })
                }}
          >
            <Text>基础</Text>
            <Text className="icon-question">?</Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">访问时间</Text>
            <Text className="block-item__content">{curTime}</Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">APP版本</Text>
            <Text className="block-item__content">{version}</Text>
          </View>
          {envVersion &&
          <View className="block-item">
              <Text className="block-item__title">运行版本</Text>
              <Text className="block-item__content">{envVersion}</Text>
          </View>}
          <View className="block-item">
            <Text className="block-item__title">运行基础库</Text>
            <Text className="block-item__content">{SDKVersion}</Text>
          </View>
        </View>

        <View className="block">
          <View className="block-title"
                onClick={() => {
                  Taro.showModal({
                    title: '信息说明',
                    content: '如果显示效果不符合预期，通常是设备兼容性问题，知道设备信息有助于我们快速定位问题。',
                    showCancel: false
                  })
                }}
          >
            <Text>设备</Text>
            <Text className="icon-question">?</Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">设备品牌</Text>
            <Text className="block-item__content">{brand},{platform}</Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">设备型号</Text>
            <Text className="block-item__content">{model}</Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">操作系统</Text>
            <Text className="block-item__content">{system}</Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">APP语言</Text>
            <Text className="block-item__content">{language}</Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">APP字体设置</Text>
            <Text className="block-item__content">{fontSizeSetting}px</Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">安全区域坐标</Text>
            <Text className="block-item__content">
              t:{safeArea.top} , r:{safeArea.right} , b:{safeArea.bottom} , l:{safeArea.left}
            </Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">安全区域宽高</Text>
            <Text className="block-item__content">
              w:{safeArea.width} , h:{safeArea.height}
            </Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">像素比/状态栏</Text>
            <Text className="block-item__content">{pixelRatio}/{statusBarHeight}</Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">屏幕/可用宽高</Text>
            <Text className="block-item__content">{screenWidth},{screenHeight}/{windowWidth},{windowHeight}</Text>
          </View>
        </View>

        <View className="block">
          <View className="block-title"
                onClick={() => {
                  Taro.showModal({
                    title: '信息说明',
                    content: '如果部分功能无法正常使用，通常是没有获得权限，如果以下显示的有false，请尝试允许我们获取权限。',
                    cancelText: '取消',
                    confirmText: '授权设置',
                  }).then((res) => {
                    if (res.confirm) {
                      Taro.openSetting({})
                    }
                  })
                }}
          >
            <Text>权限</Text>
            <Text className="icon-question">?</Text>
          </View>
          {authSetting.map((it) => {
            return <View className="block-item" key={it.key}>
              <Text className="block-item__title">{it.key}</Text>
              <Text className="block-item__content">{it.value}</Text>
            </View>
          })}

        </View>

        <View className="block">
          <View className="block-title"
                onClick={() => {
                  Taro.showModal({
                    title: '信息说明',
                    content: '如果突然无法访问，有可能是网络不通畅引起的，可切换网络(WiFi/4G)尝试，也可直接向我们反馈',
                    showCancel: false
                  })
                }}
          >
            <Text>网络</Text>
            <Text className="icon-question">?</Text>
          </View>
          <View className="block-item">
            <Text className="block-item__title">网络状态</Text>
            <Text className="block-item__content">{networkType}</Text>
          </View>
        </View>

        <View className="block">
          <View className="block-title"
                onClick={() => {
                  Taro.showModal({
                    title: '信息说明',
                    content: '知道您的访问路径对处理问题是极其有用的，请反馈时务必告诉我们您是怎么出现问题的，您是不是100%出现问题，有可能的话可以录屏告诉我们。',
                    showCancel: false
                  })
                }}
          >
            <Text>路径</Text>
            <Text className="icon-question">?</Text>
          </View>
          {routerArr.map((it, index) => {
            const options = it.options && JSON.stringify(it.options);
            return <Block key={'router' + it.page}>
              <View className="block-item"
                    onClick={() => {
                      routerArr[index].showOptions = !routerArr[index].showOptions;
                      this.setState({routerArr})
                    }}>
                <Text className="block-item__title">{it.page}</Text>
                <Text className="block-item__content">{(options && options !== '{}') ? '存在options，点击查看' : ''}</Text>
              </View>
              {it.showOptions &&
              <View className="router-options">
                  <Text className="block-item__content">
                      页面参数：{(options && options !== '{}') ? options : '---'}
                  </Text>
              </View>}
            </Block>
          })}
        </View>

        <View className="block tool">
          <View className="block-title"
                onClick={() => {
                  Taro.showModal({
                    title: '信息说明',
                    content: '在跨版本，特别是初期进行测试的过程中可能会有一些情况是缓存引起的，此处提供的一些工具便于您自己尝试修复。',
                    showCancel: false
                  })
                }}
          >
            <Text>工具</Text>
            <Text className="icon-question">?</Text>
          </View>
          <View className="block-item tool-item">
            <Input className="input"
                   placeholder="输入缓存的key"
                   value={inputStorage}
                   onInput={event => {
                     const value = event.detail.value;
                     this.setState({inputStorage: value});
                     return value;
                   }}
            />
            <Button className="btn" onClick={this.onGetStorage}>查看缓存</Button>
          </View>
          <View className="block-item tool-item">
            <Button className="btn" onClick={this.onClear}>清空缓存</Button>
            <Button className="btn" onClick={this.onVconsole}>打开vConsole</Button>
          </View>
          <View className="block-item tool-item">
            <Button className="btn" onClick={this.onUpdate}>强制更新（线上版本有效）</Button>
          </View>

        </View>

      </View>
    )
  }
}

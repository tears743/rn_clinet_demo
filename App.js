/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  TouchableOpacity,
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  NativeModules,
    DeviceEventEmitter,
    NativeAppEventEmitter,
    NativeEventEmitter,
    TextInput,
    FlatList,

} from 'react-native';
import _ from 'lodash'
import Client from 'react-native-im-client'
const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
let sessionId=''
export default class App extends Component<Props> {
    constructor(props){
        super(props)
        this.state={
            recText:'无数据',
            sendText:'',
            messageDataList:[],
        }
    }
  clientRequest=(payload)=>{
      return new Promise(resolve => {
          Client.asyncSend(payload).then(res=>{
              console.log("send response:",res)
                  resolve(res)
          }).catch(err=>{
              console.warn(err)
          })
      })

  }
  getAndSetSession=()=>{

      Client.asyncSend({
          operator:'/v1/session/start',
          params:JSON.stringify(
              {
                  "device": "pc",// 客户端设备信息：pc、pad、mobile、web等
                  "os": "linux", // 客户端运行的操作系统
                  "os_version": "3.6", // 操作系统版本
                  "app": "go-client", // 客户端运行的app
                  "app_version": "1.0", // // 客户端运行的app版本
                  "tag":{} // 用于发送自定义标记
              }
          )
      }).then(res=>{
          console.log(res)
          sessionId=res&&res.params&&res.params.value
          console.log(sessionId)
          Client.setRequestProperty('sid',sessionId)
          this.clientRequest({
              operator:'/v1/session/bind/uid/by/token',
              params:JSON.stringify(
                  {
                      "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVkIjoxNTI5NzUzNTE3LCJ1c2VyX2lkIjoyMTd9.lqCcjHx7_AgHdPiH6C_d-BJBsDACm-38NVf0JOGItw4",
                  }
              )
          })
      })

}

  componentDidMount(){


    Client.connect('121.41.20.11','2015').then(res=>{
      console.log(res)
      // this.clientRequest({
      //     operator:'/v1/session/start',
      //     params:JSON.stringify(
      //         {
      //             "device": "pc",// 客户端设备信息：pc、pad、mobile、web等
      //             "os": "linux", // 客户端运行的操作系统
      //             "os_version": "3.6", // 操作系统版本
      //             "app": "go-client", // 客户端运行的app
      //             "app_version": "1.0", // // 客户端运行的app版本
      //             "tag":{} // 用于发送自定义标记
      //         }
      //     )
      // }).then(res=>{
      //     // sessionId=res.value
      //     // Client.setRequestProperty('sid',sessionId)
      //     this.clientRequest({
      //         operator:'/v1/session/bind/uid/by/token',
      //         params:JSON.stringify(
      //             {
      //                 token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVkIjoxNTI4Nzg3NzMzLCJ1c2VyX2lkIjoyMTd9.d82-vvBR2IJgoqVpjjT-3-4F5dHNAI1AtqgY-ZiLqqA',
      //             }
      //         )
      //     })
      // })


    }).catch(err=>{console.warn(err)})
      console.log('addEventListener')
      NativeAppEventEmitter.addListener('onMessage',(res)=>{
          console.log('receive:::',res)
          const receiveData= JSON.parse(_.get(res,'params',''))
          this.setState({
              messageDataList:[...this.state.messageDataList,...receiveData]
          })
      })
  }
    send=()=>{
      const sendData=  {
              "from": "218", // 消息发送者
              "type": "chat", // 消息类型：chat：单聊 group: 群聊 room:聊天室
              "to": "217", // 消息接收者
              "msg": {
                  "message": this.state.sendText,
                  "type": "text" // 消息类型:text audio image video
              },
              "ext": null // 扩展消息
      }

      Client.asyncSend({
          operator:'/v1/send/message',
          params:JSON.stringify(sendData),
      }).then(res=>{
        console.log(res)
          this.setState({
              messageDataList:[...this.state.messageDataList,sendData]
          })
      }).catch(err=>{
        console.warn(err)
      })
    }
    onTextChange=(val)=>{
        this.setState({
            sendText:val
        })
    }
    renderItem=(data)=>{
        const item  = _.get(data,'item','')
        const sender = _.get(item,'from','');
        const message = _.get(item,'msg.message','')
        console.log(item)
        return <View style={{margin:5,width:Dimensions.get('window').width,flex:1,flexDirection:'row',alignItems:'center'}}>
            <View style={{borderRadius:5,backgroundColor:'#71a1ed',padding:5}}>
            <Text style={{color:'#fff'}}>{sender}</Text>
            </View>
            <View style={{marginHorizontal:10,borderRadius:5,backgroundColor:'#71a1ed',padding:5}}>
            <Text style={{color:"#fff"}}>{message}</Text>
            </View>
        </View>
    }
    getKey=(item,index)=>{
        return ""+index
    }
  render() {
    return (
      <View style={styles.container}>

          {/*<Text>{this.state.recText}</Text>*/}
          <View style={{flex:1}}>
          <FlatList
              data={this.state.messageDataList}
              renderItem={this.renderItem}
              keyExtractor={this.getKey}
              style={{flex:1}}
              refreshing={true}
          />
          </View>
        <View style={{alignSelf:'flex-end',alignItems:'center',flexDirection:'row',padding:10}}>
            <TextInput onChangeText={this.onTextChange} value={this.state.sendText} multiline style={{margin:5,padding:5,width:200,borderRadius:20,borderWidth:1,borderColor:"#999"}} underlineColorAndroid="transparent"/>
        <TouchableOpacity style={{padding:5,borderRadius:5,borderWidth:1,borderColor:'#71a1ed',backgroundColor:'#71a1ed'}}  onPress={this.send}>
          <Text style={{color:'#fff'}}>发送消息</Text>
        </TouchableOpacity>
          <TouchableOpacity style={{marginLeft:3,padding:5,borderRadius:5,borderWidth:1,borderColor:'#79c482',backgroundColor:'#79c482'}} onPress={this.getAndSetSession}>
              <Text style={{color:'#fff'}}>初始会话</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection:'row',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

import React from 'react';
import { StyleSheet, View, ActivityIndicator,FlatList,Dimensions, Image, Animated, TouchableWithoutFeedback,TouchableOpacity,CameraRoll, Share, Alert } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
// import * as Sharing from 'expo-sharing';
const {height,width} = Dimensions.get('window');
export default class App extends React.Component {

  constructor() {
    super()
    this.state ={ 
      isLoading: true,
      images:[],
      scale:new Animated.Value(1),
      isImageFocused:false
    }
    this.scale ={
    transform:[{scale:this.state.scale}]
    }
    this.actionBarY = this.state.scale.interpolate({
        inputRange:[0.9,1],
        outputRange:[0,-80]
    });
    this.borderRadius = this.state.scale.interpolate({
      inputRange:[0.9,1],
      outputRange:[30,0]
  })
  };

  

  loadWallpapers=() =>{
axios.get('https://api.unsplash.com/photos/random?count=30&client_id=b6a085058c4aba520362aa744186cd78425580088fd19a00e43f5be229b689cb').then(function(response){
  console.log(response.data)
  this.setState({images:response.data, isLoading:false});
}.bind(this)).catch(function(error){
  console.log(error)
}).finally(function(){
  console.log('request is completed')
});
  }

  shareWallpaper=async(image) => {
    try{
       await Share.share({
         message: 'Checkout this Wallpaper' +  image.urls.full
       });
    }catch(error){
      console.log(error);
    }
   };

  componentDidMount(){
    this.loadWallpapers()
  }

  saveToCameraRoll = async(image)=>{
    let cameraPermissions = await Permissions.getAsync(Permissions.CAMERA_ROLL);
  if(cameraPermissions.status !== 'granted'){
    cameraPermissions = await Permissions.askAsync
    (Permissions.CAMERA_ROLL);
  } if(cameraPermissions.status === 'granted'){
    FileSystem.downloadAsync(
      image.urls.regular,
      FileSystem.documentDirectory + image.id + '.jpg'
    ).then(({uri}) =>{
      CameraRoll.saveToCameraRoll(uri);
      Alert.alert('Saved to Photos');
    }).catch(error =>{
      console.log(error)
    })
  }else{
    Alert.alert('Requires camera roll permission');
  }};


  
   
  showControls =(item) =>{
    this.setState((state) =>({
      isImageFocused:!state.isImageFocused
    }),() =>{
      if(this.state.isImageFocused){
        Animated.spring(this.state.scale,{
          toValue:0.9
        }).start()
      }else{
        Animated.spring(this.state.scale,{
          toValue:1
        }).start()
      }
    })
  }

  renderItem =({item}) =>{
    return(
      <View style={{flex:1}}>
        <View style={{
          position:'absolute',
          top:0,
          right:0,
          left:0,
          bottom:0,
          backgroundColor:'black'
        }}>
       <ActivityIndicator size="large" color="grey" />
        </View>
    <TouchableWithoutFeedback onPress={() =>this.showControls(item)}>
   <Animated.View style={[{width}, this.scale]}>
<Animated.Image source={{uri: item.urls.regular}}
 style={{ height:'100%', width:null, borderRadius:this.borderRadius}}
 resizeMode="cover"/>
   </Animated.View>
   </TouchableWithoutFeedback> 
   <Animated.View
   style={{
     position:'absolute',
     left:0,
     right:0,
     bottom:this.actionBarY,
     height:80,
     backgroundColor:'black',
     flexDirection:'row',
     justifyContent:"space-around"
   }} >
     <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
       <TouchableOpacity activeOpacity={0.5} onPress={() => this.loadWallpapers()}>
         <Ionicons name="ios-refresh" color="white" size={40} />
       </TouchableOpacity>
     </View>
     <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
       <TouchableOpacity activeOpacity={0.5} onPress={() => this.shareWallpaper(item)}>
         <Ionicons name="ios-share" color="white" size={40} />
       </TouchableOpacity>
     </View>
     <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
       <TouchableOpacity activeOpacity={0.5} onPress={() => this.saveToCameraRoll(item)}>
         <Ionicons name="ios-save" color="white" size={40} />
       </TouchableOpacity>
     </View>

     </Animated.View>
   </View>
    )
  }
  render(){
  return  this.state.isLoading?(
  <View style={{flex:1, backgroundColor:'black', justifyContent:'center', alignItems:'center'}}>
  <ActivityIndicator size="large" color='grey' />
  </View>
  ): (
    <View style={{flex:1, backgroundColor:'black'}} >
      <FlatList 
      scrollEnabled={!this.state.isImageFocused}
       horizontal
       pagingEnabled
       data={this.state.images}
       renderItem={this.renderItem}
       keyExtractor={item => item.id}
      /></View>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
 
//新增缺陷页面
import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    ScrollView,
    InteractionManager,
    TouchableOpacity,
    TextInput,
    DeviceEventEmitter
} from 'react-native';
import {WhiteSpace, Button, DatePicker, Toast, ActivityIndicator} from 'antd-mobile';
//项目分期
import ProjectStaging from './newDefectsItems/ProjectStaging'
// import ApiTest from './APITest'
//责任人
import Responsibilitys from './newDefectsItems/Responsibilitys'
// 选择类别状态
import CategorySelection from './newDefectsItems/categorySelection/CategorySelection'
//选择行业类别
import BusinessTypeSelection from './newDefectsItems/categorySelection/BusinessTypeSelection'
// 选择紧急状态
import UrgentSelection from './newDefectsItems/categorySelection/UrgentSelection'
//引入'新建质量问题'上传数据方法
import {newQualityPro} from "../../dao/QualityProblemNewDao"
// import {receiveQualityPro} from "../../dao/QualityListDao";
import { FetPost } from '../../util/HttpBase';
//控制单击事件
import NoDoublePress from '../../util/NoDoublePress'
import {queryQualityDetail} from "../../dao/QualityListDao";
// 照片选择器
import HZImagePicker from '../../common/HZImagePicker'

//提交数据
import {doPostToken} from '../../util/HttpBase'

type props = {}
export default class QualityProblemNEW extends Component<props> {
    imgPicker: any
    id: integer

    getUrgentStatusCodeByName(name) {
        switch (name) {
            case "重要":
                return "Important"
            case "重要且紧急":
                return "ImportantAndUrgency"
            case "紧急":
                return "Urgency"
            case "普通":
                return "Norm"
        }
    }
    // 5、类别：增加一个一级类别，一级暂定：工程、设计、物业、前期、营销
    getBusinessTypeSelectionKey(name){
       switch (name){
           case "工程":
               return "Engineering"
           case "设计":
               return "Design"
           case "物业":
               return "Property"
           case "前期":
               return "Prophase"
           case  "营销":
               return 'Marketing'
       }
    }
    getCategoryCodeByName(name) {
        switch (name) {
            case "土建类":
                return "0101"
            case "安装类":
                return "0102"
            case "精装/软装类":
                return "0103"
            case "景观类":
                return "0104"
            case "工程质量类":
                return "02"
        }
    }

    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this.substraction = null
        this.id = props.id ? id : 0
        this.state = {
            projectSectionName: "",
            simpleDescriptionText: '',
            descriptionText: '',
            categoryKey: '',
            UrgentSelectionKey: "",
            categorySelection: "",
            number: "99",
            name: '请选择责任人',
            projectStagingName: "请选择项目分期",
            phone: '',
            userSelectCode: "",
            images: [],
            // 行业类别
            businessTypeKey:''

        }
    }

    selectUser = (payload) => {
        this.setState({...payload})
    }
    selectProject = (payload) => {
        this.setState({...payload})
    }

    //类型选择
    categorySelectionKey(key) {
        this.setState({
            categoryKey: this.getCategoryCodeByName(key)
        })
    }

    //行业类别选择
    businessTypeSelectionKey(key) {
        this.setState({
            businessTypeKey: this.getBusinessTypeSelectionKey(key)
        })
    }

    //紧急程度选择
    UrgentSelectionKey(key) {
        this.setState({
            UrgentSelectionKey: this.getUrgentStatusCodeByName(key)
        })
    }

    // 上传图片

    _onPressButton(str) {
        this.setState({images: str});
        // console.log(str, '1111111111111111111qqqqqqqqqqqqqq')
    }

    //提交问题(post)
    saveDraft = () => {
         if(!this.state.projectSelectCode&&this.state.projectSelectCode!="请选择项目分期"){
             Toast.info("请选择项目分期!")
             return false;
         }else  if(!this.state.simpleDescriptionText){
             Toast.info("请填写简述!")
             return false;
         }else  if(!this.state.descriptionText){
             Toast.info("请填写详细描述!")
             return false;
         }else  if(!this.state.categoryKey){
             Toast.info("请选择类别")
             return false;
         }else  if(!this.state.businessTypeKey){
             Toast.info("请选择行业类别!")
             return false;
         }else  if(!this.state.UrgentSelectionKey){
             Toast.info("请选择紧急程度!")
             return false;
         }else  if(this.state.name == "请选择责任人"){
             Toast.info("请选择责任人!")
             return false;
         }else {

        let formData = new FormData();      //因为需要上传多张图片,所以需要遍历数组,把图片的路径数组放入formData中
        for(var i = 0;i<this.state.images.length;i++){
            let file = {uri: this.state.images[i].uri, type: 'multipart/form-data', name: this.state.images[i].name};   //这里的key(uri和type和name)不能改变,
            formData.append("files",file);   //这里的files就是后台需要的key
        }
        // formData.append("problemId",this.id);
        formData.append("projectSectionCode",this.state.projectSelectCode);
        formData.append("category",this.state.categoryKey);
        formData.append("simpleDescription",this.state.simpleDescriptionText);
        formData.append("description",this.state.descriptionText);
        // formData.append("submitPeopleId",this.id);
        formData.append("responsibilityUserId",this.state.userSelectId);
        formData.append("responsibilityUserName", this.state.name);
        formData.append("urgencyStatus",this.state.UrgentSelectionKey);
        formData.append("responsibilityUserPhone",this.state.phone);
        //行业选择
         // formData.append("businessTypeKey",this.state.businessTypeKey)
        FetPost("/qa/qualityProblem.do", data)
            .then((responseData) => {
                if (responseData.code === 200) {
                    Toast.info('提交成功 !!!', 1, () => {
                        InteractionManager.runAfterInteractions(() => {
                            this.props.navigation.navigate('QualityList', {
                                qualityStatusIndex: 1, //草稿页面
                                qualityImpIndex: 0,
                                qualityTypeIndex: 0,
                            })
                        })
                    })
                }

            })
            .catch((error) => {
                Toast.info('提交失败，请稍后再试 !!!', 1)
            })
        }
    }
    static navigationOptions = {
        title: '新增缺陷',
    }
    componentDidMount() {
        // 组件通知接收
        let _this = this
        this.substraction = DeviceEventEmitter.addListener('userSelected', function (payload) {
            _this.setState(payload)
        })
        this.substraction = DeviceEventEmitter.addListener('StagingSelected', function (payload) {
            _this.setState(payload)
        })

    }

    componentWillUnmount() {
        //组件清除通知
        this.substraction.remove('')
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView>
                    {/*项目分期*/}
                    <View>
                        <ProjectStaging navigation={this.navigation}
                                        projectStagingName={this.state.projectStagingName}
                                        selectProject={(payload) => this.selectProject(payload)}
                        />
                    </View>
                    <View style={[styles.container, {
                        borderTopWidth: 0.8,
                        borderTopColor: '#eee', marginBottom: 10
                    }]}>
                        <View style={styles.list}>
                            <Text style={styles.position}>简述:</Text>
                            <TextInput style={styles.content}
                                       onChangeText={(positionText) => this.setState({simpleDescriptionText: positionText})}
                                       value={this.state.simpleDescriptionText} multiline={true}
                                       underlineColorAndroid="transparent"
                            placeholder={"今天天气好晴朗,处处好风光!"}/>
                        </View>
                    </View>
                    <View style={[styles.container, {
                        borderTopWidth: 0.8,
                        borderTopColor: '#eee'
                    }]}>
                        <View style={styles.list}>
                            <Text style={styles.position}>详细描述:</Text>
                            <TextInput style={styles.content}
                                       onChangeText={(descriptionText) => this.setState({descriptionText})}
                                       value={this.state.descriptionText} multiline={true}
                                       underlineColorAndroid="transparent"
                                       placeholder={"今天天气好晴朗,处处好风光!"}/>
                        </View>
                    </View>
                    {/*//选择类别*/}
                    <View style={{marginTop: 10}}>
                        <CategorySelection categoryKey={(value) => this.categorySelectionKey(value)}/>
                    </View>
                    {/*//选择行业类别*/}
                    <View >
                        <BusinessTypeSelection businessTypeSelectionKeyF={(value) => this.businessTypeSelectionKey(value)}/>
                    </View>
                    {/*//选择紧急状态*/}
                    <View>
                        <UrgentSelection rgentKey={(value) => this.UrgentSelectionKey(value)}/>
                    </View>
                    {/*责任人*/}
                    <View>
                        <Responsibilitys name={this.state.name}
                                         phone={this.state.phone}
                                         navigation={this.navigation}
                                         selectUser={(payload) => this.selectUser(payload)}/>
                    </View>
                    {/*拍照*/}

                    <View style={{paddingLeft: 25, paddingTop: 10}}>
                        <HZImagePicker ref={(ref) => {
                            this.imgPicker = ref
                        }} itemWidth={70} itemHeight={70} editable={true} images={this.state.images}
                                       callback={(value) => this._onPressButton(value)}/>
                    </View>
                    {/*<View style={{paddingLeft: 25, paddingTop: 10}}>*/}
                    {/*<HZImagePicker ref={(ref) => {*/}
                    {/*this.imgPicker = ref*/}
                    {/*}} itemWidth={70} itemHeight={70} editable={true} images={this.state.images} />*/}
                    {/*</View>*/}
                    <TouchableOpacity>
                        <View style={styles.saveCollect}>
                            <View style={styles.submitSaveBox}>
                                <Button onClick={() => NoDoublePress.onPress(() => this.saveDraft())}
                                        style={[styles.submit_saveDraft,]}>
                                    <Text style={styles.saveDraftText}>提交问题</Text>
                                </Button>

                            </View>
                            {/*<View style={[styles.submitSaveBox, styles.submitBox]}>*/}
                            {/*<Button text="red" onClick={() => NoDoublePress.onPress(() => this.submit())}*/}
                            {/*style={[styles.submit_saveDraft]}*/}
                            {/*style={[styles.submitText, styles.submitText_saveDraftText]}>*/}
                            {/*<Text style={styles.submitText_saveDraftText}>保存并提交</Text>*/}
                            {/*</Button>*/}
                            {/*</View>*/}

                        </View>
                    </TouchableOpacity>

                </ScrollView>

            </View>
        );
    }
}
//获取屏幕宽度  
var Dimensions = require('Dimensions');
var width = Dimensions.get('window').width;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        flexDirection: "column",
        justifyContent: 'flex-start',
        backgroundColor: "#fff"
        // alignItems:'center',
        // backgroundColor: 'pink',
    },
    saveCollect: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: "center",
        backgroundColor: "#fff",
        // width: '100%',
        alignItems: 'center',
        paddingLeft: 30,
        paddingRight: 30,
        paddingBottom: 14,
    },
    // 保存并提交
    submitSaveBox: {
        // flex:1,
        marginTop: 15,
        paddingBottom: 15,
        // left:25

    },
    submitBox: {
        marginLeft: "30%",
    },

    // 保存草稿
    submit_saveDraft: {
        flex: 1,
        alignSelf: 'center',
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 5,
        borderWidth: 0,
        backgroundColor: "#3a80fd",
        // textAlign: 'center',

    },
    submitText_saveDraftText: {
        flex: 1,
        // fontSize: 20,
        // fontFamily: "Microsoft YaHei",
        // backgroundColor: "#3a80fd",
        backgroundColor: "#fff",
        // textAlign: 'center',
        paddingTop: 5,
        paddingBottom: 5,

        borderRadius: 5,
        // color:'#494c51'
    },
    submitText: {
        // color: '#00A0F4'
    },
    saveDraftText: {
        color: '#ffffff',
    },
    // 具体位置和详情描述开始
    list: {
        marginTop: 10,
        marginLeft: 13,
        paddingRight: 18
    },
    position: {
        fontSize: 18,
        marginLeft: 13,
        color: "#494c51",
        fontFamily: "Microsoft YaHei",
    },
    content: {
        minHeight: 60,
        fontSize: 16,
        color: "#494c51",
        fontFamily: "Microsoft YaHei",
        backgroundColor: "#f6f6f6",
        marginTop: 6,
        marginLeft: 13,
        marginRight: 10,
        padding: 6,
        textAlignVertical: 'top',
    }
    // 具体位置和详情描述结束
});

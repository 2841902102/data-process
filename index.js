import React from 'react';
import { Modal, Upload, Icon, Button, message, Spin } from 'antd';
import './index.css'
const Draggable = require('react-draggable');
const Dragger = Upload.Dragger;

/*
    params:
        action: 请配置请求地址，非必传
        wsUrl: WebSocket服务地址，非必传
        headers: 设置上传的请求头部，非必传
        data: 上传所需参数或返回上传参数的方法，非必传   
        width: modal框宽度，非必传，默认为600
        title: 标题名称，非必传，默认为空
        uploadShow: Upload上传组件是否显示，非必传，默认为true
        downLoadShow: 下载按钮是否显示，非必传，默认为true
        downLoadValue: 下载按钮文字，非必传，默认为'下载文件'
        closeShow: 关闭按钮是否显示，非必传，默认为true
        closeValue: 关闭按钮文字，非必传，默认为'关闭'

    api:
        handleClose: 点击关闭时的回调
        handleDownload: 点击下载文件时的回调
*/

const DataProcess =React.createClass({
    getInitialState() {
        return {
            offsetLeft: null,
            offsetTop: null,
            mStyle: null,
            visible: false,
            downloadDisabled: true,
            fileList: [],
            logMsg: null,
            loading: false
        };
    },

    // 上传文件
    handleChange(info) {
        let file = info.file;
        let fileList = [];
        this.setState({logMsg: null});

        if (file.status !== "removed") {
            this.setState({loading: true})
            if (file.response) {
                file.url = file.response.url;
                this.setState({logMsg: file.response.backMsg, loading: false});
                if (!file.response.success) {
                    file.status = "error";
                    message.error(`${file.name} file upload failed.`);
                } else {
                    message.success(`${file.name} file uploaded successfully`);                   
                }
            }
            fileList = [file]
        }

        if (file.status === "done" || file.status === "error") {
            this.setState({downloadDisabled: false});
        }

        if (file.status === "removed") {
            fileList = []
            this.setState({logMsg: null, downloadDisabled: true});
        }
        
        this.setState({fileList});
    },

    //渲染可拖拽区域的头部
    renderDraggableHeader() {
        const {title, draggable=true} = this.props;
        const that = this;
        //如果未启用拖拽则默认返回原始title
        if (!draggable) return title;
        //包装拖拽的头部区域
        let headerTitle = null;
        if (title) {//如果存在头部标题|元素则直接在此基础上包装
            if (React.isValidElement(title)) {
                headerTitle = title;
            } else {
                headerTitle = <div style={{cursor: 'move'}}>{title}</div>;
            }
        } else {//如果不存在头部标题则构建一个空的头部作为可拖拽区域
            headerTitle = <div style={{cursor: 'move'}} className="empty-draggable-area">点此处拖拽移动</div>;
        }
        const rndDiv =
            <Draggable
                position={{x: 0, y: 0}}
                onStart={(e,data)=>{
                    //获取到yyui-modal ant-modal层级的元素矩阵
                    var modalRect = e.currentTarget.parentNode.parentNode.parentNode.parentNode.getBoundingClientRect();
                    //获取当前点击位置距离弹窗左上角的位置
                    var offsetLeft = e.clientX - modalRect.left;
                    var offsetTop = e.clientY - modalRect.top;
                    //清除默认的margin，定位到当前原始位置
                    that.setState({mStyle:{margin:0,left:modalRect.left,top:modalRect.top},offsetLeft,offsetTop});
                }}
                onDrag={(e,data)=>{
                    //移动到对应拖拽时的位置
                    that.setState({mStyle:{margin:0,left:e.clientX-that.state.offsetLeft,top:e.clientY-that.state.offsetTop}});
                }}
                onStop={(e,data)=>{
                    // that.setState({mStyle:{left:e.clientX,top:e.clientY}});
                }}
            >
                {headerTitle}
            </Draggable>
        return rndDiv;
    },

    // 显示组件
    showModal() {
        this.setState({visible: true});
        this.handleWebSocket();
    },

    // 隐藏组件
    hideModal() {
        this.setState({
            visible: false,
            fileList: [],
            logMsg: null,
            downloadDisabled: true,
            loading: false
        });

        if (this.props.handleClose && typeof this.props.handleClose == 'function') {
            this.props.handleClose(this.state.fileList);
        }
    },

    // 下载文件
    handleDownload() {
        // let downloadUrl = 'https://ccpre.yonyouccs.com/icop-orgcenter-web/staff/downImportErr?tenantId=wg7t6538';
        // window.open(downloadUrl);
        if (this.props.handleDownload && typeof(this.props.handleDownload) == "function") {
            this.props.handleDownload(this.state.fileList);
        }
    },

    // webSocket通信
    handleWebSocket() {
        let websocket = null;
        const { wsUrl='ws://127.0.0.1:8080' } = this.props;
        if ('WebSocket' in window) {
            websocket = new WebSocket(wsUrl);
        } else {
            message.warning('该浏览器不支持websocket！');
        }
    
        websocket.onopen = () => {
            console.log('建立连接');
        }
    
        websocket.onclose = (res) => {
            console.log('连接关闭');
        }
    
        websocket.onmessage = () => {
            console.log('收到消息');
        }
    
        websocket.onerror = () => {
            message.error('websocket通信发生错误！')
        }
    
        window.onbeforeunload = () => { 
            websocket.close();
        }
    
        window.onunload = () => {
            websocket.close();
        }
    },
 
    render() {
        const modalTitle = this.renderDraggableHeader();
        const {visible, downloadDisabled, logMsg, loading} = this.state;
        const {
            action='https://ccpre.yonyouccs.com/icop-share-web/dict/category/device/importApplyCategory/1622531401565', 
            headers,
            data, 
            width = 600, 
            uploadShow = true, 
            downLoadShow = true, 
            downLoadValue = '下载文件', 
            closeShow = true,
            closeValue = '关闭'
        } = this.props;
        const props = {
            action,
            headers,
            data,
            onChange: this.handleChange
        };
        const logMsgObj = JSON.parse(logMsg || null);
        const text  = [];
        for ( let key in logMsgObj) {
            const item = [];
            logMsgObj[key].forEach(function(ele){
                item.push(<dd style={{"text-indent":"2em"}}>{ele}</dd>);
            })
            text.push(<div><dt>{key}</dt>{item}</div>);  
        }
        return (
            <Modal width={width} title={modalTitle} visible={visible} style={this.state.mStyle}
                onOk={() => this.handleOk()} onCancel={() => this.hideModal()}
                footer={[
                    downLoadShow && <Button key="download" type="primary" disabled={downloadDisabled} onClick={() => this.handleDownload()}>{downLoadValue}</Button>,
                    closeShow && <Button key="close" type="primary" onClick={() => this.hideModal()}>{closeValue}</Button>,
                ]}
            >
                <Spin spinning={loading}>
                    <div>
                        {uploadShow ? <Dragger {...props} fileList={this.state.fileList}>
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">点击或将文件拖拽到此区域上传</p>
                            <p className="ant-upload-hint">仅支持单个上传，严禁上传公司内部资料及其他违禁文件</p>
                        </Dragger> :
                        <Upload {...props} fileList={this.state.fileList}></Upload>}
                    </div>
                    { logMsg &&
                    <div className='log-content'>
                        <p><dl>{text}</dl></p>
                    </div> }
                </Spin>
            </Modal>
        );
    }
})

export default DataProcess
import React, { useState, useEffect, useRef } from 'react';
import {Layout, Menu, Button, theme, DatePicker, Modal} from 'antd';
import {UserOutlined, MedicineBoxOutlined, MoneyCollectOutlined} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import SimplePeer from 'simple-peer';
import TextArea from "antd/es/input/TextArea";

const { Header, Content, Footer, Sider } = Layout;

const MemberCallpage = () => {
    const navigate = useNavigate();
    const [isCalling, setIsCalling] = useState(false);
    const [stream, setStream] = useState(null);
    const [peer, setPeer] = useState(null);

    const [incomingCall, setIncomingCall] = useState(null); // 保存来电信息
    const [caller, setCaller] = useState(null); // 保存来电者
    const [modalVisible, setModalVisible] = useState(false); // 控制弹窗显示
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);
    let username = localStorage.getItem("username");
    const serverURL = `ws://192.168.191.99:8080/transfer/${username}`; // 替换为你的 WebSocket URL


    useEffect(() => {
        // 初始化 WebSocket
        socketRef.current = new WebSocket(serverURL);

        socketRef.current.onopen = () => {
            console.log("WebSocket 连接成功");
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'offer') {
                console.log('接收到 Offer', data);
                setIncomingCall(data.sdp); // 统一使用 sdp
                console.log(data.sdp.sdp);
                setCaller(data.fromUser); // 保存来电者信息
            } else if (data.type === 'candidate') {
                console.log(data.candidate);
                if (peer) peer.signal(data.candidate);
            }else if (data.type === 'bye') {
                console.log("接收到 bye 消息，断开连接");
                setModalVisible(true);
                // 关闭 Peer 连接
                // if (newPeer) {
                //     newPeer.destroy();
                //     console.log("Peer 连接已关闭");
                // }
                //
                localVideoRef.current.srcObject=null;
                remoteVideoRef.current.srcObject = null;

                //
                //
                //
                // // 重置状态
                setPeer(null);
                setIsCalling(false);
                // return;
            }
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close(); // 关闭 WebSocket 连接
            }
        };
    }, []);

    const acceptCall = async (offerSdp) => {
        try {
            // 获取本地流
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(localStream);

            // 将本地视频流绑定到视频元素
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
                localVideoRef.current.play().catch((err) => console.error("本地视频播放失败:", err));
            }

            console.log('本地流:', localStream);

            // 创建接收方的 Peer 实例
            const newPeer = new SimplePeer({
                initiator: false, // 接收方
                trickle: true, // 分阶段发送 ICE 候选者
                stream: localStream, // 绑定本地流
                config: {
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" }, // 免费的 STUN 服务器
                    ],
                },
            });

            // 监听信令数据
            newPeer.on("signal", (data) => {
                if (data.type === "answer") {
                    console.log("发送 Answer SDP:", data);
                    socketRef.current.send(
                        JSON.stringify({
                            type: "answer",
                            fromUser: username, // 替换为当前用户 ID
                            targetUser: caller, // 替换为目标用户 ID
                            sdp: data, // 包含 SDP
                        })
                    );
                } else if (data.candidate) {
                    console.log("发送 ICE 候选者:", data.candidate);
                    socketRef.current.send(
                        JSON.stringify({
                            type: "candidate",
                            fromUser: username,
                            targetUser: caller,
                            candidate: data.candidate,
                        })
                    );
                }
            });

            // 接收远程流
            newPeer.on("stream", (remoteStream) => {
                console.log("接收到远程流:", remoteStream);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current
                        .play()
                        .catch((err) => console.error("远程视频播放失败:", err));
                }
            });

            // 监听错误事件
            newPeer.on("error", (err) => {
                console.error("Peer 连接出错:", err);
            });

            // 监听关闭事件
            newPeer.on("close", () => {
                console.log("Peer 连接已关闭");
                setPeer(null);
                setIsCalling(false);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = null;
                }
            });

            // 设置对方的 SDP 信息
            console.log("接收到的 Offer SDP:", offerSdp);
            newPeer.signal(offerSdp);

            // 更新状态
            setPeer(newPeer);
            setIncomingCall(null); // 清除来电信息
            setIsCalling(true);
        } catch (error) {
            console.error("处理来电时出错:", error);
            alert("连接出错，请稍后重试。");
        }
    };



    const rejectCall = () => {
        socketRef.current.send(
            JSON.stringify({
                type: "bye",
                fromUser: username, // 替换为当前用户 ID
                targetUser: caller, // 替换为目标用户 ID
            })
        );
        setIncomingCall(null); // 清除来电状态
    };

    const endCall = () => {
        rejectCall();
        localVideoRef.current.srcObject = null;
        remoteVideoRef.current.srcObject = null;
        setPeer(null);
        setModalVisible(true);
        setIsCalling(false);
    };
    function getItem(label, key, icon,path) {
        return {
            key,
            icon,
            label,
            onClick: ()=>navigate(path)
        };
    }

    const handlePlayVideo = () => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.play().then(() => {
                console.log('用户触发视频播放成功');
            }).catch((error) => {
                console.error('用户触发视频播放失败:', error.message);
            });
        }
    };

    const items = [
        getItem('数据', '1', <MoneyCollectOutlined />,'/memberStatistic'),
        getItem('预约', '2',  <UserOutlined />,'/memberhome'),
        getItem('就诊信息','3',<UserOutlined />,'/member'),
        getItem('视频会诊','4',<UserOutlined />,'/membercall'),
        getItem('个人信息','5',<UserOutlined />,'/memberprofile'),
    ];
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const {RangePicker} = DatePicker;
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header
                style={{
                    position:'fixed',
                    width: '100%',
                    zIndex:100,
                    padding: 0,
                    background: colorBgContainer
                }}>
                <div className="demo-logo"/>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['4']}
                    items={items}
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                >{items.map(item => (
                    <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                        {item.label}
                    </Menu.Item>
                ))}
                </Menu>
            </Header>

            <Layout style={{ marginTop: '64px' }}>
                {/* 左侧栏 */}
                <Sider
                    theme="dark"
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                >
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']} />
                </Sider>

                {/* 内容区域 */}
                <Content
                    style={{
                        margin: '16px',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: '#f0f2f5',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div style={{width: '400px', textAlign: 'center'}}>
                        {/* 来电提示 */}
                        {incomingCall && (
                            <div style={{marginBottom: '16px'}}>
                                <p style={{fontSize: '16px', fontWeight: 'bold', color: '#333'}}>
                                    {caller} 发起了通话请求，是否接听？
                                </p>
                                <div style={{display: 'flex', justifyContent: 'space-around'}}>
                                    <Button type="primary" onClick={() => acceptCall(incomingCall)}>
                                        接听
                                    </Button>
                                    <Button type="danger" onClick={rejectCall}>
                                        拒绝
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 视频区域 */}
                        <div
                            style={{
                                marginTop: '16px',
                                display: 'flex',
                                gap: '16px', // 添加间距
                                justifyContent: 'flex-start', // 从左侧开始对齐
                                alignItems: 'center', // 垂直对齐
                                height: '50vh', // 设置父容器高度
                                width: '100vh', // 设置父容器宽度
                                marginLeft: '-180px', // 向左偏移 16px，根据需要调整数值
                            }}
                        >
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                style={{
                                    width: '48%', // 视频占父容器宽度的比例
                                    height: '100%', // 视频高度跟随父容器
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    objectFit: 'cover', // 确保视频填满区域
                                }}
                            />
                            <video
                                ref={localVideoRef} // 假设这是本地视频的 ref
                                autoPlay
                                playsInline
                                style={{
                                    width: '48%', // 视频占父容器宽度的比例
                                    height: '100%', // 视频高度跟随父容器
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    objectFit: 'cover', // 确保视频填满区域
                                }}
                            />
                        </div>


                        {/* 挂断按钮 */}
                        {isCalling && (
                            <Button
                                type="danger"
                                onClick={endCall}
                                style={{marginTop: '16px', width: '100%'}}
                            >
                                挂断
                            </Button>
                        )}
                    </div>
                </Content>
            </Layout>

            <Footer style={{textAlign: 'center', padding: '8px', background: '#001529', color: '#fff'}}>
                医疗会诊平台 ©2024 Created by YourTeam
            </Footer>
            <Modal
                title="通话结束"
                visible={modalVisible}
                onOk={() => {
                        setModalVisible(false);
                }}
                onCancel={() => setModalVisible(false)}
            >
                <p>视频通话已结束</p>
            </Modal>
        </Layout>

    );
};

export default MemberCallpage;

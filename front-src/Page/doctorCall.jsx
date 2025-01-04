import React, { useState, useEffect, useRef } from 'react';
import {Layout, Menu, Button, Space, Card, Input, Divider, Modal, message} from 'antd';
import { UserOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import {useLocation, useNavigate} from "react-router-dom";
import SimplePeer from 'simple-peer';
import TextArea from "antd/es/input/TextArea";
import changeAppointment from "../Service/changeAppointment";
import updateClinic from "../Service/updateClinic";
const { Header, Content, Footer, Sider } = Layout;

const DoctorCallpage = () => {
    const navigate = useNavigate();


    const [collapsed, setCollapsed] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [stream, setStream] = useState(null);
    const [peer, setPeer] = useState(null);
    let loading = false;
    const location = useLocation();
    const customer = location.state?.customer;
    console.log(customer);
    const membername = customer?.name || '';
    const [modalVisible, setModalVisible] = useState(false); // 控制弹窗显示
    const [targetUser, setTargetUser] = useState(membername); // 保存目标用户的 ID
    const socketRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    let username = localStorage.getItem("username");
    const serverURL = `ws://192.168.191.99:8080/transfer/${username}`;
    const [instruction, setInstruction] = useState(customer?.instruction || null);
    const createTestStream = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const context = canvas.getContext('2d');
        setInterval(() => {
            context.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
            context.fillRect(0, 0, canvas.width, canvas.height);
        }, 1000);
        const stream = canvas.captureStream(30); // 30 FPS
        return stream;
    };

    const saveInstruction = async () => {
        const updatedAppointment = {
            date: customer.date,
            doctor: customer.doctor,
            instruction: instruction,
            endHourindex: customer.appointmentEndHourindex,
            endMinuteindex: customer.appointmentEndMinutesindex,
            startHourindex: customer.appointmentStartHourindex,
            startMinuteindex: customer.appointmentStartMinutesindex,
        };

        // 假设 changeAppointment 是一个异步函数
        let data = await changeAppointment(updatedAppointment);
        let data2 = await updateClinic(updatedAppointment);
        message.success('就诊信息已成功保存！');
    };


    const handleInstruction = (e) => {
        setInstruction(e.target.value); // 更新 instruction 的值
    };

    useEffect(() => {
        if (!socketRef.current) {
            // 初始化 WebSocket
            socketRef.current = new WebSocket(serverURL);

            socketRef.current.onopen = () => {
                console.log("WebSocket 连接成功");
            };

            socketRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === 'answer') {
                    console.log("接收到 Answer");
                    if (peer) {
                        if(loading){
                            loading = false;
                        }
                        peer.signal(data.sdp); // 设置远端 SDP
                    }
                } else if (data.type === 'candidate') {
                    console.log("接收到 ICE 候选者");
                    if (peer) peer.signal(data.candidate); // 添加 ICE 候选者
                }
            };

            socketRef.current.onerror = (error) => {
                console.error("WebSocket 错误:", error);
            };

            socketRef.current.onclose = () => {
                console.log("WebSocket 已关闭");
            };
        }

        // 页面卸载时关闭 WebSocket
        return () => {
            if (socketRef.current) {
                socketRef.current.close(); // 关闭 WebSocket 连接
            }
        };
    }, []); // 依赖列表为空，仅在组件加载时运行

    const startCall = async () => {
        loading = true;
        console.log(customer);
        try {
            // 获取本地音视频流
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(localStream);

            // 将本地视频流绑定到视频元素
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
            }


            console.log('本地流:', localStream);
            console.log('本地音频轨道:', localStream.getAudioTracks());
            console.log('本地视频轨道:', localStream.getVideoTracks());

            // 创建 Peer 实例
            const newPeer = new SimplePeer({
                initiator: true, // 发起呼叫
                trickle: true, // 分阶段发送 ICE 候选者
                stream: localStream, // 使用本地视频流
                config: {
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" }, // 免费的 STUN 服务器
                    ],
                },
            });

            // 监听信令事件，处理信令数据
            newPeer.on('signal', (data) => {
                const targetName = membername || targetUser;

                const message = data.candidate
                    ? {
                        type: 'candidate',
                        fromUser: username, // 当前用户 ID
                        targetUser: targetName, // 如果 membername 存在，则使用它
                        candidate: data.candidate, // ICE 候选者
                    }
                    : {
                        type: 'offer',
                        fromUser: username, // 当前用户 ID
                        targetUser: targetName, // 如果 membername 存在，则使用它
                        sdp: data, // SDP 信息
                    };

                console.log(data.candidate ? '发送 ICE 候选者:' : '发送信令:', data);
                socketRef.current.send(JSON.stringify(message));
            });

            // 监听远程流事件
            newPeer.on('stream', (remoteStream) => {
                console.log("接收到远程流:", remoteStream);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream; // 绑定远程流到视频元素
                    remoteVideoRef.current
                        .play()
                        .catch((err) => console.error("远程视频播放失败:", err));
                }
            });

            // 监听 WebSocket 返回的信令消息
            socketRef.current.onmessage = (event) => {
                const message = JSON.parse(event.data);

                console.log("接收到的信令消息:", message);

                // 判断信令类型
                if (message.type === 'answer') {
                    console.log("接收到接收方的 Answer:", message.sdp);
                    console.log('Target User:', targetUser);
                    newPeer.signal(message.sdp); // 将接收方的 SDP 提交给 Peer
                } else if (message.type === 'candidate') {
                    console.log("接收到接收方的 ICE 候选者:", message.candidate);
                    console.log('Target User:', targetUser);
                    newPeer.signal({
                        candidate: message.candidate,
                        sdpMid: message.sdpMid,
                        sdpMLineIndex: message.sdpMLineIndex,
                    });
                } else if (message.type === 'bye') {
                    console.log("接收到 bye 消息，断开连接");
                    remoteVideoRef.current.srcObject = null;
                    localVideoRef.current.srcObject = null;
                    loading = false;
                    setPeer(null);
                    setIsCalling(false);
                    setModalVisible(true);
                }
            };

            // 监听错误事件
            newPeer.on('error', (err) => {
                console.error('Peer 连接出错:', err);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = null;
                }
                if (peer) {
                    peer.destroy();
                    setPeer(null);
                }
                loading = false;
                setIsCalling(false);
                localStream.getTracks().forEach(track => track.stop());
            });

            // 监听关闭事件
            newPeer.on('close', () => {
                console.log('Peer 连接已关闭');
                loading = false;
                setPeer(null);
                setIsCalling(false);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = null;
                }
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = null;
                }
                localStream.getTracks().forEach(track => track.stop());
            });

            // 更新状态
            setPeer(newPeer);
            setIsCalling(true);
        } catch (err) {
            console.error("获取用户媒体失败:", err);
            alert("无法访问摄像头或麦克风，请检查设备连接和权限设置。");
        }
    };


    const rejectCall = () => {
        socketRef.current.send(
            JSON.stringify({
                type: "bye",
                fromUser: username, // 替换为当前用户 ID
                targetUser: targetUser, // 替换为目标用户 ID
            })
        );
        console.log("发送bye请求")
           };


    const endCall = () => {
        rejectCall();
        setModalVisible(true);
        loading = false;
        console.log("接收到 bye 消息，断开连接");
        console.log(customer);
        // 关闭 Peer 连接
        if (peer) {
            setPeer(null);
            console.log("Peer 连接已关闭");
        }
        //
        localVideoRef.current.srcObject = null;
        remoteVideoRef.current.srcObject = null;
        //
        //
        //
        // // 重置状态
        setPeer(null);
        setIsCalling(false);
        // return;
    };

    const getItem = (label, key, icon, path) => ({
        key,
        icon,
        label,
        onClick: () => navigate(path),
    });

    const items = [
        getItem("就诊", "1", <MoneyCollectOutlined />, "/doctor"),
        getItem("视频会诊", "2", <UserOutlined />, "/doctorCall"),
        getItem("个人设置", "3", <UserOutlined />, "/doctorProfile"),
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}> {/* 将高度从100vh调整为90vh */}
            <Header style={{ padding: 0 }}>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["2"]}>
                    {items.map((item) => (
                        <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                            {item.label}
                        </Menu.Item>
                    ))}
                </Menu>
            </Header>
            <Layout>
                <Sider
                    theme="dark"
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                >
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={["2"]} />
                </Sider>
                <Content
                    style={{
                        margin: "8px", // 减少外部间距
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Card
                        title="视频会诊"
                        bordered={false}
                        style={{ width: 500, textAlign: "center" }} // 调整卡片宽度和整体显示
                    >
                        <Space direction="vertical" size="middle" style={{ width: "100%" }}> {/* 改为middle减少垂直间距 */}
                            <Input
                                placeholder="请输入目标用户名"
                                value={targetUser}
                                onChange={(e) => setTargetUser(e.target.value)}
                            />
                            {!isCalling ? (
                                <Button type="primary" onClick={startCall} disabled={!targetUser}>
                                    发起通话
                                </Button>
                            ) : (
                                <Button type="danger" onClick={endCall}>
                                    挂断
                                </Button>
                            )}
                            <Divider />
                            {/* 本地视频 */}
                            {loading ? (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "1px solid #ccc",
                                        borderRadius: "8px",
                                        fontSize: "18px",
                                        color: "#888",
                                    }}
                                >
                                    正在呼叫中...
                                </div>
                            ) : (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{
                                        width: "100%",
                                        border: "1px solid #ccc",
                                        borderRadius: "8px",
                                    }}
                                />
                            )}
                            {/* 远端视频 */}
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                style={{
                                    width: "100%",
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    marginTop: "10px", // 减少间距
                                }}
                            />
                        </Space>
                    </Card>
                </Content>
                <Footer style={{ textAlign: "center", padding: "8px" }}> {/* 减少底部内边距 */}
                    智医云桥 ©2024 Created by YourTeam
                </Footer>
            </Layout>
            <Modal
                title="通话结束"
                visible={modalVisible}
                onOk={() => {
                    if (customer) {
                        saveInstruction(); // 如果 customer 存在，保存 instruction
                        setModalVisible(false);
                    } else {
                        setModalVisible(false); // 如果 customer 不存在，仅关闭 Modal
                    }
                }}
                onCancel={() => setModalVisible(false)} // 关闭弹窗
                okText={customer ? "保存并关闭" : "确定"}
                cancelText="关闭"
            >
                <p>视频通话已结束</p>
                <label htmlFor="instruction" style={{fontWeight: 'bold'}}>
                    请提供您的诊断结果：
                </label>
                <TextArea
                    rows={12}
                    value={instruction || ''} // 如果 instruction 为空，则显示空字符串
                    onChange={handleInstruction}
                    disabled={!customer} // 如果 customer 为空，禁用输入框
                />
            </Modal>
        </Layout>

    );
};

export default DoctorCallpage;

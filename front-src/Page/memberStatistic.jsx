import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Divider, Skeleton, Button, Input, Spin } from 'antd';
import { MoneyCollectOutlined, UserOutlined, MedicineBoxOutlined, LoadingOutlined } from '@ant-design/icons';
import '../Css/Profile.css';
import '../Css/home.css';
import '../Css/Doctor.css';
import dayjs from 'dayjs';
import getData from '../Service/getData'; 
import getLLM from '../Service/getLLM'; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Header, Content, Footer, Sider } = Layout;

const MemberStatisticpage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]); // 用于存储获取的数据
    const [loading, setLoading] = useState(true); // 控制加载状态
    const [isRefreshing, setIsRefreshing] = useState(false); // 控制刷新状态
    const [llmResult, setLLMResult] = useState({ content: '', loading: false }); // 存储LLM返回的结果和加载状态

    const today = new Date();
    const dayOfWeek = today.getDay(); // 正确使用 getDay() 获取星期几

    const getItem = (label, key, icon, path) => ({
        key,
        icon,
        label,
        onClick: () => navigate(path)
    });

    const items = [
        getItem('数据', '1', <MoneyCollectOutlined />, '/memberStatistic'),
        getItem('预约', '2', <UserOutlined />, '/memberhome'),
        getItem('就诊信息', '3', <UserOutlined />, '/member'),
        getItem('视频会诊', '4', <UserOutlined />, '/membercall'),
        getItem('个人信息', '5', <UserOutlined />, '/memberprofile'),
    ];

    const location = useLocation();
    const getKeyFromPath = (path) => {
        switch (path) {
            case '/settings/accountDetail':
                return '1';
            case '/settings/accountManager':
                return '2';
            case '/settings/doctorSetting':
                return '3';
            case '/settings/treatmentSetting':
                return '4';
            default:
                return '5';
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getData();
                console.log(result);
                setData(result);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRefreshData = async () => {
        setIsRefreshing(true);
        try {
            const result = await getData();
            console.log(result);
            setData(result);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setLoading(false);
        }
        setIsRefreshing(false);
    };

    const parseData = (data) => {
        return data.map((item, index) => {
            const [hr, hrv] = item.value.split(',').map(v => v.split(':'));
            return {
                time: dayjs(item.timestamp).format('HH:mm:ss'),
                HR: parseInt(hr[1], 10),
                HRV: parseInt(hrv[1], 10)
            };
        });
    };

    const formattedData = parseData(data);

    const handleLLMConsultation = async () => {
        setLLMResult(prev => ({ ...prev, loading: true }));
        try {
            const result = await getLLM();
            setLLMResult({ content: result.content, loading: false });
        } catch (error) {
            console.error('Failed to fetch LLM result:', error);
            setLLMResult({ content: 'Failed to fetch LLM result', loading: false });
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ padding: 0 }}>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} items={items}>
                    {items.map(item => (
                        <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                            {item.label}
                        </Menu.Item>
                    ))}
                </Menu>
            </Header>
            <Layout>
                <Sider>
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={['2']}
                        onSelect={({ key }) => {}}
                        selectedKeys={[getKeyFromPath(location.pathname)]}
                    >
                        <Menu.Item key="2" icon={<MedicineBoxOutlined />}>
                            个人健康数据
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Content style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '20px' }}>
                    {loading || isRefreshing ? (
                        <Skeleton active />
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={formattedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="HR" stroke="#8884d8" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="HRV" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                    <div style={{ flexGrow: 1 }} />
                    <Button
                        type="primary"
                        size="small"
                        onClick={handleRefreshData}
                        loading={isRefreshing}
                        style={{ position: 'absolute', right: '16px', bottom: '500px' }}
                    >
                        刷新数据
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        onClick={handleLLMConsultation}
                        style={{ position: 'absolute', right: '16px', bottom: '40px' }}
                    >
                        用户数据智能咨询
                    </Button>
                    {llmResult.loading && (
                        <Spin
                            indicator={<LoadingOutlined style={{ fontSize: 100 }} spin />}
                            style={{ position: 'absolute', left: '50%', top: '80%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
                        />
                    )}
                    <Input.TextArea
                        value={llmResult.content}
                        style={{ width: '97%', marginTop: 20, height: 400, position: 'relative', zIndex: 1 }}
                    />
                </Content>
                <Footer style={{ textAlign: 'center' }}>...</Footer>
            </Layout>
        </Layout>
    );
};

export default MemberStatisticpage;
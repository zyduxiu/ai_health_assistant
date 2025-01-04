import React, { useState, useEffect } from 'react';

import {
    ShoppingCartOutlined,
    BookOutlined,
    AccountBookOutlined,
    UserOutlined,
    MoneyCollectOutlined,
    PlusCircleOutlined,
    StockOutlined
} from '@ant-design/icons';

import { Button, Modal, message } from 'antd';
import { Layout, Space, Radio } from 'antd';
import {DatePicker, List, Table, Tag, Descriptions, Typography, Tabs } from 'antd';
import { Breadcrumb, Menu, theme, Row, Col, AutoComplete} from 'antd';
import PayFromMemberCard from './PayFromMemberCard';
import '../Css/CheckPay.css';
import Router from "./router";
import {useNavigate} from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import async from "async";
import changeAppointment from "../Service/changeAppointment";
import {config} from "../Service/config";

const { Sider, Content } = Layout;

function CheckPay() {
    const sidebar_options = [
        {label: '全部', value: '全部'},
        { label: '未诊', value: '未诊' },
        { label: '已诊', value: '已诊' },
    ];

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [sidebar_select_value, set_sidebar_select_value] = useState('全部');
    const [patients, setPatients] = useState([]);
    const [payment, setPayment] = useState('');

    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState({
        instruction:"",
    });
    const [instruction,setInstruction]=useState(selectedCustomer.instruction);
    const [filteredRows, setFilteredRows] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        setInstruction(selectedCustomer.instruction);
    }, [selectedCustomer]);


    let appointmentinformation= {
        startHourindex: 0,
        endHourindex: 0,
        startMinuteindex: 0,
        endMinuteindex: 0,
        date: '',
        doctor: '',
        Instruction: ''
    }

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/api/allpaid/member`,{credentials: "include",})
            .then(response => {
                console.log("Response status:", response.status);  // 打印响应状态码
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();  // 先读取为文本
            })
            .then(text => {
                console.log('Received response:', text);  // 输出接收到的文本内容
                return text ? JSON.parse(text) : [];  // 确保即使是空字符串也能正确处理
            })
            .then(data => {
                console.log('Parsed data:', data);
                setPatients(data);
                setFilteredRows(data);
            })
            .catch(error => {
                console.error('Error fetching unpaid appointments:', error);
            });
    }, []);

    console.log(patients);
    const onChange_sidebar_select = ({ target: { value } }) => {
        set_sidebar_select_value(value);
        if (value === '全部') {
            setFilteredRows(patients);  // 显示所有患者
        } else if (value === '未诊') {
            setFilteredRows(patients.filter(row => row.attribute === '已预约'));
        } else if (value === '已诊') {
            setFilteredRows(patients.filter(row => row.attribute === '已诊'));
        }

    };

    const columns = [
        {
            title: '姓名',
            width: 70,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '项目',
            width: 55,
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: '医生',
            dataIndex: 'doctor',
            key: 'amount',
        },
    ];
    console.log(selectedCustomer);

    const onSelectCustomer = (record) => {
        setSelectedCustomer(record);
    };


    function selectPaymentMethod(e) {
        setPayment(e.target.value);
    }

    function handlePaymentSubmission() {
        setIsPaymentModalVisible(true);
    }

    function handleConfirmPayment() {
        if (!payment) {
            alert("请先选择一个支付方式！");
            return;
        }
        selectedCustomer.status = '已付费';
        setIsPaymentModalVisible(false);
        setIsConfirmModalVisible(true);
        setPayment("");
    }

    function handleBackToPayment() {
        setIsConfirmModalVisible(false);  // 关闭确认支付模态窗口
        setIsPaymentModalVisible(true);   // 重新打开选择支付方式的模态窗口
    }

    function handleDonePayment () {
        setIsPaymentModalVisible(false);
        setIsConfirmModalVisible(false);
        setPayment("");
        selectedCustomer.status = '已付费';
        return message.success('支付成功！');
    }

    const handleButtonClick = () => {
        navigate('/doctorCall'); // 直接调用 navigate 来跳转
    };
    function handleCloseModal () {
        setIsPaymentModalVisible(false);
        setIsConfirmModalVisible(false);
        setPayment("");
    }
    const handleInstruction=(event)=>{
        setInstruction(event.target.value);
    }

    const saveInstruction=async ()=>{
        appointmentinformation.date=selectedCustomer.date;
        appointmentinformation.doctor=selectedCustomer.doctor;
        appointmentinformation.instruction=instruction;
        appointmentinformation.endHourindex=selectedCustomer.appointmentEndHourindex;
        appointmentinformation.endMinuteindex=selectedCustomer.appointmentEndMinutesindex;
        appointmentinformation.startHourindex=selectedCustomer.appointmentStartHourindex;
        appointmentinformation.startMinuteindex=selectedCustomer.appointmentStartMinutesindex;
        let data=await changeAppointment(appointmentinformation);
        message.success("用户信息已成功更新")
    }

    return patients && (
        <div className='main-container'>
            <div className='split-into-left-right'>
                <div className='left-section-sidebar'>
                    <Sider width={300} style={{ zIndex: 80, marginTop: 60, background: 'whitesmoke' }} className="site-layout-background margin-from-top">
                        <Space direction={"vertical"} size={8}>
                            <DatePicker.RangePicker style={{ marginTop: 10, marginLeft: 15 }} />
                            <Radio.Group
                                style={{ marginLeft: 15 }}
                                options={sidebar_options}
                                onChange={onChange_sidebar_select}
                                value={sidebar_select_value}
                                optionType="button"
                                size={'large'}
                            />
                            <div style={{ width: 295, cursor: 'pointer' }}>
                                <Table
                                    style={{ marginLeft: 15 }}
                                    columns={columns}
                                    dataSource={filteredRows}
                                    size={'small'}
                                    onRow={(record) => {
                                        return {
                                            onClick: () => onSelectCustomer(record), // click row
                                        };
                                    }}
                                />
                            </div>
                        </Space>
                    </Sider>
                </div>

                <div className='right-section-payment'>

                    <Content className='right-section-payment' style={{ margin: '0 16px' }}>
                        {/* Header with Charge Information and Buttons */}
                        {selectedCustomer&&selectedCustomer.attribute !== '已预约' &&(
                            <div style={{ padding: 24, marginTop: 80, background: colorBgContainer, borderRadius: borderRadiusLG, marginBottom: 24 }}>
                                <Row  gutter={16} justify="space-between" align="middle">
                                    <Col>
                                        <Typography.Title level={4}>付费详情</Typography.Title>
                                    </Col>
                                    <Col>
                                        <Descriptions size="small" column={3}>
                                            <Descriptions.Item label="付费金额">{selectedCustomer.appointmentcost}</Descriptions.Item>
                                            <Descriptions.Item label="就诊日期">{selectedCustomer.date}</Descriptions.Item>
                                        </Descriptions>

                                        {selectedCustomer&&selectedCustomer.attribute === '已诊' && (
                                            <Button  className='button-pay' onClick={handlePaymentSubmission} id='charge' type="primary"  icon={<ShoppingCartOutlined />} style={{ marginRight: 8,  marginTop: 5}}>
                                                付费
                                            </Button>
                                        )}
                                        <Modal
                                            title="支付方式"
                                            visible={isPaymentModalVisible}
                                            onOk={handleConfirmPayment}
                                            onCancel={handleCloseModal}
                                            okText="确认"
                                            cancelText="取消"
                                        >
                                            <select value={payment} style={{ width: 250, height: 30 }} onChange={selectPaymentMethod}>
                                                <option value="">请选择</option>
                                                <option value="微信支付">微信支付</option>
                                                <option value="支付宝">支付宝</option>
                                                <option value="美团支付">美团支付</option>
                                                <option value="Visa">Visa</option>
                                                <option value="Mastercard">Mastercard</option>
                                            </select>
                                            <p style={{ height: 30 }}>支付方式: {payment}</p>
                                        </Modal>
                                        <Modal
                                            title="确认支付"
                                            visible={isConfirmModalVisible}
                                            onCancel={handleCloseModal}
                                            footer={[
                                                <Button key="back" onClick={handleBackToPayment}>Back</Button>,
                                                <Button key="submit" type="primary" onClick={handleDonePayment}>Done</Button>,
                                            ]}
                                        >
                                            <img src="../../QRCode.jpg" alt="Payment Confirmation" style={{ width: '100%' }} />
                                            <p>请确认支付信息 {selectedCustomer.amount}</p>
                                        </Modal>

                                        {selectedCustomer&&selectedCustomer.attribute === '已诊' && (<PayFromMemberCard currentAppointment={selectedCustomer}/>)}

                                    </Col>
                                </Row>
                            </div>

                        )}

                        {selectedCustomer&&selectedCustomer.attribute === '已预约' && (
                            <div style={{ padding: 24, marginTop: 80, background: colorBgContainer, borderRadius: borderRadiusLG, marginBottom: 24 }}>
                                <Row  gutter={16} justify="space-between" align="middle">
                                    <Col>
                                        <Typography.Title level={4}>预约详情</Typography.Title>
                                    </Col>
                                    <Col>
                                        <Descriptions size="small" column={3}>
                                            <Descriptions.Item label="预约时间">{selectedCustomer.appointmentStartTime
                                            } - {selectedCustomer.appointmentEndTime
                                            }</Descriptions.Item>
                                            <Descriptions.Item label="就诊项目">{selectedCustomer.type}</Descriptions.Item>
                                        </Descriptions>
                                    </Col>
                                </Row>
                            </div>

                        )}

                        {/* Content with Patient Information, Charge Items Table and Membership Details */}
                        <div style={{ padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                            {/* Patient Details and Responsible Doctor */}
                            {selectedCustomer&&selectedCustomer.attribute !== '已预约' && (
                                <Descriptions title="客户信息"  style={{ marginBottom: 2 }} column={5}>
                                    <Descriptions.Item label="姓名">{selectedCustomer.name}</Descriptions.Item>
                                    <Descriptions.Item label="会员等级">{selectedCustomer.membership}</Descriptions.Item>
                                    <Descriptions.Item label="问诊日期">{selectedCustomer.date}</Descriptions.Item>
                                    <Descriptions.Item label="负责医生" span={3}>{selectedCustomer.doctor}</Descriptions.Item>
                                </Descriptions>
                            )}

                            {selectedCustomer&&selectedCustomer.attribute !== '已预约' && (
                                <Descriptions title="就诊信息"  style={{ marginBottom: 2 }}></Descriptions>
                            )}
                            {/* Charge Items Table */}
                            {selectedCustomer&&selectedCustomer.attribute !== '已预约' && (
                                <div>
                                    <TextArea rows={12} value={instruction} readOnly/>

                                </div>
                            )}


                            {/* Membership Details */}
                            {selectedCustomer&&selectedCustomer.attribute !== '已预约' && selectedCustomer.isMember && (
                                <Descriptions  title="会员信息" column={4}>
                                    <Descriptions.Item label="会员类别">{selectedCustomer.cardType}</Descriptions.Item>
                                    <Descriptions.Item label="卡号">{selectedCustomer.cardNumber}</Descriptions.Item>
                                    <Descriptions.Item label="优惠折扣">{selectedCustomer.cardDiscount}</Descriptions.Item>
                                    <Descriptions.Item label="卡内余额">{'¥'+selectedCustomer.cardValue}</Descriptions.Item>
                                </Descriptions>
                            )}
                        </div>
                    </Content>
                </div>
            </div>

        </div>
    );
}

export default CheckPay;

import React, {useEffect, useState} from 'react';
import {
    List,
    Descriptions,
    Badge,
    Button,
    Modal,
    Form,
    Input,
    DatePicker,
    message,
    Switch,
    Row,
    Col,
    Card,
    Divider, InputNumber, Select
} from 'antd';


//import { Option } from 'antd/es/select'; // 或者 import { Option } from 'antd';

import moment from 'moment';
import 'moment/locale/zh-cn';
import getDoctors from "../Service/getDoctors";
import updateDoctors from "../Service/updateDoctors";
import getDoctor from "../Service/getDoctor";

const { Option } = Select;
const DoctorPerson = () => {
    moment.locale('zh-cn');

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [doctors, setDoctors] = useState(null);
    const [currentDoctor, setCurrentDoctor] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [showOffDuty, setShowOffDuty] = useState(false);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [form]=Form.useForm();
    let update=false;
    const filterDoctors = (doctors, searchText, showOffDuty) => {
        console.log(doctors);
        return doctors.filter(doctor => {
            const isMatch = doctor.fullname.toLowerCase().includes(searchText.toLowerCase());
            const isOnDuty = showOffDuty || doctor.onLeave !== moment().format('ddd');
            return isMatch && isOnDuty;
        });
    };

    useEffect(() => {
        if(doctors!==null) {
            const filtered = filterDoctors(doctors, searchText, showOffDuty);
            setFilteredDoctors(filtered);
        }
    }, [doctors, searchText, showOffDuty]);
    const showModal = (doctor) => {
        setCurrentDoctor(doctor);
        form.resetFields();
        setIsModalVisible(true);
    };


    useEffect(
        () => {
            const initialize = async () => {
                let data = await getDoctor();
                setDoctors(data);
            };
            initialize();
        }
        ,[update])

    async function initialize() {
        let data = await getDoctor();
        setDoctors(data);
    };

    const handleupdate=async ()=>{
        if (currentDoctor) {
            const updatedDoctors = doctors.map(doc => doc.id === currentDoctor.id ? {...currentDoctor} : doc);
            console.log(updatedDoctors);
            console.log(currentDoctor);
            let data = await updateDoctors(currentDoctor);
            update = !update;
            initialize();
            //setDoctors(updatedDoctors);
        }

    }
    const handleOk = async () => {
        form.validateFields().then(values=> {
            handleupdate();
            setIsModalVisible(false);
            message.success('信息已保存');
        }).catch(errorInfo => {
            console.log('Validate Failed:', errorInfo);
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    console.log(currentDoctor);
    const handleChange = (key, value) => {
        setCurrentDoctor({ ...currentDoctor, [key]: value });
    };

    const defaultdoctor={registrationDate:null};
    console.log(currentDoctor);

    console.log(doctors);
    if(doctors) {
        return (
            <div style={{padding: '24px', minHeight: '360px'}}>
                <Card>

                    <Divider/>
                    <List
                        grid={{gutter: 16, xs: 1, sm: 2, md: 4}}
                        dataSource={filteredDoctors}
                        renderItem={doctor => (
                            <List.Item key={doctor.id} style={{minWidth: '100vh'}}>
                                <Descriptions title={doctor.fullname} bordered size="small">
                                    {/*<Descriptions.Item label="部门">{doctor.department}</Descriptions.Item>*/}
                                    <Descriptions.Item label="状态">
                                        <Badge status={doctor.onLeave !== moment().format('ddd') ? 'success' : 'error'}
                                               text={doctor.onLeave !== moment().format('ddd') ? '值班' : '休假'}/>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="操作">
                                        <Button type="primary" onClick={() => showModal(doctor)}>
                                            查看个人信息
                                        </Button>
                                    </Descriptions.Item>
                                </Descriptions>
                            </List.Item>
                        )}
                    />
                    {currentDoctor && (
                        <Modal title="查看个人信息" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                            <Form>
                                {/* 姓名 和 出生日期 */}
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item label="姓名" rules={[{ required: true, message: '请输入医生姓名' }]}>
                                            <Input
                                                value={currentDoctor.fullname}
                                                onChange={e => handleChange('fullname', e.target.value)}
                                                readOnly={currentDoctor.registrationDate}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="出生日期" rules={[{ required: true, message: '请选择出生日期' }]}>
                                            <DatePicker value={moment(currentDoctor.birthDate)} onChange={(date, dateString) => handleChange('birthDate', dateString)} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* 邮箱 和 专业 */}
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item label="邮箱" rules={[{ type: 'email', message: '请输入正确的邮箱格式' }, { required: true, message: '请输入邮箱' }]}>
                                            <Input value={currentDoctor.emailAddress} onChange={e => handleChange('emailAddress', e.target.value)} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="专业" rules={[{ required: true, message: '请输入专业' }]}>
                                            <Input value={currentDoctor.specialization}  readOnly/>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* 职务 和 资格证 */}
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item label="职务" rules={[{ required: true, message: '请输入职务' }]}>
                                            <Input value={currentDoctor.cuurentPosition}  readOnly/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="资格证" rules={[{ required: true, message: '请输入资格证' }]}>
                                            <Input value={currentDoctor.boardCertifications}  readOnly/>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* 电话号码 和 基础工资 */}
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item label="电话号码" rules={[{ required: true, message: '请输入电话号码' }, { pattern: new RegExp(/^1[3456789]\d{9}$/, 'g'), message: '请输入正确的电话号码格式' }]}>
                                            <Input value={currentDoctor.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="基础工资" rules={[{ required: true, message: '请输入基础工资' }, { type: 'number', min: 0, message: '工资必须为非负数' }]}>
                                            <InputNumber value={currentDoctor.basicSalary} readOnly/>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* 部门 和 家庭地址 */}
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item label="部门" rules={[{ required: true, message: '请输入部门' }]}>
                                            <Input value={currentDoctor.department} readOnly />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="家庭地址" rules={[{ required: true, message: '请输入家庭地址' }]}>
                                            <Input value={currentDoctor.homeAddress} onChange={e => handleChange('homeAddress', e.target.value)} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                {/* 休日 和 工龄 */}
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item label="休日" rules={[{ required: true, message: '请选择休日' }]} readOnly>
                                            <Select value={currentDoctor.onLeave} >
                                                <Option value="周一">周一</Option>
                                                <Option value="周二">周二</Option>
                                                <Option value="周三">周三</Option>
                                                <Option value="周四">周四</Option>
                                                <Option value="周五">周五</Option>
                                                <Option value="周六">周六</Option>
                                                <Option value="周日">周日</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="工龄" rules={[{ required: true, message: '请输入工龄' }, { type: 'number', min: 0, message: '工龄必须为非负数' }]}>
                                            <InputNumber value={currentDoctor.practiceYears} readOnly/>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* 医疗号 和 毕业院校 */}
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item label="医疗号" rules={[{ required: true, message: '请输入医疗号' }]}>
                                            <Input value={currentDoctor.medicalNumberLicense}  readOnly/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="毕业院校" rules={[{ required: true, message: '请输入毕业院校' }]}>
                                            <Input value={currentDoctor.medicalSchool}  readOnly/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item label="性别" rules={[{ required: true, message: '请选择性别' }]}>
                                            <Select value={currentDoctor.gender} readOnly>
                                                <Option value="男">男</Option>
                                                <Option value="女">女</Option>

                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="注册时间">
                                            <Input value={currentDoctor.registrationDate} readOnly/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Modal>
                    )}
                </Card>
            </div>
        );
    }
};

export default DoctorPerson;
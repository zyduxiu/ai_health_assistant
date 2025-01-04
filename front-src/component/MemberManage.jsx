import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import getAccounts from "../Service/getAccount";
import updateAccount from "../Service/adjustAccount";
import AddAccount from "../Service/AddAccount";
import deleteaccount from "../Service/deleteAccount";
import getMember from "../Service/getMember";
import changeMember from "../Service/changeMember";

const MemberManage = () => {
    const [accounts, setAccounts] = useState([
        { id: 1, username: 'user1', joinedDate: '2023-01-01', name: 'John Doe', password: '123456', phone: '1234567890' },
        { id: 2, username: 'user2', joinedDate: '2023-01-02', name: 'Jane Doe', password: '654321', phone: '0987654321' }
    ]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentAccount, setCurrentAccount] = useState(null);
    const [form] = Form.useForm();
    const [account, setAccount] = useState(null);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const initialize = async () => {
            let data = await getMember();
            console.log(data);
            setAccount(data);
            setUsername(data[0].memberName || '');
            setEmail(data[0].memberEmail || '');
            setPhone(data[0].memberPhone || '');
        };

        initialize();
    }, []);

    const showModal = (account) => {
        setCurrentAccount(account);
        form.setFieldsValue(account ? {
            username: account.username,
            name: account.name,
            password: account.password,
            phone: account.phone
        } : {
            username: '',
            name: '',
            password: '',
            phone: ''
        });

        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleadd = async (values) => {
        let accountChange = {
            username: username,
            email: email,
            phonenumber: phone,
        };
        console.log(accountChange);
        try {
            let data =await changeMember(accountChange);
            let updatedData = await getMember();
            setAccount(updatedData);
            message.success("用户信息更新成功");
        } catch (error) {
            message.error("用户名已存在");
        }
    };


    const handleOk = async () => {
        form.validateFields().then(values => {
            console.log(values);
            if (currentAccount) {
                // Edit account
                const updatedAccounts = account.map(acc =>
                    acc.id === currentAccount.id ? { ...acc, ...values } : acc
                );
                handleadd(values);
                setAccounts(updatedAccounts);
            } else {
                // Add new account
                const newAccount = {
                    id: accounts.length + 1,
                    joinedDate: new Date().toISOString().slice(0, 10),
                    ...values
                };
                handleadd(values);
                setAccounts([...accounts, newAccount]);
            }
            setIsModalVisible(false);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const columns = [
        {
            title: '用户名',
            dataIndex: 'memberName',
            key: 'memberName',
        },
        {
            title: '邮箱',
            dataIndex: 'memberEmail',
            key: 'memberEmail',
        },
        {
            title: '会员手机号',
            dataIndex: 'memberPhone',
            key: 'memberPhone',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        style={{ marginRight: 8 }}
                    />
                </>
            ),
        },
    ];

    console.log(account);
    if (account !== null) {
        console.log(username);
        return (
            <>
                <Card style={{ margin: '20px' }}>
                    <Table columns={columns} dataSource={account} rowKey="id" />
                </Card>

                <Modal
                    title={currentAccount ? "添加新账号" : "修改账号"}
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText="确认"
                    cancelText="取消"
                >
                    <Form  layout="vertical">
                        <Form.Item
                            label="用户名"
                            rules={[{ required: true, message: '请输入用户名！' }]}
                        >
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                readOnly={currentAccount !== null}
                            />
                        </Form.Item>
                        <Form.Item
                            label="邮箱"
                            rules={[{ required: true, message: '请输入邮箱！' }]}
                        >
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item
                            label="手机号"
                            rules={[{ required: true, message: '请输入手机号！' }]}
                        >
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        );
    }
};

export default MemberManage;
